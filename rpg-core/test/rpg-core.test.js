import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryCampaignRepository } from '../src/repository.js';
import {
  FixedCanonSource,
  FixedSituationSource,
  InMemoryCharacterSource,
  RpgCoreService
} from '../src/service.js';
import { resolveTest } from '../src/rules.js';

function ids() {
  let n = 0;
  return () => `id-${++n}`;
}

function character(overrides = {}) {
  return {
    character_id: 'char-1',
    revision: 1,
    display_name: 'Teste',
    mechanics: {
      attributes: {
        potencia: 2,
        agilidade: 2,
        vigor: 3,
        intelecto: 2,
        percepcao: 3,
        presenca: 1
      },
      competencies: [
        { id: 'investigacao', level: 2 },
        { id: 'sobrevivencia', level: 2 },
        { id: 'oficios', level: 1 },
        { id: 'influencia', level: 1 },
        { id: 'runologia', level: 1 },
        { id: 'historia_regional', level: 1 }
      ],
      specialties: [
        { id: 'rastreamento', level: 1 },
        { id: 'metalurgia', level: 1 }
      ],
      power_resources: {
        mana: { applicable: false },
        aura: { applicable: false }
      },
      inventory: []
    },
    ...overrides
  };
}

function makeService(record = character(), roller = () => 10) {
  return new RpgCoreService({
    repository: new InMemoryCampaignRepository(),
    characterSource: new InMemoryCharacterSource([record]),
    canonSource: new FixedCanonSource({ id: 'valdren', version: '0.1' }),
    situationSource: new FixedSituationSource({
      situation_id: 'sit-1',
      version: 1,
      start_location_id: 'valdren-start',
      clocks: []
    }),
    roller,
    idFactory: ids(),
    now: () => '2026-09-30T20:00:00.000Z'
  });
}

const init = {
  character_id: 'char-1',
  character_revision: 1,
  difficulty_mode: 'medio',
  duration_mode: '30',
  region_selection: 'auto',
  region_id: null,
  adventure_preference: 'auto',
  campaign_name: null
};

test('cria campanha com Vitalidade e Fôlego derivados sem inventar Mana/Aura', () => {
  const service = makeService();
  const created = service.createCampaign(init);

  assert.equal(created.state.character.vitality, 14);
  assert.equal(created.state.character.resources.folego.maximum, 10);
  assert.equal(created.state.character.resources.mana.applicable, false);
  assert.equal(created.state.character.resources.aura.applicable, false);
  assert.equal(created.manifest.canon_policy, 'pinned');
});

test('rejeita personagem sem ficha mecânica em vez de inferir atributos silenciosamente', () => {
  const service = makeService({
    character_id: 'char-1',
    revision: 1,
    display_name: 'Sem mecânica'
  });

  assert.throws(
    () => service.createCampaign(init),
    err => err.code === 'CHARACTER_MECHANICS_REQUIRED'
  );
});

test('valida orçamento inicial de atributos', () => {
  const bad = character();
  bad.mechanics.attributes.presenca = 2;
  const service = makeService(bad);

  assert.throws(
    () => service.createCampaign(init),
    err => err.code === 'INVALID_ATTRIBUTE_BUDGET'
  );
});

test('Favor usa o maior d20 e Pressão usa o menor', () => {
  const favorRolls = [4, 17];
  const favor = resolveTest({
    attribute: 2,
    competence: 1,
    target: 12,
    rollMode: 'favor',
    roller: () => favorRolls.shift()
  });

  const pressureRolls = [4, 17];
  const pressure = resolveTest({
    attribute: 2,
    competence: 1,
    target: 12,
    rollMode: 'pressao',
    roller: () => pressureRolls.shift()
  });

  assert.equal(favor.selected_die, 17);
  assert.equal(pressure.selected_die, 4);
});

test('20 natural melhora um grau sem alterar a dificuldade', () => {
  const result = resolveTest({
    attribute: 0,
    competence: 0,
    target: 21,
    roller: () => 20
  });

  assert.equal(result.target, 21);
  assert.equal(result.margin, -1);
  assert.equal(result.grade, 'sucesso');
});

test('turno mockado consome Fôlego, persiste evento e incrementa state_version', () => {
  const service = makeService();
  const created = service.createCampaign(init);

  const turn = service.processMockTurn({
    campaign_id: created.manifest.campaign_id,
    idempotency_key: 'turn-1',
    expected_state_version: 1,
    player_input: {
      source: 'suggested_action',
      raw_text: '',
      selected_action_id: 'corrida_sob_pressao'
    }
  });

  assert.equal(turn.state_version, 2);
  assert.equal(turn.visible_state_patch.folego.current, 9);

  const loaded = service.loadCampaign(created.manifest.campaign_id);
  assert.equal(loaded.state.state_version, 2);
  assert.equal(loaded.events.length, 2);
});

test('idempotência impede nova rolagem e novo consumo', () => {
  let calls = 0;
  const service = makeService(character(), () => {
    calls += 1;
    return 11;
  });
  const created = service.createCampaign(init);

  const request = {
    campaign_id: created.manifest.campaign_id,
    idempotency_key: 'same-turn',
    expected_state_version: 1,
    player_input: {
      source: 'suggested_action',
      raw_text: '',
      selected_action_id: 'corrida_sob_pressao'
    }
  };

  const first = service.processMockTurn(request);
  const second = service.processMockTurn(request);

  assert.deepEqual(second, first);
  assert.equal(calls, 1);

  const loaded = service.loadCampaign(created.manifest.campaign_id);
  assert.equal(loaded.state.character.resources.folego.current, 9);
  assert.equal(loaded.events.length, 2);
});

test('state_version antiga é rejeitada', () => {
  const service = makeService();
  const created = service.createCampaign(init);

  service.processMockTurn({
    campaign_id: created.manifest.campaign_id,
    idempotency_key: 'turn-1',
    expected_state_version: 1,
    player_input: {
      source: 'suggested_action',
      raw_text: '',
      selected_action_id: 'examinar_sinais'
    }
  });

  assert.throws(
    () => service.processMockTurn({
      campaign_id: created.manifest.campaign_id,
      idempotency_key: 'turn-2',
      expected_state_version: 1,
      player_input: {
        source: 'suggested_action',
        raw_text: '',
        selected_action_id: 'ler_documento_aberto'
      }
    }),
    err => err.code === 'STATE_VERSION_CONFLICT'
  );
});
