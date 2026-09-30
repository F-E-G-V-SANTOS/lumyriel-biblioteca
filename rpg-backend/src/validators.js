const DIFFICULTIES = new Set(['historia', 'facil', 'medio', 'dificil', 'lumyriel']);
const DURATIONS = new Set(['30', '60', '90', '120', '240', 'continua']);
const REGIONS = new Set(['auto', 'selected']);
const ADVENTURE_PREFERENCES = new Set([
  'auto', 'social', 'investigacao', 'exploracao', 'viagem', 'sobrevivencia', 'combate', 'mista',
]);
const PLAYER_INPUT_SOURCES = new Set(['suggested_action', 'free_action', 'system_continue']);
const ATTRIBUTES = ['potencia', 'agilidade', 'vigor', 'intelecto', 'percepcao', 'presenca'];

export class ValidationError extends Error {
  constructor(message, code = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.status = 400;
  }
}

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(`${label} must be an object`);
  }
}

function assertString(value, label, { nullable = false, allowEmpty = false } = {}) {
  if (nullable && value === null) return;
  if (typeof value !== 'string' || (!allowEmpty && value.trim() === '')) {
    throw new ValidationError(`${label} must be ${allowEmpty ? 'a string' : 'a non-empty string'}`);
  }
}

function assertOnlyKeys(value, allowed, label) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new ValidationError(`${label} contains unsupported field: ${key}`);
  }
}

export function validateCharacterImport(body) {
  assertObject(body, 'body');
  assertObject(body.creator_payload, 'creator_payload');
  assertObject(body.mechanics, 'mechanics');

  const attrs = body.mechanics.attributes;
  assertObject(attrs, 'mechanics.attributes');

  let total = 0;
  for (const key of ATTRIBUTES) {
    const value = attrs[key];
    if (!Number.isInteger(value) || value < 1 || value > 3) {
      throw new ValidationError(`mechanics.attributes.${key} must be an integer from 1 to 3`);
    }
    total += value;
  }
  if (total !== 13) {
    throw new ValidationError('initial attributes must total 13 (six base 1 values + 7 distributed points)');
  }

  const competencies = body.mechanics.competencies;
  if (!Array.isArray(competencies)) {
    throw new ValidationError('mechanics.competencies must be an array');
  }
  const ids = new Set();
  let level2 = 0;
  let level1 = 0;
  let specialties = 0;
  for (const item of competencies) {
    assertObject(item, 'competency');
    assertString(item.id, 'competency.id');
    if (ids.has(item.id)) throw new ValidationError(`duplicate competency: ${item.id}`);
    ids.add(item.id);
    if (![1, 2].includes(item.level)) {
      throw new ValidationError(`competency ${item.id} must start at level 1 or 2`);
    }
    if (item.level === 2) level2 += 1;
    if (item.level === 1) level1 += 1;
    const specs = item.specialties ?? [];
    if (!Array.isArray(specs)) {
      throw new ValidationError(`competency ${item.id}.specialties must be an array`);
    }
    for (const spec of specs) {
      assertObject(spec, 'specialty');
      assertString(spec.id, 'specialty.id');
      if (spec.level !== 1) throw new ValidationError(`specialty ${spec.id} must start at level 1`);
      specialties += 1;
    }
  }
  if (level2 !== 2 || level1 !== 4 || specialties !== 2) {
    throw new ValidationError('initial competencies require exactly 2 at level 2, 4 at level 1, and 2 specialties at level 1');
  }

  const mana = body.mechanics.resources?.mana;
  const aura = body.mechanics.resources?.aura;
  for (const [name, resource] of [['mana', mana], ['aura', aura]]) {
    if (resource === undefined) continue;
    assertObject(resource, `mechanics.resources.${name}`);
    if (typeof resource.applicable !== 'boolean') {
      throw new ValidationError(`mechanics.resources.${name}.applicable must be boolean`);
    }
    if (resource.applicable) {
      if (!Number.isInteger(resource.maximum) || resource.maximum < 0) {
        throw new ValidationError(`mechanics.resources.${name}.maximum must be a non-negative integer when applicable`);
      }
    }
  }

  return body;
}

export function validateCampaignInit(body) {
  assertObject(body, 'body');
  assertOnlyKeys(body, new Set([
    'character_id', 'character_revision', 'difficulty_mode', 'duration_mode',
    'region_selection', 'region_id', 'adventure_preference', 'campaign_name',
  ]), 'body');

  assertString(body.character_id, 'character_id');
  if (!Number.isInteger(body.character_revision) || body.character_revision < 1) {
    throw new ValidationError('character_revision must be a positive integer');
  }
  if (!DIFFICULTIES.has(body.difficulty_mode)) throw new ValidationError('invalid difficulty_mode');
  if (!DURATIONS.has(body.duration_mode)) throw new ValidationError('invalid duration_mode');
  if (!REGIONS.has(body.region_selection)) throw new ValidationError('invalid region_selection');

  if (body.region_id !== null) assertString(body.region_id, 'region_id');
  if (body.region_selection === 'selected' && body.region_id === null) {
    throw new ValidationError('region_id is required when region_selection is selected');
  }

  if (!ADVENTURE_PREFERENCES.has(body.adventure_preference)) {
    throw new ValidationError('invalid adventure_preference');
  }
  if (body.campaign_name !== null) assertString(body.campaign_name, 'campaign_name');

  return body;
}

export function validateTurnRequest(body) {
  assertObject(body, 'body');
  assertOnlyKeys(body, new Set(['idempotency_key', 'expected_state_version', 'player_input']), 'body');

  assertString(body.idempotency_key, 'idempotency_key');
  if (!Number.isInteger(body.expected_state_version) || body.expected_state_version < 1) {
    throw new ValidationError('expected_state_version must be a positive integer');
  }

  assertObject(body.player_input, 'player_input');
  assertOnlyKeys(body.player_input, new Set(['source', 'raw_text', 'selected_action_id']), 'player_input');

  if (!PLAYER_INPUT_SOURCES.has(body.player_input.source)) {
    throw new ValidationError('invalid player_input.source');
  }
  assertString(body.player_input.raw_text, 'player_input.raw_text', { allowEmpty: true });
  if (body.player_input.selected_action_id !== null) {
    assertString(body.player_input.selected_action_id, 'player_input.selected_action_id');
  }

  if (body.player_input.source === 'suggested_action' && body.player_input.selected_action_id === null) {
    throw new ValidationError('selected_action_id is required for suggested_action');
  }
  if (body.player_input.source === 'free_action' && body.player_input.raw_text.trim() === '') {
    throw new ValidationError('raw_text is required for free_action');
  }

  return body;
}

export function getCompetencyLevel(mechanics, competencyId) {
  const competencies = Array.isArray(mechanics?.competencies) ? mechanics.competencies : [];
  const competency = competencies.find((item) => item?.id === competencyId);
  return Number.isInteger(competency?.level) ? competency.level : 0;
}
