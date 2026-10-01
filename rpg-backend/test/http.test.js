import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHandler } from '../src/app.js';
import { MemoryRepository } from '../src/repository.js';
import { NarratorService } from '../src/narrator.js';

function startServer(repository, narrator = null) {
  const config = {
    cookieSecret: '0123456789abcdef0123456789abcdef',
    allowedOrigin: null
  };
  const server = http.createServer(createHandler({ repository, config, narrator }));
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function request(server, path, { method='GET', body, cookie, headers={} }={}) {
  const address = server.address();
  return await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: address.port,
      path,
      method,
      headers: {
        ...(body ? { 'content-type':'application/json' } : {}),
        ...(cookie ? { cookie } : {}),
        ...headers
      }
    }, res => {
      const chunks=[];
      res.on('data', c=>chunks.push(c));
      res.on('end', ()=>resolve({
        status: res.statusCode,
        headers: res.headers,
        body: JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
      }));
    });
    req.on('error', reject);
    if (body) req.end(JSON.stringify(body)); else req.end();
  });
}

test('fluxo HTTP Fase 1–3 cria, carrega e resolve turno', async t => {
  const repository = new MemoryRepository({ rng: () => 10 });
  const server = await startServer(repository);
  t.after(()=>server.close());

  const created = await request(server, '/api/rpg/campaigns', {
    method:'POST',
    body:{
      difficulty_mode:'medio',
      duration_mode:'30',
      character:{ name:'Aren QA', skillSurvival:'Treinado' }
    }
  });
  assert.equal(created.status, 201);
  const cookie = created.headers['set-cookie'][0].split(';')[0];
  const id = created.body.manifest.campaign_id;
  assert.equal(created.body.manifest.latest_state_version, 1);

  const loaded = await request(server, `/api/rpg/campaigns/${id}`, { cookie });
  assert.equal(loaded.status, 200);
  assert.equal(loaded.body.visible_state.character_state.display_name, 'Aren QA');

  const turn = await request(server, `/api/rpg/campaigns/${id}/turns`, {
    method:'POST',
    cookie,
    headers:{ 'idempotency-key':'qa-turn-1' },
    body:{
      expected_state_version:1,
      player_input:{ text:'Examino a rota.', mock_action_code:'inspecionar_rota' }
    }
  });
  assert.equal(turn.status, 200);
  assert.equal(turn.body.state_version, 2);
  assert.equal(turn.body.mechanical_events_visible[0].difficulty, 12);
  assert.equal(turn.body.mechanical_events_visible[0].grade, 'sucesso');
});


test('rota HTTP usa Narrador Fase 4 quando habilitado no handler', async t => {
  const repository = new MemoryRepository({ rng: () => 10 });
  const fakeClient = {
    requests: [],
    async create(payload) {
      this.requests.push(payload);
      const output = {
        narrativa:'Você observa a área sem precisar de um teste.',
        acoes_sugeridas:[],
        acao_livre:true,
        fase_da_cena:'exploracao',
        risco_visivel:'baixo',
        confianca_do_risco:'media',
        avisos_de_interface:[],
        entidades_visiveis:[]
      };
      return { id:'resp_http_phase4', status:'completed', output:[{ type:'message', content:[{ type:'output_text', text:JSON.stringify(output) }] }] };
    }
  };
  const narrator = new NarratorService({ repository, responsesClient: fakeClient });
  const server = await startServer(repository, narrator);
  t.after(()=>server.close());

  const created = await request(server, '/api/rpg/campaigns', {
    method:'POST',
    body:{ difficulty_mode:'medio', duration_mode:'30', character:{ name:'HTTP Phase 4' } }
  });
  const cookie = created.headers['set-cookie'][0].split(';')[0];
  const id = created.body.manifest.campaign_id;
  const turn = await request(server, `/api/rpg/campaigns/${id}/turns`, {
    method:'POST', cookie, headers:{ 'idempotency-key':'http-phase4-1' },
    body:{ expected_state_version:1, player_input:{ text:'Olho ao redor.', source:'free_action' } }
  });
  assert.equal(turn.status, 200);
  assert.equal(turn.body.phase, 'narrator_phase_4');
  assert.equal(turn.body.narrative, 'Você observa a área sem precisar de um teste.');
  assert.equal(fakeClient.requests.length, 1);
});
