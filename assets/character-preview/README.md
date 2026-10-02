# Preview Visual Modular do Criador de Personagens

Versão inicial: v0.1.

## Objetivo

Montar o retrato do personagem em tempo real a partir de peças visuais padronizadas, sem geração de imagem a cada escolha.

## Regra de arquitetura

Todas as peças usam a mesma prancha lógica de 800 × 1000. O motor sobrepõe camadas; portanto olhos, cabelo, orelhas, chifres, roupa e acessórios permanecem alinhados entre si.

O pacote inicial usa vetores no arquivo `sprite.svg`. Essa solução serve como base técnica e pode receber arte final mais detalhada depois sem alterar a lógica do Criador.

## Ordem das camadas

1. roupa / busto;
2. orelhas;
3. base de pele / cabeça;
4. olhos esquerdo e direito;
5. linhas faciais;
6. marcas;
7. cabelo;
8. chifres;
9. acessórios que cobrem o rosto.

## Campos já conectados na v0.1

- espécie / povo;
- origem Mutari como base humanoide;
- formato geral de cabeça/rosto;
- cor de pele;
- orelhas e morfologia Selvari;
- chifres Valdrin;
- formato dos olhos;
- cor de cada olho separadamente, incluindo heterocromia;
- cor, estrutura/comprimento e penteado do cabelo;
- proteção / vestimenta;
- itens especiais de rosto, incluindo óculos, lentes opacas, véu, máscara e capuz;
- cicatriz facial;
- estado de coerência biológica.

## Limites deliberados da v0.1

O primeiro gate é validar alinhamento, leitura visual e resposta em tempo real. Cauda, corpo inteiro, mãos, armas e detalhes finos de espécie ficam para lotes posteriores. Não serão produzidas combinações infinitas: cada lote visual precisa ter função clara e compatibilidade definida.

## Próximos lotes

- Lote A: bases anatômicas adicionais e variações de rosto;
- Lote B: olhos e arquiteturas oculares;
- Lote C: cabelos e penteados;
- Lote D: orelhas, chifres e particularidades de espécie;
- Lote E: roupas e acessórios;
- Lote F: marcas, cicatrizes e elementos raros;
- Lote G: integração do retrato no dossiê impresso/PDF.

Regra editorial: `primeiro encaixe e coerência; depois variedade`.
