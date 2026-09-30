import test from 'node:test';
import assert from 'node:assert/strict';
import { runNarratorTurn } from './narrator.js';

function finalOutput(text) {
  return {
    narrativa: text,
    acoes_sugeridas: [],
    acao_livre: true,
    fase_da_cena: 'exploracao',
    risco_visivel: null,
    confianca_do_risco: null,
    avisos_de_interface: [],
    entidades_visiveis: [],
  };
}

test('resume reuses a persisted tool result without executing the tool again', async () => {
  let toolExecutions = 0;
  let requestBody = null;

  const fakeFetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        id: 'resp_resume_final',
        output_text: JSON.stringify(finalOutput('Resultado anterior preservado.')),
        output: [],
      }),
    };
  };

  const result = await runNarratorTurn({
    context: {
      campaign_id: 'camp_test',
      allowed_tools: ['realizar_teste'],
    },
    executeTool: async () => {
      toolExecutions += 1;
      return { should_not_run: true };
    },
    fetchImpl: fakeFetch,
    apiKey: null,
    model: 'test-model',
    resume: {
      previous_response_id: 'resp_before_failure',
      tool_call_id: 'call_already_resolved',
      tool_result: {
        operation_id: 'op_persisted',
        resolved_test: { die_raw: 17, degree: 'sucesso' },
      },
      tool_cycles: 1,
    },
  });

  assert.equal(toolExecutions, 0);
  assert.equal(result.tool_cycles, 1);
  assert.equal(result.output.narrativa, 'Resultado anterior preservado.');
  assert.equal(requestBody.previous_response_id, 'resp_before_failure');
  assert.equal(requestBody.input[0].call_id, 'call_already_resolved');
  assert.match(requestBody.input[0].output, /op_persisted/);
  assert.match(requestBody.instructions, /MOTOR CALCULA, VALIDA E PERSISTE/);
});

test('tool result hook runs before the continuation request', async () => {
  const order = [];
  let requestCount = 0;

  const fakeFetch = async (_url, options) => {
    requestCount += 1;
    order.push(`fetch:${requestCount}`);
    const body = JSON.parse(options.body);

    if (requestCount === 1) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: 'resp_tool',
          output: [{
            type: 'function_call',
            call_id: 'call_state',
            name: 'consultar_estado',
            arguments: '{"entidades":[],"campos":["recursos"],"perspectiva":"personagem"}',
          }],
        }),
      };
    }

    assert.equal(body.previous_response_id, 'resp_tool');
    assert.match(body.instructions, /GPT NARRA E INTERPRETA/);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        id: 'resp_final',
        output_text: JSON.stringify(finalOutput('Continuação concluída.')),
        output: [],
      }),
    };
  };

  await runNarratorTurn({
    context: {
      campaign_id: 'camp_test',
      allowed_tools: ['consultar_estado'],
    },
    executeTool: async () => {
      order.push('execute');
      return { ok: true };
    },
    onToolResult: async () => order.push('persist-result'),
    fetchImpl: fakeFetch,
    apiKey: null,
    model: 'test-model',
  });

  assert.deepEqual(order, ['fetch:1', 'execute', 'persist-result', 'fetch:2']);
});
