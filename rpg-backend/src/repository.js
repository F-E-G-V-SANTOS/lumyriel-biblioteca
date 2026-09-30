import { randomUUID } from 'node:crypto';
import { resolveMockTurn } from './engine.js';

function visibleCampaign(row) {
  return {
    campaign_id: row.campaign_id,
    character_id: row.character_id,
    character_name: row.character_snapshot?.name || 'Personagem sem nome',
    difficulty_mode: row.difficulty_mode,
    duration_mode: row.duration_mode,
    status: row.status,
    latest_state_version: Number(row.latest_state_version),
    last_played_at: row.last_played_at,
    canon_package_id: row.canon_package_id,
    canon_package_version: row.canon_package_version
  };
}

function visibleLoad(campaign, state) {
  return {
    manifest: {
      campaign_id: campaign.campaign_id,
      campaign_schema_version: campaign.campaign_schema_version,
      state_schema_version: campaign.state_schema_version,
      character_id: campaign.character_id,
      character_source_revision: campaign.character_source_revision,
      character_snapshot_id: campaign.character_snapshot_id,
      canon_package_id: campaign.canon_package_id,
      canon_package_version: campaign.canon_package_version,
      canon_policy: campaign.canon_policy,
      situation_id: campaign.situation_id,
      situation_version: campaign.situation_version,
      difficulty_mode: campaign.difficulty_mode,
      duration_mode: campaign.duration_mode,
      created_at: campaign.created_at,
      last_saved_at: campaign.updated_at,
      latest_state_version: Number(campaign.latest_state_version),
      latest_event_sequence: Number(campaign.latest_event_sequence),
      latest_checkpoint_id: campaign.latest_checkpoint_id
    },
    visible_state: state,
    actions_available: ['texto_livre', 'mock:observar', 'mock:inspecionar_rota', 'mock:avancar_com_cuidado', 'mock:convencer_trabalhador', 'mock:forcar_obstaculo']
  };
}

export class MemoryRepository {
  constructor({ rng } = {}) {
    this.rng = rng;
    this.campaigns = new Map();
    this.states = new Map();
    this.turns = new Map();
  }

  async init() {}
  async close() {}

  async createCampaign(bundle) {
    const row = {
      ...bundle.manifest,
      user_id: bundle.userId,
      character_snapshot: structuredClone(bundle.characterSnapshot),
      status: 'active',
      updated_at: bundle.manifest.last_saved_at,
      last_played_at: bundle.manifest.last_saved_at
    };
    this.campaigns.set(bundle.campaignId, row);
    this.states.set(bundle.campaignId, structuredClone(bundle.state));
    return visibleLoad(row, bundle.state);
  }

  async listCampaigns(userId) {
    return [...this.campaigns.values()].filter(x => x.user_id === userId).map(visibleCampaign);
  }

  async getCampaign(userId, campaignId) {
    const row = this.campaigns.get(campaignId);
    if (!row || row.user_id !== userId) return null;
    return visibleLoad(row, structuredClone(this.states.get(campaignId)));
  }

  async applyMockTurn({ userId, campaignId, idempotencyKey, expectedStateVersion, playerInput }) {
    const row = this.campaigns.get(campaignId);
    if (!row || row.user_id !== userId) return { status: 404, body: { error: 'campaign_not_found' } };
    const idemKey = `${campaignId}:${idempotencyKey}`;
    if (this.turns.has(idemKey)) return { status: 200, body: structuredClone(this.turns.get(idemKey)) };
    if (Number(row.latest_state_version) !== Number(expectedStateVersion)) {
      return { status: 409, body: { error: 'state_version_conflict', latest_state_version: Number(row.latest_state_version) } };
    }

    const current = structuredClone(this.states.get(campaignId));
    const resolved = resolveMockTurn({ state: current, playerInput, rng: this.rng });
    if (!resolved.ok) return { status: 400, body: { error: resolved.code, message: resolved.message } };

    const nextVersion = Number(row.latest_state_version) + 1;
    const nextSequence = Number(row.latest_event_sequence) + 1;
    resolved.nextState.state_version = nextVersion;
    row.latest_state_version = nextVersion;
    row.latest_event_sequence = nextSequence;
    row.updated_at = new Date().toISOString();
    row.last_played_at = row.updated_at;
    this.states.set(campaignId, structuredClone(resolved.nextState));

    const body = {
      turn_id: randomUUID(),
      state_version: nextVersion,
      event_sequence: nextSequence,
      ...resolved.response
    };
    this.turns.set(idemKey, structuredClone(body));
    return { status: 200, body };
  }
}

export class PostgresRepository {
  constructor(pool, { rng } = {}) {
    this.pool = pool;
    this.rng = rng;
  }

  static async create(connectionString, { rng } = {}) {
    const pg = await import('pg');
    return new PostgresRepository(new pg.default.Pool({ connectionString }), { rng });
  }

  async init() {
    await this.pool.query('select 1');
  }

  async close() {
    await this.pool.end();
  }

  async createCampaign(bundle) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`
        INSERT INTO rpg_campaigns (
          campaign_id,user_id,character_id,character_source_revision,character_snapshot_id,character_snapshot,
          canon_package_id,canon_package_version,canon_policy,situation_id,situation_version,difficulty_mode,duration_mode,
          campaign_schema_version,state_schema_version,latest_state_version,latest_event_sequence,latest_checkpoint_id,status,
          created_at,updated_at,last_played_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,1,0,$16,'active',$17,$17,$17)
      `, [
        bundle.campaignId,bundle.userId,bundle.manifest.character_id,bundle.manifest.character_source_revision,
        bundle.characterSnapshotId,bundle.characterSnapshot,bundle.manifest.canon_package_id,bundle.manifest.canon_package_version,
        bundle.manifest.canon_policy,bundle.situationId,bundle.manifest.situation_version,bundle.manifest.difficulty_mode,
        bundle.manifest.duration_mode,bundle.manifest.campaign_schema_version,bundle.manifest.state_schema_version,
        bundle.checkpointId,bundle.manifest.created_at
      ]);

      await client.query('INSERT INTO rpg_campaign_states (campaign_id,state_version,state_json) VALUES ($1,1,$2)', [bundle.campaignId,bundle.state]);
      await client.query(`
        INSERT INTO rpg_checkpoints (
          checkpoint_id,campaign_id,state_version,event_sequence,state_json,canon_package_id,canon_package_version,
          character_snapshot_id,reason,confirmed
        ) VALUES ($1,$2,1,0,$3,$4,$5,$6,'initial',true)
      `, [bundle.checkpointId,bundle.campaignId,bundle.state,bundle.manifest.canon_package_id,bundle.manifest.canon_package_version,bundle.characterSnapshotId]);
      await client.query(`
        INSERT INTO rpg_situations (situation_id,campaign_id,situation_version,public_seed_json,private_truth_json,status)
        VALUES ($1,$2,1,$3,$4,'placeholder')
      `, [bundle.situationId,bundle.campaignId,bundle.publicSeed,bundle.privateTruth]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    return this.getCampaign(bundle.userId, bundle.campaignId);
  }

  async listCampaigns(userId) {
    const { rows } = await this.pool.query(`
      SELECT campaign_id,character_id,character_snapshot,difficulty_mode,duration_mode,status,latest_state_version,
             last_played_at,canon_package_id,canon_package_version
      FROM rpg_campaigns WHERE user_id=$1 ORDER BY last_played_at DESC
    `, [userId]);
    return rows.map(visibleCampaign);
  }

  async getCampaign(userId, campaignId) {
    const { rows } = await this.pool.query(`
      SELECT c.*, s.state_json
      FROM rpg_campaigns c
      JOIN rpg_campaign_states s ON s.campaign_id=c.campaign_id AND s.state_version=c.latest_state_version
      WHERE c.campaign_id=$1 AND c.user_id=$2
    `, [campaignId,userId]);
    if (!rows[0]) return null;
    return visibleLoad(rows[0], rows[0].state_json);
  }

  async applyMockTurn({ userId, campaignId, idempotencyKey, expectedStateVersion, playerInput }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const locked = await client.query(`
        SELECT c.*, s.state_json
        FROM rpg_campaigns c
        JOIN rpg_campaign_states s ON s.campaign_id=c.campaign_id AND s.state_version=c.latest_state_version
        WHERE c.campaign_id=$1 AND c.user_id=$2
        FOR UPDATE OF c
      `, [campaignId,userId]);
      const campaign = locked.rows[0];
      if (!campaign) {
        await client.query('ROLLBACK');
        return { status: 404, body: { error: 'campaign_not_found' } };
      }

      const existing = await client.query(`
        SELECT status, final_output_json, error_json
        FROM rpg_turns
        WHERE campaign_id=$1 AND idempotency_key=$2
      `, [campaignId,idempotencyKey]);
      if (existing.rows[0]?.status === 'completed') {
        await client.query('COMMIT');
        return { status: 200, body: existing.rows[0].final_output_json };
      }
      if (existing.rows[0]) {
        await client.query('ROLLBACK');
        return {
          status: 409,
          body: {
            error: 'idempotency_key_not_replayable',
            turn_status: existing.rows[0].status
          }
        };
      }

      if (Number(campaign.latest_state_version) !== Number(expectedStateVersion)) {
        await client.query('ROLLBACK');
        return { status: 409, body: { error: 'state_version_conflict', latest_state_version: Number(campaign.latest_state_version) } };
      }

      const turnId = randomUUID();
      await client.query(`
        INSERT INTO rpg_turns (turn_id,campaign_id,idempotency_key,request_state_version,player_input_json,status)
        VALUES ($1,$2,$3,$4,$5,'processing')
      `, [turnId,campaignId,idempotencyKey,expectedStateVersion,playerInput]);

      const resolved = resolveMockTurn({ state: campaign.state_json, playerInput, rng: this.rng });
      if (!resolved.ok) {
        await client.query('ROLLBACK');
        return { status: 400, body: { error: resolved.code, message: resolved.message } };
      }

      const nextVersion = Number(campaign.latest_state_version) + 1;
      const nextSequence = Number(campaign.latest_event_sequence) + 1;
      resolved.nextState.state_version = nextVersion;
      const eventId = randomUUID();

      await client.query('INSERT INTO rpg_campaign_states (campaign_id,state_version,state_json) VALUES ($1,$2,$3)', [campaignId,nextVersion,resolved.nextState]);
      await client.query(`
        INSERT INTO rpg_campaign_events (
          event_id,campaign_id,sequence,turn_id,operation_id,tool_name,state_version_before,state_version_after,arguments_json,result_json
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      `, [eventId,campaignId,nextSequence,turnId,resolved.event.operation_id,resolved.event.tool_name,expectedStateVersion,nextVersion,resolved.event.arguments,resolved.event.result]);

      await client.query(`
        UPDATE rpg_campaigns
        SET latest_state_version=$3, latest_event_sequence=$4, updated_at=now(), last_played_at=now()
        WHERE campaign_id=$1 AND user_id=$2
      `, [campaignId,userId,nextVersion,nextSequence]);

      const body = {
        turn_id: turnId,
        state_version: nextVersion,
        event_sequence: nextSequence,
        ...resolved.response
      };
      await client.query(`
        UPDATE rpg_turns SET status='completed', final_output_json=$3, completed_at=now()
        WHERE campaign_id=$1 AND idempotency_key=$2
      `, [campaignId,idempotencyKey,body]);

      await client.query('COMMIT');
      return { status: 200, body };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
