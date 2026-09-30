import { assertRpg } from './errors.js';

function webCrypto() {
  const cryptoApi = globalThis.crypto;
  assertRpg(
    cryptoApi && typeof cryptoApi.getRandomValues === 'function' && typeof cryptoApi.randomUUID === 'function',
    'SECURE_RANDOM_UNAVAILABLE',
    'O runtime precisa fornecer Web Crypto seguro.'
  );
  return cryptoApi;
}

export function secureRandomUUID() {
  return webCrypto().randomUUID();
}

export function secureRandomIntInclusive(min, max) {
  assertRpg(
    Number.isInteger(min) && Number.isInteger(max) && min <= max,
    'INVALID_RANDOM_RANGE',
    'Intervalo aleatório inválido.'
  );

  const range = max - min + 1;
  assertRpg(range > 0 && range <= 0x100000000, 'INVALID_RANDOM_RANGE', 'Intervalo aleatório fora do limite suportado.');

  const cryptoApi = webCrypto();
  const maxUint32PlusOne = 0x100000000;
  const limit = Math.floor(maxUint32PlusOne / range) * range;
  const buffer = new Uint32Array(1);

  let value;
  do {
    cryptoApi.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);

  return min + (value % range);
}
