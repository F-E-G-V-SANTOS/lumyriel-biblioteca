import test from 'node:test';
import assert from 'node:assert/strict';
import { OpenAIResponsesClient } from '../src/openai-responses.js';

test('cliente Responses mantém chave no servidor e envia payload ao endpoint /responses', async () => {
  let seenUrl;
  let seenOptions;
  const fetchImpl = async (url, options) => {
    seenUrl = url;
    seenOptions = options;
    return new Response(JSON.stringify({ id:'resp_qa', status:'completed', output:[] }), {
      status: 200,
      headers: { 'content-type':'application/json', 'x-request-id':'req_qa' }
    });
  };
  const client = new OpenAIResponsesClient({
    apiKey:'sk-test-server-only',
    model:'gpt-6-astra',
    baseUrl:'https://api.openai.com/v1',
    timeoutMs:5000,
    fetchImpl
  });
  const response = await client.create({ input:'QA', store:true });
  assert.equal(seenUrl, 'https://api.openai.com/v1/responses');
  assert.equal(seenOptions.headers.authorization, 'Bearer sk-test-server-only');
  const body = JSON.parse(seenOptions.body);
  assert.equal(body.model, 'gpt-6-astra');
  assert.equal(body.input, 'QA');
  assert.equal(response._request_id, 'req_qa');
});
