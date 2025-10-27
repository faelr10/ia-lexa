import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChatGptService } from 'src/ia/chatgpt.service';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { ScheduleService } from 'src/schedule/schedule.service';

@Injectable()
export class TasksService {
  constructor(
    @Inject(ScheduleService)
    private scheduleService: ScheduleService,
    @Inject(RabbitMQService)
    private rabbitMqService: RabbitMQService,
    @Inject(ChatGptService)
    private chatGptService: ChatGptService,
  ) {}

  // Executa todo dia às 7 da manhã
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  handleMidnightTask() {
    console.log('Rodando tarefa diária à meia-noite!');
  }

  // Executa a cada 1 hora
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleEveryHour() {
    //busca tarefas do dia
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const period = `{"dt_ini":"${yyyy}-${mm}-${dd}","dt_fim":"${yyyy}-${mm}-${dd}"}`;
    const listTasks = await this.scheduleService.getSchedulesByDate(period);

    await this.chatGptService.formatedListSchedules(listTasks);

    console.log('Rodando a cada 10 segundos...', listTasks);
  }
}
