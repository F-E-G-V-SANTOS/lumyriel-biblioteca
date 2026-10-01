export function readConfig(env = process.env) {
  const port = Number(env.PORT || 8787);
  const nodeEnv = env.NODE_ENV || 'development';
  const allowInMemory = env.ALLOW_IN_MEMORY === '1' || nodeEnv === 'test';
  const narratorEnabled = env.RPG_NARRATOR_ENABLED === '1';
  const openAITimeoutMs = Number(env.OPENAI_TIMEOUT_MS || 60000);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('PORT inválida.');
  }

  if (!env.DATABASE_URL && !allowInMemory) {
    throw new Error('DATABASE_URL é obrigatória fora do modo de teste/desenvolvimento em memória.');
  }

  if (!env.RPG_COOKIE_SECRET || env.RPG_COOKIE_SECRET.length < 32) {
    throw new Error('RPG_COOKIE_SECRET deve ter pelo menos 32 caracteres.');
  }

  if (!Number.isInteger(openAITimeoutMs) || openAITimeoutMs < 1000) {
    throw new Error('OPENAI_TIMEOUT_MS inválido.');
  }

  if (narratorEnabled && !env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY é obrigatória quando RPG_NARRATOR_ENABLED=1.');
  }

  return {
    port,
    nodeEnv,
    databaseUrl: env.DATABASE_URL || null,
    allowInMemory,
    cookieSecret: env.RPG_COOKIE_SECRET,
    allowedOrigin: env.ALLOWED_ORIGIN || null,
    narratorEnabled,
    openAI: {
      apiKey: env.OPENAI_API_KEY || null,
      model: env.OPENAI_MODEL || 'gpt-6-astra',
      baseUrl: env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      timeoutMs: openAITimeoutMs
    }
  };
}
