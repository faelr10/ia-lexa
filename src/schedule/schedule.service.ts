/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable } from '@nestjs/common';
import { ScheduleRepository } from './schedule.repository';

@Injectable()
export class ScheduleService {
  constructor(
    @Inject(ScheduleRepository)
    private readonly scheduleRepository: ScheduleRepository,
  ) {}

  async saveSchedule(data: any): Promise<any> {
    return this.scheduleRepository.saveSchedule(data);
  }

  async getSchedulesByDate(data: string): Promise<any[]> {
    const { dt_ini, dt_fim } = JSON.parse(data);
    const response = await this.scheduleRepository.getSchedulesByDate(
      dt_ini,
      dt_fim,
    );
    return response;
  }

  async getAllSchedules(): Promise<any[]> {
    return this.scheduleRepository.getAllSchedules();
  }

  async deleteSchedule(id: string): Promise<void> {
    await this.scheduleRepository.deleteSchedule(id);
  }
}
