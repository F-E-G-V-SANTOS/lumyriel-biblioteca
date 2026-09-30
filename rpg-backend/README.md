# Lumyriel RPG Backend MVP — Fases 1–3

Esqueleto de backend isolado para provar a arquitetura aprovada do RPG **antes** de integrar o Narrador GPT ou alterar o site público.

## Escopo desta branch

Implementa:

- persistência PostgreSQL com JSONB + event log;
- importação explícita de um personagem do Criador para a área do RPG;
- validação da criação mecânica inicial: 6 atributos, 7 pontos adicionais, 2 competências nível 2, 4 nível 1 e 2 especialidades nível 1;
- snapshot imutável do personagem ao iniciar campanha;
- `CampaignState` serializável com `state_version`;
- criação, listagem e carregamento de campanhas;
- endpoint único de turno;
- rolagem oficial no servidor;
- optimistic concurrency;
- idempotência por `campaign_id + idempotency_key`;
- event log e checkpoint manual;
- situação e narrativa **mockadas**, deliberadamente sem GPT.

Não implementa ainda:

- OpenAI Responses API;
- Pacote Canônico compilado de produção;
- gerador real de `SituationSeed`;
- combate completo;
- Mana/Aura completas;
- autenticação de produção;
- frontend `/jogar`;
- integração do Criador com estes endpoints.

## Regra de segurança

A chave da OpenAI não existe nesta fase e nunca deve ser colocada no HTML, JavaScript público, `localStorage` ou repositório.

O modo de autenticação desta branch é apenas local:

```env
RPG_ALLOW_DEV_AUTH=true
RPG_DEV_USER_ID=local-dev
```

Com `RPG_ALLOW_DEV_AUTH=false`, o servidor recusa endpoints protegidos até uma autenticação real ser integrada.

## Banco

Crie um PostgreSQL vazio e aplique:

```bash
psql "$DATABASE_URL" -f sql/001_init.sql
```

A estrutura usa:

- `rpg_characters`
- `rpg_campaigns`
- `rpg_character_snapshots`
- `rpg_campaign_states`
- `rpg_campaign_events`
- `rpg_campaign_checkpoints`
- `rpg_situations`
- `rpg_turns`

## Execução

```bash
cp .env.example .env
npm install
npm run check
npm test
npm start
```

> O Node não carrega `.env` automaticamente neste esqueleto. Exporte as variáveis pelo ambiente da plataforma ou shell antes de iniciar.

## Endpoints MVP

### Importar personagem para o RPG

`POST /api/rpg/characters/import`

O payload separa a ficha autoral do Criador (`creator_payload`) da camada mecânica do RPG (`mechanics`). A importação **não** envia o personagem para avaliação canônica e não usa o Apps Script existente.

Exemplo reduzido de `mechanics`:

```json
{
  "attributes": {
    "potencia": 2,
    "agilidade": 2,
    "vigor": 3,
    "intelecto": 2,
    "percepcao": 3,
    "presenca": 1
  },
  "competencies": [
    {"id":"percepcao_de_campo","level":2,"specialties":[{"id":"rotas_regionais","level":1}]},
    {"id":"atletismo","level":2,"specialties":[{"id":"carga","level":1}]},
    {"id":"sobrevivencia","level":1,"specialties":[]},
    {"id":"navegacao","level":1,"specialties":[]},
    {"id":"oficios","level":1,"specialties":[]},
    {"id":"influencia","level":1,"specialties":[]}
  ],
  "resources": {
    "mana": {"applicable": false},
    "aura": {"applicable": false}
  },
  "techniques": []
}
```

### Criar campanha

`POST /api/rpg/campaigns`

Segue `CampaignInitRequest`: `character_id`, `character_revision`, dificuldade, duração, seleção regional, preferência de aventura e nome opcional.

### Listar campanhas

`GET /api/rpg/campaigns`

### Carregar campanha

`GET /api/rpg/campaigns/{campaign_id}`

### Executar turno

`POST /api/rpg/campaigns/{campaign_id}/turns`

Exemplo:

```json
{
  "idempotency_key": "browser-generated-uuid",
  "expected_state_version": 1,
  "player_input": {
    "source": "suggested_action",
    "raw_text": "",
    "selected_action_id": "mock:observe"
  }
}
```

Ações mockadas disponíveis:

- `mock:observe` — Percepção + Percepção de Campo, dificuldade 10;
- `mock:force-passage` — Potência + Atletismo, dificuldade 12;
- `mock:wait` — avança 10 minutos do estado de mundo.

A dificuldade é definida pelo servidor; o jogador não envia CD nem resultado de dado.

### Checkpoint manual

`POST /api/rpg/campaigns/{campaign_id}/checkpoints`

Checkpoint não altera o mundo; apenas captura o último estado confirmado.

## Integração futura com o site

O site público e `apps-script/Code.gs` permanecem intocados nesta fase. A integração posterior deverá:

1. acrescentar ao Criador a distribuição dos atributos/competências do RPG;
2. importar a ficha para `/api/rpg/characters/import` somente quando o jogador escolher jogar;
3. criar a rota visual `/jogar`;
4. manter a submissão canônica atual como fluxo separado;
5. integrar o Narrador GPT somente depois de Fases 1–3 passarem nos testes de banco, versão e idempotência.
