import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryRepository } from '../src/repository.js';
import { createCampaignBundle } from '../src/engine.js';
import { NarratorService } from '../src/narrator.js';

const userId = '00000000-0000-4000-8000-000000000001';

function finalResponse(id, overrides = {}) {
  const output = {
    narrativa: 'A estrada mostra sinais suficientes para que você avance com uma conclusão provisória.',
    acoes_sugeridas: [],
    acao_livre: true,
    fase_da_cena: 'investigacao',
    risco_visivel: 'moderado',
    confianca_do_risco: 'media',
    avisos_de_interface: [],
    entidades_visiveis: [],
    ...overrides
  };
  return {
    id,
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }]
  };
}

class FakeResponsesClient {
  constructor(responses) {
    this.responses = [...responses];
    this.requests = [];
  }
  async create(payload) {
    this.requests.push(structuredClone(payload));
    const next = this.responses.shift();
    if (!next) throw new Error('FakeResponsesClient sem resposta preparada.');
    return structuredClone(next);
  }
}

async function setup(character = { name: 'Aren QA', skillSurvival: 'Treinado' }) {
  const repository = new MemoryRepository({ rng: () => 10 });
  const bundle = createCampaignBundle({
    userId,
    input: { difficulty_mode: 'medio', duration_mode: '30', character }
  });
  await repository.createCampaign(bundle);
  return { repository, bundle };
}

test('Narrador Fase 4 resolve tool call sem permitir CD ou dado vindos do modelo', async () => {
  const { repository, bundle } = await setup();
  const callArgs = {
    ator_id: bundle.state.character_id,
    intencao: 'Examinar as marcas na rota.',
    atributo_sugerido: 'percepcao',
    competencia_sugerida: 'sobrevivencia',
    especialidade_sugerida: null,
    contexto: 'Há sinais de passagem recentes no trecho.',
    resultado_desejado: 'Entender se a carga passou por aqui.',
    riscos_percebidos: ['perder tempo']
  };
  const client = new FakeResponsesClient([
    {
      id: 'resp_tool_1',
      status: 'completed',
      output: [{ type: 'function_call', call_id: 'call_test_1', name: 'realizar_teste', arguments: JSON.stringify(callArgs) }]
    },
    finalResponse('resp_final_1')
  ]);
  const narrator = new NarratorService({ repository, responsesClient: client });

  const result = await narrator.runTurn({
    userId,
    campaignId: bundle.campaignId,
    idempotencyKey: 'phase4-turn-1',
    expectedStateVersion: 1,
    playerInput: { text: 'Quero examinar as marcas na estrada.', source: 'free_action' }
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.state_version, 2);
  assert.equal(result.body.mechanical_events_visible.length, 1);
  assert.equal(result.body.mechanical_events_visible[0].difficulty, 12);
  assert.equal(result.body.mechanical_events_visible[0].die, 10);
  assert.equal(result.body.mechanical_events_visible[0].difficulty_source, 'phase4_server_catalog_v0.1');
  assert.equal(client.requests.length, 2);
  assert.equal(client.requests[0].parallel_tool_calls, false);
  assert.equal(client.requests[0].tools[1].parameters.properties.atributo_sugerido.enum.includes(12), false);
  assert.equal(client.requests[1].previous_response_id, 'resp_tool_1');
  assert.equal(client.requests[1].input[0].type, 'function_call_output');
  const toolOutput = JSON.parse(client.requests[1].input[0].output);
  assert.equal(toolOutput.mechanical.difficulty, 12);
  assert.equal(toolOutput.mechanical.die, 10);
});

test('consultar_estado é somente leitura e mantém state_version', async () => {
  const { repository, bundle } = await setup();
  const client = new FakeResponsesClient([
    {
      id: 'resp_state_1',
      status: 'completed',
      output: [{
        type: 'function_call',
        call_id: 'call_state_1',
        name: 'consultar_estado',
        arguments: JSON.stringify({ entidades: [], campos: ['localizacao','competencias'], perspectiva: 'personagem' })
      }]
    },
    finalResponse('resp_state_final', { fase_da_cena: 'exploracao' })
  ]);
  const narrator = new NarratorService({ repository, responsesClient: client });
  const result = await narrator.runTurn({
    userId,
    campaignId: bundle.campaignId,
    idempotencyKey: 'phase4-state-1',
    expectedStateVersion: 1,
    playerInput: { text: 'O que consigo perceber daqui?', source: 'free_action' }
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.state_version, 1);
  const toolOutput = JSON.parse(client.requests[1].input[0].output);
  assert.equal(toolOutput.ok, true);
  assert.equal(toolOutput.dados.localizacao.region_id, 'valdren');
  assert.equal(toolOutput.dados.competencias.sobrevivencia, 2);
});

test('saída final sem ferramenta conclui turno e é replayável pela mesma idempotency_key', async () => {
  const { repository, bundle } = await setup();
  const client = new FakeResponsesClient([finalResponse('resp_direct_1')]);
  const narrator = new NarratorService({ repository, responsesClient: client });
  const req = {
    userId,
    campaignId: bundle.campaignId,
    idempotencyKey: 'phase4-direct-1',
    expectedStateVersion: 1,
    playerInput: { text: 'Observo o movimento ao redor.', source: 'free_action' }
  };
  const first = await narrator.runTurn(req);
  const second = await narrator.runTurn(req);
  assert.equal(first.status, 200);
  assert.deepEqual(second.body, first.body);
  assert.equal(client.requests.length, 1);
});

test('perfil mecânico não mapeado volta como erro de tool sem inventar CD', async () => {
  const { repository, bundle } = await setup({ name: 'Aren QA', skillKnowledge: 'Treinado' });
  const callArgs = {
    ator_id: bundle.state.character_id,
    intencao: 'Tentar uma ação ainda não calibrada.',
    atributo_sugerido: 'vigor',
    competencia_sugerida: 'conhecimentos',
    especialidade_sugerida: null,
    contexto: 'QA.',
    resultado_desejado: 'QA.',
    riscos_percebidos: []
  };
  const client = new FakeResponsesClient([
    { id: 'resp_unmapped', status: 'completed', output: [{ type:'function_call', call_id:'call_unmapped', name:'realizar_teste', arguments:JSON.stringify(callArgs) }] },
    finalResponse('resp_unmapped_final', { avisos_de_interface: ['A ação não possui resolução mecânica calibrada nesta fase.'] })
  ]);
  const narrator = new NarratorService({ repository, responsesClient: client });
  const result = await narrator.runTurn({
    userId,
    campaignId: bundle.campaignId,
    idempotencyKey: 'phase4-unmapped-1',
    expectedStateVersion: 1,
    playerInput: { text: 'Faço uma ação estranha.', source: 'free_action' }
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.state_version, 1);
  assert.equal(result.body.mechanical_events_visible.length, 0);
  const toolOutput = JSON.parse(client.requests[1].input[0].output);
  assert.equal(toolOutput.ok, false);
  assert.equal(toolOutput.error, 'test_profile_unavailable');
});
