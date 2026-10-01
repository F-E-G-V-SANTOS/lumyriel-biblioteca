# Direção Visual do Site de Lumyriel

## Estado
Direção aprovada em 01/10/2026 para a Biblioteca de Lumyriel.

**Autoridade visual confirmada:** Bíblia Visual de Lumyriel v1.13 — REC-WPN-02 · Armamento de Elite.

Frase-mãe preservada da autoridade visual:

> “Não parecer realista como fotografia. Parecer real como mundo.”

Esta diretriz governa a interface do site. Ela não cria cânone de mundo e não substitui a Bíblia Visual vigente do projeto. Quando houver dúvida de lore, a autoridade canônica continua sendo consultada antes de qualquer elemento visual específico ser introduzido.

## Referência visual aprovada
A referência principal do site é o conjunto de capas aprovado para:

- **O Filho da Montanha**
- **Os Livros dos Tempos**
- **Livro das Artes Mágicas**

A interface deve parecer pertencer à mesma coleção física desses livros.

## Linguagem visual

### Deve transmitir
- livro antigo real;
- objeto editorial físico;
- papel envelhecido;
- carvão, madeira escura, couro, tecido e metal gasto;
- pintura narrativa manual e texturizada;
- pigmento quebrado, pincel seco e detalhe seletivo;
- assimetria controlada;
- sobriedade;
- sensação de arquivo, biblioteca e memória histórica.

### Paleta-base
- carvão e preto quente;
- marrons muito escuros;
- papel envelhecido e marfim;
- bronze/ouro fosco e gasto;
- cores pictóricas apenas quando pertencem à arte.

Bronze não deve parecer ouro digital luminoso.

## Tipografia
Priorizar linguagem editorial clássica.

- títulos: serifados;
- textos longos: serifados quando apropriado à leitura;
- interface funcional: sans-serif discreta;
- evitar estética de painel tecnológico;
- evitar títulos com tratamento de pôster de fantasia como padrão automático.

## Forma da interface
O site não deve parecer um aplicativo SaaS com skin medieval.

Preferir:
- bordas finas;
- cantos quase retos;
- divisores editoriais;
- fichas, fólios, páginas, lombadas e arquivos;
- áreas de respiro;
- hierarquia tipográfica.

Evitar:
- excesso de cards;
- pílulas decorativas;
- grandes cantos arredondados;
- glassmorphism;
- neon;
- glow mágico;
- interfaces azuis genéricas de fantasia;
- ornamentação gratuita.

## Regra canônica de decoração

**DECORAÇÃO NÃO PODE CRIAR LORE.**

Não inserir apenas por estética:
- brasões;
- bandeiras;
- runas;
- alfabetos;
- selos;
- símbolos religiosos;
- glifos;
- constelações;
- instrumentos;
- arquitetura;
- criaturas;
- armas;
- mapas;
- corpos celestes.

Um desses elementos só pode aparecer quando for confirmado como adequado pela autoridade vigente do projeto.

## Marca de Lumyriel
Não inventar sigilo ou logotipo diegético para Lumyriel.

O antigo círculo com a letra **L** não é identidade canônica e não deve retornar como símbolo do mundo.

A palavra **LUMYRIEL** pode funcionar como assinatura editorial tipográfica.

## Capas
Capas devem parecer livros reais e reutilizáveis.

Não imprimir na arte:
- Beta 1;
- Beta 13;
- versão alpha;
- códigos de desenvolvimento;
- estados editoriais.

Essas informações pertencem à interface ao redor da capa.

Uma capa planejada, ainda inexistente, não deve fingir ser arte final. Deve aparecer como **projeto futuro / fólio provisório** até existir direção própria.

## Regras específicas das obras

### O Filho da Montanha
Direção simbólica e misteriosa.

- montanha como presença, origem e destino;
- não resumir a trama;
- não colocar Helior automaticamente;
- não colocar forja apenas porque ela existe no romance;
- não explicar visualmente aquilo que o leitor deve descobrir.

### Os Livros dos Tempos
Transmitir antiguidade, escala histórica e memória.

- não inventar céu ou astronomia;
- não criar cidade monumental apenas para preencher composição;
- paisagem, arquitetura ou objeto específico devem ser canonicamente sustentados.

### Livro das Artes Mágicas
Transmitir estudo e conhecimento acumulado.

- aparência de obra didática real;
- evitar “biblioteca mágica premium”;
- não adicionar cristal, astrolábio, runas ou filigranas sem base canônica.

## Leitor
O leitor deve parecer uma edição material preservada, sem sacrificar legibilidade.

- papel envelhecido;
- tinta escura;
- margens generosas;
- navegação subordinada ao texto;
- controles discretos;
- capa da obra presente como referência editorial.

## Criador de Personagens
O Criador deve parecer um **dossiê/ficha de arquivo de Lumyriel**, não um livro narrativo e não um painel de videogame.

- índice escuro;
- formulário em papel;
- campos funcionais claros;
- identidade editorial comum ao restante do site.

## Regra de continuidade

**A ARTE CONDUZ. A INTERFACE SERVE.**

Antes de adicionar um elemento visual, testar:

1. Parece pertencer fisicamente à coleção aprovada?
2. Está ajudando a leitura ou apenas decorando?
3. Introduz algum fato de mundo não confirmado?
4. Parece manual/editorial ou parece UI genérica de fantasia?
5. Continuaria válido se a versão do manuscrito mudasse amanhã?

Se falhar em 2, 3 ou 4, não entra.

## Implementação atual
A biblioteca, o leitor e o Criador de Personagens já adotam esta linguagem-base.

Os estados editoriais permanecem fora das capas.

As três capas aprovadas são ativos reais do site em `assets/covers/`, em versões otimizadas para exibição. A arte não recebe títulos, sigilos ou a assinatura `LUMYRIEL` sobrepostos pela interface: tudo o que aparece impresso na capa pertence ao próprio arquivo de arte.

No destaque inicial, as três obras aparecem como coleção física em profundidade, com **O Filho da Montanha** em primeiro plano. O leitor reutiliza a capa correspondente como referência editorial na navegação lateral.

Capas futuras sem arte aprovada permanecem deliberadamente como fólio provisório, sem fingir uma ilustração final.

A hierarquia da página inicial também segue a lógica editorial: a experiência principal apresenta primeiro as obras de Lumyriel. As matrizes criativas e a origem acadêmica permanecem públicas, mas aparecem depois da biblioteca, da leitura e do arquivo visual para não interromper a imersão inicial.

A estante principal reúne apenas as três obras com identidade visual aprovada. Projetos planejados sem arte final aparecem em uma prateleira secundária de **Em preparação**, mantendo clara a diferença entre coleção existente e projeto futuro.

A implementação deve preservar navegação por teclado, foco visível e preferência do sistema por redução de movimento; a atmosfera física não justifica perda de acessibilidade.

## Arquivo visual
O Arquivo Visual permanece **em desenvolvimento**. As capas editoriais pertencem à Biblioteca e não são usadas para preencher esta seção.

- a seção pública não exibe imagens enquanto o acervo estiver em curadoria;
- arte conceitual, cartografia e documentos permanecem categorias distintas;
- um mapa técnico não vira “arte” apenas para preencher galeria;
- cada coleção visual precisa ter contexto e função editorial definidos antes de ser publicada.

## Gramática editorial da interface
A interface principal passa a seguir três metáforas físicas distintas, mas compatíveis:

- **Home = catálogo editorial:** as capas aparecem como obras, não como cards de aplicativo. Filtros funcionam como abas de catálogo e estados editoriais ficam tipograficamente subordinados às capas.
- **Leitor = sumário + fólio:** capítulos são apresentados como índice editorial; paginação e progresso funcionam como marcações discretas de página, não como widgets flutuantes.
- **Criador = dossiê:** as nove etapas funcionam como índice documental, não como wizard gamificado.

Evitar reintroduzir:
- contêineres escuros ao redor de cada livro apenas por organização;
- pílulas decorativas para estado;
- blocos com bordas e sombras onde divisores editoriais resolvem;
- círculos de progresso típicos de onboarding;
- excesso de botões equivalentes na mesma hierarquia.

A capa, o texto e a hierarquia devem resolver a composição antes de qualquer componente visual extra.

## Primeira dobra
No desktop, a abertura deve caber funcionalmente na primeira viewport: título, texto introdutório, ações principais e composição dos livros precisam estar visíveis sem exigir rolagem para descobrir os CTAs.

- a escala do título pode responder também à altura da viewport;
- telas/notebooks com menor altura útil recebem composição mais compacta;
- reduzir espaçamento é preferível a esconder ações abaixo da dobra;
- a presença editorial do hero deve ser preservada, mas não às custas da navegação inicial.

## Mobile
Em telas pequenas, a composição deve simplificar sem abandonar a identidade física.

- as três capas do destaque continuam perceptíveis como coleção;
- controles não podem esmagar a arte;
- a navegação principal usa **Índice** como linguagem editorial, em vez de simplesmente desaparecer;
- leitor e criador podem abreviar a marca de cabeçalho para **Lumyriel** quando o espaço exigir;
- o índice de etapas do Criador permanece acessível horizontalmente e acompanha a etapa ativa;
- o leitor usa fundo de fechamento atrás da lista de capítulos para deixar claro quando a navegação lateral está aberta.

---

**Regra final:** o visitante deve reconhecer a atmosfera de Lumyriel antes de precisar ler uma explicação sobre o que Lumyriel é.

## Continuidade de leitura
A Biblioteca pode guardar no navegador o ponto de leitura de cada obra.

- a memória é local ao navegador;
- cada obra preserva seu próprio capítulo e posição aproximada;
- a abertura principal pode oferecer **Continuar leitura** usando a última obra lida;
- entrar por uma capa específica retoma aquela obra, não necessariamente a última do acervo;
- essa função é de conveniência e não cria conta, perfil ou sincronização entre dispositivos.

A memória de leitura não deve dominar visualmente a home: ela aparece como informação editorial discreta.

## Resolução das capas
Os ativos públicos vigentes em `assets/covers/` estão otimizados em **300×540 px**.

Enquanto esses arquivos forem os ativos publicados:
- não ampliar a capa acima de aproximadamente 300 px de largura nas galerias;
- hero e biblioteca permanecem dentro da faixa segura;
- o Arquivo Visual deve respeitar a largura nativa para evitar perda perceptível de nitidez.

As fontes aprovadas existem em resolução maior e podem substituir esses ativos futuramente sem alterar layout, identidade ou conteúdo.

