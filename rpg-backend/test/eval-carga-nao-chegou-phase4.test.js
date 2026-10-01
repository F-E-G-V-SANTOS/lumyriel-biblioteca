import test from 'node:test';
import assert from 'node:assert/strict';
import { createCampaignBundle, resolveNarratorTest } from '../src/engine.js';
import { PHASE4_TOOLS } from '../src/narrator-schema.js';

const userId = '00000000-0000-4000-8000-000000000001';

function qaBundle() {
  return createCampaignBundle({
    userId,
    input: {
      difficulty_mode: 'medio',
      duration_mode: '30',
      character: {
        name: 'QA Carga',
        skillCraft: 'Treinado',
        skillSurvival: 'Treinado'
      }
    }
  });
}

test('A Carga — contrato do Narrador não oferece campos para CD ou dado', () => {
  const tool = PHASE4_TOOLS.find(x => x.name === 'realizar_teste');
  assert.ok(tool);
  const fields = Object.keys(tool.parameters.properties);
  assert.equal(fields.includes('dificuldade'), false);
  assert.equal(fields.includes('cd'), false);
  assert.equal(fields.includes('dado'), false);
  assert.equal(fields.includes('resultado'), false);
});

test('A Carga — Fase 4 falha fechada para Intelecto + Ofícios sem desafio de situação', () => {
  const bundle = qaBundle();
  const result = resolveNarratorTest({
    state: bundle.state,
    args: {
      ator_id: bundle.state.character_id,
      intencao: 'Cruzar o registro da carga com manutenção recente.',
      atributo_sugerido: 'intelecto',
      competencia_sugerida: 'Ofícios',
      especialidade_sugerida: null,
      contexto: 'Registros de oficina e carga.',
      resultado_desejado: 'Identificar manutenção relevante.',
      riscos_percebidos: ['perder tempo ou concluir cedo demais']
    },
    rng: () => 11
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'test_profile_unavailable');
});

test('A Carga — ferramentas ainda ausentes permanecem explicitamente fora da Fase 4', () => {
  const names = new Set(PHASE4_TOOLS.map(x => x.name));
  assert.deepEqual([...names].sort(), ['consultar_estado','realizar_teste']);
  for (const requiredLater of ['registrar_rumor','viajar_para','usar_item','atualizar_relacao','encerrar_cena']) {
    assert.equal(names.has(requiredLater), false, `${requiredLater} só deve entrar quando tiver motor e persistência próprios`);
  }
});

test('A Carga — tempo real da sessão e tempo do mundo são estados distintos', () => {
  const bundle = qaBundle();
  assert.equal(bundle.state.real_elapsed_time, 0);
  assert.equal(bundle.state.world_time.elapsed_minutes, 0);
  const clone = structuredClone(bundle.state);
  clone.world_time.elapsed_minutes += 9;
  assert.equal(clone.real_elapsed_time, 0);
  assert.equal(clone.world_time.elapsed_minutes, 9);
});
