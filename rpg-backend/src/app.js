import { createCampaignBundle, validateCampaignInit } from './engine.js';
import { resolveAnonymousUser } from './auth.js';

function json(res, status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    ...extraHeaders
  });
  res.end(payload);
}

async function readJson(req, maxBytes = 1_000_000) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw Object.assign(new Error('payload_too_large'), { statusCode: 413 });
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('invalid_json'), { statusCode: 400 });
  }
}

function corsHeaders(config, req) {
  if (!config.allowedOrigin) return {};
  if (req.headers.origin !== config.allowedOrigin) return {};
  return {
    'access-control-allow-origin': config.allowedOrigin,
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': 'content-type,idempotency-key',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'vary': 'origin'
  };
}

export function createHandler({ repository, config, now = () => new Date() }) {
  return async function handler(req, res) {
    const cors = corsHeaders(config, req);
    if (req.method === 'OPTIONS') {
      res.writeHead(204, cors);
      return res.end();
    }

    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/health' && req.method === 'GET') {
        return json(res, 200, { ok: true, service: 'Lumyriel RPG Backend', phase: '1-3', narrator: false }, cors);
      }

      const auth = resolveAnonymousUser(req, config.cookieSecret);
      const headers = { ...cors };
      if (auth.setCookie) headers['set-cookie'] = auth.setCookie;

      if (url.pathname === '/api/rpg/campaigns' && req.method === 'POST') {
        const body = await readJson(req);
        const errors = validateCampaignInit(body);
        if (errors.length) return json(res, 400, { error: 'invalid_campaign_init', details: errors }, headers);
        const bundle = createCampaignBundle({ userId: auth.userId, input: body, now: now() });
        const created = await repository.createCampaign(bundle);
        return json(res, 201, created, headers);
      }

      if (url.pathname === '/api/rpg/campaigns' && req.method === 'GET') {
        return json(res, 200, { campaigns: await repository.listCampaigns(auth.userId) }, headers);
      }

      const campaignMatch = url.pathname.match(/^\/api\/rpg\/campaigns\/([0-9a-f-]{36})$/i);
      if (campaignMatch && req.method === 'GET') {
        const campaign = await repository.getCampaign(auth.userId, campaignMatch[1]);
        return campaign ? json(res, 200, campaign, headers) : json(res, 404, { error: 'campaign_not_found' }, headers);
      }

      const turnMatch = url.pathname.match(/^\/api\/rpg\/campaigns\/([0-9a-f-]{36})\/turns$/i);
      if (turnMatch && req.method === 'POST') {
        const body = await readJson(req);
        const idempotencyKey = String(req.headers['idempotency-key'] || body.idempotency_key || '').trim();
        const expectedStateVersion = Number(body.expected_state_version);
        if (!idempotencyKey || idempotencyKey.length > 200) {
          return json(res, 400, { error: 'idempotency_key_required' }, headers);
        }
        if (!Number.isInteger(expectedStateVersion) || expectedStateVersion < 1) {
          return json(res, 400, { error: 'expected_state_version_invalid' }, headers);
        }
        if (!body.player_input || typeof body.player_input !== 'object') {
          return json(res, 400, { error: 'player_input_required' }, headers);
        }
        const result = await repository.applyMockTurn({
          userId: auth.userId,
          campaignId: turnMatch[1],
          idempotencyKey,
          expectedStateVersion,
          playerInput: body.player_input
        });
        return json(res, result.status, result.body, headers);
      }

      return json(res, 404, { error: 'not_found' }, headers);
    } catch (error) {
      const status = error.statusCode || 500;
      const safe = status >= 500 ? 'internal_error' : error.message;
      return json(res, status, { error: safe }, cors);
    }
  };
}
