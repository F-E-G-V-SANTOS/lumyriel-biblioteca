# Lumyriel RPG Backend — Fases 1–3

Primeiro esqueleto executável do RPG single-player de Lumyriel. Esta área é deliberadamente separada de `apps-script/`, que continua responsável apenas por receber submissões do Criador de Personagens.

## O que já existe

- `CampaignState` serializável e independente do texto do GPT;
- `CampaignManifest` pinado ao Pacote Canônico Valdren v0.1;
- migração PostgreSQL para campanhas, estados, eventos, checkpoints, situações e turnos;
- identidade anônima de protótipo por cookie HttpOnly assinado;
- `POST /api/rpg/campaigns` — cria campanha;
- `GET /api/rpg/campaigns` — lista campanhas do usuário;
- `GET /api/rpg/campaigns/:id` — carrega campanha;
- `POST /api/rpg/campaigns/:id/turns` — turno da Fase 3, ainda sem GPT;
- rolagem oficial no servidor;
- regra d20 + atributo + competência contra dificuldade estável da situação;
- Favor/Pressão como 2d20 maior/menor;
- graus de resultado por margem;
- versionamento otimista do estado;
- idempotência por turno;
- event log monotônico.

## Limite proposital desta etapa

O endpoint de turno não interpreta linguagem natural ainda. O campo `player_input.text` já é aceito, mas a resolução mecânica usa `mock_action_code` somente para QA de Fase 3. A interpretação da intenção entra na Fase 4 com `NarratorTurnContext + OpenAI + consultar_estado + realizar_teste`.

Os códigos mock atuais são:

- `observar` — registra ação sem teste;
- `inspecionar_rota` — Percepção + Sobrevivência, CD 12;
- `avancar_com_cuidado` — Agilidade + Sobrevivência, CD 10;
- `convencer_trabalhador` — Presença + Influência, CD 12;
- `forcar_obstaculo` — Potência + Atletismo, CD 15.

Eles são andaimes de QA, não conteúdo canônico nem lista final de ações do jogador.

## Criador de Personagens

A campanha recebe um snapshot completo do personagem no momento da criação. A campanha já iniciada não muda retroativamente se a ficha-base for alterada depois.

Nesta fase, as competências do criador são convertidas assim:

`Sem experiência=0`, `Familiar=1`, `Treinado=2`, `Experiente=3`, `Mestre=4`.

Os seis atributos começam em `1 = comum` como base neutra. A conversão biográfica de atributos ainda precisa de calibração própria; o backend não inventa valores a partir de aparência, povo ou biografia.

## Banco

A arquitetura usa PostgreSQL. Rode `migrations/001_rpg_core.sql` no banco antes de iniciar o servidor.

## Variáveis

Copie `.env.example` para seu gerenciador de ambiente. Não publique `DATABASE_URL`, `RPG_COOKIE_SECRET` ou futura chave da OpenAI no repositório ou no navegador.

## Desenvolvimento

```bash
npm install
npm test
npm start
```

Para testes locais sem PostgreSQL, `NODE_ENV=test` ou `ALLOW_IN_MEMORY=1` habilita o repositório em memória. Produção deve usar `DATABASE_URL`.

## Próxima fase

Fase 4 conforme o Backend MVP v0.1:

1. construir `NarratorTurnContext` mínimo;
2. conectar a OpenAI Responses API somente no servidor;
3. habilitar primeiro `consultar_estado` e `realizar_teste`;
4. manter `parallel_tool_calls=false`, schemas estritos e backend soberano;
5. adicionar eval regressivo de “A Carga que Não Chegou”.

A interface `/jogar` continua depois do backend mínimo, como definido na ordem oficial de implementação.
