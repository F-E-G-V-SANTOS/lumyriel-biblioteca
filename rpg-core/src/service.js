import { createCampaignArtifacts } from './campaign.js';
import { assertRpg } from './errors.js';
import { resolveTest } from './rules.js';
import { secureRandomUUID } from './random.js';

function competenceLevel(state, competenceId) {
  return state.competencies.find(x => x.competence_id === competenceId)?.level ?? 0;
}

const MOCK_ACTIONS = Object.freeze({
  examinar_sinais: {
    tool_name: 'realizar_teste',
    classification: 'INCERTO',
    attribute: 'percepcao',
    competence_id: 'investigacao',
    target: 12,
    folego_cost: 0,
    label: 'Examinar sinais e relacionar indícios'
  },
  corrida_sob_pressao: {
    tool_name: 'realizar_teste',
    classification: 'INCERTO',
    attribute: 'agilidade',
    competence_id: 'sobrevivencia',
    target: 10,
    folego_cost: 1,
    label: 'Correr sob pressão'
  },
  ler_documento_aberto: {
    tool_name: 'acao_certa',
    classification: 'CERTO',
    attribute: null,
    competence_id: null,
    target: null,
    folego_cost: 0,
    label: 'Ler um documento aberto e legível'
  }
});

export class RpgCoreService {
  constructor({
    repository,
    characterSource,
    canonSource,
    situationSource,
    roller = null,
    idFactory = secureRandomUUID,
    now = () => new Date().toISOString()
  }) {
    this.repository = repository;
    this.characterSource = characterSource;
    this.canonSource = canonSource;
    this.situationSource = situationSource;
    this.roller = roller;
    this.idFactory = idFactory;
    this.now = now;
  }

  createCampaign(init) {
    const character = this.characterSource.get(init.character_id);
    const canon = this.canonSource.getApproved();
    const situation = this.situationSource.create({ init, character, canon });

    const artifacts = createCampaignArtifacts({
      init,
      characterRecord: character,
      canonPackage: canon,
      situation,
      idFactory: this.idFactory,
      now: this.now
    });

    return this.repository.create(artifacts);
  }

  loadCampaign(campaignId) {
    return this.repository.load(campaignId);
  }

  processMockTurn({
    campaign_id,
    idempotency_key,
    expected_state_version,
    player_input
  }) {
    assertRpg(typeof idempotency_key === 'string' && idempotency_key.trim(), 'IDEMPOTENCY_REQUIRED', 'idempotency_key é obrigatória.');
    assertRpg(Number.isInteger(expected_state_version), 'STATE_VERSION_REQUIRED', 'expected_state_version é obrigatória.');

    const existing = this.repository.findTurn(campaign_id, idempotency_key);
    if (existing) return existing;

    const loaded = this.repository.load(campaign_id);
    const state = loaded.state;

    assertRpg(
      state.state_version === expected_state_version,
      'STATE_VERSION_CONFLICT',
      'A campanha mudou desde que a ação foi enviada.',
      { expected: expected_state_version, actual: state.state_version }
    );

    const actionId = player_input?.selected_action_id;
    const action = MOCK_ACTIONS[actionId];
    assertRpg(action, 'MOCK_ACTION_NOT_FOUND', 'Ação mockada não reconhecida.');

    const nextState = structuredClone(state);
    const turnId = this.idFactory();
    const operationId = this.idFactory();

    const folego = nextState.character.resources.folego;
    if (action.folego_cost > 0) {
      assertRpg(
        folego.applicable && folego.current >= action.folego_cost,
        'ACTION_IMPOSSIBLE',
        'A ação é impossível no estado atual por falta de Fôlego.'
      );
      folego.current -= action.folego_cost;
      folego.state = folego.current === 0 ? 'esgotado' : 'disponivel';
    }

    let mechanicalResult;
    if (action.classification === 'CERTO') {
      mechanicalResult = {
        classification: 'CERTO',
        rolled: false,
        outcome: 'sucesso'
      };
    } else {
      const attributeValue = nextState.character.attributes[action.attribute];
      const competence = competenceLevel(nextState, action.competence_id);

      mechanicalResult = {
        classification: 'INCERTO',
        rolled: true,
        test: resolveTest({
          attribute: attributeValue,
          competence,
          specialty: 0,
          situational: 0,
          target: action.target,
          rollMode: 'normal',
          roller: this.roller
        })
      };
    }

    const operation = {
      tool_name: action.tool_name,
      arguments_json: {
        action_id: actionId,
        raw_text: player_input?.raw_text ?? '',
        action_label: action.label
      },
      result_json: mechanicalResult
    };

    const response = {
      turn_id: turnId,
      operation_id: operationId,
      campaign_id,
      mock_phase: true,
      narrator_output: null,
      mechanical_events_visible: [mechanicalResult],
      visible_state_patch: {
        vitality: nextState.character.vitality,
        folego: nextState.character.resources.folego
      },
      checkpoint_created: false,
      save_status: 'confirmed'
    };

    return this.repository.commitTurn({
      campaignId: campaign_id,
      idempotencyKey: idempotency_key,
      expectedStateVersion: expected_state_version,
      nextState,
      operation,
      response,
      now: this.now
    });
  }
}

export class InMemoryCharacterSource {
  constructor(records = []) {
    this.records = new Map(records.map(x => [x.character_id, structuredClone(x)]));
  }

  get(characterId) {
    const value = this.records.get(characterId);
    assertRpg(value, 'CHARACTER_NOT_FOUND', 'Personagem não encontrado.');
    return structuredClone(value);
  }
}

export class FixedCanonSource {
  constructor(pkg) {
    this.pkg = structuredClone(pkg);
  }

  getApproved() {
    return structuredClone(this.pkg);
  }
}

export class FixedSituationSource {
  constructor(seed) {
    this.seed = structuredClone(seed);
  }

  create() {
    return structuredClone(this.seed);
  }
}
