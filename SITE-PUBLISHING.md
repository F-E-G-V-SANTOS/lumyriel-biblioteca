# Publicação do Site — Biblioteca de Lumyriel

## Estratégia recomendada

Como o site é estático e usa caminhos relativos, a opção mais simples é **GitHub Pages publicado a partir da branch `main` e da raiz do repositório**.

Não é necessário workflow de build.

## Ativar GitHub Pages

No GitHub:

1. abra o repositório `F-E-G-V-SANTOS/lumyriel-biblioteca`;
2. entre em **Settings**;
3. abra **Pages**;
4. em **Build and deployment**, escolha **Deploy from a branch**;
5. selecione:
   - branch: `main`
   - pasta: `/ (root)`
6. salve;
7. aguarde a publicação;
8. copie a URL pública exibida pelo próprio GitHub.

A URL não deve ser presumida no código antes de a publicação ser confirmada.

## Teste depois da publicação

Abrir diretamente:

- `index.html`
- `reader.html?book=filho&ch=0`
- `reader.html?book=tempos&note=1`
- `character-creator.html`
- `privacy.html`
- `site-status.json`

Abra também `site-status.json` e confirme que a edição publicada corresponde ao estado esperado.

Confirmar também que estes ativos respondem:

- `assets/covers/o-filho-da-montanha.webp`
- `assets/covers/os-livros-dos-tempos.webp`
- `assets/covers/livro-das-artes-magicas.webp`
- `books/lmy-odm-b13.dat`
- `books/lmy-olt-b1.dat`

## Teste funcional

### Biblioteca
- filtros funcionam;
- links do índice móvel funcionam;
- capas não recebem texto sobreposto;
- projetos planejados ficam separados da coleção principal.

### Leitor
- Livro 1 abre com 16 capítulos;
- Livros dos Tempos abre com 7 coleções e 54 livros;
- troca de capítulo funciona;
- memória de leitura funciona após fechar e reabrir;
- `Continuar leitura` retoma a obra correta.

### Criador
- todas as 9 etapas abrem;
- rascunho local é preservado;
- JSON e TXT são exportados;
- botão de submissão permanece desabilitado enquanto `characterSubmissionUrl` estiver vazio.

## Depois que a URL pública estiver confirmada

Atualizar metadados com a URL real:

- `canonical`;
- `og:url`;
- decidir `og:image`;
- URLs absolutas para imagem social;
- `sitemap.xml`, se indexação for desejada;
- `robots.txt`, conforme a política de indexação.

## Domínio próprio

Se Lumyriel receber domínio próprio no futuro:

1. configurar o domínio no provedor;
2. configurar Custom domain no GitHub Pages;
3. aguardar HTTPS ativo;
4. usar o domínio definitivo nos metadados;
5. não manter URLs antigas como autoridade canônica de compartilhamento.

## Submissões de personagens

A publicação do site **não exige** publicar o backend do Criador.

Para habilitar submissões:

1. concluir `SUBMISSION-POLICY-DECISIONS.md`;
2. publicar as regras públicas;
3. implantar `apps-script/Code.gs`;
4. testar o endpoint;
5. colocar a URL `/exec` em `assets/site-config.js`;
6. testar o endpoint com `characterSubmissionEnabled: false`;
7. executar o teste ponta a ponta controlado;
8. somente depois das regras públicas, alterar `characterSubmissionEnabled` para `true`.

Até lá:

```js
window.LUMYRIEL_CONFIG = {
  characterSubmissionUrl: '',
  characterSubmissionEnabled: false
};
```

deve permanecer vazio.

## Gate de publicação

A publicação técnica não substitui QA visual em dispositivos reais.

O Gate A só fecha depois de:
- URL pública ativa;
- teste real em celular;
- teste real em desktop;
- navegação e leitura sem bloqueios.


## Indexação

O estado atual do repositório **não bloqueia mecanismos de busca**: não existe `robots.txt` e as páginas principais não usam `noindex`.

Antes de ativar o Pages, decidir entre:

### Alpha indexável
Não adicionar bloqueio. Depois da URL pública:
- criar `sitemap.xml`;
- definir canonical;
- completar `og:url` e imagem social.

### Alpha não indexável
Adicionar temporariamente:

```html
<meta name="robots" content="noindex,nofollow">
```

às páginas públicas principais.

Não publicar um `robots.txt` como substituto de `noindex` se a intenção for impedir indexação: robots controla rastreamento, não garante remoção de URLs do índice.

A decisão deve ser deliberada antes do Gate A.


## Proteção do leitor estático

A Alpha mantém o conteúdo no próprio GitHub Pages. Para reduzir cópia casual, o leitor bloqueia seleção, copiar/recortar, menu de contexto, arraste, impressão e alguns atalhos comuns de inspeção.

Os manuscritos atuais são publicados como arquivos `.dat` codificados e decodificados somente pelo leitor. Isso remove a exposição trivial de JSON legível na branch atual, mas continua sendo ofuscação, não criptografia segura.

Limite técnico: um site estático público não consegue impedir de forma absoluta que o conteúdo recebido pelo navegador seja recuperado. Além disso, JSONs já publicados anteriormente continuam presentes no histórico antigo do Git até que uma reescrita deliberada de histórico seja feita.

A configuração já reserva:

```js
readerContentBaseUrl: ''
```

Se um dia a arquitetura mudar, o leitor pode consumir o mesmo formato de dados a partir de outra origem. **Nenhum servidor privado está ativo nem é necessário hoje.**
