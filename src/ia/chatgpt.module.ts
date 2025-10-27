import { forwardRef, Module } from '@nestjs/common';
import { ChatGptService } from './chatgpt.service';
import { ChatGptController } from './chatgpt.controller';
import { ScheduleRepository } from 'src/schedule/schedule.repository';
import { PrismaClient } from '@prisma/client';
import { ScheduleService } from 'src/schedule/schedule.service';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [forwardRef(() => RabbitMQModule)],
  controllers: [ChatGptController],
  providers: [
    ChatGptService,
    ScheduleRepository,
    PrismaClient,
    ScheduleService,
    RabbitMQService,
  ],
  exports: [ChatGptService],
})
export class ChatGptModule {}
