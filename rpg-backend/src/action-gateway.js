const REGISTERED_ACTIONS = Object.freeze({
  'mock:observe': Object.freeze({
    action_id: 'mock:observe',
    classification: 'INCERTO',
    label: 'Observar o entorno',
    test: Object.freeze({
      attribute: 'percepcao',
      competency: 'percepcao_de_campo',
      difficulty: 10,
      intent: 'Observar o entorno imediato de Valdren',
    }),
  }),
  'mock:force-passage': Object.freeze({
    action_id: 'mock:force-passage',
    classification: 'INCERTO',
    label: 'Testar uma ação física',
    test: Object.freeze({
      attribute: 'potencia',
      competency: 'atletismo',
      difficulty: 12,
      intent: 'Forçar uma passagem obstruída durante o protótipo',
    }),
  }),
  'mock:wait': Object.freeze({
    action_id: 'mock:wait',
    classification: 'CERTO',
    label: 'Esperar dez minutos',
    effect: Object.freeze({
      type: 'advance_time',
      minutes: 10,
    }),
  }),
});

function clone(value) {
  return structuredClone(value);
}

export function getRegisteredAction(actionId) {
  const action = REGISTERED_ACTIONS[actionId];
  return action ? clone(action) : null;
}

export function listRegisteredActions() {
  return Object.values(REGISTERED_ACTIONS).map((action) => ({
    id: action.action_id,
    label: action.label,
    classification: action.classification,
  }));
}

export function classifyAction(playerInput) {
  const selected = playerInput?.selected_action_id ?? null;
  const registered = selected ? getRegisteredAction(selected) : null;
  if (registered) return registered;

  const raw = String(playerInput?.raw_text ?? '').trim();
  return {
    action_id: selected,
    classification: 'PRECISA_CONTEXTO',
    reason: raw
      ? 'A intenção foi recebida, mas a situação atual ainda não possui uma regra autoritativa que determine possibilidade, teste e dificuldade.'
      : 'A ação não possui regra autoritativa registrada no gateway atual.',
    raw_text: raw,
  };
}

export function isRegisteredUncertainAction(playerInput) {
  return classifyAction(playerInput).classification === 'INCERTO';
}
