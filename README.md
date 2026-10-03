# Biblioteca de Lumyriel
https://f-e-g-v-santos.github.io/lumyriel-biblioteca/

Site editorial do universo de **Lumyriel**.

O projeto reúne obras de leitura, arquivo visual, Criador de Personagens e ferramentas derivadas do worldbuilding, preservando uma identidade visual comum inspirada em livros físicos, arquivos e dossiês.

## Estado atual

### Leitura disponível
- **O Filho da Montanha** — Beta 13 · Base v1.19 · 16 capítulos
- **Os Livros dos Tempos** — Beta 1 · Base Editorial v1.0 · 54 livros · 1.074 capítulos
- **Artes Mágicas Lumyrielianas** — Beta · 6 volumes · leitor nativo
- **Matemática e Física de Lumyriel** — RC1 · Primeira Edição · 48 capítulos · 8 apêndices
- **Biologia de Lumyriel** — RC1 · Primeira Edição · 6 volumes · 33 partes · 138 capítulos · 514 páginas-fonte
- **Construindo Mundos — Volume V: Vida Cotidiana** — Edição Final v1.0 · 10 partes · 56 capítulos · 732 subseções · 290 páginas

### Ferramentas
- Criador de Personagens — versão alpha
- memória local de leitura por obra
- exportação de personagem em JSON e TXT
- backend de submissões preparado, mas desacoplado da publicação do site

## Estrutura

```
index.html                  catálogo editorial
reader.html                 leitor principal das obras
biology-reader.html         leitor da coleção Biologia de Lumyriel
construindo-reader.html     leitor da coleção Construindo Mundos
character-creator.html      Criador de Personagens
privacy.html                privacidade e submissões
site-status.json            estado editorial/publicável da versão estática

assets/
  covers/                   capas públicas
  covers-data.js            mapa de capas
  site-config.js            configuração de serviços externos

books/
  lmy-odm-b13.dat           O Filho da Montanha · conteúdo estático codificado
  lmy-olt-b1.dat            Os Livros dos Tempos · conteúdo estático codificado
  lmy-aml-b1.dat            Artes Mágicas Lumyrielianas · conteúdo estático codificado
  lmy-mfl-rc1.dat           manifesto de Matemática e Física de Lumyriel
  lmy-bio-rc1.dat           Biologia de Lumyriel · conteúdo nativo codificado
  lmy-bio-rc1.qa.json       QA estrutural e hashes da conversão de Biologia
  lmy-cm-v05.dat            manifesto segmentado de Construindo Mundos · Volume V
  lmy-cm-v05.00–06.dat      segmentos codificados do Volume V
  lmy-cm-v05.qa.json        QA estrutural da publicação de Construindo Mundos

apps-script/
  Code.gs                   backend de submissões
  DEPLOY.md                 implantação do Apps Script
```

## Biologia de Lumyriel

A edição pública de **Biologia de Lumyriel** não usa PDF no site. Os seis PDFs RC1 permanecem no Drive como fontes editoriais congeladas e referência de QA. A leitura pública usa `books/lmy-bio-rc1.dat`, gerado de forma reproduzível por `tools/build_biology_native.py`.

O builder valida:
- 6 volumes;
- 33 partes;
- 138 capítulos;
- 514 páginas-fonte;
- equivalência textual normalizada entre cada PDF RC1 e o conteúdo convertido;
- hashes SHA-256 canônicos por volume.

O QA estático da publicação é executado por `tools/check_biology_site.py`.

## Construindo Mundos

A coleção **Construindo Mundos** usa um leitor próprio preparado para receber novos volumes sem reconstrução da interface. A publicação inicial é o **Volume V — Vida Cotidiana**, fechado com 10 partes, 56 capítulos, 732 subseções e PDF editorial de 290 páginas.

O conteúdo público é carregado por `books/lmy-cm-v05.dat`, um manifesto gzip+Base64 que referencia sete segmentos codificados (`lmy-cm-v05.00.dat` a `lmy-cm-v05.06.dat`). O leitor recompõe os segmentos no navegador e preserva a navegação por volume, partes e capítulos. O QA da edição está em `books/lmy-cm-v05.qa.json`.

## Documentação do projeto

- `SITE-VISUAL-DIRECTION.md` — autoridade de interface e linguagem visual
- `SITE-RELEASE-CHECKLIST.md` — gates de lançamento
- `SUBMISSION-POLICY-DECISIONS.md` — decisões autorais pendentes para contribuições
- `SITE-PUBLISHING.md` — publicação do site

## Princípios da interface

**Home = catálogo editorial**

**Leitor = sumário + fólio**

**Criador = dossiê**

A arte conduz e a interface serve. Elementos decorativos não podem criar lore.

## Executar localmente

O site não exige processo de build para leitura do conteúdo já gerado.

Na raiz do repositório:

```bash
python3 -m http.server 8000
```

Depois abra:

```
http://localhost:8000/
```

É preferível usar um servidor local em vez de abrir os HTMLs diretamente com `file://`, porque o leitor carrega os arquivos estáticos codificados com `fetch()` e os decodifica no navegador.

## Serviços externos

O site principal funciona sem backend.

O Criador só habilita submissão direta quando `assets/site-config.js` contém uma URL de Apps Script válida **e** `characterSubmissionEnabled: true`.

Enquanto o canal público de contribuições não tiver regras autorais fechadas, a configuração deve permanecer vazia.

## Cânone

O site não é autoridade canônica autônoma.

As obras e ferramentas publicadas devem seguir as autoridades vigentes do projeto Lumyriel. Uma submissão de personagem nunca se torna canônica automaticamente.

## Proteção de leitura estática

O leitor usa barreiras de cópia casual:
- seleção de texto desativada em toda a interface de leitura;
- eventos de copiar, recortar, arrastar e menu de contexto bloqueados;
- atalhos comuns de cópia, impressão, salvar, selecionar tudo e ver código-fonte interceptados;
- atalhos mais óbvios de DevTools recebem bloqueio de conveniência;
- impressão do conteúdo bloqueada por CSS;
- as páginas de leitura usam `noindex,nofollow`;
- os manuscritos da branch atual não ficam expostos como JSON legível: são publicados em arquivos estáticos codificados `.dat`.

Essas medidas **não são DRM**. Como a Biblioteca continua hospedada como site estático público, alguém tecnicamente determinado ainda pode recuperar o conteúdo entregue ao navegador.

Importante: versões antigas dos JSONs continuam existindo no histórico público do Git porque elas já haviam sido publicadas. Remover isso exigiria reescrita destrutiva do histórico, operação que não é feita automaticamente.

O modo atual permanece **estático**. `readerContentBaseUrl` existe apenas como ponto de extensão futuro e fica vazio; nenhum servidor privado está ativo ou é necessário hoje.
