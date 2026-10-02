# ADR-001 — Fonte do personagem jogável

Status: aceito para o protótipo técnico.

## Problema

O contrato de Runtime define que a criação de campanha recebe `character_id + character_revision`, lê o personagem criado no site e cria um snapshot imutável.

O site atual, porém, possui dois comportamentos diferentes:

1. rascunho local do Criador, mantido no navegador;
2. submissão opcional ao Apps Script para avaliação autoral, gravada como `PENDENTE_DE_AVALIACAO` e `canonical: false`.

Nenhum desses fluxos é uma fonte de dados adequada para saves do RPG.

## Decisão

O backend do RPG terá um armazenamento próprio de personagens jogáveis: `rpg_player_characters`.

Esse registro é privado por usuário e contém:

- `character_id`;
- `user_id`;
- `revision`;
- `creator_version`;
- JSON estruturado do personagem;
- status e datas.

Ao iniciar uma campanha, o backend valida que:

- o personagem pertence ao usuário;
- `character_revision` coincide com a revisão atual;
- o JSON é compatível com o contrato vigente.

Em seguida cria `rpg_character_snapshots`, que é imutável e pertence à campanha.

## Distinção de versões

`character_revision` = revisão incremental do personagem salvo.

`creator_version` = versão da interface/contrato do Criador, como `alpha-0.4`.

Uma não substitui a outra.

## Fronteira com submissões

Salvar um personagem para jogar **não** equivale a submetê-lo a Lumyriel.

`apps-script/Code.gs` permanece dedicado à fila autoral de submissões e não será usado para:

- autenticação;
- saves;
- campanhas;
- inventário;
- rolagens;
- estado do RPG;
- chave da OpenAI.

A submissão autoral continua opcional e separada.

## Consequência para a integração futura

O Criador ganhará uma ação de salvar/atualizar personagem no backend do RPG. A ação atual de submissão permanece independente.

Campanhas antigas continuam presas ao snapshot criado no início e não mudam quando o personagem-base é editado.
