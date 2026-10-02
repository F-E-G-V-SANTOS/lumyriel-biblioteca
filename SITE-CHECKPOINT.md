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
