# Checkpoint — Modernização da Biblioteca — 30/10/2026

WORKSTREAM_ID: LUMY-SITE-MODERNIZACAO
CHECKPOINT_ID: CP-LUMY-SITE-MODERNIZACAO-20261030-R1
OP_KEY: SITE-V3-20261030
Estado: PREPARED_VERIFIED_LOCAL. Verificar commit e publicação remotos antes de repetir.

Autorização: Filipe aprovou a análise e as sugestões nesta conversa e pediu “vamos fazer isso”. É uma exceção explícita à pausa geral para o site; não altera os ponteiros nem o trabalho do acervo, Atlas ou Livro.

Implementado: catálogo central data/catalog.json e geração estática; home selecionada; biblioteca com busca e categorias; galeria de 122 artes com filtro, lotes de 24 e visualizador; Atlas com link ao visualizador existente (acesso restrito preservado); ferramentas e sobre; imagens responsivas; preferências comuns aos leitores; continuidade de Narrar; cache normal de arquivos estáticos; recuperação sem corrida e sem Beta 13; Construindo Mundos por volume.

Validação: scripts/check-library.py; sete obras abertas no navegador local; volumes I e XIV de Construindo; igualdade profunda dos 14 volumes / 808 capítulos; busca e filtros; galeria e navegação entre artes; preferências de leitura e retorno à home; menu e biblioteca em iframe de 390 px sem overflow horizontal.

Comparação observada da home no desktop: 14 → 4 scripts externos; 135 → 13 imagens; aproximadamente 28.102 → 3.171 px de altura. Estes são indicadores estruturais, não tempos de carregamento. Construindo: manifesto + volume I 94.499 bytes, antes 1.120.588 bytes em segmentos completos; redução aproximada de 91,6%. Capas responsivas adicionadas sem substituir originais.

Fonte anterior para reversão: commit 4ff672c08636795ef445f6029c72a2c4ca379b6a. Nenhum payload anterior removido e nenhum texto de livro alterado. A geração pode ser repetida com python scripts/build-library.py. Conferir python scripts/check-library.py antes de publicar.

Limites: não foi executado Lighthouse, não há dados de campo de Core Web Vitals e o layout móvel não foi validado em aparelho físico. Próximo gate: observar a versão publicada, conferir em celular real e refinar apenas falhas ou escolhas visuais observadas. Não migrar o site para outra hospedagem nem publicar o Atlas como público.

---

## Histórico anterior (pode conter estados superados)

# Lumyriel Site — Checkpoint

Estado consolidado em 02/10/2026 após a migração nativa de Artes Mágicas, evolução do Criador de Personagens, revisão do leitor, nova interface viva da home e publicação de **Matemática e Física de Lumyriel — RC1**.

## Capas oficiais aprovadas

O site usa atualmente estas oito capas em `assets/covers/`:

- `o-filho-da-montanha.webp`
- `os-livros-dos-tempos.webp`
- `biologia-lumyrieliana.webp`
- `matematica-lumyrieliana.webp`
- `artes-magicas-lumyrielianas.webp`
- `lumyriel-rpg.webp`
- `construindo-mundos.webp`
- `criador-de-personagens.webp`

Autoria exibida: **F E G V Santos**.

O título editorial vigente da coleção de magia no site é **Artes Mágicas Lumyrielianas**.

## Home — interface viva da Biblioteca

A estrutura vertical original do site permanece vigente. A experiência experimental em estilo console foi abandonada e removida.

A home ganhou um palco visual próprio em `assets/hero-library-stage.js`:

- oito livros/projetos aparecem como uma pilha física de capas no hero;
- no desktop, hover/foco traz a capa para a frente e o clique localiza o projeto na própria página;
- no mobile, o primeiro toque seleciona a capa e abre nome + descrição; o segundo toque localiza o projeto;
- tocar em área vazia fecha o card selecionado;
- o último livro selecionado permanece visualmente no topo da pilha depois de fechar;
- mensagem padrão “Explore o acervo” foi removida para não cobrir as capas;
- coordenadas próprias para mobile reduzem overflow horizontal e preservam títulos;
- animações contínuas, filtros e sombras foram reduzidos no mobile para desempenho;
- `prefers-reduced-motion` continua respeitado.

O fundo da home usa `porto-entre-montanhas.webp` como presença atmosférica de Lumyriel, muito escurecida e dessaturada. No desktop há movimento lento; no mobile o fundo é estático e limitado à área inicial para evitar travamentos.

Estado da rodada: deployment #352 concluído com sucesso para o ajuste em que as capas voltaram a preencher os cards móveis. A próxima decisão visual é consolidar a proporção natural das capas sem voltar a cortar títulos ou criar moldura interna.

## Feedback e Apoie

- ações flutuantes permanecem disponíveis na home;
- camada própria e `z-index` elevado evitam desaparecimento sob o fundo/conteúdo;
- mobile respeita área segura inferior e mantém os dois controles juntos;
- correção publicada no deployment #346.

## Leitor editorial

A barra superior do leitor foi refinada para mobile:

- marca reduzida para `Lumyriel`;
- ações principais compactadas;
- Feedback/Apoie agrupados para reduzir competição horizontal;
- Capítulos e voltar usam tratamento visual coerente;
- altura da barra reduzida e alinhamento móvel normalizado.

O leitor continua com papel envelhecido, memória de leitura, navegação por capítulos e proteção editorial.

## Artes Mágicas Lumyrielianas — leitor nativo

Coleção fechada e publicada para leitura Beta no mesmo leitor editorial usado pelos demais livros:

- RC1 aprovado;
- 6/6 volumes com QA PDF PASS;
- 392 páginas A4 nas edições-fonte;
- 8 partes e 40 capítulos por volume;
- 240 capítulos convertidos para o formato nativo do site;
- arquivo local `books/lmy-aml-b1.dat`;
- papel envelhecido, navegação, paginação aproximada e memória de leitura compartilhando a mesma arquitetura de `reader.html`;
- seletor próprio de volume e abertura de cada volume;
- 11 figuras didáticas do Volume IV preservadas em `assets/books/artes-magicas/`;
- sem iframe ou dependência do visualizador do Google Drive durante a leitura normal;
- `magic-reader.html` mantido somente como redirecionamento de compatibilidade para `reader.html?book=magia&v=0&intro=1`.

Volumes publicados:

1. Volume I — Fundamentos v1.5 — 65 páginas;
2. Volume II — Mana, Acoplamento e Construção de Técnicas v1.5 — 68 páginas;
3. Volume III — Aura, Corpo e Presença v1.8 — 53 páginas;
4. Volume IV — Runologia, Pergaminhos, Matrizes e Artefatos v1.12 — 74 páginas;
5. Volume V — Fenomenologia, Campo e Investigação Mágica v0.21 — 66 páginas;
6. Volume VI — Artes Avançadas, Alto Risco e Fronteiras do Conhecimento v0.20 — 66 páginas.

O catálogo apresenta a coleção como `Leitura disponível · Beta` e abre diretamente o leitor nativo.

A migração é reproduzível por `.github/workflows/build-magic-native.yml` e `tools/build_magic_native.py`, que validam a estrutura dos volumes antes de publicar uma nova conversão.

## Matemática e Física de Lumyriel — leitor nativo

A Primeira Edição RC1 está publicada no mesmo leitor editorial da Biblioteca:

- fonte editorial: `Lumyriel — MAT-FIS-MAN-01 — Manuscrito Mestre da Primeira Edição RC1 — Congelado`;
- 13 Partes;
- 48 capítulos;
- 8 apêndices;
- 14 blocos de leitura (`s00`–`s13`), além do manifesto e da abertura;
- manifesto: `books/lmy-mfl-rc1.dat`;
- abertura: `books/lmy-mfl-intro.00.dat`;
- acesso público pelo leitor: `reader.html?book=matematica&intro=1`;
- capa vigente: `assets/covers/matematica-lumyrieliana.webp`;
- carregamento dividido e sob demanda por Parte, evitando carregar a obra inteira de uma vez;
- memória de leitura, navegação entre capítulos/apêndices e progresso integrados ao leitor comum;
- catálogo atualizado para `Leitura disponível` com `RC1 · Primeira Edição · 48 capítulos · 8 apêndices`.

Os payloads finais `s09`, `s10` e `s13`, que haviam apresentado truncamento em tentativas anteriores, foram regenerados diretamente do manuscrito congelado. O workflow confirmou a exportação-fonte com **525.479 bytes** e passou o QA canônico dos três blocos antes da publicação. O `main` vigente preserva essa regeneração e o GitHub Pages está com build/deploy concluído com sucesso.

## Criador de Personagens

Bloco estrutural vigente:

- matriz biológica Mutari sem estados de compatibilidade em aberto;
- recomendações anatômicas por espécie/configuração;
- observações para combinações contraditórias de jeito de falar;
- ampliação de marcas, cultura, repertório linguístico, códigos sociais, profissões, passado, atuação, especializações, limitações, objetivos, valores e linha moral;
- três itens especiais e ampliação de armas/ferramentas/proteções;
- itens para ocultar olhos raros;
- três modos de nome: naturalizar nome real, gerar nome diretamente lumyrieliano e usar nome real sem conversão;
- gênero exibido como `Masculino`, `Feminino`, `Outro` e `Não definir`; `Outro` não abre campo livre;
- rascunhos antigos com Homem/Mulher são convertidos para Masculino/Feminino;
- dossiê com impressão / salvar em PDF;
- mensagens técnicas de submissão ocultas ao usuário final;
- capa oficial do Criador integrada à página e ao catálogo.

### Preview Visual Modular v0.3

- retrato/busto modular em tempo real;
- responde a espécie, pele, rosto, olhos independentes, cabelo, sobrancelhas, nariz, boca, orelhas, chifres, cicatriz, roupa e acessórios;
- compatibilidade anatômica reaproveita as regras do próprio Criador;
- biblioteca SVG é carregada dentro da página;
- o dossiê recebe snapshot SVG autocontido para impressão/PDF;
- direção visual vigente: manuscrito/pintura editorial envelhecida, evitando avatar moderno;
- escopo continua fechado em retrato/busto, sem corpo inteiro nesta fase;
- próxima expansão artística só deve ocorrer após avaliação visual da qualidade das peças atuais.

## Projetos no site

- Lumyriel RPG: capa oficial integrada e seção de apresentação mantida.
- Construindo Mundos: incluído como projeto editorial em desenvolvimento.
- Biologia Lumyrieliana: capa oficial disponível; projeto ainda em preparação.
- Matemática e Física de Lumyriel: RC1 publicada e disponível no leitor nativo.

## Arquivo Visual

Estado público atual: **12 registros**.

A arte `Viajante sob guarda-chuva` foi removida da galeria pública, mantendo o arquivo preservado fora do índice.

Permanecem em `assets/gallery/revisao-canonica/`:

1. `oreo-nethra-das-sombras.webp`
2. `pulseira-do-peregrino.webp`
3. `arte-lumyriel-revisao-canonica.webp` — prancha de criaturas

A auditoria vigente é `ARQUIVO-VISUAL-AUDIT.md` v1.4.

## Próximas frentes

### Site

1. concluir o QA visual da pilha de capas no mobile, especialmente proporção natural, títulos e fechamento dos cards;
2. validar em aparelho real que não há overflow horizontal nem travamento após as otimizações;
3. manter o leitor separado da teatralidade da home: leitura deve continuar silenciosa e editorial;
4. só depois ampliar novas animações ou fundos.

### Arquivo Visual

1. corrigir Óreo preservando a arte-base e ajustando dados/texto ao cânone;
2. corrigir Pulseira do Peregrino removendo funções inventadas e preservando sua função documental/acadêmica vigente;
3. recuperar da prancha de criaturas somente os elementos individualmente compatíveis e não publicar a prancha inteira sem revisão;
4. concluir a auditoria dos lotes enviados em RAR: Brasões, Olhos, Armas e Outros;
5. classificar cada imagem como `APROVAR`, `CORRIGIR` ou `NÃO PUBLICAR COMO CÂNONE` antes de acrescentá-la à galeria.

Regra de preservação: não sobrescrever originais durante a revisão; manter fonte e versão corrigida separadas até aprovação autoral.


## 2026-10-20 — Os Livros dos Tempos v7.5

- Autorização: atualizar o site com o DAT v7.5 enviado pelo autor ao GitHub.
- Leitor principal e recuperação passam a carregar `books/Os_Livros_dos_Tempos_v7.5.dat`; arquivo antigo preservado.
- Catálogo, navegação e status passam a informar 54 livros, 285 capítulos e edição v7.5.
- Sete coleções e 8.054 unidades numeradas; abertura sem o exemplo da mulher.
- SHA-256 do DAT: `a4492b976d3b067d6bb9d134f07133f60bc139ea1d778e8ce18ac058ddffeda2`.
- Links `reader.html?book=tempos` mantidos; início pela nota editorial nas rotas do catálogo.
- A publicação do conteúdo no Pages é verificada após o commit; os registros anteriores são históricos.
- Corrigido também um erro de sintaxe preexistente no separador de `mathIntroText`, que impedia a inicialização do leitor principal e acionava a recuperação.


## 2026-10-20 — Abertura direta de Os Livros dos Tempos

- Por pedido do autor, o site deixa de exibir a página separada de Nota Editorial.
- O slogan aparece uma vez sob “Palavras de quem entrega estas folhas”, antes do texto de entrega.
- Catálogo e seletores apontam para o primeiro capítulo. Links antigos com `note=1` abrem o início e passam à URL normal.
- O leitor de recuperação recebe a mesma epígrafe.
- O DAT v7.5 permanece idêntico: a união acontece na apresentação do site, preservando a fonte e os 8.054 IDs.


## 2026-10-26 — Ampliação do Arquivo Visual aprovada pelo autor

- Frente: SITE-ARQUIVO-VISUAL; inclusão explicitamente autorizada nesta conversa.
- Fontes: `imagens para o site.rar` (41 imagens) e `imagens aprovadas.rar` (11 imagens).
- 52 fontes únicas por SHA-256; nenhum protótipo do RAR histórico foi incluído por inferência.
- 13 registros anteriores preservados; manifesto passa a 65 registros.
- Novas artes em `assets/gallery/aprovadas-2026-10/`, WebP sem perdas, dimensões e pixels RGB conferidos contra as fontes. Miniaturas separadas de até 640 px para a grade móvel.
- Títulos expositivos derivados dos nomes fornecidos; olho sem nome identificado como estudo ocular de Rhevar. Não se cria lore nem topônimo.
- Grade construída diretamente pelo manifesto, com carregamento preguiçoso; imagem completa só é solicitada ao abrir o visualizador existente.
- Próximos lotes históricos e reconstruções continuam separados, aguardando seleção autoral explícita.


## 2026-10-26 — Correção da escala das miniaturas

- Relato autoral confirmado nos screenshots: miniaturas estreitas e excessivamente altas.
- Causa: atributos de dimensão original combinados com CSS `width:100%` sem `height:auto`; `object-fit:cover` recortava as artes na caixa alta.
- Correção: altura automática, proporção natural e `contain`; cards alinhados pelo topo da grade. Fontes, miniaturas, manifesto e visualizador completo preservados.


## 2026-10-26 — Curadoria por coleções

- Pedido autoral: organizar a exposição por tipo, evitando uma pasta de fotos misturadas.
- 65 artes preservadas em oito coleções expositivas: Paisagens; Cidades e cotidiano; Ruínas e mistérios; Criaturas; Flora e fungos; Personagens; Cenas e aventuras; Estudos visuais.
- Visão Todas apresenta blocos com título e descrição; botões filtram uma coleção com contagem e estado acessível.
- Visualizador percorre somente as artes da coleção visível. Proporção natural e miniaturas sob demanda preservadas.
- Classificação editorial não modifica cânone, títulos ou arquivos de imagem.

- QA da organização: filtro Flora exibe oito artes; visualizador circula de 1/8 a 8/8 dentro da coleção; Estudos exibe uma arte; Todas restaura os oito blocos. Proporção explícita por imagem reserva altura antes do carregamento preguiçoso, evitando saltos.


## 2026-10-26 — Identificação visual de Verdelume corrigida

- Decisão autoral explícita: Verdelume é uma variação de vagalume, não o mamífero anteriormente identificado na galeria.
- Legenda pública e texto alternativo passam a “Pequeno mamífero entre frutos caídos”, sem criar nome de espécie.
- Arte aprovada preservada. Caminhos técnicos legados mantidos para evitar quebrar links; não são identificação canônica.
- Registro restrito à exposição do site; não foi feita alteração silenciosa nas bíblias.


## 2026-10-26 — Árvores-Flauta de Brumamata

- Publicação explicitamente autorizada pelo autor: árvore viva, pesquisa de campo e árvore caída.
- Três fontes aprovadas; originais preservados; exposição em Flora e fungos.
- WebP sem perdas com pixels RGB verificados; miniaturas de até 640 px sem recorte.
- Manifesto ampliado de 65 para 68 artes, preservando todas as entradas anteriores.
- Casca clara, copa dourada, frutos negros e cavidades de tamanhos variados seguem a referência visual aprovada; não foram alteradas bíblias ou outras frentes.


## 2026-10-27 — Olhos e manifestações aprovados

- Pedido autoral nesta conversa: salvar no site as imagens aprovadas dos estudos oculares.
- Incluídas 19 imagens: quatro fases do Véu de Vigília, Pupila Radial de Raio, Selo do Véu, Olhos de Sangue, onze estudos humanos adicionais (incluindo roda astral) e o Rhevar de íris em pétalas.
- Coleção própria “Olhos e manifestações”; 18 imagens humanas e um estudo de Rhevar.
- Fontes originais preservadas; WebP completos sem perdas, mesmas dimensões e igualdade de pixels RGB verificada; miniaturas independentes até 640 px sem recorte.
- Manifesto anterior preservado integralmente; nomes, hashes SHA-256 das fontes e aprovação registrados nas novas entradas.
- Fases 1–4 ordenadas; Roda astral segue EOL-DESP-01. Aprovação visual não atribui novas funções aos demais padrões.
- Trabalho preparado a partir de main dc61948c6e23bdff76c43f47d3a2a1ee0e11080a em worktree separado, preservando alterações locais anteriores.
- Não foram publicadas imagens de SOB A PEDRA, estudos sem aprovação identificada ou variantes rejeitadas.
