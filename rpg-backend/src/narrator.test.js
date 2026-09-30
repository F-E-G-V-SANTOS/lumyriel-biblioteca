import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNarratorTurnContext, queryStateSlice } from './context.js';
import { narratorOutputFormat, narratorTools, runNarratorTurn } from './narrator.js';
import { buildInitialState } from './engine.js';

const mechanics = {
  attributes: { potencia: 2, agilidade: 2, vigor: 3, intelecto: 2, percepcao: 3, presenca: 1 },
  competencies: [
    { id: 'percepcao_de_campo', level: 2, specialties: [{ id: 'rotas_regionais', level: 1 }] },
    { id: 'atletismo', level: 2, specialties: [{ id: 'carga', level: 1 }] },
    { id: 'sobrevivencia', level: 1, specialties: [] },
    { id: 'navegacao', level: 1, specialties: [] },
    { id: 'oficios', level: 1, specialties: [] },
    { id: 'influencia', level: 1, specialties: [] },
  ],
  resources: { mana: { applicable: false }, aura: { applicable: false } },
  techniques: [],
};

function makeState() {
  return buildInitialState({ campaignId: 'camp_test', characterId: 'char_test', mechanics, difficultyMode: 'medio', durationMode: '60' });
}

function assertStrictObjectSchema(schema) {
  if (!schema || typeof schema !== 'object') return;
  if (schema.type === 'object') {
    assert.equal(schema.additionalProperties, false);
    assert.deepEqual(new Set(schema.required), new Set(Object.keys(schema.properties)));
    for (const value of Object.values(schema.properties)) assertStrictObjectSchema(value);
  }
  if (schema.items) assertStrictObjectSchema(schema.items);
}

test('phase 4 tool schemas and narrator output remain strict', () => {
  for (const tool of narratorTools) {
    assert.equal(tool.strict, true);
    assertStrictObjectSchema(tool.parameters);
  }
  assert.equal(narratorOutputFormat.strict, true);
  assertStrictObjectSchema(narratorOutputFormat.schema);
});

test('NarratorTurnContext sends an authorized slice rather than full CampaignState', () => {
  const state = makeState();
  state.session_facts.push({ fact_id: 'hidden_fact', text: 'engine-only test', origin: 'SESSAO', confidence: 'confirmado', known_to_character: false });
  const context = buildNarratorTurnContext({
    state,
    turnId: 'turn_test',
    playerInput: { source: 'free_action', raw_text: 'Observo a estrada.', selected_action_id: null },
  });
  assert.equal(context.state_version, 1);
  assert.deepEqual(context.allowed_tools, ['consultar_estado', 'realizar_teste']);
  assert.equal('session_facts' in context, false);
  assert.equal(JSON.stringify(context).includes('engine-only test'), false);
});

test('consultar_estado returns only requested state families', () => {
  const state = makeState();
  const slice = queryStateSlice(state, { entidades: ['char_test'], campos: ['recursos', 'resumo_cena'], perspectiva: 'personagem' });
  assert.equal(slice.dados.character.vitality, 14);
  assert.equal(typeof slice.dados.scene_summary, 'string');
  assert.equal('inventory' in slice.dados, false);
});

test('Responses API loop accepts one tool call then structured final output', async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.OPENAI_MODEL;
  process.env.OPENAI_API_KEY = 'test-key';
  process.env.OPENAI_MODEL = 'test-model';
  const calls = [];
  const fakeFetch = async (_url, options) => {
    calls.push(JSON.parse(options.body));
    const payload = calls.length === 1
      ? { id: 'resp_1', output: [{ type: 'function_call', call_id: 'call_1', name: 'consultar_estado', arguments: '{"entidades":[],"campos":["recursos"],"perspectiva":"personagem"}' }] }
      : { id: 'resp_2', output_text: JSON.stringify({ narrativa: 'Tudo permanece coerente.', acoes_sugeridas: [], acao_livre: true, fase_da_cena: 'exploracao', risco_visivel: null, confianca_do_risco: null, avisos_de_interface: [], entidades_visiveis: [] }), output: [] };
    return { ok: true, status: 200, json: async () => payload };
  };
  try {
    const result = await runNarratorTurn({
      context: { allowed_tools: ['consultar_estado'], campaign_id: 'camp_test' },
      executeTool: async (name) => ({ ok: name === 'consultar_estado' }),
      fetchImpl: fakeFetch,
    });
    assert.equal(result.output.narrativa, 'Tudo permanece coerente.');
    assert.equal(result.tool_cycles, 1);
    assert.equal(calls[0].parallel_tool_calls, false);
    assert.equal(calls[0].text.format.name, 'lumyriel_narrator_output');
    assert.equal(calls[1].previous_response_id, 'resp_1');
    assert.equal(calls[1].input[0].type, 'function_call_output');
  } finally {
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = originalKey;
    if (originalModel === undefined) delete process.env.OPENAI_MODEL; else process.env.OPENAI_MODEL = originalModel;
  }
});
