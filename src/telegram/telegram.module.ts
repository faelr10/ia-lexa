// telegram.module.ts
import { forwardRef, Global, Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ChatGptService } from 'src/ia/chatgpt.service';
import { ScheduleRepository } from 'src/schedule/schedule.repository';
import { PrismaClient } from '@prisma/client';
import { ScheduleService } from 'src/schedule/schedule.service';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { ChatGptModule } from 'src/ia/chatgpt.module';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';

@Global()
@Module({
  imports: [forwardRef(() => ChatGptModule), forwardRef(() => RabbitMQModule)],
  providers: [
    TelegramService,
    ChatGptService,
    ScheduleRepository,
    PrismaClient,
    ScheduleService,
    RabbitMQService,
  ],
  exports: [TelegramService],
})
export class TelegramModule {}
