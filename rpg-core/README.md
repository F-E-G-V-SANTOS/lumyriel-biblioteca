# Lumyriel RPG Core — MVP v0.1

Primeira implementação isolada das Fases 1–3 definidas em **Lumyriel — RPG — Backend MVP v0.1**.

## O que este diretório prova

- criação de uma campanha a partir de snapshot imutável de personagem;
- pinning de Pacote Canônico;
- `CampaignState` serializável;
- Vitalidade e Fôlego derivados pelas fórmulas aprovadas;
- Mana e Aura **não são inventadas** quando o pacote mecânico/canônico não fornece escala;
- resolução d20 no motor, com Favor, Pressão, margem e graus;
- idempotência de turno;
- concorrência otimista por `state_version`;
- event log;
- turno sem GPT com ações mockadas.

## O que deliberadamente NÃO está aqui

- chave da OpenAI;
- chamada à Responses API;
- autenticação;
- banco de produção;
- adaptador HTTP/framework;
- gerador final de SituationSeed;
- regras completas de combate;
- integração com `character-creator.html`;
- qualquer mudança em `apps-script/Code.gs`.

O repositório atual é um site estático com um Apps Script de submissões. Como não existe backend transacional vigente para reutilizar, este núcleo mantém a lógica independente de provedor. O adaptador de produção será escolhido depois sem acoplar regras de Lumyriel a Express, Cloudflare, Firebase, Supabase ou outra infraestrutura por antecipação.

## Integração pendente com o Criador

O Criador atual ainda não persiste a ficha mecânica exigida pelo RPG.

Para o MVP mecânico, a criação aprovada exige:

- seis atributos iniciando em 1;
- 7 pontos adicionais;
- limite comum 3 antes de exceções canônicas;
- 2 competências em nível 2;
- 4 competências em nível 1;
- 2 especialidades em nível 1.

Por isso, `createCampaign` falha com `CHARACTER_MECHANICS_REQUIRED` quando essa camada não existe. O núcleo não converte profissão, aparência ou povo em atributos silenciosamente.

## Regra de espécies

O núcleo não codifica bônus raciais nem reintroduz opções removidas do Criador. Biologia, cultura, origem e formação permanecem separadas. Exceções mecânicas de espécie só entram quando vierem de regra canônica explícita.

## Testes

Requer Node.js 20+.

```bash
cd rpg-core
npm test
```

Os testes atuais cobrem inicialização, orçamento de atributos, Favor/Pressão, 20 natural, persistência, idempotência e conflito de versão.

## Próximo passo

1. executar os testes em CI/local;
2. definir o armazenamento transacional e autenticação do backend publicado;
3. implementar adaptadores de personagem e Pacote Canônico;
4. implementar `create/load/turn` HTTP em cima deste núcleo;
5. só depois integrar o Narrador GPT e a rota `/jogar`.
