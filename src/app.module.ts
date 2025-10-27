import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { ChatGptModule } from './ia/chatgpt.module';
import { MessageConsumer } from './rabbitmq/message.consumer';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [TelegramModule, ChatGptModule, TasksModule],
  controllers: [AppController],
  providers: [AppService, MessageConsumer],
})
export class AppModule {}
