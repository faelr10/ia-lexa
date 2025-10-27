import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { ChatGptService } from 'src/ia/chatgpt.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  public bot: TelegramBot;

  constructor(
    @Inject(forwardRef(() => ChatGptService))
    private readonly chatGptService: ChatGptService,
  ) {}

  onModuleInit() {
    const token = String(process.env.TELEGRAM_BOT_TOKEN);

    if (!this.bot) {
      this.bot = new TelegramBot(token, { polling: true });
    }

    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;

      if (msg.voice) {
        const fileId = msg.voice.file_id;
        const fileLink = await this.bot.getFileLink(fileId);
        console.log('Link do arquivo de voz:', fileLink);
        const texto =
          await this.chatGptService.transcribeTelegramAudio(fileLink);
        console.log(texto);

        try {
          await this.chatGptService.newRequest(texto);
          return;
        } catch (err) {
          console.error('Erro ao processar ou enviar mensagem:', err);
          await this.sendTelegramMessage(
            chatId,
            'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
          );
        }
      }

      const text = msg.text;
      if (!text) return;

      console.log(`Mensagem recebida: "${text}" do chat ${chatId}`);

      try {
        await this.chatGptService.newRequest(text);
        return;
      } catch (err) {
        console.error('Erro ao processar ou enviar mensagem:', err);
        await this.sendTelegramMessage(
          chatId,
          'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        );
      }
    });
  }

  private async sendTelegramMessage(chatId: number, message: string) {
    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      return;
    } catch (err) {
      console.log('Erro ao enviar mensagem:', err);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  async sendMessage(chatId: number, message: string) {
    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: undefined });
      return;
    } catch (error) {
      throw new Error('Erro ao enviar mensagem: ' + error);
    }
  }
}
