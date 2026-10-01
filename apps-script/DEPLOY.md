# Backend de recebimento da Biblioteca Lumyrieliana

Este diretório contém o endpoint Google Apps Script usado pelo site para dois fluxos independentes:

- **Criador de Personagens** — candidaturas não canônicas;
- **Feedback Editorial** — comentários de leitores sobre obras, narrativa e experiência do site.

## Estado atual

- backend preparado: **v1.2**;
- Criador compatível: **alpha-0.9**;
- formulário de feedback: **v1.0**;
- honeypot ativo;
- limite de payload: 200.000 caracteres;
- proteção contra submissões idênticas repetidas em janela de 10 minutos;
- personagens continuam sempre **não canônicos** até avaliação autoral;
- feedback não altera cânone nem decisões editoriais automaticamente.

## Pastas de destino

### Personagens

**Lumyriel / Submissões de Personagens**

Folder ID: `1epajEdS3zafAAMYtTTi9TWN1QMNaUgJL`

Cada envio gera:
- JSON estruturado;
- dossiê TXT legível.

### Feedback de leitores

**Lumyriel / Feedback de Leitores**

Folder ID: `10HRr9GxboFhhl2M7WrcxQlm0nvdYpG5W`

Cada feedback gera:
- JSON estruturado;
- TXT legível com contexto, marcações e respostas abertas.

## Publicação do Apps Script

1. Acesse o Google Apps Script com a mesma conta que possui a pasta Lumyriel.
2. Crie um **Novo projeto** ou abra o projeto já usado pelo site.
3. Substitua o conteúdo de `Code.gs` pelo conteúdo de `apps-script/Code.gs` deste repositório.
4. Em **Configurações do projeto**, ajuste o fuso horário para **America/Porto_Velho**.
5. Clique em **Implantar > Nova implantação** ou edite a implantação existente.
6. Tipo: **App da Web**.
7. Executar como: **Eu**.
8. Quem pode acessar: escolha a opção pública disponível para permitir feedback de visitantes.
9. Autorize o acesso ao Google Drive.
10. Copie a URL terminada em `/exec`.

## Teste do serviço

Abra a URL `/exec` no navegador. A resposta esperada é semelhante a:

```json
{"ok":true,"service":"Lumyriel Intake","version":"1.2","accepts":["character_submission","reader_feedback"]}
```

## Conectar o site

Edite somente:

`assets/site-config.js`

Exemplo:

```js
window.LUMYRIEL_CONFIG = {
  characterSubmissionUrl: 'COLE_A_URL_EXEC_AQUI',
  characterSubmissionEnabled: false,

  feedbackSubmissionUrl: 'COLE_A_MESMA_URL_EXEC_AQUI',
  feedbackSubmissionEnabled: true,

  readerContentBaseUrl: '',
  readerProtectionEnabled: true
};
```

Os dois fluxos podem compartilhar a mesma URL porque o backend distingue o tipo de payload.

### Abertura independente

- `characterSubmissionEnabled: false` mantém o envio de personagens fechado.
- `feedbackSubmissionEnabled: true` abre apenas o feedback editorial.

Isso permite receber comentários de leitores sem abrir as regras de contribuição de personagens.

## Teste do feedback

1. Abra `feedback.html`.
2. Marque pelo menos uma opção ou escreva um comentário.
3. Clique em **Enviar feedback**.
4. Confirme que surgiram dois arquivos em **Lumyriel / Feedback de Leitores**:
   - `.json`;
   - `— Feedback.txt`.
5. Envie exatamente o mesmo conteúdo novamente imediatamente e confirme que o backend evita duplicata recente.

## Governança

### Personagens

Cada candidatura recebe:
- ID `LUM-CHAR-AAAAMMDD-XXXXXX`;
- status `PENDENTE_DE_AVALIACAO`;
- `canonical: false`;
- data de recebimento;
- versão do Criador.

### Feedback

Cada comentário recebe:
- ID `LUM-FDBK-AAAAMMDD-XXXXXX`;
- status `RECEBIDO`;
- obra/área comentada;
- marcações rápidas;
- campos dissertativos;
- nome/e-mail somente quando o leitor optar por fornecê-los.

Feedback é insumo editorial. Uma opinião individual não altera automaticamente texto, cânone, personagens ou regras do mundo.
