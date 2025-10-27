// src/schedule/schedule.module.ts
import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleRepository } from './schedule.repository';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [],
  providers: [ScheduleService, ScheduleRepository, PrismaClient],
  exports: [ScheduleService],
})
export class ScheduleModule {}
