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
    const parsed = JSON.parse(data) as { dt_ini: string; dt_fim: string };
    const response = await this.scheduleRepository.getSchedulesByDate(
      parsed.dt_ini,
      parsed.dt_fim,
    );
    return response;
  }

  async getAllSchedules(): Promise<any[]> {
    return this.scheduleRepository.getAllSchedules();
  }

  async deleteSchedule(id: string): Promise<void> {
    await this.scheduleRepository.deleteSchedule(id);
  }

  async updateSchedule(id: string, updates: any): Promise<any> {
    return this.scheduleRepository.updateSchedule(id, updates);
  }

  async getScheduleById(id: string): Promise<any> {
    return this.scheduleRepository.getScheduleById(id);
  }
}
