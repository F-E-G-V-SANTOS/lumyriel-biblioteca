import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'lumyriel_rpg_uid';

function sign(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function parseCookies(header = '') {
  return Object.fromEntries(
    header.split(';').map(x => x.trim()).filter(Boolean).map(part => {
      const i = part.indexOf('=');
      return i === -1 ? [part, ''] : [part.slice(0, i), decodeURIComponent(part.slice(i + 1))];
    })
  );
}

function verifySignedUser(value, secret) {
  if (!value || !value.includes('.')) return null;
  const [id, signature] = value.split('.', 2);
  if (!/^[0-9a-f-]{36}$/i.test(id) || !signature) return null;
  const expected = Buffer.from(sign(id, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length) return null;
  return timingSafeEqual(expected, received) ? id : null;
}

export function resolveAnonymousUser(req, secret) {
  const cookies = parseCookies(req.headers.cookie || '');
  const existing = verifySignedUser(cookies[COOKIE_NAME], secret);
  if (existing) return { userId: existing, setCookie: null };

  const userId = randomUUID();
  const value = `${userId}.${sign(userId, secret)}`;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const setCookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure}`;
  return { userId, setCookie };
}
