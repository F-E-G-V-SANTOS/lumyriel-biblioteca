# Preview Visual Modular do Criador de Personagens

Versão vigente: **v0.3**.

## Objetivo

Montar o retrato do personagem em tempo real a partir de peças visuais padronizadas, sem geração de imagem a cada escolha.

## Estado atual

O motor está funcional e ligado ao Criador. O retrato responde às escolhas da ficha, usa uma biblioteca visual fixa e pode gerar um **snapshot SVG autocontido** para o dossiê final e para impressão / salvar em PDF.

A v0.3 também iniciou a transição do manequim técnico para uma linguagem de **ilustração editorial envelhecida**, mais coerente com Lumyriel: paleta menos saturada, textura de pintura, linhas orgânicas, papel envelhecido, sombra e acabamento de manuscrito.

## Regra de arquitetura

Todas as peças usam a mesma prancha lógica de **800 × 1000**. O motor sobrepõe camadas; portanto olhos, cabelo, orelhas, chifres, roupa, traços faciais e acessórios permanecem alinhados entre si.

O pacote usa vetores no arquivo `sprite.svg`. A composição visível pode evoluir artisticamente sem reescrever o motor ou os campos do Criador.

## Ordem das camadas v0.3

1. roupa / busto;
2. orelhas;
3. base de pele / cabeça;
4. olhos esquerdo e direito;
5. estrutura facial;
6. sobrancelhas;
7. nariz;
8. boca;
9. marcas;
10. cabelo;
11. chifres;
12. acessórios que cobrem o rosto.

## Campos conectados

- espécie / povo;
- origem Mutari como base humanoide;
- formato geral de cabeça e rosto;
- cor de pele;
- orelhas e morfologia Selvari;
- chifres Valdrin;
- formato dos olhos;
- cor de cada olho separadamente, incluindo heterocromia;
- sobrancelhas;
- nariz;
- boca;
- cor, estrutura, comprimento e penteado do cabelo;
- proteção / vestimenta;
- itens especiais de rosto, incluindo óculos, lentes opacas, véu, máscara e capuz;
- cicatriz facial;
- estado de coerência biológica;
- snapshot do retrato para dossiê impresso / PDF.

## Exportação

A ficha final não depende mais de copiar referências externas do preview. O motor resolve as peças escolhidas e monta um **SVG independente**, com as formas e o filtro artístico necessários dentro da própria composição. Esse snapshot é inserido no bloco `Retrato` do dossiê antes da impressão.

## Limites deliberados

O foco continua sendo **retrato / busto**. Cauda, corpo inteiro, mãos, armas e equipamento corporal complexo ficam fora desta fase.

Não serão produzidas combinações infinitas. Cada novo lote precisa:

- representar uma escolha real existente na ficha;
- manter o mesmo enquadramento e coordenadas;
- respeitar a biologia e o cânone;
- melhorar variedade ou identificação visual de modo perceptível.

## Próximos gates

1. validar no site se o snapshot aparece no dossiê e no PDF;
2. avaliar se a linguagem visual v0.3 já se aproxima o suficiente da identidade de Lumyriel;
3. refinar primeiro as bases de rosto e cabelos que ainda pareçam genéricos;
4. só então expandir arquiteturas oculares, traços de espécie, roupas e acessórios;
5. corpo parcial só será reavaliado depois de o retrato-base estar estável.

Regra editorial: **primeiro encaixe, identidade visual e coerência; depois variedade**.
