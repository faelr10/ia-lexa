/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import {
  PROMPT_IDENTIFIER_TASK_FOR_EDIT,
  PROMPT_EXTRACT_EDIT_DATA,
} from './prompt-identifier-task-for-edit';

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
      model: 'gpt-4o',
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
      const parsed = JSON.parse(message) as { action: string };

      if (parsed.action === 'new-task') {
        await this.newTaskRequest(text);
      } else if (parsed.action === 'get-task') {
        await this.getTaskRequest(text);
      } else if (parsed.action === 'delete-task') {
        await this.deleteTask(text);
      } else if (parsed.action === 'edit-task') {
        await this.editTask(text);
      } else {
        console.log('entrou no nenhum-dos-dois');
      }

      return 'Ok';
    } catch (error: unknown) {
      console.error('Erro na API da OpenAI:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } };
        if (httpError.response?.status === 429) {
          return 'Estou sem créditos ou limite de requisições atingido. Tente mais tarde.';
        }
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
    try {
      const promptNewTask = buildDynamicPromptToNewTask(text);
      const response = await this._requestGpt(promptNewTask);

      const savedTask = await this.scheduleService.saveSchedule(response);

      // Enviar confirmação detalhada
      const confirmationMessage = this._formatTaskConfirmation(
        savedTask as {
          assunto?: string;
          descricao?: string;
          dia?: string;
          horario?: string;
        },
        'criada',
      );
      await this.rabbitMQService.sendToQueue({
        chatId: process.env.TELEGRAM_CHAT_ID,
        message: confirmationMessage,
      });

      return 'Tarefa criada com sucesso.';
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      await this.rabbitMQService.sendToQueue({
        chatId: process.env.TELEGRAM_CHAT_ID,
        message: 'Desculpe, ocorreu um erro ao criar a tarefa.',
      });
      return 'Erro ao criar tarefa';
    }
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
    // Validação: se a lista estiver vazia, retornar mensagem padrão
    if (!list || list.length === 0) {
      return `📅 _Seus Agendamentos_\n\n📭 Você não possui tarefas agendadas para este período.`;
    }

    // Preparar dados com validação e ordenação
    const validatedList = list
      .filter((task: any) => task && task.dia) // Filtrar tarefas inválidas
      .map((task: any) => ({
        assunto: task.assunto || 'Sem assunto',
        descricao: task.descricao || '',
        dia: task.dia,
        horario: task.horario || '',
        status: task.status || 'pending',
      }))
      .sort((a: any, b: any) => {
        // Ordenar por data primeiro
        if (a.dia !== b.dia) {
          return a.dia.localeCompare(b.dia);
        }
        // Se mesma data, ordenar por horário
        if (a.horario && b.horario) {
          return a.horario.localeCompare(b.horario);
        }
        return 0;
      });

    console.log(`Formatação de ${validatedList.length} tarefa(s)`);

    const promptFormatedList = `${promptTemplateToFormatedList} ${JSON.stringify(validatedList)}`;
    const response = await this._requestGpt(promptFormatedList);

    // Validar se a resposta contém a contagem correta
    const expectedCount = validatedList.length;
    const countInResponse = (response.match(/Total.*?(\d+)/) || [])[1];

    if (countInResponse && parseInt(countInResponse) !== expectedCount) {
      console.warn(
        `⚠️ Contagem inconsistente! Esperado: ${expectedCount}, GPT retornou: ${countInResponse}`,
      );
    }

    return response;
  }

  private _formatTaskConfirmation(
    task: {
      assunto?: string;
      descricao?: string;
      dia?: string;
      horario?: string;
    },
    action: 'criada' | 'atualizada' | 'cancelada',
  ): string {
    const emoji =
      action === 'criada' ? '✅' : action === 'atualizada' ? '📝' : '❌';
    const actionText =
      action === 'criada'
        ? 'Tarefa criada'
        : action === 'atualizada'
          ? 'Tarefa atualizada'
          : 'Tarefa cancelada';

    let message = `${emoji} ${actionText}!\n\n`;
    message += `📌 ${task.assunto || 'Sem assunto'}\n`;

    if (task.descricao) {
      message += `📄 ${task.descricao}\n`;
    }

    if (task.dia) {
      const date = new Date(task.dia);
      const formatedDate = date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      message += `📅 ${formatedDate.charAt(0).toUpperCase() + formatedDate.slice(1)}\n`;
    }

    if (task.horario) {
      message += `🕐 ${task.horario}`;
    }

    return message;
  }

  async deleteTask(text: string): Promise<string> {
    try {
      const allFutureTasks = await this.scheduleService.getAllSchedules();

      const promptDeleteTask = `${PROMPT_IDENTIFIER_TASK_FOR_DELETE(text, JSON.stringify(allFutureTasks, null, 2))}`;
      const taskId = await this._requestGpt(promptDeleteTask);

      console.log('ID do compromisso a cancelar:', taskId);

      if (!taskId || taskId === 'nenhum' || taskId === null) {
        await this.rabbitMQService.sendToQueue({
          chatId: process.env.TELEGRAM_CHAT_ID,
          message: 'Não encontrei nenhuma tarefa para cancelar.',
        });
        return 'Tarefa não encontrada';
      }

      // Buscar a tarefa antes de deletar para mostrar os detalhes
      const taskToDelete = await this.scheduleService.getScheduleById(taskId);

      // Deletar a tarefa
      await this.scheduleService.deleteSchedule(taskId);

      // Enviar confirmação detalhada
      const confirmationMessage = this._formatTaskConfirmation(
        taskToDelete as {
          assunto?: string;
          descricao?: string;
          dia?: string;
          horario?: string;
        },
        'cancelada',
      );
      await this.rabbitMQService.sendToQueue({
        chatId: process.env.TELEGRAM_CHAT_ID,
        message: confirmationMessage,
      });

      return 'Tarefa cancelada com sucesso';
    } catch (error) {
      console.error('Erro ao cancelar tarefa:', error);
      await this.rabbitMQService.sendToQueue({
        chatId: process.env.TELEGRAM_CHAT_ID,
        message: 'Desculpe, ocorreu um erro ao cancelar a tarefa.',
      });
      return 'Erro ao cancelar tarefa';
    }
  }

  async editTask(text: string): Promise<string> {
    try {
      // Passo 1: Identificar qual tarefa o usuário quer editar
      const allTasks = await this.scheduleService.getAllSchedules();
      const promptIdentifyTask = PROMPT_IDENTIFIER_TASK_FOR_EDIT(
        text,
        JSON.stringify(allTasks, null, 2),
      );

      const identifyResponse = await this._requestGpt(promptIdentifyTask);
      console.log('ID do compromisso a editar:', identifyResponse);

      if (!identifyResponse || identifyResponse === 'nenhum') {
        await this.rabbitMQService.sendToQueue({
          chatId: process.env.TELEGRAM_CHAT_ID,
          message: 'Não encontrei nenhuma tarefa para editar.',
        });
        return 'Tarefa não encontrada';
      }

      // Passo 2: Extrair os novos dados da mensagem
      const promptExtractData = PROMPT_EXTRACT_EDIT_DATA(text);
      const extractResponse = await this._requestGpt(promptExtractData);

      console.log('Dados para atualizar:', extractResponse);

      const updateData = JSON.parse(extractResponse) as {
        dia?: string | null;
        horario?: string | null;
        assunto?: string | null;
        descricao?: string | null;
      };

      // Passo 3: Atualizar a tarefa
      await this.scheduleService.updateSchedule(identifyResponse, updateData);

      // Passo 4: Buscar a tarefa atualizada e enviar confirmação detalhada
      const updatedTask =
        await this.scheduleService.getScheduleById(identifyResponse);

      const confirmationMessage = this._formatTaskConfirmation(
        updatedTask as {
          assunto?: string;
          descricao?: string;
          dia?: string;
          horario?: string;
        },
        'atualizada',
      );
      await this.rabbitMQService.sendToQueue({
        chatId: process.env.TELEGRAM_CHAT_ID,
        message: confirmationMessage,
      });

      return 'Tarefa atualizada com sucesso';
    } catch (error) {
      console.error('Erro ao editar tarefa:', error);
      await this.rabbitMQService.sendToQueue({
        chatId: process.env.TELEGRAM_CHAT_ID,
        message: 'Desculpe, ocorreu um erro ao editar a tarefa.',
      });
      return 'Erro ao editar tarefa';
    }
  }
}
