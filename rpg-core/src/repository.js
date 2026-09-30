import { assertRpg } from './errors.js';

function clone(value) {
  return structuredClone(value);
}

export class InMemoryCampaignRepository {
  #campaigns = new Map();

  create(artifacts) {
    const id = artifacts.manifest.campaign_id;
    assertRpg(!this.#campaigns.has(id), 'CAMPAIGN_EXISTS', 'Campanha já existe.');

    this.#campaigns.set(id, {
      manifest: clone(artifacts.manifest),
      snapshot: clone(artifacts.characterSnapshot),
      state: clone(artifacts.state),
      situation: clone(artifacts.situation),
      events: [clone(artifacts.initialEvent)],
      checkpoints: [clone(artifacts.checkpoint)],
      turnsByIdempotency: new Map()
    });

    return this.load(id);
  }

  load(campaignId) {
    const row = this.#campaigns.get(campaignId);
    assertRpg(row, 'CAMPAIGN_NOT_FOUND', 'Campanha não encontrada.');

    return {
      manifest: clone(row.manifest),
      characterSnapshot: clone(row.snapshot),
      state: clone(row.state),
      situation: clone(row.situation),
      events: clone(row.events),
      checkpoints: clone(row.checkpoints)
    };
  }

  findTurn(campaignId, idempotencyKey) {
    const row = this.#campaigns.get(campaignId);
    assertRpg(row, 'CAMPAIGN_NOT_FOUND', 'Campanha não encontrada.');
    const turn = row.turnsByIdempotency.get(idempotencyKey);
    return turn ? clone(turn) : null;
  }

  commitTurn({
    campaignId,
    idempotencyKey,
    expectedStateVersion,
    nextState,
    operation,
    response,
    now = () => new Date().toISOString()
  }) {
    const row = this.#campaigns.get(campaignId);
    assertRpg(row, 'CAMPAIGN_NOT_FOUND', 'Campanha não encontrada.');

    const existing = row.turnsByIdempotency.get(idempotencyKey);
    if (existing) return clone(existing);

    assertRpg(
      row.state.state_version === expectedStateVersion,
      'STATE_VERSION_CONFLICT',
      'A campanha mudou desde que a ação foi enviada.',
      { expected: expectedStateVersion, actual: row.state.state_version }
    );

    const nextVersion = expectedStateVersion + 1;
    nextState.state_version = nextVersion;

    const eventSequence = row.manifest.latest_event_sequence + 1;
    const event = {
      campaign_id: campaignId,
      event_sequence: eventSequence,
      turn_id: response.turn_id,
      operation_id: response.operation_id,
      tool_name: operation.tool_name,
      state_version_before: expectedStateVersion,
      state_version_after: nextVersion,
      arguments_json: clone(operation.arguments_json),
      result_json: clone(operation.result_json),
      world_time_ref: nextState.world_time?.epoch_minutes ?? null,
      created_at: now()
    };

    row.state = clone(nextState);
    row.events.push(event);
    row.manifest.latest_state_version = nextVersion;
    row.manifest.latest_event_sequence = eventSequence;
    row.manifest.last_saved_at = event.created_at;

    const stored = {
      ...clone(response),
      state_version: nextVersion,
      event_sequence: eventSequence
    };
    row.turnsByIdempotency.set(idempotencyKey, stored);
    return clone(stored);
  }
}
