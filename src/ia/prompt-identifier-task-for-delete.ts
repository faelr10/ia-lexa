export const PROMPT_IDENTIFIER_TASK_FOR_DELETE = (
  mensagemUsuario: string,
  lista: string, // Recebe a string JSON já formatada
) => `
Você receberá uma mensagem de um usuário e uma lista de compromissos.  
Sua tarefa é identificar **qual compromisso o usuário deseja cancelar** e retornar **apenas o valor do campo "id" do objeto correspondente**.

Regras importantes:
- Compare a mensagem com os campos "assunto" e "descricao" de cada compromisso.
- Use a data ("dia") e o horário ("horario") se forem mencionados na mensagem.
- Palavras relativas como "hoje" ou "amanhã" devem ser interpretadas como a data atual do sistema.
- A data atual do sistema é ${new Date().toISOString().split('T')[0]}.
- **Retorne apenas o id** do compromisso correto, sem nenhum texto adicional.
- Se não encontrar nenhum compromisso que combine, retorne "nenhum".

Mensagem do usuário: "${mensagemUsuario}"

Lista de compromissos: ${lista}
`;