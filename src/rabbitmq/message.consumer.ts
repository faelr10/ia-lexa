/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { TelegramService } from '../telegram/telegram.service';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConsumeMessage, Channel } from 'amqplib';

@Injectable()
export class MessageConsumer implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.AmqpConnectionManager;
  private channel: ChannelWrapper;

  constructor(
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramService: TelegramService,
  ) {
    console.log('🏗️ MessageConsumer criado');
    console.log('📱 TelegramService injetado:', !!this.telegramService);
  }

  async onModuleInit() {
    console.log('🎧 Iniciando consumer do RabbitMQ...');

    this.connection = amqp.connect(['amqp://admin:admin@localhost:5672'], {
      heartbeatIntervalInSeconds: 30,
      reconnectTimeInSeconds: 2,
    });

    this.connection.on('connect', () => {
      console.log('✅ Consumer conectado ao RabbitMQ');
    });

    this.connection.on('disconnect', (err) => {
      console.log('❌ Consumer desconectado', err?.err?.message);
    });

    this.connection.on('connectFailed', (err) => {
      console.error('❌ Consumer falhou ao conectar:', err);
    });

    this.channel = this.connection.createChannel({
      setup: async (channel: Channel) => {
        console.log('🔧 Configurando consumer...');

        const queueInfo = await channel.assertQueue('send-messages', {
          durable: true,
        });
        console.log(
          `📊 Fila "send-messages" - Mensagens: ${queueInfo.messageCount}, Consumidores: ${queueInfo.consumerCount}`,
        );

        await channel.prefetch(1);

        console.log('👂 Registrando consumer...');

        const consumeResult = await channel.consume(
          'send-messages',
          async (msg: ConsumeMessage | null) => {
            if (!msg) {
              console.log('⚠️ Mensagem nula recebida');
              return;
            }

            try {
              const content = msg.content.toString();
              console.log('📬 Mensagem recebida:', content);

              const { chatId, message } = JSON.parse(content);

              console.log(
                `📤 Tentando enviar para Telegram - ChatID: ${chatId}`,
              );
              console.log(`📝 Conteúdo da mensagem: ${message}`);
              console.log(
                `🔍 TelegramService disponível: ${!!this.telegramService}`,
              );

              // ✅ Adicione tratamento de erro específico
              if (!this.telegramService) {
                throw new Error('TelegramService não está disponível');
              }

              await this.telegramService.sendMessage(chatId, message);

              // await this.telegramService.bot.sendMessage(chatId, message);

              console.log('✅ Mensagem enviada com sucesso para o Telegram');
              channel.ack(msg);
            } catch (error) {
              console.error('❌ Erro ao processar mensagem:', error);
              console.error('❌ Stack:', error.stack);
              console.error('❌ Detalhes:', JSON.stringify(error, null, 2));

              // ✅ Rejeita a mensagem mas mantém na fila para retry
              channel.nack(msg, false, true); // requeue = true
            }
          },
          {
            noAck: false,
          },
        );

        console.log(
          `✅ Consumer registrado com tag: ${consumeResult.consumerTag}`,
        );
      },
    });

    this.channel.on('error', (err) => {
      console.error('❌ Erro no canal do consumer:', err);
    });

    this.channel.on('close', () => {
      console.log('⚠️ Canal do consumer fechado');
    });

    await this.channel.waitForConnect();
    console.log('✅ Consumer pronto para processar mensagens');
  }

  async onModuleDestroy() {
    console.log('🛑 Encerrando consumer...');
    await this.channel.close();
    await this.connection.close();
    console.log('✅ Consumer encerrado');
  }
}
