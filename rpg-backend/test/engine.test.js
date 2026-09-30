import test from 'node:test';
import assert from 'node:assert/strict';
import { createCampaignBundle, resolveMockTurn } from '../src/engine.js';

const baseInput = {
  difficulty_mode: 'medio',
  duration_mode: '30',
  character: {
    name: 'Aren QA',
    people: 'Humano',
    skillSurvival: 'Treinado',
    skillSocial: 'Familiar',
    masteryChoices: ['Rastreamento']
  }
};

test('cria manifesto pinado e estado serializável', () => {
  const bundle = createCampaignBundle({ userId: '00000000-0000-4000-8000-000000000001', input: baseInput, now: new Date('2026-09-30T20:00:00Z') });
  assert.equal(bundle.manifest.canon_policy, 'pinned');
  assert.equal(bundle.manifest.canon_package_version, '0.1');
  assert.equal(bundle.state.state_version, 1);
  assert.equal(bundle.state.competencies.sobrevivencia, 2);
  assert.doesNotThrow(() => JSON.stringify(bundle.state));
});

test('teste básico usa CD do servidor e margem definida pela especificação', () => {
  const bundle = createCampaignBundle({ userId: '00000000-0000-4000-8000-000000000001', input: baseInput });
  const result = resolveMockTurn({
    state: bundle.state,
    playerInput: { text: 'Examino a estrada.', mock_action_code: 'inspecionar_rota' },
    rng: () => 10
  });
  assert.equal(result.ok, true);
  assert.equal(result.response.mechanical_events_visible[0].difficulty, 12);
  assert.equal(result.response.mechanical_events_visible[0].total, 13);
  assert.equal(result.response.mechanical_events_visible[0].margin, 1);
  assert.equal(result.response.mechanical_events_visible[0].grade, 'sucesso');
});

test('favor rola dois d20 e conserva o maior', () => {
  const rolls = [4, 17];
  const bundle = createCampaignBundle({ userId: '00000000-0000-4000-8000-000000000001', input: baseInput });
  const result = resolveMockTurn({
    state: bundle.state,
    playerInput: { text: 'Avanço com preparação.', mock_action_code: 'avancar_com_cuidado', favor: true },
    rng: () => rolls.shift()
  });
  assert.deepEqual(result.response.mechanical_events_visible[0].rolls, [4, 17]);
  assert.equal(result.response.mechanical_events_visible[0].die, 17);
});
