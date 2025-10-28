export const PROMPT_IDENTIFIER_TASK_FOR_EDIT = (
  mensagemUsuario: string,
  lista: string,
) => `
Você receberá uma mensagem de um usuário e uma lista de compromissos.
Sua tarefa é identificar **qual compromisso o usuário deseja editar** e retornar **apenas o valor do campo "id"** do objeto correspondente.

Regras importantes:
- Compare a mensagem com os campos "assunto" e "descricao" de cada compromisso.
- Use a data ("dia") e o horário ("horario") se forem mencionados na mensagem.
- Palavras relativas como "hoje" ou "amanhã" devem ser interpretadas como a data atual do sistema.
- A data atual do sistema é ${new Date().toISOString().split('T')[0]}.
- **Retorne APENAS o id** do compromisso correto, sem nenhum texto adicional.
- Se não encontrar nenhum compromisso que combine, retorne "nenhum".

Mensagem do usuário: "${mensagemUsuario}"

Lista de compromissos: ${lista}
`;

export const PROMPT_EXTRACT_EDIT_DATA = (
  mensagemUsuario: string,
) => `
Você é um assistente que extrai informações de edição de tarefas/agendamentos de mensagens em linguagem natural.

CONTEXTO TEMPORAL:
- Hoje: ${new Date().toISOString().split('T')[0]}

FORMATO JSON OBRIGATÓRIO:
{
  "dia": "YYYY-MM-DD",
  "horario": "HH:MM",
  "assunto": "string",
  "descricao": "string"
}

REGRAS DE EXTRAÇÃO:
1. Extraia apenas as informações novas que o usuário mencionou na mensagem.
2. Para campos que não foram mencionados, deixe como null (não modifique).
3. Mantenha os campos originais que não foram alterados.
4. Se o usuário não mencionou um campo específico, deixe como null.
5. Se o usuário mencionou explicitamente "remover" ou "cancelar" um campo, deixe como "" (string vazia).

Formato de saída:
- Se mencionou novo dia/horário/assunto/descricao → inclua no JSON
- Se não mencionou → deixe null

Exemplos:
Mensagem: "agora é para as 15h"
Saída: {"dia": null, "horario": "15:00", "assunto": null, "descricao": null}

Mensagem: "mudar para segunda às 10h"
Saída: {"dia": "2025-10-27", "horario": "10:00", "assunto": null, "descricao": null}

Mensagem: "nova descrição: reunião importante com o cliente"
Saída: {"dia": null, "horario": null, "assunto": null, "descricao": "Reunião importante com o cliente"}

Mensagem: "mudar o assunto para Dentista"
Saída: {"dia": null, "horario": null, "assunto": "Dentista", "descricao": null}

IMPORTANTE:
- Retorne APENAS o JSON válido, sem texto adicional ou markdown
- Campos não mencionados devem ser null
- Campos a remover devem ser "" (string vazia)
- Todos os campos são strings ou null

Mensagem a processar:
"${mensagemUsuario}"
`.trim();

