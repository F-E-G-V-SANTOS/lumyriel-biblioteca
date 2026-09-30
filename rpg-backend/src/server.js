import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { pool, withTransaction } from './db.js';
import {
  ValidationError,
  validateCampaignInit,
  validateCharacterImport,
  validateTurnRequest,
} from './validators.js';
import { buildInitialState, resolveMockTurn } from './engine.js';

const PORT = Number(process.env.PORT || 8787);
const ALLOWED_ORIGIN = process.env.RPG_ALLOWED_ORIGIN || '';

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function userIdForRequest() {
  if (process.env.RPG_ALLOW_DEV_AUTH === 'true') {
    return process.env.RPG_DEV_USER_ID || 'local-dev';
  }
  throw new HttpError(501, 'AUTH_NOT_CONFIGURED', 'Production authentication is not configured yet');
}

function setCors(req, res) {
  if (!ALLOWED_ORIGIN) return;
  const origin = req.headers.origin;
  if (origin === ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  }
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) throw new HttpError(413, 'PAYLOAD_TOO_LARGE', 'Request body exceeds 1 MB');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'INVALID_JSON', 'Request body is not valid JSON');
  }
}

function visibleCampaignState(state) {
  return state;
}

function durationModeToName(durationMode) {
  return durationMode === 'continua' ? 'Campanha contínua' : `${durationMode} min`;
}

function createMockSituation(campaignId, body) {
  return {
    situation_id: `sit_${randomUUID()}`,
    origin: 'SESSION',
    region_id: body.region_selection === 'selected' ? body.region_id : 'valdren',
    start_location_id: 'session:valdren:mvp-start',
    situation_type: body.adventure_preference === 'auto' ? 'mista' : body.adventure_preference,
    premise_visible: 'Situação provisória de infraestrutura usada somente para validar o motor sem Narrador GPT.',
    normal_state: 'Rotina regional de Valdren.',
    change: 'Um problema local simples exige observação, decisão e registro de estado.',
    forces: [],
    clocks: [],
    information_nodes: [],
    hidden_truth_ids: [],
    allowed_canonical_entity_ids: [],
    generated_session_entity_ids: [],
    end_conditions: ['Infraestrutura validada.'],
    failure_endings: ['A sessão de teste pode ser encerrada sem consequência canônica.'],
    duration_blueprint: {
      target_minutes: body.duration_mode === 'continua' ? null : Number(body.duration_mode),
      opening_weight: 1,
      development_weight: 1,
      convergence_weight: 1,
      climax_weight: 1,
      epilogue_weight: 1,
    },
    no_single_solution: true,
    campaign_id: campaignId,
  };
}

async function importCharacter(req, res) {
  const userId = userIdForRequest(req);
  const body = validateCharacterImport(await readJson(req));
  const characterId = `char_${randomUUID()}`;
  const revision = 1;
  const creatorVersion = body.creator_payload?._meta?.creator_version || 'unknown';

  const row = await pool.query(
    `INSERT INTO rpg_characters
      (character_id, user_id, revision, creator_version, character_json, mechanics_json)
     VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb)
     RETURNING character_id, revision, creator_version, created_at`,
    [characterId, userId, revision, creatorVersion, JSON.stringify(body.creator_payload), JSON.stringify(body.mechanics)],
  );

  sendJson(res, 201, row.rows[0]);
}

async function createCampaign(req, res) {
  const userId = userIdForRequest(req);
  const body = validateCampaignInit(await readJson(req));

  const result = await withTransaction(async (client) => {
    const characterResult = await client.query(
      `SELECT character_id, revision, character_json, mechanics_json
         FROM rpg_characters
        WHERE character_id = $1 AND user_id = $2`,
      [body.character_id, userId],
    );
    if (!characterResult.rowCount) throw new HttpError(404, 'CHARACTER_NOT_FOUND', 'Character not found');
    const character = characterResult.rows[0];
    if (character.revision !== body.character_revision) {
      throw new HttpError(409, 'CHARACTER_REVISION_CONFLICT', 'Character revision is no longer current');
    }

    const campaignId = `camp_${randomUUID()}`;
    const snapshotId = `snap_${randomUUID()}`;
    const checkpointId = `chk_${randomUUID()}`;
    const situation = createMockSituation(campaignId, body);
    const state = buildInitialState({
      campaignId,
      characterId: body.character_id,
      mechanics: character.mechanics_json,
      difficultyMode: body.difficulty_mode,
      durationMode: body.duration_mode,
    });
    const campaignName = body.campaign_name || character.character_json?.name || 'Campanha de Lumyriel';

    await client.query(
      `INSERT INTO rpg_campaigns
        (campaign_id, user_id, campaign_name, character_id, character_source_revision,
         character_snapshot_id, canon_package_id, canon_package_version, canon_policy,
         situation_id, situation_version, difficulty_mode, duration_mode,
         campaign_schema_version, state_schema_version, latest_state_version,
         latest_event_sequence, latest_checkpoint_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,1,$11,$12,$13,$14,1,0,$15,'active')`,
      [
        campaignId, userId, campaignName, body.character_id, body.character_revision,
        snapshotId, 'rpg:valdren:package', '0.1', 'pinned',
        situation.situation_id, body.difficulty_mode, body.duration_mode,
        'rpg-campaign-0.1', state.schema_version, checkpointId,
      ],
    );

    await client.query(
      `INSERT INTO rpg_character_snapshots
        (snapshot_id, campaign_id, character_id, source_revision, snapshot_json, mechanics_json)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb)`,
      [snapshotId, campaignId, body.character_id, body.character_revision, JSON.stringify(character.character_json), JSON.stringify(character.mechanics_json)],
    );

    await client.query(
      `INSERT INTO rpg_situations
        (situation_id, campaign_id, version, public_seed_json, private_truth_json, status)
       VALUES ($1,$2,1,$3::jsonb,'{}'::jsonb,'active')`,
      [situation.situation_id, campaignId, JSON.stringify(situation)],
    );

    await client.query(
      `INSERT INTO rpg_campaign_states (campaign_id, state_version, state_json)
       VALUES ($1,1,$2::jsonb)`,
      [campaignId, JSON.stringify(state)],
    );

    await client.query(
      `INSERT INTO rpg_campaign_checkpoints
        (checkpoint_id, campaign_id, state_version, event_sequence, state_json,
         scene_summary, campaign_summary, canon_package_id, canon_package_version,
         character_snapshot_id, reason)
       VALUES ($1,$2,1,0,$3::jsonb,$4,$5,$6,$7,$8,'campaign_created')`,
      [
        checkpointId, campaignId, JSON.stringify(state), state.scene_summary, state.campaign_summary,
        'rpg:valdren:package', '0.1', snapshotId,
      ],
    );

    return {
      campaign_id: campaignId,
      state_version: 1,
      campaign_name: campaignName,
      difficulty: body.difficulty_mode,
      duration: durationModeToName(body.duration_mode),
      opening_output: {
        mode: 'mock_no_gpt',
        narrative: situation.premise_visible,
        suggested_actions: [
          { id: 'mock:observe', label: 'Observar o entorno' },
          { id: 'mock:force-passage', label: 'Testar uma ação física' },
          { id: 'mock:wait', label: 'Esperar dez minutos' },
        ],
        free_action_allowed: true,
      },
      visible_state: visibleCampaignState(state),
      save_status: 'checkpoint_created',
    };
  });

  sendJson(res, 201, result);
}

async function listCampaigns(req, res) {
  const userId = userIdForRequest(req);
  const result = await pool.query(
    `SELECT campaign_id, campaign_name, character_id, difficulty_mode, duration_mode,
            status, latest_state_version, updated_at
       FROM rpg_campaigns
      WHERE user_id = $1
      ORDER BY updated_at DESC`,
    [userId],
  );
  sendJson(res, 200, { campaigns: result.rows });
}

async function loadCampaign(req, res, campaignId) {
  const userId = userIdForRequest(req);
  const result = await pool.query(
    `SELECT c.campaign_id, c.campaign_name, c.character_id, c.difficulty_mode,
            c.duration_mode, c.status, c.latest_state_version,
            s.state_json
       FROM rpg_campaigns c
       JOIN rpg_campaign_states s ON s.campaign_id = c.campaign_id
      WHERE c.campaign_id = $1 AND c.user_id = $2`,
    [campaignId, userId],
  );
  if (!result.rowCount) throw new HttpError(404, 'CAMPAIGN_NOT_FOUND', 'Campaign not found');
  const row = result.rows[0];
  sendJson(res, 200, {
    campaign_id: row.campaign_id,
    campaign_name: row.campaign_name,
    character_id: row.character_id,
    difficulty: row.difficulty_mode,
    duration: row.duration_mode,
    status: row.status,
    state_version: row.latest_state_version,
    visible_state: visibleCampaignState(row.state_json),
    narrator_output: {
      mode: 'mock_no_gpt',
      narrative: row.state_json.scene_summary,
      suggested_actions: [
        { id: 'mock:observe', label: 'Observar o entorno' },
        { id: 'mock:force-passage', label: 'Testar uma ação física' },
        { id: 'mock:wait', label: 'Esperar dez minutos' },
      ],
      free_action_allowed: true,
    },
  });
}

async function takeTurn(req, res, campaignId) {
  const userId = userIdForRequest(req);
  const body = validateTurnRequest(await readJson(req));

  const output = await withTransaction(async (client) => {
    const campaignResult = await client.query(
      `SELECT * FROM rpg_campaigns
        WHERE campaign_id = $1 AND user_id = $2
        FOR UPDATE`,
      [campaignId, userId],
    );
    if (!campaignResult.rowCount) throw new HttpError(404, 'CAMPAIGN_NOT_FOUND', 'Campaign not found');
    const campaign = campaignResult.rows[0];
    if (campaign.status !== 'active') throw new HttpError(409, 'CAMPAIGN_NOT_ACTIVE', 'Campaign is not active');

    const existing = await client.query(
      `SELECT status, final_output_json
         FROM rpg_turns
        WHERE campaign_id = $1 AND idempotency_key = $2`,
      [campaignId, body.idempotency_key],
    );
    if (existing.rowCount) {
      if (existing.rows[0].status === 'completed') return existing.rows[0].final_output_json;
      throw new HttpError(409, 'TURN_ALREADY_PROCESSING', 'This idempotency key is already being processed');
    }

    const turnId = `turn_${randomUUID()}`;
    await client.query(
      `INSERT INTO rpg_turns
        (turn_id, campaign_id, idempotency_key, initial_state_version, current_state_version,
         player_input_json, status, tool_step)
       VALUES ($1,$2,$3,$4,$4,$5::jsonb,'processing',0)`,
      [turnId, campaignId, body.idempotency_key, body.expected_state_version, JSON.stringify(body.player_input)],
    );

    const stateResult = await client.query(
      `SELECT state_version, state_json FROM rpg_campaign_states
        WHERE campaign_id = $1
        FOR UPDATE`,
      [campaignId],
    );
    const current = stateResult.rows[0];
    if (current.state_version !== body.expected_state_version) {
      throw new HttpError(409, 'STATE_VERSION_CONFLICT', `Expected state ${body.expected_state_version}, current is ${current.state_version}`);
    }

    const mechanicsResult = await client.query(
      `SELECT mechanics_json FROM rpg_character_snapshots
        WHERE snapshot_id = $1`,
      [campaign.character_snapshot_id],
    );
    const mechanics = mechanicsResult.rows[0].mechanics_json;
    const resolved = resolveMockTurn({
      state: current.state_json,
      mechanics,
      playerInput: body.player_input,
    });

    const nextVersion = current.state_version + 1;
    resolved.nextState.state_version = nextVersion;

    const update = await client.query(
      `UPDATE rpg_campaign_states
          SET state_version = $3, state_json = $4::jsonb, updated_at = now()
        WHERE campaign_id = $1 AND state_version = $2`,
      [campaignId, current.state_version, nextVersion, JSON.stringify(resolved.nextState)],
    );
    if (update.rowCount !== 1) throw new HttpError(409, 'STATE_VERSION_CONFLICT', 'Campaign state changed concurrently');

    const eventSequence = campaign.latest_event_sequence + 1;
    await client.query(
      `INSERT INTO rpg_campaign_events
        (campaign_id, event_sequence, turn_id, operation_id, tool_name,
         state_version_before, state_version_after, arguments_json, result_json, world_time_ref)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10)`,
      [
        campaignId, eventSequence, turnId, resolved.operationId, 'mock_turn',
        current.state_version, nextVersion, JSON.stringify(body.player_input),
        JSON.stringify({ narrator_output: resolved.narratorOutput, mechanical_events_visible: resolved.mechanicalEventsVisible }),
        resolved.nextState.world_time?.epoch_minutes ?? null,
      ],
    );

    await client.query(
      `UPDATE rpg_campaigns
          SET latest_state_version = $2,
              latest_event_sequence = $3,
              updated_at = now()
        WHERE campaign_id = $1`,
      [campaignId, nextVersion, eventSequence],
    );

    const finalOutput = {
      turn_id: turnId,
      state_version: nextVersion,
      narrator_output: resolved.narratorOutput,
      mechanical_events_visible: resolved.mechanicalEventsVisible,
      visible_state_patch: {
        state_version: nextVersion,
        world_time: resolved.nextState.world_time,
        character: resolved.nextState.character,
        scene_summary: resolved.nextState.scene_summary,
        campaign_summary: resolved.nextState.campaign_summary,
      },
      checkpoint_created: false,
      save_status: 'state_persisted',
    };

    await client.query(
      `UPDATE rpg_turns
          SET current_state_version = $2,
              status = 'completed',
              final_output_json = $3::jsonb,
              completed_at = now()
        WHERE turn_id = $1`,
      [turnId, nextVersion, JSON.stringify(finalOutput)],
    );

    return finalOutput;
  });

  sendJson(res, 200, output);
}

async function createCheckpoint(req, res, campaignId) {
  const userId = userIdForRequest(req);
  const result = await withTransaction(async (client) => {
    const campaignResult = await client.query(
      `SELECT * FROM rpg_campaigns
        WHERE campaign_id = $1 AND user_id = $2
        FOR UPDATE`,
      [campaignId, userId],
    );
    if (!campaignResult.rowCount) throw new HttpError(404, 'CAMPAIGN_NOT_FOUND', 'Campaign not found');
    const campaign = campaignResult.rows[0];
    const stateResult = await client.query(
      `SELECT state_version, state_json FROM rpg_campaign_states WHERE campaign_id = $1`,
      [campaignId],
    );
    const state = stateResult.rows[0];
    const checkpointId = `chk_${randomUUID()}`;

    await client.query(
      `INSERT INTO rpg_campaign_checkpoints
        (checkpoint_id, campaign_id, state_version, event_sequence, state_json,
         scene_summary, campaign_summary, canon_package_id, canon_package_version,
         character_snapshot_id, reason)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,'manual')`,
      [
        checkpointId, campaignId, state.state_version, campaign.latest_event_sequence,
        JSON.stringify(state.state_json), state.state_json.scene_summary, state.state_json.campaign_summary,
        campaign.canon_package_id, campaign.canon_package_version, campaign.character_snapshot_id,
      ],
    );

    await client.query(
      `UPDATE rpg_campaigns SET latest_checkpoint_id = $2, updated_at = now() WHERE campaign_id = $1`,
      [campaignId, checkpointId],
    );

    return { checkpoint_id: checkpointId, state_version: state.state_version, save_status: 'checkpoint_created' };
  });
  sendJson(res, 201, result);
}

async function router(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname;

  if (req.method === 'GET' && path === '/health') {
    sendJson(res, 200, { ok: true, service: 'Lumyriel RPG Backend MVP', phase: '1-3-no-gpt' });
    return;
  }
  if (req.method === 'POST' && path === '/api/rpg/characters/import') return importCharacter(req, res);
  if (req.method === 'POST' && path === '/api/rpg/campaigns') return createCampaign(req, res);
  if (req.method === 'GET' && path === '/api/rpg/campaigns') return listCampaigns(req, res);

  const campaignMatch = path.match(/^\/api\/rpg\/campaigns\/([^/]+)$/);
  if (req.method === 'GET' && campaignMatch) return loadCampaign(req, res, campaignMatch[1]);

  const turnMatch = path.match(/^\/api\/rpg\/campaigns\/([^/]+)\/turns$/);
  if (req.method === 'POST' && turnMatch) return takeTurn(req, res, turnMatch[1]);

  const checkpointMatch = path.match(/^\/api\/rpg\/campaigns\/([^/]+)\/checkpoints$/);
  if (req.method === 'POST' && checkpointMatch) return createCheckpoint(req, res, checkpointMatch[1]);

  throw new HttpError(404, 'NOT_FOUND', 'Route not found');
}

const server = http.createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (error) {
    const status = error.status || (error instanceof ValidationError ? 400 : 500);
    const code = error.code || 'INTERNAL_ERROR';
    if (status >= 500) console.error(error);
    sendJson(res, status, { ok: false, error: code, message: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Lumyriel RPG Backend MVP listening on :${PORT}`);
});
