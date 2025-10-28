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

// Retorna o domingo desta semana (início da semana)
export function getThisSundayISO(): string {
  const today = new Date();
  const dayOfWeek = today.getDay(); // domingo=0
  const diff = dayOfWeek; // quantos dias voltar para domingo
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - diff);
  return sunday.toISOString().split('T')[0];
}

// Retorna o sábado desta semana (fim da semana)
export function getThisSaturdayISO(): string {
  const sundayISO = getThisSundayISO();
  const sunday = new Date(sundayISO);
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  return saturday.toISOString().split('T')[0];
}

// Retorna o domingo da próxima semana (início da próxima semana)
export function getNextSundayISO(): string {
  const sunday = new Date(getThisSundayISO());
  sunday.setDate(sunday.getDate() + 7);
  return sunday.toISOString().split('T')[0];
}

// Retorna o sábado da próxima semana (fim da próxima semana)
export function getNextSaturdayISO(): string {
  const sunday = new Date(getNextSundayISO());
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  return saturday.toISOString().split('T')[0];
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

// Retorna a próxima ocorrência de sábado (pode ser hoje ou daqui alguns dias)
export function getNextSaturdayOccurrenceISO(): string {
  return getNextWeekdayISO(6); // sábado = 6
}

// Retorna "hoje"
export function getTodayFormatted(): string {
  return getTodayISO();
}

// Retorna "amanhã"
export function getTomorrowISO(): string {
  return getDateOffset(1);
}

// Retorna a sexta-feira desta semana
export function getThisFridayISO(): string {
  return getNextWeekdayISO(5); // sexta-feira = 5
}

// Retorna o início do fim de semana (próximo sábado)
export function getThisWeekendStartISO(): string {
  return getNextSaturdayOccurrenceISO();
}

// Retorna o fim do fim de semana (próximo domingo após o sábado)
export function getThisWeekendEndISO(): string {
  const saturday = new Date(getThisWeekendStartISO());
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  return sunday.toISOString().split('T')[0];
}

// Retorna os próximos X dias
export function getNextDaysISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// ✅ FUNÇÃO APIMORADA: Transformar em FUNÇÃO para gerar prompt dinâmico
export function getPromptTemplateGetTasksByDate(): string {
  return `
Você é um assistente especializado em interpretar solicitações de datas e períodos de tarefas/agendamentos.

📅 CONTEXTO TEMPORAL:
Data de hoje: ${getTodayISO()}

📋 FORMATO DE SAÍDA OBRIGATÓRIO:
Retorne APENAS um JSON válido, sem texto adicional, explicações ou markdown:

{
  "dt_ini": "AAAA-MM-DD",
  "dt_fim": "AAAA-MM-DD"
}

🔑 REGRAS FUNDAMENTAIS:
1. Retorne APENAS o JSON, sem código markdown (sem backticks)
2. Use SEMPRE formato ISO "AAAA-MM-DD" para as datas
3. "dt_ini" = data inicial do período (INCLUSIVA)
4. "dt_fim" = data final do período (INCLUSIVA)
5. Se NÃO for sobre agendamentos, retorne: {"dt_ini": null, "dt_fim": null}
6. Use a data de HOJE como referência para cálculos relativos
7. "Semana" = Domingo a Sábado (7 dias completos)
8. "Mês" = Do dia 1 ao último dia do mês

📅 INTERPRETAÇÕES DE PERÍODOS:

PERÍODOS RELATIVOS:
- "hoje" → de hoje até hoje (período de 1 dia)
- "amanhã" → de amanhã até amanhã
- "depois de amanhã" → 2 dias a partir de hoje
- "próximos 3 dias" → de hoje até daqui 3 dias
- "próximos 7 dias" → de hoje até daqui 7 dias
- "próximas 2 semanas" → 14 dias a partir de hoje

DIAS DA SEMANA:
- "segunda", "terça", etc → próxima ocorrência desse dia
- "esta segunda" → segunda-feira desta semana
- "próxima terça" → próxima terça-feira (pode ser desta ou da próxima semana)

PERÍODOS SEMANAIS:
- "esta semana" → Domingo a Sábado desta semana
- "próxima semana" → Domingo a Sábado da próxima semana
- "fim de semana" → Sábado e Domingo próximos
- "próximo fim de semana" → Próximo sábado e domingo

PERÍODOS MENSAIS:
- "este mês" → Do dia 1 ao último dia do mês atual
- "próximo mês" → Do dia 1 ao último dia do mês seguinte
- "mês que vem" → Mesmo que "próximo mês"

PERÍODOS ANUAIS:
- "este ano" → De 1º de janeiro a 31 de dezembro do ano atual
- "próximo ano" → De 1º de janeiro a 31 de dezembro do próximo ano

DATAS ESPECÍFICAS:
- "dia 15" → dia 15 do mês atual (ou próximo se já passou)
- "dia 20 de fevereiro" → 20 de fevereiro do ano atual
- "25/01" → 25 de janeiro do ano atual

PERÍODOS COM RANGE:
- "entre dia 10 e 20" → do dia 10 ao dia 20 do mês atual
- "durante janeiro" → 1 a 31 de janeiro do ano atual
- "primeira semana de dezembro" → dias 1-7 de dezembro

📝 EXEMPLOS CONCRETOS:

Entrada: "Quero meus agendamentos de hoje"
Saída: {"dt_ini": "${getTodayFormatted()}", "dt_fim": "${getTodayFormatted()}"}

Entrada: "Mostre os agendamentos de amanhã"
Saída: {"dt_ini": "${getTomorrowISO()}", "dt_fim": "${getTomorrowISO()}"}

Entrada: "Agendamentos desta semana"
Saída: {"dt_ini": "${getThisSundayISO()}", "dt_fim": "${getThisSaturdayISO()}"}

Entrada: "Agendamentos da próxima semana"
Saída: {"dt_ini": "${getNextSundayISO()}", "dt_fim": "${getNextSaturdayISO()}"}

Entrada: "Agendamentos deste mês"
Saída: {"dt_ini": "${getFirstDayOfMonthISO()}", "dt_fim": "${getLastDayOfMonthISO()}"}

Entrada: "Agendamentos do próximo mês"
Saída: {"dt_ini": "${getFirstDayOfNextMonthISO()}", "dt_fim": "${getLastDayOfNextMonthISO()}"}

Entrada: "Fim de semana"
Saída: {"dt_ini": "${getThisWeekendStartISO()}", "dt_fim": "${getThisWeekendEndISO()}"}

Entrada: "Próximos 7 dias"
Saída: {"dt_ini": "${getTodayFormatted()}", "dt_fim": "${getNextDaysISO(7)}"}

Entrada: "Agendamentos de sábado"
Saída: {"dt_ini": "${getNextSaturdayOccurrenceISO()}", "dt_fim": "${getNextSaturdayOccurrenceISO()}"}

Entrada: "Todas as minhas tarefas"
Saída: {"dt_ini": null, "dt_fim": null}

Entrada: "Oi, tudo bem?"
Saída: {"dt_ini": null, "dt_fim": null}

⚠️ IMPORTANTE:
- Se não identificar um período específico ou não for sobre agendamentos, retorne null para ambos os campos
- Não invente datas se não tiver certeza
- Considere sempre o contexto temporal fornecido
- Para "todos" ou "todas", retorne null para ambos os campos (indicando busca sem filtro de data)
`;
}
