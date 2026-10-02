# Interface Cinematográfica da Biblioteca Lumyrieliana — Protótipo v0.1

Este diretório é um experimento isolado. Ele **não substitui nem altera a home vigente** da Biblioteca Lumyrieliana.

## Objetivo

Testar uma linguagem de navegação inspirada em interfaces de console e Big Picture sem copiar sua aparência. A interação usa foco grande, carrossel horizontal, fundo responsivo e transições cinematográficas; a materialidade continua sendo própria de Lumyriel: carvão, bronze, papel envelhecido, capas físicas e tipografia editorial.

## Arquitetura

- `index.html` — tela experimental independente;
- `styles.css` — identidade visual e responsividade;
- `app.js` — foco, navegação horizontal, teclado e fundo responsivo.

Os assets são reutilizados do projeto principal por caminhos relativos. Nenhum arquivo atual da home, leitor, Criador ou RPG é substituído por este experimento.

## Escopo do v0.1

- menu superior minimalista;
- painel de destaque;
- carrossel horizontal de obras/ferramentas;
- fundo vivo baseado na seleção;
- foco por mouse, toque e teclado;
- suporte às setas esquerda/direita;
- `prefers-reduced-motion` respeitado;
- sem som automático;
- sem GSAP;
- sem `scroll-snap: mandatory`;
- sem alteração da home vigente.

## Critérios para decidir uma futura adoção

1. identidade de Lumyriel continua reconhecível;
2. navegação fica mais prazerosa sem virar interface futurista genérica;
3. mobile continua legível e natural;
4. foco por teclado funciona;
5. desempenho permanece leve;
6. o leitor de livros continua separado e silencioso;
7. só depois de aprovação visual qualquer técnica poderá ser portada seletivamente para a home principal.

Regra do experimento: **adotar comportamento de console, não copiar a aparência de um console específico**.
