# Lumyriel RPG — Backend MVP + Frontend Alpha

Linha integrada de desenvolvimento do RPG: backend transacional das Fases 1–3, fundação isolada do Narrador GPT e frontend alpha em `rpg.html`. O fluxo de submissão canônica do Criador continua separado em `apps-script/Code.gs`.

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
- situação e narrativa **mockadas** no endpoint de turno enquanto a orquestração GPT não é ativada;\n- `rpg.html` integrado ao contrato real de importação, campanhas, turnos, `state_version`, idempotência e checkpoints;\n- configuração mecânica temporária no frontend alpha, sem inferir atributos/competências da biografia;\n- modo demonstração local explicitamente não autoritativo quando nenhum backend estiver configurado.

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

## Fase 4 — fundação do Narrador (não ativada no endpoint)

A branch também contém a camada isolada de integração do Narrador:

- `src/context.js` monta `NarratorTurnContext` sem enviar o `CampaignState` inteiro;
- `src/narrator.js` implementa Responses API por HTTP, Function Calling estrito e Structured Output;
- somente `consultar_estado` e `realizar_teste` estão expostos nesta fundação;
- `parallel_tool_calls=false`;
- `OPENAI_API_KEY` e `OPENAI_MODEL` existem apenas no ambiente do servidor;
- o endpoint de turno continua na implementação mockada da Fase 3.

Essa separação continua deliberada: a próxima etapa do backend é refatorar o endpoint de turno para que chamadas ao modelo ocorram **fora de transações PostgreSQL abertas**. Só depois disso `RPG_ENABLE_NARRATOR` poderá ligar o Narrador real com recuperação idempotente.
\n\n## Correção de integridade\n\nO arquivo `src/validators.js` originalmente entrou no commit das Fases 1–3 com bytes corrompidos a partir de `validateCampaignInit`. A branch integrada reparou o arquivo, restaurando os validadores de `CampaignInitRequest`, `TurnRequest` e `getCompetencyLevel`. A sintaxe do validador e do JavaScript de `rpg.html` foi verificada após a correção.\n