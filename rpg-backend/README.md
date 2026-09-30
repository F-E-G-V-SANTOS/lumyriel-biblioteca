# Lumyriel RPG — Backend MVP + Frontend Alpha

Esta branch reúne o frontend alpha do RPG, o backend transacional e o piloto controlado do Narrador GPT. O fluxo canônico de submissão do Criador de Personagens continua separado em `apps-script/Code.gs`.

## Estado atual

Implementado:

- `rpg.html` integrado ao site e ao Criador de Personagens;
- importação explícita de ficha narrativa + camada mecânica;
- seis atributos com total inicial 13 e limite comum 3;
- 2 competências no nível 2, 4 no nível 1 e 2 especialidades;
- PostgreSQL com `CampaignState`, event log, checkpoints e snapshots;
- `state_version` com concorrência otimista;
- idempotência por `campaign_id + idempotency_key`;
- rolagens oficiais no servidor;
- Valdren como pacote regional do MVP;
- cinco dificuldades: História, Fácil, Médio, Difícil e Lumyriel;
- durações 30/60/90/120/240 minutos ou campanha contínua;
- modo local de demonstração, explicitamente não autoritativo;
- fundação do Narrador via Responses API, Function Calling estrito e Structured Output;
- persistência dos passos de ferramenta em `rpg_turn_steps`;
- recuperação de turno sem rerrolar uma operação mecânica já confirmada;
- piloto GPT ativável somente para as ações mecânicas já registradas pelo motor.

Ainda não implementado por completo:

- gateway semântico geral para qualquer ação livre;
- gerador real de `SituationSeed`;
- Pacote Canônico compilado de produção;
- combate completo;
- Mana/Aura completas;
- autenticação pública de produção;
- migração da preparação mecânica temporária de `rpg.html` para o Criador.

## Regra de autoridade

> GPT narra e interpreta. O motor calcula, valida e persiste.

O modelo não escolhe CD, dado, ferimento, inventário, reputação, relógio ou alteração canônica como autoridade. Toda mutação persistente precisa passar pelo motor.

A dificuldade de uma ação pertence à situação. Ela não muda porque o jogador escolheu História, Fácil, Médio, Difícil ou Lumyriel.

## Segurança

Credenciais do Narrador existem somente no ambiente do backend. Nunca coloque credenciais no HTML, JavaScript público, `localStorage` ou repositório.

Desenvolvimento local pode usar:

```env
RPG_ALLOW_DEV_AUTH=true
RPG_DEV_USER_ID=local-dev
RPG_ENABLE_NARRATOR=false
```

Com `RPG_ALLOW_DEV_AUTH=false`, os endpoints protegidos recusam acesso até existir autenticação de produção.

`RPG_ENABLE_NARRATOR=false` é o padrão seguro. Quando `true`, somente as ações-piloto `mock:observe` e `mock:force-passage` entram no orquestrador GPT nesta etapa; as demais continuam no caminho mock.

## Banco

Crie um PostgreSQL vazio e aplique as migrações em ordem:

```bash
psql "$DATABASE_URL" -f sql/001_init.sql
psql "$DATABASE_URL" -f sql/002_narrator_turn_steps.sql
```

Tabelas principais:

- `rpg_characters`;
- `rpg_campaigns`;
- `rpg_character_snapshots`;
- `rpg_campaign_states`;
- `rpg_campaign_events`;
- `rpg_campaign_checkpoints`;
- `rpg_situations`;
- `rpg_turns`;
- `rpg_turn_steps`.

A migração 002 também cria uma trava para impedir dois turnos ativos simultâneos na mesma campanha.

## Execução

```bash
cp .env.example .env
npm install
npm run check
npm test
npm start
```

O Node não carrega `.env` automaticamente neste esqueleto. Exporte as variáveis pelo shell ou configure-as na plataforma de execução.

## Endpoints

### Importar personagem

`POST /api/rpg/characters/import`

O payload separa:

- `creator_payload`: ficha narrativa do Criador;
- `mechanics`: ficha mecânica do RPG.

A importação para o RPG não envia o personagem para avaliação canônica.

Exemplo reduzido:

```json
{
  "creator_payload": {
    "name": "Personagem de teste"
  },
  "mechanics": {
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
}
```

### Criar campanha

`POST /api/rpg/campaigns`

Segue `CampaignInitRequest` com personagem, revisão, dificuldade, duração, seleção regional, preferência de aventura e nome opcional.

### Listar campanhas

`GET /api/rpg/campaigns`

### Carregar campanha

`GET /api/rpg/campaigns/{campaign_id}`

### Executar turno

`POST /api/rpg/campaigns/{campaign_id}/turns`

```json
{
  "idempotency_key": "browser-generated-uuid",
  "expected_state_version": 1,
  "player_input": {
    "source": "suggested_action",
    "raw_text": "Observar o entorno",
    "selected_action_id": "mock:observe"
  }
}
```

Ações mecânicas registradas no piloto:

- `mock:observe` — Percepção + Percepção de Campo, CD 10;
- `mock:force-passage` — Potência + Atletismo, CD 12;
- `mock:wait` — avança 10 minutos, ainda no caminho mock.

A CD é definida pelo motor. O cliente e o Narrador não fornecem o valor final.

### Checkpoint manual

`POST /api/rpg/campaigns/{campaign_id}/checkpoints`

Checkpoint apenas captura o último estado confirmado.

## Fase 4 — Narrador GPT piloto

Arquivos:

- `src/context.js`: monta o `NarratorTurnContext` autorizado;
- `src/narrator.js`: integra Responses API, ferramentas estritas e saída estruturada;
- `src/narrated-turn.js`: orquestra persistência, ferramenta, recuperação e finalização;
- `sql/002_narrator_turn_steps.sql`: registra chamadas/resultados de ferramenta.

Fluxo de uma ação-piloto com Narrador habilitado:

1. o backend valida a intenção e cria o turno;
2. a transação é encerrada;
3. o modelo recebe contexto autorizado;
4. a primeira chamada é forçada para `realizar_teste` nas duas ações-piloto;
5. o motor ignora qualquer tentativa do modelo de escolher CD e usa a regra registrada da ação;
6. dado, resultado e novo `CampaignState` são persistidos atomicamente;
7. o resultado persistido é devolvido ao modelo;
8. o modelo produz a narrativa estruturada;
9. o backend persiste a finalização e devolve a resposta ao frontend.

Nenhuma chamada externa ao modelo fica esperando dentro de uma transação PostgreSQL.

Se a chamada ao modelo falha depois de uma rolagem confirmada, o turno passa a `recoverable_error`. Ao repetir a mesma `idempotency_key`, o backend continua a partir de `response_id + tool_call_id + tool_result` persistidos. O dado não é rolado novamente.

As continuações que usam `previous_response_id` reenviam as instruções do Narrador em cada request.

## Integração com o site

`rpg.html` já:

1. lê a ficha narrativa salva pelo Criador;
2. pede a camada mecânica temporariamente dentro do RPG;
3. importa a ficha para o backend;
4. cria campanha;
5. envia turnos com `expected_state_version` e `idempotency_key`;
6. cria checkpoints;
7. retoma campanha pelo estado oficial;
8. mantém a submissão canônica em fluxo separado.

A preparação mecânica deverá migrar para o Criador quando a outra frente estiver pronta, sem mudar o contrato do backend.

## Correções de integridade registradas

O `src/validators.js` original da linha Fases 1–3 continha bytes corrompidos a partir de `validateCampaignInit`. O arquivo foi reconstruído com os contratos vigentes e voltou a passar na validação sintática.

A integração atual também corrige a continuidade de `instructions` nas chamadas da Responses API: ao usar `previous_response_id`, o contrato do Narrador é reenviado explicitamente.
