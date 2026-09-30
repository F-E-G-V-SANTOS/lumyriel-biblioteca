import { assertRpg } from './errors.js';
import { secureRandomUUID } from './random.js';
import {
  DIFFICULTY_MODES,
  DURATION_MODES,
  buildInitialResources,
  validateCreationAttributes,
  validateInitialCompetencies
} from './rules.js';

const TARGET_MINUTES = Object.freeze({
  '30': 30,
  '60': 60,
  '90': 90,
  '120': 120,
  '240': 240,
  'continua': null
});

export function createCampaignArtifacts({
  init,
  characterRecord,
  canonPackage,
  situation,
  idFactory = secureRandomUUID,
  now = () => new Date().toISOString()
}) {
  assertRpg(init && typeof init === 'object', 'INVALID_INIT', 'CampaignInitRequest ausente.');
  assertRpg(DIFFICULTY_MODES.includes(init.difficulty_mode), 'INVALID_DIFFICULTY', 'Dificuldade inválida.');
  assertRpg(DURATION_MODES.includes(init.duration_mode), 'INVALID_DURATION', 'Duração inválida.');

  assertRpg(characterRecord && characterRecord.character_id === init.character_id, 'CHARACTER_NOT_FOUND', 'Personagem não encontrado.');
  assertRpg(
    Number.isInteger(init.character_revision) && characterRecord.revision === init.character_revision,
    'CHARACTER_REVISION_CONFLICT',
    'A revisão do personagem não corresponde à revisão atual.'
  );

  const mechanics = characterRecord.mechanics;
  assertRpg(mechanics, 'CHARACTER_MECHANICS_REQUIRED', 'O personagem ainda não possui ficha mecânica do RPG.');

  const attributes = validateCreationAttributes(mechanics.attributes);
  const competencyProfile = validateInitialCompetencies(mechanics.competencies, mechanics.specialties);
  const initialResources = buildInitialResources(attributes, mechanics.power_resources);

  assertRpg(canonPackage?.id && canonPackage?.version, 'CANON_PACKAGE_REQUIRED', 'Pacote Canônico aprovado é obrigatório.');
  assertRpg(situation?.situation_id && situation?.start_location_id, 'SITUATION_REQUIRED', 'SituationSeed é obrigatório.');

  const campaignId = idFactory();
  const characterSnapshotId = idFactory();
  const checkpointId = idFactory();
  const createdAt = now();

  const characterSnapshot = {
    character_snapshot_id: characterSnapshotId,
    campaign_id: campaignId,
    character_id: characterRecord.character_id,
    source_revision: characterRecord.revision,
    snapshot: structuredClone(characterRecord),
    created_at: createdAt
  };

  const state = {
    schema_version: '0.2',
    state_version: 1,
    campaign_id: campaignId,
    character_id: characterRecord.character_id,
    difficulty_mode: init.difficulty_mode,
    timing: {
      target_minutes: TARGET_MINUTES[init.duration_mode],
      elapsed_seconds: 0,
      remaining_seconds: TARGET_MINUTES[init.duration_mode] === null ? null : TARGET_MINUTES[init.duration_mode] * 60,
      pacing_phase: 'abertura'
    },
    world_time: {
      calendar_id: null,
      date_label: null,
      epoch_minutes: null,
      segment_label: null
    },
    current_location_id: situation.start_location_id,
    character: {
      character_id: characterRecord.character_id,
      attributes,
      vitality: initialResources.vitality,
      vitality_max: initialResources.vitality_max,
      resources: initialResources.resources
    },
    injuries: [],
    conditions: [],
    inventory: structuredClone(mechanics.inventory ?? []),
    competencies: competencyProfile.competencies.map(item => ({
      competence_id: item.id,
      level: item.level,
      practice_marks: 0
    })),
    technique_ids: structuredClone(mechanics.technique_ids ?? []),
    relationships: [],
    reputation: [],
    objectives: [],
    session_facts: [],
    rumors: [],
    clues: [],
    clocks: structuredClone(situation.clocks ?? []),
    npc_states: [],
    creature_states: [],
    open_hooks: [],
    scene_summary: '',
    campaign_summary: '',
    canonical_context_refs: []
  };

  const manifest = {
    campaign_id: campaignId,
    campaign_schema_version: '0.1',
    state_schema_version: '0.2',
    character_id: characterRecord.character_id,
    character_source_revision: characterRecord.revision,
    character_snapshot_id: characterSnapshotId,
    canon_package_id: canonPackage.id,
    canon_package_version: canonPackage.version,
    canon_policy: 'pinned',
    situation_id: situation.situation_id,
    situation_version: situation.version ?? 1,
    difficulty_mode: init.difficulty_mode,
    duration_mode: init.duration_mode,
    created_at: createdAt,
    last_saved_at: createdAt,
    latest_state_version: 1,
    latest_event_sequence: 1,
    latest_checkpoint_id: checkpointId
  };

  const initialEvent = {
    campaign_id: campaignId,
    event_sequence: 1,
    turn_id: null,
    operation_id: `campaign:${campaignId}:created`,
    tool_name: 'campaign_created',
    state_version_before: 0,
    state_version_after: 1,
    arguments_json: {
      difficulty_mode: init.difficulty_mode,
      duration_mode: init.duration_mode
    },
    result_json: { ok: true },
    world_time_ref: null,
    created_at: createdAt
  };

  const checkpoint = {
    checkpoint_id: checkpointId,
    campaign_id: campaignId,
    state_version: 1,
    event_sequence: 1,
    state_json: structuredClone(state),
    scene_summary: '',
    campaign_summary: '',
    canon_package_id: canonPackage.id,
    canon_package_version: canonPackage.version,
    character_snapshot_id: characterSnapshotId,
    reason: 'periodic',
    created_at: createdAt,
    confirmed: true
  };

  return {
    manifest,
    characterSnapshot,
    state,
    initialEvent,
    checkpoint,
    situation: structuredClone(situation)
  };
}
