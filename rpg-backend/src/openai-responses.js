export class OpenAIResponsesClient {
  constructor({ apiKey, model, baseUrl = 'https://api.openai.com/v1', timeoutMs = 60000, fetchImpl = fetch }) {
    if (!apiKey) throw new Error('OPENAI_API_KEY ausente.');
    if (!model) throw new Error('OPENAI_MODEL ausente.');
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.timeoutMs = timeoutMs;
    this.fetchImpl = fetchImpl;
  }

  async create(payload) {
    const response = await this.fetchImpl(`${this.baseUrl}/responses`, {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${this.apiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ model: this.model, ...payload }),
      signal: AbortSignal.timeout(this.timeoutMs)
    });

    const requestId = response.headers.get('x-request-id');
    const raw = await response.text();
    let body;
    try { body = raw ? JSON.parse(raw) : {}; }
    catch { body = { error: { message: raw || 'Resposta não JSON da OpenAI.' } }; }

    if (!response.ok) {
      const error = new Error(body?.error?.message || `OpenAI HTTP ${response.status}`);
      error.code = 'openai_api_error';
      error.statusCode = 502;
      error.openaiStatus = response.status;
      error.openaiRequestId = requestId;
      throw error;
    }

    if (body.status && body.status !== 'completed') {
      const error = new Error(`Resposta OpenAI não concluída: ${body.status}`);
      error.code = 'openai_incomplete_response';
      error.statusCode = 502;
      error.openaiRequestId = requestId;
      error.details = body.incomplete_details || body.error || null;
      throw error;
    }

    return { ...body, _request_id: requestId };
  }
}

export function extractFunctionCalls(response) {
  return (response?.output || []).filter(item => item?.type === 'function_call');
}

export function extractStructuredOutput(response) {
  for (const item of response?.output || []) {
    if (item?.type !== 'message') continue;
    for (const part of item.content || []) {
      if (part?.type === 'refusal') {
        const error = new Error(part.refusal || 'Modelo recusou a resposta.');
        error.code = 'openai_refusal';
        error.statusCode = 422;
        throw error;
      }
      if (part?.type === 'output_text' && typeof part.text === 'string') {
        try { return JSON.parse(part.text); }
        catch {
          const error = new Error('Structured Output não pôde ser interpretado como JSON.');
          error.code = 'invalid_structured_output';
          error.statusCode = 502;
          throw error;
        }
      }
    }
  }
  const error = new Error('Resposta final do Narrador ausente.');
  error.code = 'narrator_output_missing';
  error.statusCode = 502;
  throw error;
}
