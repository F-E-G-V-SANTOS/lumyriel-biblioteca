const RISK_ENUM = ['baixo', 'moderado', 'alto', 'extremo', 'desconhecido', null];

export const narratorTools = [
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
              'localizacao', 'tempo', 'recursos', 'ferimentos', 'condicoes', 'inventario',
              'equipamento', 'competencias', 'tecnicas', 'relacoes', 'reputacao', 'objetivos',
              'relogios', 'fatos', 'rumores', 'pistas', 'estado_npc', 'estado_criatura',
              'resumo_cena', 'resumo_campanha',
            ],
          },
        },
        perspectiva: { type: 'string', enum: ['motor', 'personagem'] },
      },
      required: ['entidades', 'campos', 'perspectiva'],
      additionalProperties: false,
    },
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
          type: ['string', 'null'],
          enum: ['potencia', 'agilidade', 'vigor', 'intelecto', 'percepcao', 'presenca', null],
        },
        competencia_sugerida: { type: ['string', 'null'] },
        especialidade_sugerida: { type: ['string', 'null'] },
        contexto: { type: 'string' },
        resultado_desejado: { type: 'string' },
        riscos_percebidos: { type: 'array', items: { type: 'string' } },
      },
      required: [
        'ator_id', 'intencao', 'atributo_sugerido', 'competencia_sugerida',
        'especialidade_sugerida', 'contexto', 'resultado_desejado', 'riscos_percebidos',
      ],
      additionalProperties: false,
    },
  },
];

export const narratorOutputFormat = {
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
              enum: ['social', 'investigacao', 'exploracao', 'viagem', 'combate', 'oficio', 'sobrevivencia', 'descanso', 'transicao', 'outra'],
            },
            alvo_id: { type: ['string', 'null'] },
            risco_percebido: { type: ['string', 'null'], enum: RISK_ENUM },
            requer_teste_desconhecido: { type: 'boolean' },
          },
          required: ['id', 'rotulo', 'intencao', 'categoria', 'alvo_id', 'risco_percebido', 'requer_teste_desconhecido'],
          additionalProperties: false,
        },
      },
      acao_livre: { type: 'boolean' },
      fase_da_cena: {
        type: 'string',
        enum: ['abertura', 'exploracao', 'social', 'investigacao', 'viagem', 'combate', 'perseguicao', 'descanso', 'transicao', 'resolucao', 'epilogo'],
      },
      risco_visivel: { type: ['string', 'null'], enum: RISK_ENUM },
      confianca_do_risco: { type: ['string', 'null'], enum: ['alta', 'media', 'baixa', 'desconhecida', null] },
      avisos_de_interface: { type: 'array', items: { type: 'string' } },
      entidades_visiveis: { type: 'array', items: { type: 'string' } },
    },
    required: [
      'narrativa', 'acoes_sugeridas', 'acao_livre', 'fase_da_cena', 'risco_visivel',
      'confianca_do_risco', 'avisos_de_interface', 'entidades_visiveis',
    ],
    additionalProperties: false,
  },
};

const narratorInstructions = `Você é o Narrador do RPG de Lumyriel.
GPT NARRA E INTERPRETA. MOTOR CALCULA, VALIDA E PERSISTE.
Nunca invente resultado de dado, custo, ferimento, item, reputação, posição, relógio ou fato canônico como alteração persistente.
Quando uma ação incerta exigir resolução, use realizar_teste. Não forneça dificuldade numérica nem resultado de dado.
Use consultar_estado quando o recorte recebido não bastar.
Respeite o que o personagem sabe. Não revele segredos apenas porque existem no backend.
Não crie topônimos permanentes, instituições ou fatos canônicos fora do contexto autorizado.
Ações sugeridas são possibilidades, nunca limites; acao_livre deve permanecer true.`;

function parseOutputText(response) {
  if (typeof response.output_text === 'string' && response.output_text.trim()) return response.output_text;
  const text = [];
  for (const item of response.output ?? []) {
    if (item.type !== 'message') continue;
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && typeof content.text === 'string') text.push(content.text);
    }
  }
  return text.join('');
}

async function createResponse(payload, fetchImpl) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  if (!apiKey) throw new Error('OPENAI_API_KEY is required when narrator integration is enabled');
  if (!model) throw new Error('OPENAI_MODEL is required when narrator integration is enabled');

  const response = await fetchImpl('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, ...payload }),
  });
  const body = await response.json();
  if (!response.ok) {
    const message = body?.error?.message || `OpenAI Responses API returned HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.openai = body;
    throw error;
  }
  return body;
}

async function emitHook(hook, payload) {
  if (typeof hook === 'function') await hook(payload);
}

function continuationPayload(previousResponseId, callId, result) {
  return {
    instructions: narratorInstructions,
    previous_response_id: previousResponseId,
    input: [{
      type: 'function_call_output',
      call_id: callId,
      output: JSON.stringify(result ?? null),
    }],
    tools: narratorTools,
    tool_choice: 'auto',
    parallel_tool_calls: false,
    text: { format: narratorOutputFormat },
    store: true,
  };
}

export async function runNarratorTurn({
  context,
  executeTool,
  fetchImpl = fetch,
  maxToolCycles = 6,
  onResponse = null,
  onToolCall = null,
  onToolResult = null,
  resume = null,
}) {
  let cycles = Number.isInteger(resume?.tool_cycles) ? resume.tool_cycles : 0;
  let response;

  if (resume) {
    if (!resume.previous_response_id || !resume.tool_call_id) {
      throw new Error('Narrator resume requires previous_response_id and tool_call_id');
    }
    if (!Object.prototype.hasOwnProperty.call(resume, 'tool_result')) {
      throw new Error('Narrator resume requires the persisted tool_result');
    }
    response = await createResponse(
      continuationPayload(resume.previous_response_id, resume.tool_call_id, resume.tool_result),
      fetchImpl,
    );
  } else {
    response = await createResponse({
      instructions: narratorInstructions,
      input: [{ role: 'user', content: JSON.stringify(context) }],
      tools: narratorTools,
      tool_choice: 'auto',
      parallel_tool_calls: false,
      text: { format: narratorOutputFormat },
      store: true,
    }, fetchImpl);
  }

  await emitHook(onResponse, {
    response_id: response.id,
    response,
    tool_cycles: cycles,
    resumed: Boolean(resume),
  });

  while (true) {
    const calls = (response.output ?? []).filter((item) => item.type === 'function_call');
    if (!calls.length) {
      const raw = parseOutputText(response);
      if (!raw) throw new Error('Narrator response did not contain structured output text');
      return {
        response_id: response.id,
        output: JSON.parse(raw),
        tool_cycles: cycles,
      };
    }

    if (calls.length !== 1) {
      throw new Error(`Narrator returned ${calls.length} tool calls despite parallel_tool_calls=false`);
    }
    if (cycles >= maxToolCycles) {
      throw new Error('Narrator tool loop exceeded the configured safety limit');
    }

    const call = calls[0];
    if (!context.allowed_tools.includes(call.name)) {
      throw new Error(`Narrator requested disallowed tool: ${call.name}`);
    }

    const args = JSON.parse(call.arguments);
    const stepIndex = cycles;

    await emitHook(onToolCall, {
      step_index: stepIndex,
      response_id: response.id,
      call_id: call.call_id,
      tool_name: call.name,
      arguments: args,
    });

    const result = await executeTool(call.name, args, {
      step_index: stepIndex,
      response_id: response.id,
      call_id: call.call_id,
    });

    await emitHook(onToolResult, {
      step_index: stepIndex,
      response_id: response.id,
      call_id: call.call_id,
      tool_name: call.name,
      arguments: args,
      result,
    });

    cycles += 1;

    response = await createResponse(
      continuationPayload(response.id, call.call_id, result),
      fetchImpl,
    );

    await emitHook(onResponse, {
      response_id: response.id,
      response,
      tool_cycles: cycles,
      resumed: false,
    });
  }
}
