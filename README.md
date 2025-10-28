# IA Lexa 🤖

Aplicação NestJS de assistente virtual inteligente para gerenciamento de tarefas via Telegram, utilizando inteligência artificial (OpenAI GPT-4 e Whisper) para processar mensagens de texto e áudio.

## 📋 Sobre o Projeto

A **IA Lexa** é um bot do Telegram que ajuda você a gerenciar suas tarefas e agendamentos de forma natural e intuitiva. Você pode interagir com o bot através de mensagens de texto ou voz, e a IA entenderá sua intenção para criar, consultar, editar ou cancelar tarefas.

### 🎯 Funcionalidades

- ✨ **Criação de Tarefas**: Solicite novas tarefas de forma natural via texto ou voz
- 📅 **Consulta de Agendamentos**: Busque suas tarefas por período ou data específica
- ✏️ **Edição de Tarefas**: Modifique tarefas existentes com uma simples mensagem
- 🗑️ **Cancelamento de Tarefas**: Cancele tarefas de forma rápida e intuitiva
- 🎤 **Reconhecimento de Voz**: Envie mensagens de áudio e a IA transcreverá automaticamente
- 🧠 **Processamento Inteligente**: Utiliza GPT-4 para entender o contexto e as intenções do usuário

## 🛠️ Tecnologias

- **Backend**: NestJS
- **Banco de Dados**: MongoDB com Prisma ORM
- **IA**: OpenAI (GPT-4o-mini + Whisper)
- **Message Queue**: RabbitMQ
- **Bot**: Telegram Bot API
- **Containerização**: Docker & Docker Compose

## 📦 Pré-requisitos

- Node.js (versão 18 ou superior)
- Docker e Docker Compose
- Conta na OpenAI (para API key)
- Bot do Telegram (para bot token)

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd ia-lexa
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# API OpenAI
OPENAI_API_KEY=your_openai_api_key

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Porta da aplicação
PORT=3001
```

4. **Inicie os serviços com Docker Compose**
```bash
docker-compose up -d
```

Isso iniciará:
- MongoDB na porta `27017`
- Mongo Express na porta `8081` (interface web para o MongoDB)
- RabbitMQ na porta `5672` (AMQP) e `15672` (painel web)

5. **Execute as migrações do Prisma**
```bash
npx prisma generate
npx prisma migrate dev
```

6. **Inicie a aplicação**
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run start:prod
```

A aplicação estará rodando em `http://localhost:3001`

## 📂 Estrutura do Projeto

```
src/
├── app.module.ts              # Módulo principal
├── main.ts                    # Entry point da aplicação
├── ia/                        # Módulo de IA
│   ├── chatgpt.service.ts     # Serviço de integração com OpenAI
│   ├── chatgpt.controller.ts  # Endpoints HTTP para ChatGPT
│   └── prompts.ts             # Prompts para GPT
├── telegram/                  # Módulo do Telegram
│   └── telegram.service.ts    # Serviço do bot Telegram
├── rabbitmq/                  # Módulo RabbitMQ
│   ├── rabbitmq.service.ts    # Serviço RabbitMQ (producer)
│   └── message.consumer.ts    # Consumer de mensagens
├── schedule/                  # Módulo de agendamentos
│   ├── schedule.service.ts    # Lógica de negócio
│   └── schedule.repository.ts # Acesso ao banco de dados
└── tasks/                     # Módulo de tarefas
    └── tasks.service.ts       # Serviço de tarefas
```

## 🏗️ Arquitetura

```
┌─────────────┐
│   Telegram  │
│     Bot     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  TelegramService│
│   (Listener)    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  ChatGptService │
│   (AI Logic)    │
└──────┬──────────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌──────────┐    ┌──────────────┐
│ScheduleDB│    │  RabbitMQ    │
│ (MongoDB)│    │   Queue      │
└──────────┘    └──────┬───────┘
                      │
                      ▼
              ┌──────────────┐
              │  Consumer    │
              │ (Send to TG) │
              └──────────────┘
```

## 📝 Uso

### Interagindo com o bot

1. Abra o Telegram e encontre seu bot
2. Envie mensagens de texto ou áudio com suas solicitações:

**Exemplos de comandos:**
- "Criar uma tarefa de reunião amanhã às 14h"
- "Quais são minhas tarefas da semana?"
- "Cancelar a reunião de amanhã"
- "Editar a reunião para quinta-feira às 15h"
- Envie um áudio descrevendo sua tarefa

### API REST

Também é possível usar a API REST diretamente:

```bash
POST http://localhost:3001/chatgpt/prompt
Content-Type: application/json

{
  "prompt": "Criar tarefa para reunião amanhã às 14h"
}
```

## 🧪 Testes

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🐳 Docker

### Subir todos os serviços
```bash
docker-compose up -d
```

### Parar os serviços
```bash
docker-compose down
```

### Visualizar logs
```bash
docker-compose logs -f
```

### Acessar painéis

- **RabbitMQ Management**: http://localhost:15672
  - Usuário: `admin`
  - Senha: `admin`

- **Mongo Express**: http://localhost:8081

## 📄 Licença

MIT

## 👨‍💻 Autor

Rafael

## 🙏 Agradecimentos

- NestJS Framework
- OpenAI
- Telegram Bot API
- Prisma
