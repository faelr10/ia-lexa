// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-return */
// import { Injectable } from '@nestjs/common';
// import {
//   connect,
//   ChannelWrapper,
//   AmqpConnectionManager,
// } from 'amqp-connection-manager';

// @Injectable()
// export class RabbitMQService {
//   private channel: ChannelWrapper;

//   constructor() {
//     const connection: AmqpConnectionManager = connect([
//       'amqp://admin:admin@rabbitmq:5672',
//     ]);

//     connection.on('connect', () => console.log('✅ Conectado ao RabbitMQ'));
//     connection.on('disconnect', (err) =>
//       console.log('❌ Desconectado do RabbitMQ', err?.err?.message),
//     );

//     this.channel = connection.createChannel({
//       setup: (channel) => {
//         return channel.assertQueue('send-messages', { durable: true });
//       },
//     });
//   }

//   async sendToQueue(data: any) {
//     console.log('📨 Enviando para a fila...');
//     const enviado = await this.channel.sendToQueue(
//       'send-messages',
//       Buffer.from(JSON.stringify(data)),
//     );

//     console.log('✅ Resultado do envio:', enviado);
//   }
// }

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  connect,
  ChannelWrapper,
  AmqpConnectionManager,
} from 'amqp-connection-manager';
import { ConfirmChannel, Options } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: AmqpConnectionManager;
  private channel: ChannelWrapper;
  private isReady = false;

  constructor() {
    this.connection = connect([process.env.RABBITMQ_URL as string], {
      heartbeatIntervalInSeconds: 30,
      reconnectTimeInSeconds: 2,
    });

    this.connection.on('connect', () => {
      console.log('✅ Conectado ao RabbitMQ');
      this.isReady = true;
    });

    this.connection.on('disconnect', (err) => {
      console.log('❌ Desconectado do RabbitMQ', err?.err?.message);
      this.isReady = false;
    });

    this.connection.on('connectFailed', (err) => {
      console.error('❌ Falha ao conectar no RabbitMQ:', err.err);
    });

    this.channel = this.connection.createChannel({
      json: false,
      setup: async (channel: ConfirmChannel) => {
        console.log('🔧 Configurando canal...');

        // await channel.confirmSelect();

        await channel.assertQueue('send-messages', {
          durable: true,
        });

        console.log('✅ Fila configurada');
      },
    });

    this.channel.on('error', (err) => {
      console.error('❌ Erro no canal:', err);
    });

    this.channel.on('close', () => {
      console.log('⚠️ Canal fechado');
    });
  }

  async onModuleInit() {
    await this.channel.waitForConnect();
    console.log('✅ Canal RabbitMQ pronto para uso');
  }

  async onModuleDestroy() {
    await this.channel.close();
    await this.connection.close();
  }

  async sendToQueue(data: any): Promise<boolean> {
    if (!this.isReady) {
      console.warn('⚠️ RabbitMQ não está conectado ainda');
      throw new Error('RabbitMQ não está conectado');
    }

    try {
      console.log('📨 Enviando para a fila...', data);

      const message = Buffer.from(JSON.stringify(data));

      const result = await this.channel.sendToQueue(
        'send-messages',
        message,
        {
          persistent: true, // Marca a mensagem como persistente
        } as Options.Publish, // Cast explícito para o tipo correto
      );

      console.log('✅ Mensagem enviada com sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  // Método auxiliar para verificar a saúde
  healthCheck(): boolean {
    return this.isReady;
  }
}
