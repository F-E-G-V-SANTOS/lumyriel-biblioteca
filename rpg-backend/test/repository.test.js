import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryRepository } from '../src/repository.js';
import { createCampaignBundle } from '../src/engine.js';

const userId = '00000000-0000-4000-8000-000000000001';
const input = { difficulty_mode: 'medio', duration_mode: '30', character: { name: 'QA', skillSurvival: 'Treinado' } };

test('idempotência não reaplica turno', async () => {
  const repo = new MemoryRepository({ rng: () => 10 });
  const bundle = createCampaignBundle({ userId, input });
  await repo.createCampaign(bundle);

  const req = {
    userId,
    campaignId: bundle.campaignId,
    idempotencyKey: 'turn-1',
    expectedStateVersion: 1,
    playerInput: { text: 'Examino.', mock_action_code: 'inspecionar_rota' }
  };
  const first = await repo.applyMockTurn(req);
  const second = await repo.applyMockTurn(req);
  assert.equal(first.status, 200);
  assert.deepEqual(second.body, first.body);

  const loaded = await repo.getCampaign(userId, bundle.campaignId);
  assert.equal(loaded.manifest.latest_state_version, 2);
  assert.equal(loaded.manifest.latest_event_sequence, 1);
});

test('versão antiga é rejeitada', async () => {
  const repo = new MemoryRepository({ rng: () => 10 });
  const bundle = createCampaignBundle({ userId, input });
  await repo.createCampaign(bundle);
  await repo.applyMockTurn({
    userId,
    campaignId: bundle.campaignId,
    idempotencyKey: 'turn-1',
    expectedStateVersion: 1,
    playerInput: { text: 'Examino.', mock_action_code: 'inspecionar_rota' }
  });
  const stale = await repo.applyMockTurn({
    userId,
    campaignId: bundle.campaignId,
    idempotencyKey: 'turn-2',
    expectedStateVersion: 1,
    playerInput: { text: 'De novo.', mock_action_code: 'inspecionar_rota' }
  });
  assert.equal(stale.status, 409);
  assert.equal(stale.body.latest_state_version, 2);
});
