import { randomUUID } from 'node:crypto';
import { pool, withTransaction } from './db.js';
import { resolveMockTurn } from './engine.js';
import { buildNarratorTurnContext, queryStateSlice } from './context.js';
import { runNarratorTurn } from './narrator.js';
import { isRegisteredUncertainAction } from './action-gateway.js';

function domainError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

export function isNarratorPilotAction(playerInput) {
  return playerInput?.source === 'suggested_action'
    && isRegisteredUncertainAction(playerInput);
}

async function loadMechanics(client, snapshotId) {
  const result = await client.query(
    `SELECT mechanics_json
       FROM rpg_character_snapshots
      WHERE snapshot_id = $1`,
    [snapshotId],
  );
  if (!result.rowCount) {
    throw domainError(500, 'CHARACTER_SNAPSHOT_MISSING', 'Character mechanics snapshot is missing');
  }
  return result.rows[0].mechanics_json;
}

async function prepareTurn({ userId, campaignId, body }) {
  return withTransaction(async (client) => {
    const campaignResult = await client.query(
      `SELECT *
         FROM rpg_campaigns
        WHERE campaign_id = $1 AND user_id = $2
        FOR UPDATE`,
      [campaignId, userId],
    );
    if (!campaignResult.rowCount) {
      throw domainError(404, 'CAMPAIGN_NOT_FOUND', 'Campaign not found');
    }
    const campaign = campaignResult.rows[0];
    if (campaign.status !== 'active') {
      throw domainError(409, 'CAMPAIGN_NOT_ACTIVE', 'Campaign is not active');
    }

    const existingResult = await client.query(
      `SELECT *
         FROM rpg_turns
        WHERE campaign_id = $1 AND idempotency_key = $2
        FOR UPDATE`,
      [campaignId, body.idempotency_key],
    );

    if (existingResult.rowCount) {
      const existing = existingResult.rows[0];
      if (existing.status === 'completed') {
        return { mode: 'completed', finalOutput: existing.final_output_json };
      }
      if (existing.status !== 'recoverable_error') {
        throw domainError(409, 'TURN_ALREADY_PROCESSING', 'This idempotency key is already being processed');
      }

      const stateResult = await client.query(
        `SELECT state_version, state_json
           FROM rpg_campaign_states
          WHERE campaign_id = $1
          FOR UPDATE`,
        [campaignId],
      );
      if (!stateResult.rowCount) {
        throw domainError(500, 'CAMPAIGN_STATE_MISSING', 'Campaign state is missing');
      }

      const latestCompletedStep = await client.query(
        `SELECT step_index, response_id, tool_call_id, tool_name, result_json
           FROM rpg_turn_steps
          WHERE turn_id = $1 AND status = 'completed'
          ORDER BY step_index DESC
          LIMIT 1`,
        [existing.turn_id],
      );

      if (!latestCompletedStep.rowCount) {
        await client.query(
          `DELETE FROM rpg_turn_steps
            WHERE turn_id = $1 AND status = 'requested'`,
          [existing.turn_id],
        );
      }

      await client.query(
        `UPDATE rpg_turns
            SET status = 'waiting_model',
                error_json = NULL
          WHERE turn_id = $1`,
        [existing.turn_id],
      );

      return {
        mode: 'recover',
        turnId: existing.turn_id,
        campaign,
        state: stateResult.rows[0].state_json,
        stateVersion: stateResult.rows[0].state_version,
        mechanics: await loadMechanics(client, campaign.character_snapshot_id),
        resumeStep: latestCompletedStep.rows[0] ?? null,
      };
    }

    const activeResult = await client.query(
      `SELECT turn_id
         FROM rpg_turns
        WHERE campaign_id = $1
          AND status IN ('processing','waiting_model','waiting_tool')
        LIMIT 1`,
      [campaignId],
    );
    if (activeResult.rowCount) {
      throw domainError(409, 'CAMPAIGN_TURN_IN_PROGRESS', 'Another turn is already active for this campaign');
    }

    const stateResult = await client.query(
      `SELECT state_version, state_json
         FROM rpg_campaign_states
        WHERE campaign_id = $1
        FOR UPDATE`,
      [campaignId],
    );
    if (!stateResult.rowCount) {
      throw domainError(500, 'CAMPAIGN_STATE_MISSING', 'Campaign state is missing');
    }
    const current = stateResult.rows[0];
    if (current.state_version !== body.expected_state_version) {
      throw domainError(
        409,
        'STATE_VERSION_CONFLICT',
        `Expected state ${body.expected_state_version}, current is ${current.state_version}`,
      );
    }

    const turnId = `turn_${randomUUID()}`;
    await client.query(
      `INSERT INTO rpg_turns
        (turn_id, campaign_id, idempotency_key, initial_state_version, current_state_version,
         player_input_json, status, tool_step)
       VALUES ($1,$2,$3,$4,$4,$5::jsonb,'waiting_model',0)`,
      [
        turnId,
        campaignId,
        body.idempotency_key,
        current.state_version,
        JSON.stringify(body.player_input),
      ],
    );

    return {
      mode: 'new',
      turnId,
      campaign,
      state: current.state_json,
      stateVersion: current.state_version,
      mechanics: await loadMechanics(client, campaign.character_snapshot_id),
      resumeStep: null,
    };
  });
}

async function recordResponse(turnId, payload) {
  await pool.query(
    `UPDATE rpg_turns
        SET model_response_id = $2,
            status = CASE
              WHEN status = 'waiting_tool' THEN status
              ELSE 'waiting_model'
            END
      WHERE turn_id = $1
        AND status <> 'completed'`,
    [turnId, payload.response_id],
  );
}

async function recordToolCall(turnId, payload) {
  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO rpg_turn_steps
        (turn_id, step_index, response_id, tool_call_id, tool_name, arguments_json, status)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,'requested')
       ON CONFLICT (turn_id, step_index) DO NOTHING`,
      [
        turnId,
        payload.step_index,
        payload.response_id,
        payload.call_id,
        payload.tool_name,
        JSON.stringify(payload.arguments),
      ],
    );

    await client.query(
      `UPDATE rpg_turns
          SET status = 'waiting_tool',
              model_response_id = $2,
              tool_step = GREATEST(tool_step, $3)
        WHERE turn_id = $1
          AND status <> 'completed'`,
      [turnId, payload.response_id, payload.step_index],
    );
  });
}

async function completeReadStep(turnId, meta, toolName, args, result) {
  await pool.query(
    `UPDATE rpg_turn_steps
        SET result_json = $4::jsonb,
            status = 'completed',
            completed_at = now()
      WHERE turn_id = $1
        AND step_index = $2
        AND tool_call_id = $3
        AND tool_name = $5`,
    [turnId, meta.step_index, meta.call_id, JSON.stringify(result), toolName],
  );
  return result;
}

function mechanicalToolResult(event, args, stateVersion) {
  return {
    classification: 'INCERTO',
    state_version: stateVersion,
    operation_id: event.operation_id,
    intent: args.intencao,
    requested_suggestions: {
      attribute: args.atributo_sugerido,
      competency: args.competencia_sugerida,
      specialty: args.especialidade_sugerida,
    },
    resolved_test: {
      die_raw: event.die_raw,
      attribute: event.attribute,
      competency: event.competency,
      modifier_total: event.modifier_total,
      difficulty: event.difficulty,
      total: event.total,
      margin: event.margin,
      degree: event.degree,
    },
    costs_applied: [],
    consequences: [],
    events_requiring_resolution: [],
    authority_note: 'A dificuldade e os valores usados foram determinados pelo motor, não pelo Narrador.',
  };
}

async function resolvePilotTest({ runtime, userId, campaignId, body, args, meta }) {
  const result = await withTransaction(async (client) => {
    const stepResult = await client.query(
      `SELECT status, result_json
         FROM rpg_turn_steps
        WHERE turn_id = $1 AND step_index = $2
        FOR UPDATE`,
      [runtime.turnId, meta.step_index],
    );
    if (!stepResult.rowCount) {
      throw domainError(500, 'TURN_STEP_MISSING', 'Narrator tool step was not registered');
    }
    if (stepResult.rows[0].status === 'completed') {
      const stateResult = await client.query(
        `SELECT state_version, state_json
           FROM rpg_campaign_states
          WHERE campaign_id = $1`,
        [campaignId],
      );
      return {
        toolResult: stepResult.rows[0].result_json,
        nextState: stateResult.rows[0].state_json,
      };
    }

    const previousMutation = await client.query(
      `SELECT result_json
         FROM rpg_turn_steps
        WHERE turn_id = $1
          AND tool_name = 'realizar_teste'
          AND status = 'completed'
          AND step_index <> $2
        ORDER BY step_index DESC
        LIMIT 1`,
      [runtime.turnId, meta.step_index],
    );
    if (previousMutation.rowCount) {
      const noReroll = {
        classification: 'IMPOSSIVEL',
        reason: 'Um teste autoritativo já foi resolvido neste turno. O mesmo turno não recebe nova rolagem sem mudança material de ação.',
        prior_operation_id: previousMutation.rows[0].result_json?.operation_id ?? null,
      };
      await client.query(
        `UPDATE rpg_turn_steps
            SET result_json = $3::jsonb,
                status = 'completed',
                completed_at = now()
          WHERE turn_id = $1 AND step_index = $2`,
        [runtime.turnId, meta.step_index, JSON.stringify(noReroll)],
      );
      return { toolResult: noReroll, nextState: runtime.state };
    }

    const campaignResult = await client.query(
      `SELECT *
         FROM rpg_campaigns
        WHERE campaign_id = $1 AND user_id = $2
        FOR UPDATE`,
      [campaignId, userId],
    );
    if (!campaignResult.rowCount) {
      throw domainError(404, 'CAMPAIGN_NOT_FOUND', 'Campaign not found');
    }
    const campaign = campaignResult.rows[0];

    const stateResult = await client.query(
      `SELECT state_version, state_json
         FROM rpg_campaign_states
        WHERE campaign_id = $1
        FOR UPDATE`,
      [campaignId],
    );
    const current = stateResult.rows[0];

    const turnResult = await client.query(
      `SELECT current_state_version
         FROM rpg_turns
        WHERE turn_id = $1
        FOR UPDATE`,
      [runtime.turnId],
    );
    if (current.state_version !== turnResult.rows[0].current_state_version) {
      throw domainError(409, 'STATE_VERSION_CONFLICT', 'Campaign state changed while the Narrator was resolving a tool');
    }

    if (!isNarratorPilotAction(body.player_input)) {
      const needsContext = {
        classification: 'PRECISA_CONTEXTO',
        reason: 'O gateway mecânico do alpha ainda não possui dificuldade autoritativa para esta ação.',
      };
      await client.query(
        `UPDATE rpg_turn_steps
            SET result_json = $3::jsonb,
                status = 'completed',
                completed_at = now()
          WHERE turn_id = $1 AND step_index = $2`,
        [runtime.turnId, meta.step_index, JSON.stringify(needsContext)],
      );
      return { toolResult: needsContext, nextState: current.state_json };
    }

    const resolved = resolveMockTurn({
      state: current.state_json,
      mechanics: runtime.mechanics,
      playerInput: body.player_input,
    });
    const event = resolved.mechanicalEventsVisible[0];
    if (!event) {
      throw domainError(500, 'PILOT_TEST_MISSING', 'The pilot action did not produce an authoritative test');
    }

    const nextVersion = current.state_version + 1;
    resolved.nextState.state_version = nextVersion;
    const eventSequence = campaign.latest_event_sequence + 1;
    const toolResult = mechanicalToolResult(event, args, nextVersion);

    const update = await client.query(
      `UPDATE rpg_campaign_states
          SET state_version = $3,
              state_json = $4::jsonb,
              updated_at = now()
        WHERE campaign_id = $1 AND state_version = $2`,
      [campaignId, current.state_version, nextVersion, JSON.stringify(resolved.nextState)],
    );
    if (update.rowCount !== 1) {
      throw domainError(409, 'STATE_VERSION_CONFLICT', 'Campaign state changed concurrently');
    }

    await client.query(
      `INSERT INTO rpg_campaign_events
        (campaign_id, event_sequence, turn_id, operation_id, tool_name,
         state_version_before, state_version_after, arguments_json, result_json, world_time_ref)
       VALUES ($1,$2,$3,$4,'realizar_teste',$5,$6,$7::jsonb,$8::jsonb,$9)`,
      [
        campaignId,
        eventSequence,
        runtime.turnId,
        event.operation_id,
        current.state_version,
        nextVersion,
        JSON.stringify(args),
        JSON.stringify(toolResult),
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

    await client.query(
      `UPDATE rpg_turns
          SET current_state_version = $2,
              status = 'waiting_model',
              tool_step = GREATEST(tool_step, $3)
        WHERE turn_id = $1`,
      [runtime.turnId, nextVersion, meta.step_index + 1],
    );

    await client.query(
      `UPDATE rpg_turn_steps
          SET result_json = $3::jsonb,
              status = 'completed',
              completed_at = now()
        WHERE turn_id = $1 AND step_index = $2`,
      [runtime.turnId, meta.step_index, JSON.stringify(toolResult)],
    );

    return { toolResult, nextState: resolved.nextState };
  });

  runtime.state = result.nextState;
  return result.toolResult;
}

async function executeNarratorTool({ runtime, userId, campaignId, body, name, args, meta }) {
  if (name === 'consultar_estado') {
    const result = queryStateSlice(runtime.state, args);
    return completeReadStep(runtime.turnId, meta, name, args, result);
  }
  if (name === 'realizar_teste') {
    return resolvePilotTest({ runtime, userId, campaignId, body, args, meta });
  }
  throw domainError(400, 'NARRATOR_TOOL_NOT_IMPLEMENTED', `Narrator tool not implemented in pilot: ${name}`);
}

function mapNarratorOutput(output) {
  return {
    mode: 'gpt_pilot',
    narrative: output.narrativa,
    suggested_actions: (output.acoes_sugeridas ?? []).map((action) => ({
      id: action.id,
      label: action.rotulo,
      intention: action.intencao,
      category: action.categoria,
      target_id: action.alvo_id,
      perceived_risk: action.risco_percebido,
      test_unknown: action.requer_teste_desconhecido,
    })),
    free_action_allowed: output.acao_livre,
    scene_phase: output.fase_da_cena,
    visible_risk: output.risco_visivel,
    risk_confidence: output.confianca_do_risco,
    interface_warnings: output.avisos_de_interface,
    visible_entities: output.entidades_visiveis,
  };
}

async function finalizeTurn({ runtime, campaignId, body, narratorResult }) {
  return withTransaction(async (client) => {
    const campaignResult = await client.query(
      `SELECT *
         FROM rpg_campaigns
        WHERE campaign_id = $1
        FOR UPDATE`,
      [campaignId],
    );
    const campaign = campaignResult.rows[0];

    const turnResult = await client.query(
      `SELECT status, final_output_json
         FROM rpg_turns
        WHERE turn_id = $1
        FOR UPDATE`,
      [runtime.turnId],
    );
    if (turnResult.rows[0].status === 'completed') {
      return turnResult.rows[0].final_output_json;
    }

    const stateResult = await client.query(
      `SELECT state_version, state_json
         FROM rpg_campaign_states
        WHERE campaign_id = $1
        FOR UPDATE`,
      [campaignId],
    );
    const current = stateResult.rows[0];
    const nextState = structuredClone(current.state_json);
    nextState.scene_summary = narratorResult.output.narrativa;
    nextState.campaign_summary = `${nextState.campaign_summary} ${narratorResult.output.narrativa}`
      .trim()
      .slice(-8000);

    const nextVersion = current.state_version + 1;
    nextState.state_version = nextVersion;
    const eventSequence = campaign.latest_event_sequence + 1;
    const operationId = `op_${randomUUID()}`;
    const narratorOutput = mapNarratorOutput(narratorResult.output);

    const mechanicalResult = await client.query(
      `SELECT result_json
         FROM rpg_turn_steps
        WHERE turn_id = $1
          AND tool_name = 'realizar_teste'
          AND status = 'completed'
        ORDER BY step_index`,
      [runtime.turnId],
    );
    const mechanicalEventsVisible = mechanicalResult.rows
      .map((row) => row.result_json?.resolved_test)
      .filter(Boolean)
      .map((test) => ({
        kind: 'test',
        die_raw: test.die_raw,
        attribute: test.attribute,
        competency: test.competency,
        modifier_total: test.modifier_total,
        difficulty: test.difficulty,
        total: test.total,
        margin: test.margin,
        degree: test.degree,
      }));

    await client.query(
      `UPDATE rpg_campaign_states
          SET state_version = $3,
              state_json = $4::jsonb,
              updated_at = now()
        WHERE campaign_id = $1 AND state_version = $2`,
      [campaignId, current.state_version, nextVersion, JSON.stringify(nextState)],
    );

    await client.query(
      `INSERT INTO rpg_campaign_events
        (campaign_id, event_sequence, turn_id, operation_id, tool_name,
         state_version_before, state_version_after, arguments_json, result_json, world_time_ref)
       VALUES ($1,$2,$3,$4,'narrator_finalize',$5,$6,$7::jsonb,$8::jsonb,$9)`,
      [
        campaignId,
        eventSequence,
        runtime.turnId,
        operationId,
        current.state_version,
        nextVersion,
        JSON.stringify(body.player_input),
        JSON.stringify(narratorOutput),
        nextState.world_time?.epoch_minutes ?? null,
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
      turn_id: runtime.turnId,
      state_version: nextVersion,
      narrator_output: narratorOutput,
      mechanical_events_visible: mechanicalEventsVisible,
      visible_state_patch: {
        state_version: nextVersion,
        world_time: nextState.world_time,
        character: nextState.character,
        injuries: nextState.injuries,
        conditions: nextState.conditions,
        scene_summary: nextState.scene_summary,
        campaign_summary: nextState.campaign_summary,
      },
      checkpoint_created: false,
      save_status: 'state_persisted',
    };

    await client.query(
      `UPDATE rpg_turns
          SET current_state_version = $2,
              status = 'completed',
              model_response_id = $3,
              final_output_json = $4::jsonb,
              error_json = NULL,
              completed_at = now()
        WHERE turn_id = $1`,
      [
        runtime.turnId,
        nextVersion,
        narratorResult.response_id,
        JSON.stringify(finalOutput),
      ],
    );

    runtime.state = nextState;
    return finalOutput;
  });
}

async function markRecoverable(turnId, error) {
  const payload = {
    code: error.code || 'NARRATOR_TURN_ERROR',
    message: error.message,
  };
  await pool.query(
    `UPDATE rpg_turns
        SET status = 'recoverable_error',
            error_json = $2::jsonb
      WHERE turn_id = $1
        AND status <> 'completed'`,
    [turnId, JSON.stringify(payload)],
  );
}

export async function runNarratedPilotTurn({ userId, campaignId, body, fetchImpl = fetch }) {
  const prepared = await prepareTurn({ userId, campaignId, body });
  if (prepared.mode === 'completed') return prepared.finalOutput;

  const runtime = {
    turnId: prepared.turnId,
    state: prepared.state,
    mechanics: prepared.mechanics,
  };

  const context = buildNarratorTurnContext({
    state: runtime.state,
    playerInput: body.player_input,
    turnId: runtime.turnId,
  });
  context.allowed_tools = ['consultar_estado', 'realizar_teste'];

  const resume = prepared.resumeStep
    ? {
      previous_response_id: prepared.resumeStep.response_id,
      tool_call_id: prepared.resumeStep.tool_call_id,
      tool_result: prepared.resumeStep.result_json,
      tool_cycles: prepared.resumeStep.step_index + 1,
    }
    : null;

  try {
    const narratorResult = await runNarratorTurn({
      context,
      fetchImpl,
      initialToolChoice: resume ? 'auto' : { type: 'function', name: 'realizar_teste' },
      resume,
      onResponse: (payload) => recordResponse(runtime.turnId, payload),
      onToolCall: (payload) => recordToolCall(runtime.turnId, payload),
      executeTool: (name, args, meta) => executeNarratorTool({
        runtime,
        userId,
        campaignId,
        body,
        name,
        args,
        meta,
      }),
    });

    return await finalizeTurn({
      runtime,
      campaignId,
      body,
      narratorResult,
    });
  } catch (error) {
    await markRecoverable(runtime.turnId, error);
    throw error;
  }
}
