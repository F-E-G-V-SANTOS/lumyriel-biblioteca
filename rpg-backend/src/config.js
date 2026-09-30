export function readConfig(env = process.env) {
  const port = Number(env.PORT || 8787);
  const nodeEnv = env.NODE_ENV || 'development';
  const allowInMemory = env.ALLOW_IN_MEMORY === '1' || nodeEnv === 'test';

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('PORT inválida.');
  }

  if (!env.DATABASE_URL && !allowInMemory) {
    throw new Error('DATABASE_URL é obrigatória fora do modo de teste/desenvolvimento em memória.');
  }

  if (!env.RPG_COOKIE_SECRET || env.RPG_COOKIE_SECRET.length < 32) {
    throw new Error('RPG_COOKIE_SECRET deve ter pelo menos 32 caracteres.');
  }

  return {
    port,
    nodeEnv,
    databaseUrl: env.DATABASE_URL || null,
    allowInMemory,
    cookieSecret: env.RPG_COOKIE_SECRET,
    allowedOrigin: env.ALLOWED_ORIGIN || null
  };
}
