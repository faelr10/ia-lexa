// Retorna a data de hoje no formato ISO
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// Retorna a data de hoje + offset em dias
export function getDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// Retorna a segunda-feira desta semana
export function getThisMondayISO(): string {
  const today = new Date();
  const dayOfWeek = today.getDay(); // domingo=0
  const diff = (dayOfWeek + 6) % 7; // quantos dias voltar para segunda
  const monday = new Date(today);
  monday.setDate(today.getDate() - diff);
  return monday.toISOString().split('T')[0];
}

// Retorna o domingo desta semana
export function getThisSundayISO(): string {
  const mondayISO = getThisMondayISO();
  const monday = new Date(mondayISO);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday.toISOString().split('T')[0];
}

// Retorna a segunda-feira da próxima semana
export function getNextMondayISO(): string {
  const monday = new Date(getThisMondayISO());
  monday.setDate(monday.getDate() + 7);
  return monday.toISOString().split('T')[0];
}

// Retorna o domingo da próxima semana
export function getNextSundayISO(): string {
  const sunday = new Date(getNextMondayISO());
  sunday.setDate(sunday.getDate() + 6);
  return sunday.toISOString().split('T')[0];
}

// Retorna o primeiro dia do mês atual
export function getFirstDayOfMonthISO(): string {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return firstDay.toISOString().split('T')[0];
}

// Retorna o último dia do mês atual
export function getLastDayOfMonthISO(): string {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return lastDay.toISOString().split('T')[0];
}

// Retorna o primeiro dia do próximo mês
export function getFirstDayOfNextMonthISO(): string {
  const today = new Date();
  const firstDayNextMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    1,
  );
  return firstDayNextMonth.toISOString().split('T')[0];
}

// Retorna o último dia do próximo mês
export function getLastDayOfNextMonthISO(): string {
  const today = new Date();
  const lastDayNextMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 2,
    0,
  );
  return lastDayNextMonth.toISOString().split('T')[0];
}

// Retorna o ano atual
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

// Retorna o ano seguinte
export function getNextYear(): number {
  return new Date().getFullYear() + 1;
}

// Retorna a próxima ocorrência de um dia da semana (0=domingo,...,6=sábado)
// Se for hoje, retorna hoje
export function getNextWeekdayISO(targetDay: number): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntil = (targetDay - dayOfWeek + 7) % 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntil);
  return nextDate.toISOString().split('T')[0];
}

// Exemplos de uso para sábado
export function getNextSaturdayISO(): string {
  return getNextWeekdayISO(6); // sábado = 6
}

// ✅ MUDANÇA: transformar em FUNÇÃO para gerar prompt dinâmico
export function getPromptTemplateGetTasksByDate(): string {
  return `
Você é um assistente especializado em interpretar solicitações de datas e períodos.

IMPORTANTE: A data de hoje é ${getTodayISO()}.

Sua tarefa é analisar a mensagem do usuário e retornar APENAS um JSON válido no seguinte formato:

{
  "dt_ini": "AAAA-MM-DD",
  "dt_fim": "AAAA-MM-DD"
}

REGRAS OBRIGATÓRIAS:
1. Retorne APENAS o JSON, sem texto adicional
2. Use sempre o formato ISO "AAAA-MM-DD" para as datas
3. "dt_ini" é a data inicial do período (inclusive)
4. "dt_fim" é a data final do período (inclusive)
5. Se a mensagem não indicar período específico ou não for sobre agendamentos, retorne: {"dt_ini": null, "dt_fim": null}
6. Considere a data de hoje para calcular períodos relativos
7. Para "semana", considere segunda a domingo
8. Para "mês", considere do dia 1 ao último dia do mês

EXEMPLOS:

Entrada: "Quero meus agendamentos de hoje"
Saída: {"dt_ini": "${getTodayISO()}", "dt_fim": "${getTodayISO()}"}

Entrada: "Mostre os agendamentos de amanhã"
Saída: {"dt_ini": "${getDateOffset(1)}", "dt_fim": "${getDateOffset(1)}"}

Entrada: "Agendamentos desta semana"
Saída: {"dt_ini": "${getThisMondayISO()}", "dt_fim": "${getThisSundayISO()}"}

Entrada: "Agendamentos da próxima semana"
Saída: {"dt_ini": "${getNextMondayISO()}", "dt_fim": "${getNextSundayISO()}"}

Entrada: "Agendamentos deste mês"
Saída: {"dt_ini": "${getFirstDayOfMonthISO()}", "dt_fim": "${getLastDayOfMonthISO()}"}

Entrada: "Agendamentos do próximo mês"
Saída: {"dt_ini": "${getFirstDayOfNextMonthISO()}", "dt_fim": "${getLastDayOfNextMonthISO()}"}

Entrada: "Agendamentos de sábado"
Saída: {"dt_ini": "${getNextSaturdayISO()}", "dt_fim": "${getNextSaturdayISO()}"}

Entrada: "Oi, tudo bem?"
Saída: {"dt_ini": null, "dt_fim": null}
`;
}
