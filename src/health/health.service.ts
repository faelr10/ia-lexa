import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  // Executa a cada 10 minutos para manter a aplicação acordada
  @Cron(CronExpression.EVERY_10_MINUTES)
  async keepAlive() {
    try {
      const appUrl = process.env.APP_URL;

      if (!appUrl) {
        this.logger.warn('APP_URL não configurada. Ping desabilitado.');
        return;
      }

      this.logger.log(`🏓 Enviando ping para manter aplicação acordada...`);

      const response = await fetch(`${appUrl}/health/ping`);
      const data: unknown = await response.json();

      this.logger.log(`✅ Ping bem-sucedido: ${JSON.stringify(data)}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Erro no ping: ${errorMessage}`);
    }
  }
}
