# Backend de submissões do Criador de Personagens

Este diretório contém o endpoint Google Apps Script usado para receber personagens do site e gravá-los no Drive.

## Pasta de destino

A pasta já criada no Drive é:

**Lumyriel / Submissões de Personagens**

Folder ID: `1epajEdS3zafAAMYtTTi9TWN1QMNaUgJL`

## Publicação

1. Acesse https://script.google.com/ com a mesma conta que possui a pasta Lumyriel.
2. Crie um **Novo projeto**.
3. Apague o conteúdo padrão de `Code.gs` e cole o conteúdo de `Code.gs` deste diretório.
4. Em **Configurações do projeto**, ajuste o fuso horário para **America/Porto_Velho**.
5. Clique em **Implantar > Nova implantação**.
6. Tipo: **App da Web**.
7. Executar como: **Eu**.
8. Quem pode acessar: escolha a opção pública disponível para permitir submissões de visitantes.
9. Autorize o acesso ao Google Drive.
10. Copie a URL terminada em `/exec`.

Depois, essa URL deve ser inserida na constante `WEB_APP_URL` de `character-creator.html`.

## Governança

Toda submissão recebe:
- ID `LUM-CHAR-AAAAMMDD-XXXXXX`;
- status `PENDENTE_DE_AVALIACAO`;
- `canonical: false`;
- data de recebimento;
- versão do criador.

O endpoint grava dois arquivos por submissão:
- JSON estruturado;
- dossiê TXT legível.

**Submissão não promove personagem a cânone.** A integração ao universo continua dependente de avaliação autoral.
