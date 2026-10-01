export const PHASE4_TOOLS = Object.freeze([
  {
    type: 'function',
    name: 'consultar_estado',
    description: 'Lê recorte autorizado do estado persistente.',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        entidades: { type: 'array', items: { type: 'string' } },
        campos: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'localizacao','tempo','recursos','ferimentos','condicoes','inventario','equipamento',
              'competencias','tecnicas','relacoes','reputacao','objetivos','relogios','fatos','rumores',
              'pistas','estado_npc','estado_criatura','resumo_cena','resumo_campanha'
            ]
          }
        },
        perspectiva: { type: 'string', enum: ['motor','personagem'] }
      },
      required: ['entidades','campos','perspectiva'],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'realizar_teste',
    description: 'Pede ao motor a resolução de uma ação incerta; o modelo não fornece CD nem dado.',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        ator_id: { type: 'string' },
        intencao: { type: 'string' },
        atributo_sugerido: {
          type: ['string','null'],
          enum: ['potencia','agilidade','vigor','intelecto','percepcao','presenca',null]
        },
        competencia_sugerida: { type: ['string','null'] },
        especialidade_sugerida: { type: ['string','null'] },
        contexto: { type: 'string' },
        resultado_desejado: { type: 'string' },
        riscos_percebidos: { type: 'array', items: { type: 'string' } }
      },
      required: [
        'ator_id','intencao','atributo_sugerido','competencia_sugerida','especialidade_sugerida',
        'contexto','resultado_desejado','riscos_percebidos'
      ],
      additionalProperties: false
    }
  }
]);

export const NARRATOR_OUTPUT_FORMAT = Object.freeze({
  type: 'json_schema',
  name: 'lumyriel_narrator_output',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      narrativa: { type: 'string' },
      acoes_sugeridas: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            rotulo: { type: 'string' },
            intencao: { type: 'string' },
            categoria: {
              type: 'string',
              enum: ['social','investigacao','exploracao','viagem','combate','oficio','sobrevivencia','descanso','transicao','outra']
            },
            alvo_id: { type: ['string','null'] },
            risco_percebido: {
              type: ['string','null'],
              enum: ['baixo','moderado','alto','extremo','desconhecido',null]
            },
            requer_teste_desconhecido: { type: 'boolean' }
          },
          required: ['id','rotulo','intencao','categoria','alvo_id','risco_percebido','requer_teste_desconhecido'],
          additionalProperties: false
        }
      },
      acao_livre: { type: 'boolean' },
      fase_da_cena: {
        type: 'string',
        enum: ['abertura','exploracao','social','investigacao','viagem','combate','perseguicao','descanso','transicao','resolucao','epilogo']
      },
      risco_visivel: {
        type: ['string','null'],
        enum: ['baixo','moderado','alto','extremo','desconhecido',null]
      },
      confianca_do_risco: {
        type: ['string','null'],
        enum: ['alta','media','baixa','desconhecida',null]
      },
      avisos_de_interface: { type: 'array', items: { type: 'string' } },
      entidades_visiveis: { type: 'array', items: { type: 'string' } }
    },
    required: [
      'narrativa','acoes_sugeridas','acao_livre','fase_da_cena','risco_visivel','confianca_do_risco',
      'avisos_de_interface','entidades_visiveis'
    ],
    additionalProperties: false
  }
});

export const NARRATOR_INSTRUCTIONS = `Você é o Narrador de um RPG single-player situado em Lumyriel.

AUTORIDADE:
- O backend é soberano sobre estado, dados, dificuldades, inventário, recursos, ferimentos, relações, reputação e fatos persistentes.
- Você narra, interpreta intenções e pede ferramentas. Você não altera estado por prosa.
- Nunca escolha ou invente o resultado de um dado.
- Nunca forneça CD/dificuldade para realizar_teste. O motor decide.
- Nunca declare que uma ferramenta funcionou se o tool output retornar erro.
- Fatos marcados como SESSÃO não viram cânone.
- Não invente topônimos, instituições, rotas permanentes ou segredos como cânone.

AGÊNCIA:
- Trate a ação livre do jogador como válida entrada de intenção, mesmo quando não coincidir com ações sugeridas.
- Ações triviais e seguras não precisam de teste.
- Se houver incerteza real, risco ou pressão e a ação estiver mecanicamente mapeada, use realizar_teste.
- Se precisar confirmar estado autorizado, use consultar_estado.
- Nesta Fase 4 somente essas duas ferramentas existem. Se outra mutação fosse necessária, descreva a limitação sem inventar a alteração.

NARRAÇÃO:
- Respeite o NarratorTurnContext recebido.
- Não revele informação privada que não esteja no contexto autorizado.
- Falha move a situação; não trate toda falha como “nada acontece”.
- Evite proteção de roteiro automática, mas também não force combate.
- Produza sempre a saída final no schema lumyriel_narrator_output.`;
