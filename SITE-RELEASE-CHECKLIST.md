# Checklist de Lançamento — Biblioteca de Lumyriel

## Estado geral

A frente visual e funcional principal do site está consolidada.

### Pronto no código
- [x] identidade visual alinhada à Bíblia Visual de Lumyriel;
- [x] home tratada como catálogo editorial;
- [x] leitor tratado como sumário + fólio;
- [x] Criador tratado como dossiê;
- [x] capas aprovadas integradas ao site;
- [x] estados editoriais fora das capas;
- [x] O Filho da Montanha publicado como Beta 13 · Base v1.19 · 16 capítulos;
- [x] Os Livros dos Tempos publicado como Beta 1 · Base Editorial v1.0 · 54 livros · 1.074 capítulos;
- [x] Livro das Artes Mágicas sincronizado como Arquitetura v0.4 · Volumes I–IV em desenvolvimento;
- [x] memória de leitura por obra;
- [x] proteção estática de leitura contra cópia casual;
- [x] manuscritos da branch atual migrados de JSON legível para arquivos estáticos codificados `.dat`;
- [x] leitor marcado como `noindex,nofollow`;
- [x] seletor de obras disponíveis dentro do leitor;
- [x] porta de configuração futura para outra origem de conteúdo, mantida desativada;
- [x] retomada aproximada da posição de leitura;
- [x] rascunho local do Criador;
- [x] exportação JSON e TXT do personagem;
- [x] configuração externa para o endpoint de submissão;
- [x] gate explícito separado para habilitar submissões públicas;
- [x] backend Apps Script preparado em v1.1;
- [x] honeypot e proteção básica contra duplicação;
- [x] metadados básicos de compartilhamento;
- [x] aviso de privacidade e submissões;
- [x] navegação por teclado e preferência por redução de movimento;
- [x] QA estrutural de HTML/CSS/JavaScript;
- [x] `site-status.json` para verificação da publicação;
- [x] deployment do Pages confirmado com sucesso para `f095cb98c9a721ba798c1d190f7c91cf905eb15d`;
- [x] artefato `github-pages` do deployment baixado e inspecionado; pacote contém home, leitor, Criador, livros, capas, 404, privacidade e status;
- [x] scripts embutidos validados sintaticamente;
- [x] IDs duplicados verificados;
- [x] capas de 300×540 impedidas de ampliar além da largura nativa no Arquivo Visual.

---

# Gate A — Biblioteca pública de leitura

Este gate NÃO depende do canal de submissões de personagens.

## Pendências externas
- [ ] decidir se a Alpha pública pode ser indexada por mecanismos de busca; o estado atual não bloqueia indexação;
- [x] confirmar a hospedagem pública definitiva — GitHub Pages;
- [x] registrar a URL pública final — `https://f-e-g-v-santos.github.io/lumyriel-biblioteca/`;
- [ ] testar a versão publicada em navegador real;
- [ ] testar pelo menos:
  - [ ] Android / Chrome;
  - [ ] desktop / Chrome ou Chromium;
  - [ ] uma viewport intermediária de tablet;
  - [ ] navegação por teclado no desktop;
- [ ] conferir visualmente as três capas sem cache;
- [ ] conferir memória de leitura após fechar e reabrir o navegador;
- [ ] conferir os 16 capítulos do Livro 1 no leitor;
- [ ] conferir navegação entre coleções, livros e capítulos de Os Livros dos Tempos.

## Depois que a URL pública existir
- [ ] adicionar `canonical`;
- [ ] adicionar URLs Open Graph absolutas;
- [ ] decidir imagem social / `og:image`;
- [ ] criar `sitemap.xml` se a indexação pública for desejada;
- [ ] criar `robots.txt` conforme a política de indexação;
- [ ] decidir domínio próprio, se houver.

### Critério de fechamento do Gate A
A Biblioteca pode ser considerada **Alpha Pública** quando:
1. a URL definitiva estiver ativa e com deployment confirmado;
2. home, leitor e Criador abrirem sem erro;
3. o teste visual em celular e desktop não revelar bloqueio de uso;
4. as edições anunciadas coincidirem com os arquivos servidos.

---

# Gate B — Submissões públicas de personagens

Este gate pode permanecer fechado sem bloquear a Biblioteca pública.

## Backend
- [x] `apps-script/Code.gs` preparado;
- [x] destino no Drive definido;
- [x] estado sempre não canônico;
- [x] IDs de submissão definidos;
- [x] limite de payload;
- [x] proteção contra JSON inválido;
- [x] honeypot;
- [x] deduplicação recente;
- [x] configuração desacoplada em `assets/site-config.js`;
- [ ] publicar o Apps Script como Web App;
- [ ] obter a URL `/exec`;
- [ ] testar o health-check;
- [ ] inserir a URL em `assets/site-config.js` mantendo `characterSubmissionEnabled: false`;
- [ ] testar envio real para o Drive em modo controlado;
- [ ] publicar as regras de contribuição;
- [ ] alterar `characterSubmissionEnabled` para `true` somente no lançamento do canal;
- [ ] testar envio duplicado;
- [ ] confirmar criação do JSON e do Dossiê TXT.

## Governança autoral
- [ ] fechar as decisões de `SUBMISSION-POLICY-DECISIONS.md`;
- [ ] transformar as decisões aprovadas em texto público;
- [ ] definir um canal de contato para dúvidas, correção ou pedido relacionado a uma submissão;
- [ ] atualizar `privacy.html` quando as regras estiverem definidas.

### Critério de fechamento do Gate B
O botão de envio só deve ser liberado ao público quando:
1. o endpoint estiver implantado e testado;
2. as regras de contribuição estiverem publicadas;
3. o aviso de privacidade refletir o funcionamento real.

---

# Melhorias pós-lançamento — não bloqueantes
- [ ] decidir futuramente se vale reescrever o histórico antigo do Git para remover versões históricas dos JSONs legíveis;
- [ ] criar favicon somente depois de existir marca editorial deliberadamente aprovada;
- [ ] substituir as capas otimizadas de 300×540 por versões públicas de maior resolução quando houver uma rota binária de atualização conveniente;
- [ ] ampliar o Arquivo Visual com arte conceitual aprovada;
- [ ] publicar cartografia em coleção própria;
- [ ] adicionar novas obras quando alcançarem edição de leitura;
- [ ] decidir se haverá busca textual no acervo;
- [ ] decidir se haverá marcador/favoritos além da memória automática de leitura;
- [ ] avaliar modo de leitura com preferências de fonte/tamanho somente se isso não quebrar a identidade editorial.

---

## Regra de manutenção

**Conteúdo muda; a capa não deve precisar mudar junto.**

Nova versão de manuscrito:
1. atualiza o arquivo da obra;
2. atualiza o estado editorial da interface;
3. preserva a capa enquanto a identidade editorial continuar válida.

**SITE-VISUAL-DIRECTION.md** governa a aparência.
**SITE-RELEASE-CHECKLIST.md** governa o fechamento operacional.
