import { randomInt, randomUUID } from 'node:crypto';
import { getCompetencyLevel } from './validators.js';
import { classifyAction, listRegisteredActions } from './action-gateway.js';

const DEGREE_ORDER = ['falha_grave', 'falha_com_consequencia', 'sucesso', 'sucesso_forte', 'sucesso_excepcional'];

function baseDegree(margin) {
  if (margin >= 10) return 'sucesso_excepcional';
  if (margin >= 5) return 'sucesso_forte';
  if (margin >= 0) return 'sucesso';
  if (margin >= -4) return 'falha_com_consequencia';
  return 'falha_grave';
}

function applyNaturalShift(degree, dieRaw) {
  const index = DEGREE_ORDER.indexOf(degree);
  if (dieRaw === 20) return DEGREE_ORDER[Math.min(DEGREE_ORDER.length - 1, index + 1)];
  if (dieRaw === 1) return DEGREE_ORDER[Math.max(0, index - 1)];
  return degree;
}

export function buildInitialState({ campaignId, characterId, mechanics, difficultyMode, durationMode, startLocationId = 'session:valdren:mvp-start', openingSummary = null, situationId = null }) {
  const attrs = mechanics.attributes;
  const vitalityMax = 8 + (attrs.vigor * 2);
  const staminaMax = 5 + attrs.vigor + attrs.agilidade;
  const targetMinutes = durationMode === 'continua' ? 0 : Number(durationMode);

  const resourceState = (resource) => {
    if (!resource?.applicable) {
      return { applicable: false, current: null, maximum: null, state: null };
    }
    return {
      applicable: true,
      current: resource.maximum,
      maximum: resource.maximum,
      state: 'estavel',
    };
  };

  return {
    schema_version: 'rpg-campaign-state-0.2',
    state_version: 1,
    campaign_id: campaignId,
    character_id: characterId,
    difficulty_mode: difficultyMode,
    timing: {
      target_minutes: targetMinutes,
      elapsed_seconds: 0,
      remaining_seconds: targetMinutes > 0 ? targetMinutes * 60 : 0,
      pacing_phase: 'abertura',
    },
    world_time: {
      calendar_id: null,
      date_label: null,
      epoch_minutes: null,
      segment_label: null,
    },
    current_location_id: startLocationId,
    character: {
      character_id: characterId,
      attributes: { ...attrs },
      vitality: vitalityMax,
      vitality_max: vitalityMax,
      resources: {
        folego: { applicable: true, current: staminaMax, maximum: staminaMax, state: 'estavel' },
        mana: resourceState(mechanics.resources?.mana),
        aura: resourceState(mechanics.resources?.aura),
      },
    },
    injuries: [],
    conditions: [],
    inventory: [],
    equipment_condition: [],
    competencies: mechanics.competencies.map((item) => ({ ...item })),
    practice_marks: [],
    techniques: mechanics.techniques ?? [],
    relationships: [],
    reputation: [],
    objectives: [],
    session_facts: [],
    rumors: [],
    clues: [],
    clocks: [],
    npc_states: [],
    creature_states: [],
    open_hooks: [],
    scene_summary: openingSummary || 'Campanha criada em Valdren.',
    campaign_summary: openingSummary ? `Início da campanha: ${openingSummary}` : 'Início da campanha.',
    active_situation_id: situationId,
    canonical_context_refs: ['rpg:valdren:package-v0.1'],
  };
}

function rollTest({ state, mechanics, attribute, competency, difficulty, intent }) {
  const dieRaw = randomInt(1, 21);
  const attributeValue = state.character.attributes[attribute] ?? 0;
  const competencyValue = getCompetencyLevel(mechanics, competency);
  const modifierTotal = attributeValue + competencyValue;
  const total = dieRaw + modifierTotal;
  const margin = total - difficulty;
  const degree = applyNaturalShift(baseDegree(margin), dieRaw);

  return {
    operation_id: `op_${randomUUID()}`,
    kind: 'test',
    intent,
    attribute,
    competency,
    die_raw: dieRaw,
    modifier_total: modifierTotal,
    difficulty,
    total,
    margin,
    degree,
  };
}

function clone(value) {
  return structuredClone(value);
}

export function resolveMockTurn({ state, mechanics, playerInput }) {
  const next = clone(state);
  const gateway = classifyAction(playerInput);
  let test = null;
  let narrative;

  if (gateway.classification === 'INCERTO') {
    test = rollTest({
      state: next,
      mechanics,
      attribute: gateway.test.attribute,
      competency: gateway.test.competency,
      difficulty: gateway.test.difficulty,
      intent: gateway.test.intent,
    });
    narrative = `Teste autoritativo resolvido pelo motor: ${test.degree}.`;
  } else if (gateway.classification === 'CERTO' && gateway.effect?.type === 'advance_time') {
    next.world_time.epoch_minutes = (next.world_time.epoch_minutes ?? 0) + gateway.effect.minutes;
    narrative = `${gateway.effect.minutes} minutos de tempo de mundo foram registrados pelo motor.`;
  } else if (gateway.classification === 'IMPOSSIVEL') {
    narrative = gateway.reason || 'A ação não pode ocorrer nas condições atuais.';
  } else {
    const described = String(playerInput.raw_text || '').trim();
    narrative = described
      ? `A intenção "${described}" foi registrada, mas exige contexto mecânico adicional antes de qualquer rolagem.`
      : (gateway.reason || 'A ação exige contexto mecânico adicional antes de qualquer rolagem.');
  }

  next.scene_summary = narrative;
  next.campaign_summary = `${state.campaign_summary} ${narrative}`.trim();

  return {
    nextState: next,
    operationId: test?.operation_id ?? `op_${randomUUID()}`,
    gateway: {
      classification: gateway.classification,
      action_id: gateway.action_id ?? null,
      reason: gateway.reason ?? null,
    },
    narratorOutput: {
      mode: 'mock_no_gpt',
      narrative,
      suggested_actions: listRegisteredActions().map((action) => ({
        id: action.id,
        label: action.label,
      })),
      free_action_allowed: true,
    },
    mechanicalEventsVisible: test ? [test] : [],
  };
}
