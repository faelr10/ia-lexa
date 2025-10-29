/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ScheduleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private normalizeStatus(value: unknown): 'pending' | 'completed' | undefined {
    if (typeof value !== 'string') return undefined;
    const v = value.trim().toLowerCase();
    if (v === 'pending' || v === 'pendente') return 'pending';
    if (
      v === 'completed' ||
      v === 'concluida' ||
      v === 'concluído' ||
      v === 'concluido'
    )
      return 'completed';
    return undefined;
  }

  async saveSchedule(data: any): Promise<any> {
    try {
      const parsed = JSON.parse(data) as Record<string, unknown>;
      const normalized = this.normalizeStatus(parsed?.status);
      const payload = {
        ...parsed,
        status: normalized ?? 'pending',
      } as any;

      const schedule = await this.prisma.schedule.create({
        data: payload,
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
      return schedules.map((s) => {
        const obj = s as Record<string, unknown>;
        const status = typeof obj.status === 'string' ? obj.status : undefined;

        return {
          ...s,
          status: status ?? 'pending',
        };
      });
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
      return schedules.map((s) => {
        const obj = s as Record<string, unknown>;
        const status = typeof obj.status === 'string' ? obj.status : undefined;

        return {
          ...s,
          status: status ?? 'pending',
        };
      });
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
      return schedules.map((s) => {
        const obj = s as Record<string, unknown>;
        const status = typeof obj.status === 'string' ? obj.status : undefined;

        return {
          ...s,
          status: status ?? 'pending',
        };
      });
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

  async updateSchedule(id: string, updates: any): Promise<any> {
    try {
      // Filtra os campos null (campos não modificados)
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([, value]) => value !== null),
      ) as Record<string, unknown>;

      // Normaliza status quando fornecido
      if (Object.prototype.hasOwnProperty.call(filteredUpdates, 'status')) {
        const normalized = this.normalizeStatus(filteredUpdates.status);
        if (normalized) {
          filteredUpdates.status = normalized as any;
        } else {
          // Remove status inválido para não quebrar a atualização
          delete filteredUpdates.status;
        }
      }

      const schedule = await this.prisma.schedule.update({
        where: { id: id },
        data: filteredUpdates,
      });
      return schedule;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao atualizar o agendamento');
    }
  }

  async getScheduleById(id: string): Promise<any> {
    try {
      const schedule = await this.prisma.schedule.findUnique({
        where: { id: id },
      });
      if (!schedule) return schedule;
      const obj = schedule as Record<string, unknown>;
      const status = typeof obj.status === 'string' ? obj.status : undefined;

      return {
        ...schedule,
        status: status ?? 'pending',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao buscar agendamento');
    }
  }
}
