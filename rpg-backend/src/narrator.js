import { buildNarratorTurnContext, readAuthorizedState } from './narrator-context.js';
import { NARRATOR_INSTRUCTIONS, NARRATOR_OUTPUT_FORMAT, PHASE4_TOOLS } from './narrator-schema.js';
import { extractFunctionCalls, extractStructuredOutput } from './openai-responses.js';

function initialPayload(context) {
  return {
    store: true,
    instructions: NARRATOR_INSTRUCTIONS,
    parallel_tool_calls: false,
    tools: PHASE4_TOOLS,
    tool_choice: 'auto',
    text: { format: NARRATOR_OUTPUT_FORMAT },
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `NARRATOR_TURN_CONTEXT\n${JSON.stringify(context)}`
          }
        ]
      }
    ]
  };
}

function continuationPayload(previousResponseId, callId, toolResult) {
  return {
    store: true,
    instructions: NARRATOR_INSTRUCTIONS,
    previous_response_id: previousResponseId,
    parallel_tool_calls: false,
    tools: PHASE4_TOOLS,
    tool_choice: 'auto',
    text: { format: NARRATOR_OUTPUT_FORMAT },
    input: [
      {
        type: 'function_call_output',
        call_id: callId,
        output: JSON.stringify(toolResult)
      }
    ]
  };
}

function apiBody({ turnId, loaded, finalOutput, mechanicalEvents }) {
  return {
    turn_id: turnId,
    state_version: Number(loaded.manifest.latest_state_version),
    event_sequence: Number(loaded.manifest.latest_event_sequence),
    phase: 'narrator_phase_4',
    narrative: finalOutput.narrativa,
    suggested_actions: finalOutput.acoes_sugeridas,
    action_free: finalOutput.acao_livre,
    scene_phase: finalOutput.fase_da_cena,
    risk_visible: finalOutput.risco_visivel,
    risk_confidence: finalOutput.confianca_do_risco,
    interface_warnings: finalOutput.avisos_de_interface,
    visible_entities: finalOutput.entidades_visiveis,
    narrator_output: finalOutput,
    mechanical_events_visible: mechanicalEvents,
    visible_state_patch: {
      scene_summary: loaded.visible_state.scene_summary,
      last_turn: loaded.visible_state.last_turn
    },
    checkpoint_created: false,
    save_status: 'confirmed'
  };
}

export class NarratorService {
  constructor({ repository, responsesClient, maxToolSteps = 4 }) {
    this.repository = repository;
    this.responsesClient = responsesClient;
    this.maxToolSteps = maxToolSteps;
  }

  async runTurn({ userId, campaignId, idempotencyKey, expectedStateVersion, playerInput }) {
    const begin = await this.repository.beginNarratedTurn({
      userId, campaignId, idempotencyKey, expectedStateVersion, playerInput
    });
    if (begin.kind === 'replay') return { status: 200, body: begin.body };
    if (begin.kind === 'error') return { status: begin.status, body: begin.body };

    const turnId = begin.turnId;
    let loaded = begin.loaded;
    let response;
    const mechanicalEvents = [];

    try {
      const context = buildNarratorTurnContext({
        manifest: loaded.manifest,
        state: loaded.visible_state,
        turnId,
        playerInput,
        lastNarratorOutput: begin.lastNarratorOutput || null
      });

      response = await this.responsesClient.create(initialPayload(context));
      await this.repository.markNarratedTurnProgress({
        userId, campaignId, turnId, modelResponseId: response.id, status: 'waiting_tool'
      });

      for (let step = 0; step <= this.maxToolSteps; step += 1) {
        const calls = extractFunctionCalls(response);
        if (calls.length === 0) {
          const finalOutput = extractStructuredOutput(response);
          loaded = await this.repository.getCampaign(userId, campaignId);
          const body = apiBody({ turnId, loaded, finalOutput, mechanicalEvents });
          await this.repository.completeNarratedTurn({
            userId, campaignId, turnId, modelResponseId: response.id, finalOutput: body
          });
          return { status: 200, body };
        }

        if (calls.length !== 1) {
          throw Object.assign(new Error('O Narrador retornou múltiplas tool calls apesar de parallel_tool_calls=false.'), {
            code: 'unexpected_parallel_tool_calls', statusCode: 502
          });
        }
        if (step === this.maxToolSteps) {
          throw Object.assign(new Error('Limite de ferramentas do turno excedido.'), {
            code: 'tool_loop_limit', statusCode: 502
          });
        }

        const call = calls[0];
        let args;
        try { args = JSON.parse(call.arguments || '{}'); }
        catch {
          throw Object.assign(new Error('Argumentos de ferramenta inválidos.'), {
            code: 'invalid_tool_arguments', statusCode: 502
          });
        }

        let toolResult;
        if (call.name === 'consultar_estado') {
          loaded = await this.repository.getCampaign(userId, campaignId);
          if (!loaded) return { status: 404, body: { error: 'campaign_not_found' } };
          toolResult = readAuthorizedState(loaded.visible_state, args);
        } else if (call.name === 'realizar_teste') {
          const applied = await this.repository.applyNarratorTest({
            userId,
            campaignId,
            turnId,
            expectedStateVersion: Number(loaded.manifest.latest_state_version),
            args
          });
          if (applied.status !== 200) {
            toolResult = { ok: false, error: applied.body.error, details: applied.body };
          } else {
            toolResult = applied.body.tool_output;
            if (applied.body.mechanical_event) mechanicalEvents.push(applied.body.mechanical_event);
            loaded = applied.body.loaded;
          }
        } else {
          toolResult = { ok: false, error: 'tool_not_allowed_phase_4', tool: call.name };
        }

        await this.repository.markNarratedTurnProgress({
          userId, campaignId, turnId, modelResponseId: response.id, status: 'waiting_model'
        });
        response = await this.responsesClient.create(continuationPayload(response.id, call.call_id, toolResult));
        await this.repository.markNarratedTurnProgress({
          userId, campaignId, turnId, modelResponseId: response.id, status: 'waiting_tool'
        });
      }

      throw Object.assign(new Error('Loop do Narrador terminou sem saída final.'), { statusCode: 502 });
    } catch (error) {
      await this.repository.failNarratedTurn({
        userId,
        campaignId,
        turnId,
        modelResponseId: response?.id || null,
        error: {
          code: error.code || 'narrator_error',
          message: error.message,
          openai_request_id: error.openaiRequestId || null
        }
      }).catch(() => {});
      return {
        status: error.statusCode || 502,
        body: {
          error: error.code || 'narrator_error',
          message: error.message,
          state_may_have_advanced: mechanicalEvents.length > 0
        }
      };
    }
  }
}
