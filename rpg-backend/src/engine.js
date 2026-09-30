import { randomInt, randomUUID } from 'node:crypto';
import { getCompetencyLevel } from './validators.js';

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

export function buildInitialState({ campaignId, characterId, mechanics, difficultyMode, durationMode }) {
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
    current_location_id: 'session:valdren:mvp-start',
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
    scene_summary: 'Campanha criada. O protótipo ainda usa situação mockada sem Narrador GPT.',
    campaign_summary: 'Início da campanha.',
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
  const selected = playerInput.selected_action_id;
  let test = null;
  let narrative;

  if (selected === 'mock:observe') {
    test = rollTest({
      state: next,
      mechanics,
      attribute: 'percepcao',
      competency: 'percepcao_de_campo',
      difficulty: 10,
      intent: 'Observar o entorno imediato de Valdren',
    });
    narrative = `Teste de observação resolvido pelo motor: ${test.degree}.`;
  } else if (selected === 'mock:force-passage') {
    test = rollTest({
      state: next,
      mechanics,
      attribute: 'potencia',
      competency: 'atletismo',
      difficulty: 12,
      intent: 'Forçar uma passagem obstruída durante o protótipo',
    });
    narrative = `Teste físico resolvido pelo motor: ${test.degree}.`;
  } else if (selected === 'mock:wait') {
    next.world_time.epoch_minutes = (next.world_time.epoch_minutes ?? 0) + 10;
    narrative = 'Dez minutos de tempo de mundo foram registrados pelo motor.';
  } else {
    const described = String(playerInput.raw_text || '').trim();
    narrative = described
      ? `A intenção "${described}" foi registrada. O gateway mecânico geral ainda não resolve esta ação no protótipo.`
      : 'A intenção foi registrada. O gateway mecânico geral ainda não resolve esta ação no protótipo.';
  }

  next.scene_summary = narrative;
  next.campaign_summary = `${state.campaign_summary} ${narrative}`.trim();

  return {
    nextState: next,
    operationId: test?.operation_id ?? `op_${randomUUID()}`,
    narratorOutput: {
      mode: 'mock_no_gpt',
      narrative,
      suggested_actions: [
        { id: 'mock:observe', label: 'Observar o entorno' },
        { id: 'mock:force-passage', label: 'Testar uma ação física' },
        { id: 'mock:wait', label: 'Esperar dez minutos' },
      ],
      free_action_allowed: true,
    },
    mechanicalEventsVisible: test ? [test] : [],
  };
}
