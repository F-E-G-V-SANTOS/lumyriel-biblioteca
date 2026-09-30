import { assertRpg } from './errors.js';
import { secureRandomIntInclusive } from './random.js';

export const ATTRIBUTE_KEYS = Object.freeze([
  'potencia',
  'agilidade',
  'vigor',
  'intelecto',
  'percepcao',
  'presenca'
]);

export const DIFFICULTY_MODES = Object.freeze([
  'historia',
  'facil',
  'medio',
  'dificil',
  'lumyriel'
]);

export const DURATION_MODES = Object.freeze([
  '30',
  '60',
  '90',
  '120',
  '240',
  'continua'
]);

export const TARGET_BANDS = Object.freeze([8, 10, 12, 15, 18, 21, 24]);

const GRADE_ORDER = Object.freeze([
  'falha_grave',
  'falha_com_consequencia',
  'sucesso',
  'sucesso_forte',
  'sucesso_excepcional'
]);

function isInteger(value) {
  return Number.isInteger(value);
}

export function validateCreationAttributes(attributes) {
  assertRpg(attributes && typeof attributes === 'object', 'MECHANICS_REQUIRED', 'Atributos mecânicos são obrigatórios.');

  for (const key of ATTRIBUTE_KEYS) {
    assertRpg(
      isInteger(attributes[key]),
      'INVALID_ATTRIBUTE',
      `Atributo ${key} precisa ser inteiro.`
    );
    assertRpg(
      attributes[key] >= 1 && attributes[key] <= 3,
      'INVALID_ATTRIBUTE_RANGE',
      `Atributo ${key} precisa estar entre 1 e 3 na criação comum do MVP.`
    );
  }

  const total = ATTRIBUTE_KEYS.reduce((sum, key) => sum + attributes[key], 0);
  assertRpg(
    total === 13,
    'INVALID_ATTRIBUTE_BUDGET',
    'A criação comum começa com 1 em cada atributo e distribui 7 pontos adicionais (total 13).',
    { total }
  );

  return structuredClone(attributes);
}

export function validateInitialCompetencies(competencies = [], specialties = []) {
  assertRpg(Array.isArray(competencies), 'INVALID_COMPETENCIES', 'Competências precisam ser uma lista.');
  assertRpg(Array.isArray(specialties), 'INVALID_SPECIALTIES', 'Especialidades precisam ser uma lista.');

  const ids = new Set();
  const levels = { 1: 0, 2: 0 };

  for (const item of competencies) {
    assertRpg(item && typeof item.id === 'string' && item.id.trim(), 'INVALID_COMPETENCE', 'Competência precisa de id.');
    assertRpg(!ids.has(item.id), 'DUPLICATE_COMPETENCE', 'Competência duplicada.', { id: item.id });
    ids.add(item.id);
    assertRpg(item.level === 1 || item.level === 2, 'INVALID_COMPETENCE_LEVEL', 'Competência inicial precisa estar em nível 1 ou 2.');
    levels[item.level] += 1;
  }

  assertRpg(
    levels[2] === 2 && levels[1] === 4 && competencies.length === 6,
    'INVALID_COMPETENCE_BUDGET',
    'O MVP inicia com 2 competências no nível 2 e 4 competências no nível 1.',
    { levels, count: competencies.length }
  );

  const specialtyIds = new Set();
  for (const item of specialties) {
    assertRpg(item && typeof item.id === 'string' && item.id.trim(), 'INVALID_SPECIALTY', 'Especialidade precisa de id.');
    assertRpg(!specialtyIds.has(item.id), 'DUPLICATE_SPECIALTY', 'Especialidade duplicada.', { id: item.id });
    specialtyIds.add(item.id);
    assertRpg(item.level === 1, 'INVALID_SPECIALTY_LEVEL', 'Especialidades iniciais do MVP começam no nível 1.');
  }

  assertRpg(
    specialties.length === 2,
    'INVALID_SPECIALTY_BUDGET',
    'O MVP inicia com 2 especialidades no nível 1.'
  );

  return {
    competencies: structuredClone(competencies),
    specialties: structuredClone(specialties)
  };
}

export function validateOptionalPowerResource(resource, label) {
  const value = resource ?? { applicable: false, current: null, maximum: null, state: null };
  assertRpg(typeof value.applicable === 'boolean', 'INVALID_RESOURCE', `${label}.applicable precisa ser booleano.`);

  if (!value.applicable) {
    return { applicable: false, current: null, maximum: null, state: null };
  }

  assertRpg(
    isInteger(value.current) && isInteger(value.maximum) && value.maximum >= 0 && value.current >= 0 && value.current <= value.maximum,
    'UNDEFINED_POWER_SCALE',
    `${label} só pode ser ativado quando o adaptador canônico fornecer valores mecânicos válidos; o núcleo não inventa escala de ${label}.`
  );

  return {
    applicable: true,
    current: value.current,
    maximum: value.maximum,
    state: value.state ?? null
  };
}

export function buildInitialResources(attributes, powerResources = {}) {
  const vitalityMax = 8 + (attributes.vigor * 2);
  const folegoMax = 5 + attributes.vigor + attributes.agilidade;

  return {
    vitality: vitalityMax,
    vitality_max: vitalityMax,
    resources: {
      folego: {
        applicable: true,
        current: folegoMax,
        maximum: folegoMax,
        state: 'disponivel'
      },
      mana: validateOptionalPowerResource(powerResources.mana, 'Mana'),
      aura: validateOptionalPowerResource(powerResources.aura, 'Aura')
    }
  };
}

export function targetGrade(margin) {
  if (margin >= 10) return 'sucesso_excepcional';
  if (margin >= 5) return 'sucesso_forte';
  if (margin >= 0) return 'sucesso';
  if (margin >= -4) return 'falha_com_consequencia';
  return 'falha_grave';
}

function shiftGrade(grade, delta) {
  const index = GRADE_ORDER.indexOf(grade);
  const next = Math.max(0, Math.min(GRADE_ORDER.length - 1, index + delta));
  return GRADE_ORDER[next];
}

export function rollD20(mode = 'normal', roller = null) {
  const next = roller ?? (() => secureRandomIntInclusive(1, 20));
  assertRpg(['normal', 'favor', 'pressao'].includes(mode), 'INVALID_ROLL_MODE', 'Modo de rolagem inválido.');

  const dice = mode === 'normal' ? [next()] : [next(), next()];
  for (const die of dice) {
    assertRpg(isInteger(die) && die >= 1 && die <= 20, 'INVALID_DIE_RESULT', 'Rolagem precisa produzir inteiro entre 1 e 20.');
  }

  const selected = mode === 'favor' ? Math.max(...dice) : mode === 'pressao' ? Math.min(...dice) : dice[0];
  return { mode, dice, selected };
}

export function resolveTest({
  attribute,
  competence = 0,
  specialty = 0,
  situational = 0,
  target,
  rollMode = 'normal',
  roller = null
}) {
  assertRpg(isInteger(attribute), 'INVALID_TEST_ATTRIBUTE', 'Modificador de atributo inválido.');
  assertRpg(isInteger(competence), 'INVALID_TEST_COMPETENCE', 'Modificador de competência inválido.');
  assertRpg(isInteger(specialty), 'INVALID_TEST_SPECIALTY', 'Modificador de especialidade inválido.');
  assertRpg(isInteger(situational), 'INVALID_TEST_MODIFIER', 'Modificador situacional inválido.');
  assertRpg(isInteger(target) && target > 0, 'INVALID_TEST_TARGET', 'Dificuldade do teste inválida.');

  const roll = rollD20(rollMode, roller);
  const modifier = attribute + competence + specialty + situational;
  const total = roll.selected + modifier;
  const margin = total - target;
  let grade = targetGrade(margin);

  // O gateway só chama resolveTest para ações possíveis e incertas.
  if (roll.selected === 20) grade = shiftGrade(grade, 1);
  if (roll.selected === 1) grade = shiftGrade(grade, -1);

  return {
    raw_dice: roll.dice,
    roll_mode: roll.mode,
    selected_die: roll.selected,
    modifiers: {
      attribute,
      competence,
      specialty,
      situational,
      total: modifier
    },
    target,
    total,
    margin,
    grade
  };
}
