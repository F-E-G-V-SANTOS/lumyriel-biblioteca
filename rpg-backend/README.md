# Lumyriel RPG — backend

Esta pasta inicia a implementação do backend do RPG sem alterar o endpoint atual do Criador de Personagens.

## Estado desta frente

Fase 1 do plano técnico:

- CampaignState formalizado em JSON Schema;
- CampaignInitRequest formalizado em JSON Schema;
- CampaignManifest formalizado em JSON Schema;
- persistência relacional inicial em PostgreSQL;
- armazenamento separado de personagens jogáveis por usuário;
- concorrência otimista preparada por `state_version`;
- idempotência preparada por `campaign_id + idempotency_key`;
- event log e checkpoints separados do estado corrente;
- segredos de situação separados em `private_truth_json`.

Ainda **não** há chamada ao Narrador GPT nem rota `/jogar`. Isso é intencional: primeiro o estado e a persistência precisam funcionar de forma independente do modelo.

## Fronteira com o backend existente

`apps-script/Code.gs` continua sendo exclusivamente o intake de personagens do Criador.

Ele não deve receber turnos, rolar dados, guardar campanhas nem armazenar chave da OpenAI.

O RPG terá backend próprio. O navegador enviará intenções de jogo ao backend do RPG; somente o servidor poderá alterar o estado oficial da campanha.

Salvar um personagem para jogar também não o submete automaticamente à avaliação autoral.

## Arquivos

- `docs/ADR-001-character-source.md` — separa personagem jogável de submissão autoral.
- `schemas/campaign-state.schema.json` — fonte serializável do estado da campanha.
- `schemas/campaign-init.schema.json` — contrato de criação de campanha.
- `schemas/campaign-manifest.schema.json` — cabeçalho estável do save.
- `migrations/001_rpg_core.sql` — tabelas mínimas do MVP.

## Próxima fase

Fase 2: implementar criação e carregamento de campanha sobre esta persistência, incluindo snapshot imutável do personagem e criação atômica do primeiro checkpoint.

Antes disso, o adaptador Criador → ficha mecânica precisa ser definido: o `CampaignState` exige atributos e competências numéricos, enquanto o Criador atual é majoritariamente descritivo.

Nenhuma credencial deve ser versionada neste repositório público.
