# Backend de submissões do Criador de Personagens

Este diretório contém o endpoint Google Apps Script usado para receber personagens do site e gravá-los no Drive.

## Estado atual

- backend preparado: **v1.1**;
- Criador compatível: **alpha-0.9**;
- honeypot ativo;
- limite de payload: 200.000 caracteres;
- proteção contra submissões idênticas repetidas em janela de 10 minutos;
- submissões continuam sempre **não canônicas** até avaliação autoral.

## Pasta de destino

A pasta já criada no Drive é:

**Lumyriel / Submissões de Personagens**

Folder ID: `1epajEdS3zafAAMYtTTi9TWN1QMNaUgJL`

## Publicação do Apps Script

1. Acesse o Google Apps Script com a mesma conta que possui a pasta Lumyriel.
2. Crie um **Novo projeto**.
3. Apague o conteúdo padrão de `Code.gs` e cole o conteúdo de `apps-script/Code.gs` deste repositório.
4. Em **Configurações do projeto**, ajuste o fuso horário para **America/Porto_Velho**.
5. Clique em **Implantar > Nova implantação**.
6. Tipo: **App da Web**.
7. Executar como: **Eu**.
8. Quem pode acessar: escolha a opção pública disponível para permitir submissões de visitantes.
9. Autorize o acesso ao Google Drive.
10. Copie a URL terminada em `/exec`.

## Teste do serviço

Abra a URL `/exec` no navegador. A resposta esperada é semelhante a:

```json
{"ok":true,"service":"Lumyriel Character Intake","version":"1.1"}
```

Se essa resposta aparecer, o endpoint está publicado.

## Conectar o site

Não é mais necessário editar `character-creator.html`.

Abra apenas:

`assets/site-config.js`

e preencha:

```js
window.LUMYRIEL_CONFIG = {
  characterSubmissionUrl: 'COLE_A_URL_EXEC_AQUI'
};
```

Depois publique essa alteração no site.

## Teste de ponta a ponta

1. Abra o Criador de Personagens.
2. Monte um personagem válido.
3. Vá até **Dossiê**.
4. Clique em **Enviar personagem para Lumyriel**.
5. Confirme que surgiram dois arquivos em **Lumyriel / Submissões de Personagens**:
   - `.json` estruturado;
   - `— Dossie.txt` legível.
6. Envie o mesmo personagem novamente imediatamente e confirme que o backend não cria uma duplicata idêntica.

## Governança

Toda submissão aceita recebe:

- ID `LUM-CHAR-AAAAMMDD-XXXXXX`;
- status `PENDENTE_DE_AVALIACAO`;
- `canonical: false`;
- data de recebimento;
- versão do criador;
- estado de coerência biológica no dossiê e payload completo no JSON.

**Submissão não promove personagem a cânone.** A integração ao universo continua dependente de avaliação autoral.
