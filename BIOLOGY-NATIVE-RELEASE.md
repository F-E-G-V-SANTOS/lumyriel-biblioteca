# Biologia de Lumyriel — publicação nativa RC1

Estado: pronta para publicação no leitor estático da Biblioteca Lumyrieliana.

## Formato público

- Conteúdo do site: `books/lmy-bio-rc1.dat`.
- Formato: JSON UTF-8 compactado com Gzip e codificado em Base64, carregado e decodificado no navegador.
- O site **não publica nem lê os PDFs** da coleção.
- Os PDFs RC1 permanecem no Google Drive como versão editorial congelada e fonte de QA/conversão.

## Estrutura validada

- 6 volumes.
- 33 partes.
- 138 capítulos.
- Referências e notas de fronteira preservadas por volume.
- Mapas de continuidade preservados por volume.

## QA automatizado

`books/lmy-bio-rc1.qa.json` registra contagens e hashes canônicos dos seis volumes.

O workflow `Check Biology Native Site` valida o `.dat`, a estrutura da publicação e a sintaxe dos scripts de integração antes do merge.
