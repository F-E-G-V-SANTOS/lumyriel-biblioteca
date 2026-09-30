export class RpgError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = 'RpgError';
    this.code = code;
    this.details = details;
  }
}

export function assertRpg(condition, code, message, details = null) {
  if (!condition) throw new RpgError(code, message, details);
}
