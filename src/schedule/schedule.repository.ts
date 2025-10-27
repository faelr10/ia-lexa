/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ScheduleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async saveSchedule(data: any): Promise<any> {
    try {
      const schedule = await this.prisma.schedule.create({
        data: JSON.parse(data),
      });
      return schedule;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao salvar agendamento');
    }
  }

  async listAllSchedules(): Promise<any[]> {
    try {
      const schedules = await this.prisma.schedule.findMany();
      return schedules;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao listar agendamentos');
    }
  }

  async getSchedulesByDate(dt_ini: string, dt_fim: string): Promise<any[]> {
    try {
      const schedules = await this.prisma.schedule.findMany({
        where: {
          dia: {
            gte: dt_ini,
            lte: dt_fim,
          },
        },
      });
      return schedules;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Erro ao buscar agendamentos por data',
      );
    }
  }

  async getAllSchedules(): Promise<any[]> {
    try {
      const schedules = await this.prisma.schedule.findMany();
      return schedules;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Erro ao buscar todos os agendamentos',
      );
    }
  }

  async deleteSchedule(id: string): Promise<void> {
    try {
      await this.prisma.schedule.delete({
        where: { id: id },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao deletar o agendamento');
    }
  }
}
