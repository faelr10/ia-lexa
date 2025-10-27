/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// chatgpt.service.ts
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ScheduleService } from 'src/schedule/schedule.service';
import {
  buildDynamicPromptToNewTask,
  promptTemplateIdentifier,
} from './prompts';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { promptTemplateToFormatedList } from './prompt-formated-list';
import { getPromptTemplateGetTasksByDate } from './prompt-get-data';
import * as fs from 'fs';
import axios from 'axios';
import * as https from 'https';
import { PROMPT_IDENTIFIER_TASK_FOR_DELETE } from './prompt-identifier-task-for-delete';

@Injectable()
export class ChatGptService {
  private openai: OpenAI;

  constructor(
    @Inject(ScheduleService)
    private readonly scheduleService: ScheduleService,
    @Inject(forwardRef(() => RabbitMQService))
    private readonly rabbitMQService: RabbitMQService,
  ) {
    this.openai = new OpenAI({
      apiKey: String(process.env.OPENAI_API_KEY),
    });
  }

  private async _requestGpt(prompt: string): Promise<string> {
    const responseIA = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });
    if (!responseIA.choices?.[0]?.message?.content) {
      return 'Não consegui gerar uma resposta.';
    }
    return responseIA.choices?.[0]?.message?.content;
  }

  private async _identifierRequest(text: string): Promise<string> {
    const prompt = `${promptTemplateIdentifier} Mensagem: "${text}"`;
    return await this._requestGpt(prompt);
  }

  async newRequest(text: string): Promise<string> {
    try {
      const message = await this._identifierRequest(text);

      if (JSON.parse(message).action === 'new-task') {
        await this.newTaskRequest(text);
      } else if (JSON.parse(message).action === 'get-task') {
        await this.getTaskRequest(text);
      } else if (JSON.parse(message).action === 'delete-task') {
        await this.deleteTask(text);
      } else {
        console.log('entrou no nenhum-dos-dois');
      }

      return 'Ok';
    } catch (error) {
      console.error('Erro na API da OpenAI:', error);
      if (error.response?.status === 429) {
        return 'Estou sem créditos ou limite de requisições atingido. Tente mais tarde.';
      }
      return 'Ocorreu um erro ao tentar gerar a resposta.';
    }
  }

  async transcribeTelegramAudio(fileUrl: string) {
    const tempPath = './temp_audio.oga';
    const httpsAgent = new https.Agent({ family: 4 });
    const response = await axios.get(fileUrl, {
      responseType: 'stream',
      httpsAgent,
      timeout: 20000,
    });
    const writer = fs.createWriteStream(tempPath);
    (response.data as NodeJS.ReadableStream).pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', () => resolve());
      writer.on('error', (err) => reject(err));
    });

    const transcription = await this.openai.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: 'whisper-1',
    });

    fs.unlinkSync(tempPath);
    return transcription.text;
  }

  async formatedListSchedules(list: any[]): Promise<string> {
    const promptToFormatedList = `${promptTemplateToFormatedList} ${JSON.stringify(list)}`;
    const response = await this._requestGpt(promptToFormatedList);

    const responseToFormatedList = response;
    console.log(responseToFormatedList);

    await this.rabbitMQService.sendToQueue({
      chatId: process.env.TELEGRAM_CHAT_ID,
      message: responseToFormatedList,
    });

    return responseToFormatedList;
  }

  async newTaskRequest(text: string): Promise<string> {
    const promptNewTask = buildDynamicPromptToNewTask(text);
    const response = await this._requestGpt(promptNewTask);

    await this.scheduleService.saveSchedule(response);
    return 'Tarefa criada com sucesso.';
  }

  async getTaskRequest(text: string): Promise<string> {
    const promptGetTask = `${getPromptTemplateGetTasksByDate()} Mensagem do usuário: ${text}`;
    const response = await this._requestGpt(promptGetTask);

    console.log(response);

    const listAllSchedules =
      await this.scheduleService.getSchedulesByDate(response);

    //FORMATAR A RESPOSTA PARA O USUÁRIO
    const formatedList = await this._formatedList(listAllSchedules);

    await this.rabbitMQService.sendToQueue({
      chatId: process.env.TELEGRAM_CHAT_ID,
      message: formatedList,
    });

    return 'Solicitação feita.';
  }

  private async _formatedList(list: any[]): Promise<string> {
    const promptFormatedList = `${promptTemplateToFormatedList} ${JSON.stringify(list)}`;
    const response = await this._requestGpt(promptFormatedList);
    return response;
  }

  async deleteTask(text: string): Promise<string> {
    const allFutureTasks = await this.scheduleService.getAllSchedules();

    const promptDeleteTask = `${PROMPT_IDENTIFIER_TASK_FOR_DELETE(text, JSON.stringify(allFutureTasks, null, 2))}`;
    const response = await this._requestGpt(promptDeleteTask);

    console.log('ID do compromisso a cancelar:', response);

    if (response !== null) {
      await this.scheduleService.deleteSchedule(response);
      return 'Deletado com sucesso';
    }

    return 'Nenhum arquivo encontrado';
  }
}
