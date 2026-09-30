import { createHash, randomInt, randomUUID } from 'node:crypto';

export const DIFFICULTY_MODES = new Set(['historia', 'facil', 'medio', 'dificil', 'lumyriel']);
export const DURATION_MODES = new Set(['30', '60', '90', '120', '240', 'continua']);

export const CANON_PACKAGE = Object.freeze({
  id: 'valdren-mvp',
  version: '0.1'
});

export const CAMPAIGN_SCHEMA_VERSION = '0.1';
export const STATE_SCHEMA_VERSION = '0.1';

const SKILL_LEVELS = Object.freeze({
  'Sem experiência': 0,
  'Familiar': 1,
  'Treinado': 2,
  'Experiente': 3,
  'Mestre': 4
});

const MOCK_ACTIONS = Object.freeze({
  observar: null,
  inspecionar_rota: { attribute: 'percepcao', competence: 'sobrevivencia', difficulty: 12 },
  avancar_com_cuidado: { attribute: 'agilidade', competence: 'sobrevivencia', difficulty: 10 },
  convencer_trabalhador: { attribute: 'presenca', competence: 'influencia', difficulty: 12 },
  forcar_obstaculo: { attribute: 'potencia', competence: 'atletismo', difficulty: 15 }
});

function stableHash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function skill(value) {
  return SKILL_LEVELS[value] ?? 0;
}

export function deriveMechanicalProfile(character = {}) {
  return {
    source: 'character-creator-alpha',
    attributes: {
      potencia: 1,
      agilidade: 1,
      vigor: 1,
      intelecto: 1,
      percepcao: 1,
      presenca: 1
    },
    competencies: {
      combate_corpo_a_corpo: skill(character.skillMelee),
      combate_distancia: skill(character.skillRanged),
      praticas_auricas: skill(character.skillAura),
      artes_magicas: skill(character.skillMana),
      runologia: skill(character.skillRunes),
      sobrevivencia: skill(character.skillSurvival),
      oficios: skill(character.skillCraft),
      conhecimentos: skill(character.skillKnowledge),
      influencia: skill(character.skillSocial),
      atletismo: 0
    },
    specialities: Array.isArray(character.masteryChoices) ? character.masteryChoices : [],
    note: 'Atributos-base permanecem neutros (1=comum) nesta Fase 1–3. A conversão biográfica de atributos será calibrada separadamente; competências vêm do criador.'
  };
}

export function validateCampaignInit(input) {
  const errors = [];
  if (!input || typeof input !== 'object') errors.push('payload ausente');
  if (!input?.character || typeof input.character !== 'object') errors.push('character é obrigatório');
  if (!DIFFICULTY_MODES.has(input?.difficulty_mode)) errors.push('difficulty_mode inválido');
  if (!DURATION_MODES.has(String(input?.duration_mode))) errors.push('duration_mode inválido');
  return errors;
}

export function createCampaignBundle({ userId, input, now = new Date() }) {
  const campaignId = randomUUID();
  const characterId = String(input.character._meta?.character_id || input.character.character_id || `char-${stableHash(input.character).slice(0, 12)}`);
  const characterRevision = Number(input.character._meta?.source_revision || 1);
  const characterSnapshotId = `snap-${stableHash(input.character).slice(0, 24)}`;
  const situationId = `sit-${randomUUID()}`;
  const checkpointId = randomUUID();
  const createdAt = now.toISOString();
  const mechanicalProfile = deriveMechanicalProfile(input.character);

  const state = {
    campaign_id: campaignId,
    character_id: characterId,
    difficulty_mode: input.difficulty_mode,
    target_duration: String(input.duration_mode),
    real_elapsed_time: 0,
    world_time: { label: 'início da campanha', elapsed_minutes: 0 },
    current_location: { region_id: 'valdren', location_id: null, label: 'Valdren — ponto inicial ainda não revelado' },
    character_state: {
      display_name: input.character.name || 'Personagem sem nome',
      people: input.character.people || null,
      formation: input.character.education || input.character.trainingSource || null,
      profession: input.character.profession || null,
      mechanics: mechanicalProfile
    },
    resources: { vitalidade: null, folego: null, mana: null, aura: null },
    injuries: [],
    conditions: [],
    inventory: [],
    equipment_condition: {},
    competencies: mechanicalProfile.competencies,
    practice_marks: [],
    techniques: [],
    relationships: {},
    reputation: {},
    active_objectives: [],
    session_facts: [],
    known_rumors: [],
    known_clues: [],
    faction_clocks: {},
    npc_states: {},
    creature_states_relevant: {},
    open_hooks: [],
    scene_summary: 'Campanha criada; SituationSeed definitivo ainda não foi gerado nesta Fase 1–3.',
    campaign_summary: 'MVP técnico inicial em Valdren.',
    canonical_context_refs: [`${CANON_PACKAGE.id}@${CANON_PACKAGE.version}`],
    state_version: 1,
    last_turn: null
  };

  const manifest = {
    campaign_id: campaignId,
    campaign_schema_version: CAMPAIGN_SCHEMA_VERSION,
    state_schema_version: STATE_SCHEMA_VERSION,
    character_id: characterId,
    character_source_revision: characterRevision,
    character_snapshot_id: characterSnapshotId,
    canon_package_id: CANON_PACKAGE.id,
    canon_package_version: CANON_PACKAGE.version,
    canon_policy: 'pinned',
    situation_id: situationId,
    situation_version: 1,
    difficulty_mode: input.difficulty_mode,
    duration_mode: String(input.duration_mode),
    created_at: createdAt,
    last_saved_at: createdAt,
    latest_state_version: 1,
    latest_event_sequence: 0,
    latest_checkpoint_id: checkpointId
  };

  const publicSeed = {
    region_id: 'valdren',
    generation_status: 'placeholder_phase_1_3',
    note: 'SituationSeed real entra na Fase 8. Este placeholder apenas fixa a região MVP.'
  };

  const privateTruth = {
    generation_status: 'not_generated',
    hidden_truth_ids: []
  };

  return {
    userId,
    campaignId,
    characterSnapshotId,
    checkpointId,
    situationId,
    characterSnapshot: input.character,
    manifest,
    state,
    publicSeed,
    privateTruth
  };
}

function rollD20(mode, rng = () => randomInt(1, 21)) {
  const first = rng();
  if (mode === 'normal') return { kept: first, rolls: [first] };
  const second = rng();
  return mode === 'favor'
    ? { kept: Math.max(first, second), rolls: [first, second] }
    : { kept: Math.min(first, second), rolls: [first, second] };
}

function resultGrade(margin) {
  if (margin >= 10) return 'sucesso_excepcional';
  if (margin >= 5) return 'sucesso_forte';
  if (margin >= 0) return 'sucesso';
  if (margin >= -4) return 'falha_com_consequencia';
  return 'falha_grave';
}

function shiftGrade(grade, direction) {
  const order = ['falha_grave', 'falha_com_consequencia', 'sucesso', 'sucesso_forte', 'sucesso_excepcional'];
  const i = order.indexOf(grade);
  return order[Math.max(0, Math.min(order.length - 1, i + direction))];
}

export function resolveMockTurn({ state, playerInput, rng }) {
  const actionText = String(playerInput?.text || '').trim();
  const code = String(playerInput?.mock_action_code || 'observar');
  if (!(code in MOCK_ACTIONS)) {
    return { ok: false, code: 'unknown_mock_action', message: 'mock_action_code não reconhecido.' };
  }

  const nextState = structuredClone(state);
  const profile = MOCK_ACTIONS[code];
  let mechanical = null;

  if (profile) {
    const favor = Boolean(playerInput?.favor);
    const pressao = Boolean(playerInput?.pressao);
    const rollMode = favor === pressao ? 'normal' : favor ? 'favor' : 'pressao';
    const roll = rollD20(rollMode, rng);
    const attribute = Number(state.character_state?.mechanics?.attributes?.[profile.attribute] ?? 0);
    const competence = Number(state.competencies?.[profile.competence] ?? 0);
    const speciality = 0;
    const situational = 0;
    const total = roll.kept + attribute + competence + speciality + situational;
    const margin = total - profile.difficulty;
    let grade = resultGrade(margin);
    if (roll.kept === 20) grade = shiftGrade(grade, +1);
    if (roll.kept === 1) grade = shiftGrade(grade, -1);

    mechanical = {
      type: 'test',
      action_code: code,
      attribute: profile.attribute,
      competence: profile.competence,
      difficulty: profile.difficulty,
      roll_mode: rollMode,
      rolls: roll.rolls,
      die: roll.kept,
      modifiers: { attribute, competence, speciality, situational },
      total,
      margin,
      grade
    };
  }

  nextState.last_turn = {
    action_text: actionText,
    mock_action_code: code,
    mechanical,
    recorded_at: new Date().toISOString()
  };
  nextState.scene_summary = mechanical
    ? `Última ação técnica resolvida: ${code} → ${mechanical.grade}.`
    : 'Última ação livre registrada sem teste mecânico na fase mockada.';

  return {
    ok: true,
    nextState,
    event: {
      operation_id: randomUUID(),
      tool_name: mechanical ? 'realizar_teste' : 'mock_registrar_acao_livre',
      arguments: { text: actionText, mock_action_code: code, favor: Boolean(playerInput?.favor), pressao: Boolean(playerInput?.pressao) },
      result: mechanical || { recorded: true }
    },
    response: {
      phase: 'backend_mock_phase_3',
      narrative: mechanical
        ? `Ação recebida pelo motor. Resultado mecânico: ${mechanical.grade}. A narração GPT ainda não está ligada nesta fase.`
        : 'Ação livre registrada. A interpretação pelo Narrador GPT entra na Fase 4.',
      mechanical_events_visible: mechanical ? [mechanical] : [],
      visible_state_patch: { last_turn: nextState.last_turn, scene_summary: nextState.scene_summary },
      checkpoint_created: false,
      save_status: 'confirmed'
    }
  };
}
