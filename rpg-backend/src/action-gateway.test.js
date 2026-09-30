import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyAction,
  getRegisteredAction,
  isRegisteredUncertainAction,
  listRegisteredActions,
} from './action-gateway.js';

test('registered uncertain actions own their mechanical difficulty', () => {
  const action = classifyAction({
    source: 'suggested_action',
    raw_text: 'Observar o entorno',
    selected_action_id: 'mock:observe',
  });
  assert.equal(action.classification, 'INCERTO');
  assert.equal(action.test.attribute, 'percepcao');
  assert.equal(action.test.competency, 'percepcao_de_campo');
  assert.equal(action.test.difficulty, 10);
  assert.equal(isRegisteredUncertainAction({ selected_action_id: 'mock:observe' }), true);
});

test('certain registered action advances through an explicit effect instead of a roll', () => {
  const action = getRegisteredAction('mock:wait');
  assert.equal(action.classification, 'CERTO');
  assert.deepEqual(action.effect, { type: 'advance_time', minutes: 10 });
  assert.equal(isRegisteredUncertainAction({ selected_action_id: 'mock:wait' }), false);
});

test('unknown free actions require context and never receive a guessed difficulty', () => {
  const action = classifyAction({
    source: 'free_action',
    raw_text: 'Quero improvisar uma ponte com o que houver por perto.',
    selected_action_id: null,
  });
  assert.equal(action.classification, 'PRECISA_CONTEXTO');
  assert.equal('test' in action, false);
  assert.match(action.reason, /regra autoritativa/);
});

test('registered action list exposes labels and gateway classification without hidden test data', () => {
  const actions = listRegisteredActions();
  assert.deepEqual(actions, [
    { id: 'mock:observe', label: 'Observar o entorno', classification: 'INCERTO' },
    { id: 'mock:force-passage', label: 'Testar uma ação física', classification: 'INCERTO' },
    { id: 'mock:wait', label: 'Esperar dez minutos', classification: 'CERTO' },
  ]);
  assert.equal(actions.some((action) => 'difficulty' in action), false);
});
