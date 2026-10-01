import http from 'node:http';
import { readConfig } from './config.js';
import { createHandler } from './app.js';
import { MemoryRepository, PostgresRepository } from './repository.js';
import { NarratorService } from './narrator.js';
import { OpenAIResponsesClient } from './openai-responses.js';

const config = readConfig();
const repository = config.databaseUrl
  ? await PostgresRepository.create(config.databaseUrl)
  : new MemoryRepository();

await repository.init();

const narrator = config.narratorEnabled
  ? new NarratorService({
      repository,
      responsesClient: new OpenAIResponsesClient(config.openAI)
    })
  : null;

const server = http.createServer(createHandler({ repository, config, narrator }));

server.listen(config.port, () => {
  console.log(`Lumyriel RPG backend ouvindo em http://127.0.0.1:${config.port} | narrador=${Boolean(narrator)}`);
});

async function shutdown(signal) {
  console.log(`${signal}: encerrando Lumyriel RPG backend...`);
  server.close(async () => {
    await repository.close();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
