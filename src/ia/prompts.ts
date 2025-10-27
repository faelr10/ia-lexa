// export const promptTemplateIdentifier = `Analise a seguinte mensagem e determine se a intenção é:

// 1. Criar uma nova tarefa → "new-task"
// 2. Retornar dados das tarefas já agendadas → "get-task"
// 3. Nenhuma das opções acima → "nenhum-dos-dois"

// Retorne **somente** um JSON no seguinte formato, sem explicações adicionais:

// {
//   "action": "get-task" | "new-task" | "nenhum-dos-dois"
// }
// `;

// export function buildDynamicPromptToNewTask(text: string): string {
//   const now = new Date();

//   // Formata HOJE (YYYY-MM-DD)
//   const dia = now.toISOString().split('T')[0];

//   // Formata AGORA (HH:MM)
//   const horario = now.toTimeString().slice(0, 5);

//   // Dia da semana por extenso
//   const diasSemana = [
//     'domingo',
//     'segunda',
//     'terça',
//     'quarta',
//     'quinta',
//     'sexta',
//     'sábado',
//   ];
//   const diaSemanaHoje = diasSemana[now.getDay()];

//   // Mês por extenso
//   const meses = [
//     'janeiro',
//     'fevereiro',
//     'março',
//     'abril',
//     'maio',
//     'junho',
//     'julho',
//     'agosto',
//     'setembro',
//     'outubro',
//     'novembro',
//     'dezembro',
//   ];
//   const mesAtual = meses[now.getMonth()];

//   return `
// Você é um assistente especializado em extrair informações de tarefas/agendamentos de mensagens em linguagem natural.

// CONTEXTO TEMPORAL (ESSENCIAL):
// - Data de hoje: ${dia} (${diaSemanaHoje})
// - Horário atual: ${horario}
// - Mês atual: ${mesAtual}

// ESTRUTURA JSON OBRIGATÓRIA:
// {
//   "horario": "HH:MM",
//   "dia": "YYYY-MM-DD",
//   "assunto": "string",
//   "descricao": "string"
// }

// REGRAS DE EXTRAÇÃO:

// 1. CAMPO "dia" (obrigatório):
//    - Formato: YYYY-MM-DD
//    - Resolva datas relativas usando o contexto acima:
//      * "hoje" → ${dia}
//      * "amanhã" → próximo dia após ${dia}
//      * "segunda", "terça", etc → próxima ocorrência do dia da semana
//      * "próxima semana" → mesma dia da semana +7 dias
//      * "dia 25" → 25 do mês atual (ou próximo se já passou)
//    - Se não houver data mencionada, use HOJE: ${dia}

// 2. CAMPO "horario":
//    - Formato: HH:MM (24h)
//    - Exemplos: "14h" → "14:00", "9h30" → "09:30", "meio-dia" → "12:00"
//    - Se NÃO houver horário mencionado: "" (string vazia)
//    - Não invente horários, deixe vazio se não especificado

// 3. CAMPO "assunto" (obrigatório):
//    - Extraia o tema/ação principal da tarefa
//    - Seja conciso (máximo 50 caracteres)
//    - Capitalize a primeira letra
//    - Exemplos: "Cortar cabelo", "Reunião com cliente", "Consulta médica"

// 4. CAMPO "descricao":
//    - Informações complementares da mensagem
//    - Se houver local, participantes, observações, inclua aqui
//    - Se a mensagem for muito simples e não houver detalhes, deixe "" (string vazia)
//    - Não repita o assunto

// EXEMPLOS:

// Entrada: "preciso cortar cabelo sexta às 14h"
// Saída: {"horario": "14:00", "dia": "2025-10-24", "assunto": "Cortar cabelo", "descricao": ""}

// Entrada: "reunião com o cliente importante amanhã de manhã no escritório"
// Saída: {"horario": "", "dia": "2025-10-24", "assunto": "Reunião com cliente", "descricao": "Cliente importante, no escritório, período da manhã"}

// Entrada: "lembrar de comprar pão"
// Saída: {"horario": "", "dia": "${dia}", "assunto": "Comprar pão", "descricao": ""}

// Entrada: "dentista dia 25 às 15h na clínica odonto"
// Saída: {"horario": "15:00", "dia": "2025-10-25", "assunto": "Dentista", "descricao": "Clínica Odonto"}

// IMPORTANTE:
// - Retorne APENAS o JSON, sem explicações, markdown ou texto extra
// - Todos os campos são strings
// - Use o contexto temporal para calcular datas corretamente
// - Não invente informações que não estão na mensagem

// MENSAGEM A PROCESSAR:
// "${text}"
// `.trim();
// }
export const promptTemplateIdentifier = `
Analise a seguinte mensagem e determine a intenção principal do usuário.

Possíveis intenções:
1. Criar uma nova tarefa → "new-task" (qualquer compromisso, compromisso pessoal, reunião ou ação agendada)
2. Consultar tarefas já agendadas → "get-task"
3. Deletar um compromisso ou tarefa → "delete-task"
4. Nenhuma das opções acima → "nenhum-dos-dois"

Responda **APENAS** com o JSON abaixo, sem explicações, comentários ou markdown:

{
  "action": "new-task" | "get-task" | "delete-task" | "nenhum-dos-dois"
}

Exemplos:

Mensagem: "Agende uma reunião com o cliente amanhã"
Saída: {"action": "new-task"}

Mensagem: "Hoje vou ao shopping às 18:00"
Saída: {"action": "new-task"}

Mensagem: "Quero ver meus agendamentos da próxima semana"
Saída: {"action": "get-task"}

Mensagem: "Apague meu compromisso com o médico de amanhã"
Saída: {"action": "delete-task"}

Mensagem: "Oi, tudo bem?"
Saída: {"action": "nenhum-dos-dois"}

Mensagem a analisar:
"\${text}"
`;

export function buildDynamicPromptToNewTask(text: string): string {
  const now = new Date();

  const dia = now.toISOString().split('T')[0];
  const horario = now.toTimeString().slice(0, 5);

  const diasSemana = [
    'domingo',
    'segunda',
    'terça',
    'quarta',
    'quinta',
    'sexta',
    'sábado',
  ];
  const diaSemanaHoje = diasSemana[now.getDay()];

  const meses = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];
  const mesAtual = meses[now.getMonth()];

  return `
Você é um assistente que extrai informações de tarefas/agendamentos de mensagens em linguagem natural.

**CONTEXTO TEMPORAL**
- Hoje: ${dia} (${diaSemanaHoje})
- Hora atual: ${horario}
- Mês: ${mesAtual}

**Formato JSON obrigatório**
{
  "dia": "YYYY-MM-DD",
  "horario": "HH:MM",
  "assunto": "string",
  "descricao": "string"
}

**Regras**
1. "dia": Resolva datas relativas. Se não houver data, use ${dia}.
   - hoje → ${dia}
   - amanhã → próximo dia
   - segunda, terça, etc → próxima ocorrência do dia
   - dia 25 → 25 do mês atual (ou próximo se já passou)
   - próxima semana → mesma semana +7 dias

2. "horario": Formato 24h. Exemplos:
   - 14h → 14:00
   - 9h30 → 09:30
   - meio-dia → 12:00
   - Se não houver horário, deixe ""

3. "assunto": Tema principal da tarefa. Máx 50 caracteres. Capitalize a primeira letra.

4. "descricao": Informações complementares (local, participantes, observações). Não repita o assunto. Se não houver, deixe ""

**Exemplos**
Mensagem: "preciso cortar cabelo sexta às 14h"
Saída: {"horario":"14:00","dia":"2025-10-24","assunto":"Cortar cabelo","descricao":""}

Mensagem: "reunião com cliente amanhã de manhã no escritório"
Saída: {"horario":"","dia":"2025-10-24","assunto":"Reunião com cliente","descricao":"Cliente, período da manhã, no escritório"}

Mensagem: "dentista dia 25 às 15h na clínica"
Saída: {"horario":"15:00","dia":"2025-10-25","assunto":"Dentista","descricao":"Clínica"}

**IMPORTANTE**
- Retorne apenas o JSON, sem texto adicional ou markdown.
- Não invente informações.
- Todos os campos devem ser strings.

Mensagem a processar:
"${text}"
`.trim();
}

// export const promptTemplateGetTasksByDate = `
// Você é um assistente que interpreta mensagens do usuário sobre datas de agendamento.
// Sua tarefa é analisar a mensagem e retornar um JSON com as seguintes chaves:

// {
//   "dt_ini": "AAAA-MM-DD",
//   "dt_fim": "AAAA-MM-DD"
// }

// - "dt_ini" deve ser a data inicial do período solicitado.
// - "dt_fim" deve ser a data final do período solicitado.
// - Use sempre o formato ISO "AAAA-MM-DD".
// - Se a mensagem não indicar nenhum período específico, retorne null para ambas as datas.

// Exemplos de interpretação:

// Mensagem: "Quero meus agendamentos da próxima semana"
// Resposta: {"dt_ini": "2025-10-27", "dt_fim": "2025-11-02"}

// Mensagem: "Mostre os agendamentos de hoje"
// Resposta: {"dt_ini": "2025-10-23", "dt_fim": "2025-10-23"}

// Mensagem: "Agendamentos do mês que vem"
// Resposta: {"dt_ini": "2025-11-01", "dt_fim": "2025-11-30"}

// Mensagem: "Não quero nada"
// Resposta: {"dt_ini": null, "dt_fim": null}

// `;

// export const promptTemplateGetTasksByDate = `
// Você é um assistente especializado em interpretar solicitações de datas e períodos.

// IMPORTANTE: A data de hoje é ${new Date().toISOString().split('T')[0]}.

// Sua tarefa é analisar a mensagem do usuário e retornar APENAS um JSON válido no seguinte formato:

// {
//   "dt_ini": "AAAA-MM-DD",
//   "dt_fim": "AAAA-MM-DD"
// }

// REGRAS OBRIGATÓRIAS:
// 1. Retorne APENAS o JSON, sem texto adicional, explicações ou markdown
// 2. Use sempre o formato ISO "AAAA-MM-DD" para as datas
// 3. "dt_ini" é a data inicial do período (inclusive)
// 4. "dt_fim" é a data final do período (inclusive)
// 5. Se a mensagem não indicar período específico ou não for sobre agendamentos, retorne: {"dt_ini": null, "dt_fim": null}
// 6. Considere a data de hoje para calcular períodos relativos (hoje, amanhã, próxima semana, etc)
// 7. Para "semana", considere segunda a domingo
// 8. Para "mês", considere do dia 1 ao último dia do mês

// EXEMPLOS DE INTERPRETAÇÃO:

// Entrada: "Quero meus agendamentos de hoje"
// Saída: {"dt_ini": "${new Date().toISOString().split('T')[0]}", "dt_fim": "${new Date().toISOString().split('T')[0]}"}

// Entrada: "Mostre os agendamentos de amanhã"
// Saída: {"dt_ini": "${getDateOffset(1)}", "dt_fim": "${getDateOffset(1)}"}

// Entrada: "Agendamentos da próxima semana"
// Saída: {"dt_ini": "${getNextMondayISO()}", "dt_fim": "${getNextSundayISO()}"}

// Entrada: "Agendamentos desta semana"
// Saída: {"dt_ini": "${getThisMondayISO()}", "dt_fim": "${getThisSundayISO()}"}

// Entrada: "Agendamentos de 25 de dezembro"
// Saída: {"dt_ini": "${new Date().getFullYear()}-12-25", "dt_fim": "${new Date().getFullYear()}-12-25"}

// Entrada: "Agendamentos deste mês"
// Saída: {"dt_ini": "${getFirstDayOfMonthISO()}", "dt_fim": "${getLastDayOfMonthISO()}"}

// Entrada: "Agendamentos do próximo mês"
// Saída: {"dt_ini": "${getFirstDayOfNextMonthISO()}", "dt_fim": "${getLastDayOfNextMonthISO()}"}

// Entrada: "Agendamentos de janeiro"
// Saída: {"dt_ini": "${getNextYear()}-01-01", "dt_fim": "${getNextYear()}-01-31"}

// Entrada: "Agendamentos entre 20 e 25 de outubro"
// Saída: {"dt_ini": "2025-10-20", "dt_fim": "2025-10-25"}

// Entrada: "Oi, tudo bem?"
// Saída: {"dt_ini": null, "dt_fim": null}

// Entrada: "Não quero nada"
// Saída: {"dt_ini": null, "dt_fim": null}

// LEMBRE-SE: Retorne APENAS o JSON, nada mais.
// `;

function getNextMondayISO(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilNextMonday);
  return nextMonday.toISOString().split('T')[0];
}

function getThisMondayISO(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + daysToMonday);
  return monday.toISOString().split('T')[0];
}
