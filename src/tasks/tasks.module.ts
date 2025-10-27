// src/schedule/schedule.module.ts
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduleService } from 'src/schedule/schedule.service';
import { ScheduleRepository } from 'src/schedule/schedule.repository';
import { PrismaClient } from '@prisma/client';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { ChatGptService } from 'src/ia/chatgpt.service';
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    TasksService,
    ScheduleService,
    RabbitMQService,
    ScheduleRepository,
    ChatGptService,
    PrismaClient,
  ],
  exports: [],
})
export class TasksModule {}
