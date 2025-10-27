// rabbitmq.module.ts
import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { MessageConsumer } from './message.consumer';

@Module({
  imports: [],
  providers: [RabbitMQService, MessageConsumer],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
