import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInitialState, resolveMockTurn } from './engine.js';

const mechanics = {
  attributes: {
    potencia: 2,
    agilidade: 2,
    vigor: 3,
    intelecto: 2,
    percepcao: 3,
    presenca: 1,
  },
  competencies: [
    { id: 'percepcao_de_campo', level: 2, specialties: [{ id: 'rotas_regionais', level: 1 }] },
    { id: 'atletismo', level: 2, specialties: [{ id: 'carga', level: 1 }] },
    { id: 'sobrevivencia', level: 1, specialties: [] },
    { id: 'navegacao', level: 1, specialties: [] },
    { id: 'oficios', level: 1, specialties: [] },
    { id: 'influencia', level: 1, specialties: [] },
  ],
  resources: {
    mana: { applicable: false },
    aura: { applicable: false },
  },
  techniques: [],
};

test('initial state follows vitality and stamina formulas', () => {
  const state = buildInitialState({
    campaignId: 'camp_test',
    characterId: 'char_test',
    mechanics,
    difficultyMode: 'medio',
    durationMode: '60',
  });
  assert.equal(state.character.vitality_max, 14);
  assert.equal(state.character.resources.folego.maximum, 10);
  assert.equal(state.state_version, 1);
  assert.equal(state.timing.target_minutes, 60);
});

test('mock turn produces server-side mechanical event', () => {
  const state = buildInitialState({
    campaignId: 'camp_test',
    characterId: 'char_test',
    mechanics,
    difficultyMode: 'medio',
    durationMode: '30',
  });
  const result = resolveMockTurn({
    state,
    mechanics,
    playerInput: { source: 'suggested_action', raw_text: '', selected_action_id: 'mock:observe' },
  });
  assert.equal(result.mechanicalEventsVisible.length, 1);
  assert.equal(result.mechanicalEventsVisible[0].difficulty, 10);
  assert.equal(result.nextState.character.vitality, state.character.vitality);
});
