# Lumyriel Site — Checkpoint

Estado consolidado em 01/10/2026 após atualização das capas, do Criador de Personagens e da migração nativa de Artes Mágicas Lumyrielianas.

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

## Criador de Personagens

Bloco estrutural fechado nesta rodada:

- matriz biológica Mutari sem estados de compatibilidade em aberto;
- recomendações anatômicas por espécie/configuração;
- observações para combinações contraditórias de jeito de falar;
- ampliação de marcas, cultura, repertório linguístico, códigos sociais, profissões, passado, atuação, especializações, limitações, objetivos, valores e linha moral;
- três itens especiais e ampliação de armas/ferramentas/proteções;
- itens para ocultar olhos raros;
- três modos de nome: naturalizar nome real, gerar nome diretamente lumyrieliano e usar nome real sem conversão;
- geração de nome condicionada à escolha de gênero;
- dossiê com impressão / salvar em PDF;
- mensagens técnicas de submissão ocultas ao usuário final;
- capa oficial do Criador integrada à página e ao catálogo.

## Projetos no site

- Lumyriel RPG: capa oficial integrada e seção de apresentação mantida.
- Construindo Mundos: incluído como projeto editorial em desenvolvimento.
- Biologia Lumyrieliana e Matemática Lumyrieliana: capas oficiais disponíveis.

## Arquivo Visual

Estado público atual: **12 registros**.

A arte `Viajante sob guarda-chuva` foi removida da galeria pública, mantendo o arquivo preservado fora do índice.

Permanecem em `assets/gallery/revisao-canonica/`:

1. `oreo-nethra-das-sombras.webp`
2. `pulseira-do-peregrino.webp`
3. `arte-lumyriel-revisao-canonica.webp` — prancha de criaturas

## Próxima frente

Retomar a revisão visual interrompida:

1. corrigir Óreo preservando a arte-base e ajustando dados/texto ao cânone;
2. corrigir Pulseira do Peregrino removendo funções inventadas e preservando sua função documental/acadêmica vigente;
3. recuperar da prancha de criaturas somente os elementos individualmente compatíveis e não publicar a prancha inteira sem revisão;
4. concluir a auditoria dos lotes enviados em RAR: Brasões, Olhos, Armas e Outros;
5. classificar cada imagem como `APROVAR`, `CORRIGIR` ou `NÃO PUBLICAR COMO CÂNONE` antes de acrescentá-la à galeria.

Regra de preservação: não sobrescrever originais durante a revisão; manter fonte e versão corrigida separadas até aprovação autoral.
