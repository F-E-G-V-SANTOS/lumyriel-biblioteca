import { randomUUID } from 'node:crypto';

const SITUATION_KEYS = new Set([
  'situation_id',
  'origin',
  'region_id',
  'start_location_id',
  'situation_type',
  'premise_visible',
  'normal_state',
  'change',
  'forces',
  'clocks',
  'information_nodes',
  'hidden_truth_ids',
  'allowed_canonical_entity_ids',
  'generated_session_entity_ids',
  'end_conditions',
  'failure_endings',
  'duration_blueprint',
  'no_single_solution',
]);

const SITUATION_TYPES = new Set([
  'social',
  'investigacao',
  'exploracao',
  'viagem',
  'sobrevivencia',
  'combate',
  'mista',
]);

const CLOCK_VISIBILITY = new Set(['oculto', 'percebido', 'visivel']);

export class SituationValidationError extends Error {
  constructor(message, code = 'INVALID_SITUATION_SEED') {
    super(message);
    this.name = 'SituationValidationError';
    this.code = code;
    this.status = 500;
  }
}

function makeSessionId(kind, token, idFactory) {
  return `session:${kind}:${token}:${idFactory()}`;
}

function defaultIdFactory() {
  return randomUUID().replace(/-/g, '').slice(0, 12);
}

function assertExactKeys(object, allowed, label) {
  if (!object || typeof object !== 'object' || Array.isArray(object)) {
    throw new SituationValidationError(`${label} must be an object`);
  }
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) {
      throw new SituationValidationError(`${label} contains unsupported field: ${key}`);
    }
  }
  for (const key of allowed) {
    if (!(key in object)) {
      throw new SituationValidationError(`${label} is missing required field: ${key}`);
    }
  }
}

function assertString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new SituationValidationError(`${label} must be a non-empty string`);
  }
}

function assertStringArray(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item.trim() === '')) {
    throw new SituationValidationError(`${label} must be an array of non-empty strings`);
  }
}

function validateForce(force, index) {
  const allowed = new Set(['force_id', 'role', 'goal', 'resources', 'constraints', 'current_plan']);
  assertExactKeys(force, allowed, `forces[${index}]`);
  assertString(force.force_id, `forces[${index}].force_id`);
  assertString(force.role, `forces[${index}].role`);
  assertString(force.goal, `forces[${index}].goal`);
  assertStringArray(force.resources, `forces[${index}].resources`);
  assertStringArray(force.constraints, `forces[${index}].constraints`);
  assertString(force.current_plan, `forces[${index}].current_plan`);
}

function validateClock(clock, index) {
  const allowed = new Set(['clock_id', 'label', 'current', 'maximum', 'trigger', 'visibility']);
  assertExactKeys(clock, allowed, `clocks[${index}]`);
  assertString(clock.clock_id, `clocks[${index}].clock_id`);
  assertString(clock.label, `clocks[${index}].label`);
  if (!Number.isInteger(clock.current) || clock.current < 0) {
    throw new SituationValidationError(`clocks[${index}].current must be a non-negative integer`);
  }
  if (!Number.isInteger(clock.maximum) || clock.maximum < 1 || clock.current > clock.maximum) {
    throw new SituationValidationError(`clocks[${index}].maximum must be >= 1 and >= current`);
  }
  assertString(clock.trigger, `clocks[${index}].trigger`);
  if (!CLOCK_VISIBILITY.has(clock.visibility)) {
    throw new SituationValidationError(`clocks[${index}].visibility is invalid`);
  }
}

function validateInformationNode(node, index) {
  const allowed = new Set([
    'node_id',
    'subject',
    'truth_ref',
    'holders',
    'discovery_methods',
    'essential',
    'redundancy_group',
  ]);
  assertExactKeys(node, allowed, `information_nodes[${index}]`);
  assertString(node.node_id, `information_nodes[${index}].node_id`);
  assertString(node.subject, `information_nodes[${index}].subject`);
  assertString(node.truth_ref, `information_nodes[${index}].truth_ref`);
  assertStringArray(node.holders, `information_nodes[${index}].holders`);
  assertStringArray(node.discovery_methods, `information_nodes[${index}].discovery_methods`);
  if (typeof node.essential !== 'boolean') {
    throw new SituationValidationError(`information_nodes[${index}].essential must be boolean`);
  }
  if (node.redundancy_group !== null) assertString(node.redundancy_group, `information_nodes[${index}].redundancy_group`);
  if (node.essential && node.discovery_methods.length < 2 && node.redundancy_group === null) {
    throw new SituationValidationError(
      `essential information node ${node.node_id} needs multiple discovery methods or a redundancy group`,
    );
  }
}

function validateDurationBlueprint(blueprint) {
  const allowed = new Set([
    'target_minutes',
    'opening_weight',
    'development_weight',
    'convergence_weight',
    'climax_weight',
    'epilogue_weight',
  ]);
  assertExactKeys(blueprint, allowed, 'duration_blueprint');
  if (blueprint.target_minutes !== null
    && (!Number.isInteger(blueprint.target_minutes) || blueprint.target_minutes < 1)) {
    throw new SituationValidationError('duration_blueprint.target_minutes must be null or a positive integer');
  }
  for (const key of [
    'opening_weight',
    'development_weight',
    'convergence_weight',
    'climax_weight',
    'epilogue_weight',
  ]) {
    if (!Number.isInteger(blueprint[key]) || blueprint[key] < 0) {
      throw new SituationValidationError(`duration_blueprint.${key} must be a non-negative integer`);
    }
  }
}

export function validateSituationSeed(seed, { allowedRegions = ['valdren'] } = {}) {
  assertExactKeys(seed, SITUATION_KEYS, 'SituationSeed');
  assertString(seed.situation_id, 'situation_id');
  if (seed.origin !== 'SESSION') throw new SituationValidationError('origin must be SESSION');
  if (!allowedRegions.includes(seed.region_id)) {
    throw new SituationValidationError(`region_id is not enabled for this MVP: ${seed.region_id}`);
  }
  assertString(seed.start_location_id, 'start_location_id');
  if (!SITUATION_TYPES.has(seed.situation_type)) {
    throw new SituationValidationError('invalid situation_type');
  }
  assertString(seed.premise_visible, 'premise_visible');
  assertString(seed.normal_state, 'normal_state');
  assertString(seed.change, 'change');

  if (!Array.isArray(seed.forces) || seed.forces.length < 2) {
    throw new SituationValidationError('forces must contain at least two active forces');
  }
  seed.forces.forEach(validateForce);

  if (!Array.isArray(seed.clocks)) throw new SituationValidationError('clocks must be an array');
  seed.clocks.forEach(validateClock);

  if (!Array.isArray(seed.information_nodes) || seed.information_nodes.length < 1) {
    throw new SituationValidationError('information_nodes must contain at least one node');
  }
  seed.information_nodes.forEach(validateInformationNode);

  assertStringArray(seed.hidden_truth_ids, 'hidden_truth_ids');
  assertStringArray(seed.allowed_canonical_entity_ids, 'allowed_canonical_entity_ids');
  assertStringArray(seed.generated_session_entity_ids, 'generated_session_entity_ids');
  assertStringArray(seed.end_conditions, 'end_conditions');
  assertStringArray(seed.failure_endings, 'failure_endings');
  validateDurationBlueprint(seed.duration_blueprint);

  if (seed.no_single_solution !== true) {
    throw new SituationValidationError('no_single_solution must be true');
  }

  if (!seed.start_location_id.startsWith('session:')
    && !seed.allowed_canonical_entity_ids.includes(seed.start_location_id)) {
    throw new SituationValidationError('start_location_id must be a session entity or an authorized canonical entity');
  }

  const sessionIds = new Set(seed.generated_session_entity_ids);
  for (const force of seed.forces) {
    if (force.force_id.startsWith('session:') && !sessionIds.has(force.force_id)) {
      throw new SituationValidationError(`generated force is missing from generated_session_entity_ids: ${force.force_id}`);
    }
  }

  const hidden = new Set(seed.hidden_truth_ids);
  for (const node of seed.information_nodes) {
    if (!hidden.has(node.truth_ref)) {
      throw new SituationValidationError(`information node references an unknown truth: ${node.truth_ref}`);
    }
  }

  if (seed.duration_blueprint.target_minutes === 30) {
    if (seed.forces.length > 3) {
      throw new SituationValidationError('30-minute seed cannot exceed three active forces in the approved MVP pattern');
    }
    if (seed.information_nodes.length > 4) {
      throw new SituationValidationError('30-minute seed cannot exceed four information nodes in the approved MVP pattern');
    }
  }

  return seed;
}

function buildAuthorizationMismatchSeed({ request, idFactory }) {
  const suffix = () => idFactory();
  const situationId = `sit_auth_${suffix()}`;
  const locationId = makeSessionId('location', 'valdren-cargo-yard', suffix);

  const merchantId = makeSessionId('npc', 'merchant', suffix);
  const cargoWorkerId = makeSessionId('npc', 'cargo-worker', suffix);
  const administrationId = makeSessionId('npc', 'administration', suffix);
  const supplierRefId = makeSessionId('record', 'supplier-reference', suffix);

  const truthMismatch = `truth:${situationId}:document-mismatch`;
  const truthSubstitution = `truth:${situationId}:legitimate-substitution`;
  const truthPhysicalCargo = `truth:${situationId}:physical-cargo-current`;
  const truthNoViolation = `truth:${situationId}:no-material-violation`;

  const publicSeed = {
    situation_id: situationId,
    origin: 'SESSION',
    region_id: 'valdren',
    start_location_id: locationId,
    situation_type: request.adventure_preference === 'social' ? 'social' : 'investigacao',
    premise_visible: 'Uma carga já descarregada não pode seguir para distribuição porque os documentos apresentados pelo transportador e o registro local não coincidem em um ponto importante.',
    normal_state: 'Uma carga regional chega, é registrada, armazenada e liberada para distribuição.',
    change: 'Um campo da autorização corresponde ao lote anterior, enquanto peso e descrição pertencem ao lote atual.',
    forces: [
      {
        force_id: merchantId,
        role: 'mercador',
        goal: 'Liberar a mercadoria sem perder reputação ou dinheiro.',
        resources: ['documentos apresentados', 'mercadoria já descarregada', 'capacidade de negociar armazenamento'],
        constraints: ['não pode tornar uma autorização inconsistente em regular por simples insistência'],
        current_plan: 'Defender que a carga física e os documentos atuais justificam a liberação.',
      },
      {
        force_id: cargoWorkerId,
        role: 'trabalhador de carga',
        goal: 'Encerrar a descarga e demonstrar que não alterou os documentos.',
        resources: ['memória da descarga', 'acesso aos registros operacionais do transporte'],
        constraints: ['não controla o registro administrativo local nem o fornecedor'],
        current_plan: 'Comparar o que foi descarregado com o documento de carga recebido.',
      },
      {
        force_id: administrationId,
        role: 'administração local',
        goal: 'Impedir liberação irregular sem paralisar atividade legítima.',
        resources: ['registro local', 'autoridade para reter a carga até esclarecimento'],
        constraints: ['não deve presumir fraude sem evidência'],
        current_plan: 'Manter a carga retida até que a divergência seja explicada ou formalmente encaminhada.',
      },
    ],
    clocks: [
      {
        clock_id: `clock:${situationId}:operation-window`,
        label: 'Fim da janela de operação do dia',
        current: 0,
        maximum: 4,
        trigger: 'Tempo gasto em investigação, espera ou negociação aproxima o encerramento das operações e pode gerar custo de armazenagem e novo trabalho no dia seguinte.',
        visibility: 'visivel',
      },
    ],
    information_nodes: [
      {
        node_id: `node:${situationId}:a1`,
        subject: 'Divergência documental entre autorização e lote atual.',
        truth_ref: truthMismatch,
        holders: [administrationId, cargoWorkerId],
        discovery_methods: [
          'consultar o registro local',
          'ler o documento do transportador',
          'comparar os documentos com a carga descarregada',
        ],
        essential: true,
        redundancy_group: 'auth-core',
      },
      {
        node_id: `node:${situationId}:a2`,
        subject: 'Houve substituição legítima de parte do lote antes da saída.',
        truth_ref: truthSubstitution,
        holders: [cargoWorkerId, supplierRefId],
        discovery_methods: [
          'localizar o manifesto de carga atualizado',
          'obter o relato do trabalhador sobre a documentação recebida',
          'consultar o registro ou contato disponível do fornecedor',
        ],
        essential: true,
        redundancy_group: 'auth-core',
      },
      {
        node_id: `node:${situationId}:a3`,
        subject: 'A mercadoria física corresponde ao documento de carga atual.',
        truth_ref: truthPhysicalCargo,
        holders: [merchantId, cargoWorkerId],
        discovery_methods: [
          'inspecionar a armazenagem',
          'realizar contagem ou pesagem compatível',
          'ouvir testemunha da descarga',
        ],
        essential: false,
        redundancy_group: null,
      },
      {
        node_id: `node:${situationId}:a4`,
        subject: 'Não há indício material de violação da carga.',
        truth_ref: truthNoViolation,
        holders: [cargoWorkerId],
        discovery_methods: [
          'inspecionar sinais físicos de violação',
          'comparar a cadeia de manuseio conhecida',
        ],
        essential: false,
        redundancy_group: null,
      },
    ],
    hidden_truth_ids: [
      truthMismatch,
      truthSubstitution,
      truthPhysicalCargo,
      truthNoViolation,
    ],
    allowed_canonical_entity_ids: [],
    generated_session_entity_ids: [
      locationId,
      merchantId,
      cargoWorkerId,
      administrationId,
      supplierRefId,
    ],
    end_conditions: [
      'O jogador decide liberar, reter, escalar ou adiar a carga com base nas evidências obtidas.',
      'A responsabilidade procedural fica registrada ou encaminhada a uma autoridade competente de SESSÃO.',
    ],
    failure_endings: [
      'A carga permanece retida e gera custo de armazenagem ou novo trabalho no dia seguinte.',
      'O jogador abandona o problema e as forças locais continuam reagindo sem sua participação.',
      'Uma decisão prematura produz consequência econômica ou relacional sem transformar hipótese em verdade.',
    ],
    duration_blueprint: {
      target_minutes: 30,
      opening_weight: 2,
      development_weight: 3,
      convergence_weight: 2,
      climax_weight: 2,
      epilogue_weight: 1,
    },
    no_single_solution: true,
  };

  const privateTruth = {
    situation_id: situationId,
    truth_records: {
      [truthMismatch]: 'A autorização anexada corresponde ao lote anterior; peso e descrição pertencem ao lote atual.',
      [truthSubstitution]: 'O fornecedor substituiu legitimamente parte do lote antes da saída por indisponibilidade de mercadoria. O transportador recebeu documento atualizado de carga, mas uma cópia antiga da autorização permaneceu anexada.',
      [truthPhysicalCargo]: 'A mercadoria física corresponde ao documento de carga atualizado.',
      [truthNoViolation]: 'Não houve contrabando e não há evidência material de violação da carga.',
    },
    reveal_policy: 'Nenhuma verdade oculta é enviada integralmente ao Narrador sem descoberta, consulta ou consequência autorizada pelo motor.',
  };

  validateSituationSeed(publicSeed);
  return {
    template_id: 'qa:authorization-mismatch:v0.1',
    public_seed: publicSeed,
    private_truth: privateTruth,
  };
}

function buildFallbackSeed({ request, idFactory }) {
  const situationId = `sit_fallback_${idFactory()}`;
  const locationId = makeSessionId('location', 'valdren-generic', idFactory);
  const localId = makeSessionId('npc', 'local-worker', idFactory);
  const truthId = `truth:${situationId}:local-change`;
  const target = request.duration_mode === 'continua' ? null : Number(request.duration_mode);

  const publicSeed = {
    situation_id: situationId,
    origin: 'SESSION',
    region_id: 'valdren',
    start_location_id: locationId,
    situation_type: request.adventure_preference === 'auto' ? 'mista' : request.adventure_preference,
    premise_visible: 'Uma rotina local de Valdren saiu do curso esperado e precisa ser compreendida antes de qualquer conclusão.',
    normal_state: 'Uma atividade regional seguia sua rotina sem necessidade de intervenção do personagem.',
    change: 'Um problema local alterou o funcionamento normal e abriu mais de uma resposta plausível.',
    forces: [
      {
        force_id: localId,
        role: 'trabalhador local',
        goal: 'Compreender o problema sem criar risco ou custo desnecessário.',
        resources: ['conhecimento cotidiano da atividade'],
        constraints: ['não conhece a causa completa'],
        current_plan: 'Observar a mudança e buscar informação antes de agir.',
      },
      {
        force_id: makeSessionId('force', 'local-pressure', idFactory),
        role: 'pressão da situação',
        goal: 'Continuar produzindo consequências se ninguém agir.',
        resources: ['tempo', 'condições locais'],
        constraints: ['não altera o cânone e não cria ameaça nova sem base'],
        current_plan: 'Evoluir apenas conforme processos já estabelecidos na situação.',
      },
    ],
    clocks: [],
    information_nodes: [
      {
        node_id: `node:${situationId}:fallback-1`,
        subject: 'A mudança possui uma causa local que ainda precisa ser determinada.',
        truth_ref: truthId,
        holders: [localId],
        discovery_methods: [
          'observar diretamente a situação',
          'conversar com pessoas presentes',
        ],
        essential: true,
        redundancy_group: 'fallback-core',
      },
    ],
    hidden_truth_ids: [truthId],
    allowed_canonical_entity_ids: [],
    generated_session_entity_ids: [
      locationId,
      localId,
    ],
    end_conditions: [
      'O jogador toma uma decisão informada ou abandona a situação.',
    ],
    failure_endings: [
      'O problema permanece aberto e continua sem participação do jogador.',
    ],
    duration_blueprint: {
      target_minutes: target,
      opening_weight: 1,
      development_weight: target && target >= 60 ? 3 : 2,
      convergence_weight: 1,
      climax_weight: 1,
      epilogue_weight: 1,
    },
    no_single_solution: true,
  };

  const pressureForce = publicSeed.forces[1].force_id;
  publicSeed.generated_session_entity_ids.push(pressureForce);

  const privateTruth = {
    situation_id: situationId,
    truth_records: {
      [truthId]: 'Seed de contingência estrutural: a causa específica ainda não foi composta. O motor não deve inventar uma verdade canônica para preencher a lacuna.',
    },
    reveal_policy: 'Fallback técnico; não promover conteúdo a cânone.',
  };

  validateSituationSeed(publicSeed);
  return {
    template_id: 'fallback:valdren-structural:v0.1',
    public_seed: publicSeed,
    private_truth: privateTruth,
  };
}

export function generateSituationSeed({
  request,
  mechanics = null,
  idFactory = defaultIdFactory,
} = {}) {
  if (!request || typeof request !== 'object') {
    throw new SituationValidationError('CampaignInitRequest is required to generate a situation');
  }

  const region = request.region_selection === 'selected'
    ? request.region_id
    : 'valdren';
  if (region !== 'valdren') {
    throw new SituationValidationError('Only Valdren is enabled for the current MVP situation generator');
  }

  const preference = request.adventure_preference;
  const duration = request.duration_mode;
  const prefersSeedA = duration === '30'
    && ['auto', 'social', 'investigacao', 'mista'].includes(preference);

  if (prefersSeedA) {
    return buildAuthorizationMismatchSeed({ request, mechanics, idFactory });
  }

  return buildFallbackSeed({ request, mechanics, idFactory });
}
