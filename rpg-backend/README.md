# Lumyriel RPG Backend — Fases 1–4

Backend inicial do RPG single-player de Lumyriel. Esta área permanece separada de `apps-script/`, que continua responsável somente por receber submissões do Criador de Personagens.

## Estado atual

### Fases 1–3

- `CampaignState` serializável e independente do texto do GPT;
- `CampaignManifest` pinado ao Pacote Canônico Valdren v0.1;
- PostgreSQL para campanhas, estados, eventos, checkpoints, situações e turnos;
- identidade anônima de protótipo por cookie HttpOnly assinado;
- `POST /api/rpg/campaigns` — cria campanha;
- `GET /api/rpg/campaigns` — lista campanhas do usuário;
- `GET /api/rpg/campaigns/:id` — carrega campanha;
- `POST /api/rpg/campaigns/:id/turns` — endpoint único de intenção do jogador;
- rolagem oficial no servidor;
- d20 + atributo + competência + especialidade + modificadores contra dificuldade da situação;
- Favor/Pressão como 2d20 maior/menor no motor da Fase 3;
- graus de resultado por margem;
- versionamento otimista de estado;
- idempotência por turno;
- event log monotônico.

### Fase 4

- `NarratorTurnContext` mínimo e autorizado;
- integração server-side com OpenAI Responses API;
- Structured Output final `lumyriel_narrator_output`;
- `parallel_tool_calls=false`;
- schemas estritos (`strict=true`);
- primeiras ferramentas habilitadas: `consultar_estado` e `realizar_teste`;
- `consultar_estado` é somente leitura;
- `realizar_teste` nunca recebe CD ou resultado do dado do modelo;
- tool call e tool output são ligados por `call_id`;
- a continuação do tool loop usa `previous_response_id` apenas durante o turno ativo;
- o save da campanha continua independente da conversa da OpenAI;
- saída anterior do Narrador pode alimentar `last_operation_summary` sem reenviar transcript completo;
- falha de API após mutação mecânica é marcada como recuperável e informa que o estado pode ter avançado.

## Soberania do motor

O navegador e o modelo não podem definir diretamente:

- resultado de dado;
- CD/dificuldade;
- state version;
- inventário persistente;
- recursos;
- ferimentos;
- reputação;
- relógios;
- promoção de fatos a cânone.

O modelo interpreta a intenção e pode sugerir atributo/competência. O servidor aceita somente perfis mecânicos já calibrados.

### Catálogo técnico temporário da Fase 4

Enquanto o `SituationSeed` real ainda não existe, a integração do Narrador possui um catálogo mínimo de QA no servidor:

- Percepção + Sobrevivência → CD 12;
- Agilidade + Sobrevivência → CD 10;
- Presença + Influência → CD 12;
- Potência + Atletismo → CD 15;
- Intelecto + Conhecimentos → CD 12;
- Percepção + Investigação → CD 12.

Esses pares são andaimes técnicos para provar o loop. Eles não transformam toda situação desse tipo em uma CD universal. Se a combinação ainda não estiver mapeada, o motor retorna `test_profile_unavailable` em vez de inventar um número.

## Criador de Personagens

A campanha recebe um snapshot completo do personagem no momento da criação. Alterações futuras na ficha-base não reescrevem retroativamente uma campanha já iniciada.

Nesta etapa, as competências do criador são convertidas assim:

- `Sem experiência = 0`;
- `Familiar = 1`;
- `Treinado = 2`;
- `Experiente = 3`;
- `Mestre = 4`.

Os seis atributos começam em `1 = comum` como base neutra. A futura conversão biográfica de atributos precisa de calibração própria; o backend não deriva força, inteligência ou outras capacidades de aparência, povo ou biografia por improvisação.

## Responses API

A integração usa `POST https://api.openai.com/v1/responses` no servidor. A chave jamais vai para HTML, `localStorage` ou JavaScript público.

O modelo é configurável por ambiente. O valor de exemplo acompanha a recomendação vigente no momento da implementação, mas não é regra de cânone nem dependência rígida do RPG.

Durante um tool loop, `store=true` + `previous_response_id` simplificam a continuidade da resposta. O estado oficial do jogo continua no banco de Lumyriel, não na conversa do provedor.

## Banco

A arquitetura usa PostgreSQL. Rode `migrations/001_rpg_core.sql` antes de iniciar o servidor.

## Variáveis

Copie `.env.example` para seu gerenciador de ambiente.

Variáveis da Fase 4:

- `RPG_NARRATOR_ENABLED=1` para ativar o Narrador;
- `OPENAI_API_KEY` somente no servidor;
- `OPENAI_MODEL` configurável;
- `OPENAI_BASE_URL` configurável;
- `OPENAI_TIMEOUT_MS` configurável.

Sem `RPG_NARRATOR_ENABLED=1`, o endpoint de turno continua usando o fluxo mockado das Fases 1–3 para QA local.

## Testes

A suíte atual valida sem consumir API real:

- criação do manifesto e estado;
- regra d20 e margem;
- Favor;
- HTTP criar → carregar → turno;
- idempotência;
- rejeição de state version antiga;
- rota HTTP com Narrador;
- tool call `realizar_teste`;
- consulta de estado sem mutação;
- Structured Output final;
- perfil mecânico ainda não mapeado sem invenção de CD;
- cliente HTTP do Responses API mantendo credencial no servidor.

Execute:

```bash
npm test
```

## Limites ainda deliberados

A Fase 4 ainda não contém:

- teste live contra uma conta OpenAI real;
- todas as 16 ferramentas;
- combate do Narrador;
- recuperação automática de um tool loop interrompido depois de uma mutação;
- save/load avançado por checkpoint + replay de eventos;
- `SituationSeed` gerado;
- interface `/jogar`;
- conversão definitiva do criador para os seis atributos;
- Mana/Aura completos.

## Próxima fase oficial

Conforme Backend MVP v0.1, a próxima etapa é a **Fase 5**: adicionar as ferramentas não-combate restantes de forma incremental, sem abrir mão das validações do motor. Antes de ampliar o conjunto, o próximo QA recomendado é transformar **A Carga que Não Chegou** em eval regressivo automatizado do Narrador Fase 4.
