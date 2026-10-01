# Proteção Estática do Leitor — Lumyriel

## Objetivo

Reduzir a cópia casual das obras publicadas sem transformar a Biblioteca em uma aplicação dependente de servidor privado.

O projeto permanece **100% estático** no GitHub Pages.

## Camadas ativas

1. seleção de texto desativada na interface do leitor;
2. copiar, recortar, arrastar e menu de contexto bloqueados na área protegida;
3. atalhos comuns como Ctrl/Cmd+C, S, P, U e A interceptados;
4. atalhos mais óbvios de DevTools recebem bloqueio de conveniência;
5. impressão do conteúdo é substituída por uma mensagem;
6. leitor marcado com `noindex,nofollow`;
7. Content Security Policy limita carregamentos externos;
8. manuscritos atuais são entregues como arquivos estáticos codificados `.dat`, não JSON legível;
9. o leitor decodifica os dados localmente apenas quando abre a obra.

## Limite real

Isto **não é DRM** e não promete impossibilidade absoluta de cópia.

Se o navegador consegue mostrar um texto, uma pessoa tecnicamente determinada pode:
- inspecionar a execução;
- recuperar dados da rede;
- reproduzir a rotina de decodificação;
- usar screenshots e OCR.

A meta é elevar significativamente a fricção contra cópia casual e extração trivial, sem sacrificar a arquitetura estática.

## Histórico público

Os JSONs legíveis já existiram em commits anteriores do repositório público. A branch atual não os contém, mas o histórico antigo pode continuar apontando para esses blobs.

Apagar esse material retroativamente exigiria **reescrita destrutiva do histórico Git e force-push**. Isso deve ser uma decisão separada e deliberada.

## Porta futura

`assets/site-config.js` contém:

```js
readerContentBaseUrl: ''
```

Enquanto estiver vazio, o leitor usa os arquivos `.dat` locais.

Se um dia houver motivo para usar outra origem de conteúdo, esse campo permite encaixar uma API HTTPS sem redesenhar o leitor. Nenhum servidor privado está ativo hoje.
