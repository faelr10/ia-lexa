import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3001);

  console.log(`🚀 Aplicação rodando na porta ${process.env.PORT ?? 3000}`);
}

bootstrap().catch((err) => {
  console.error('Erro no bootstrap:', err);
  process.exit(1);
});
