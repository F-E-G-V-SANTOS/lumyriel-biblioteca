# Biblioteca de Lumyriel

Site editorial do universo de **Lumyriel**.

O projeto reúne obras de leitura, arquivo visual, Criador de Personagens e ferramentas derivadas do worldbuilding, preservando uma identidade visual comum inspirada em livros físicos, arquivos e dossiês.

## Estado atual

### Leitura disponível
- **O Filho da Montanha** — Beta 13 · Base v1.19 · 16 capítulos
- **Os Livros dos Tempos** — Beta 1 · Base Editorial v1.0 · 54 livros · 1.074 capítulos

### Em desenvolvimento
- **Livro das Artes Mágicas** — Arquitetura v0.4 · Volumes I–IV em desenvolvimento

### Ferramentas
- Criador de Personagens — versão alpha
- memória local de leitura por obra
- exportação de personagem em JSON e TXT
- backend de submissões preparado, mas desacoplado da publicação do site

## Estrutura

```
index.html                  catálogo editorial
reader.html                 leitor das obras
character-creator.html      Criador de Personagens
privacy.html                privacidade e submissões
site-status.json              estado editorial/publicável da versão estática

assets/
  covers/                   capas públicas
  covers-data.js            mapa de capas
  site-config.js            configuração de serviços externos

books/
  o-filho-da-montanha.json
  os-livros-dos-tempos.json

apps-script/
  Code.gs                   backend de submissões
  DEPLOY.md                 implantação do Apps Script
```

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

O site não exige processo de build.

Na raiz do repositório:

```bash
python3 -m http.server 8000
```

Depois abra:

```
http://localhost:8000/
```

É preferível usar um servidor local em vez de abrir os HTMLs diretamente com `file://`, porque o leitor carrega os livros JSON com `fetch()`.

## Serviços externos

O site principal funciona sem backend.

O Criador só habilita submissão direta quando `assets/site-config.js` contém uma URL de Apps Script válida **e** `characterSubmissionEnabled: true`.

Enquanto o canal público de contribuições não tiver regras autorais fechadas, a configuração deve permanecer vazia.

## Cânone

O site não é autoridade canônica autônoma.

As obras e ferramentas publicadas devem seguir as autoridades vigentes do projeto Lumyriel. Uma submissão de personagem nunca se torna canônica automaticamente.
