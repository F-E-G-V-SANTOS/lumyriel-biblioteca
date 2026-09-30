const DIFFICULTIES = new Set(['historia', 'facil', 'medio', 'dificil', 'lumyriel']);
const DURATIONS = new Set(['30', '60', '90', '120', '240', 'continua']);
const REGIONS = new Set(['auto', 'selected']);
const ADVENTURE_PREFERENCES = new Set([
  'auto', 'social', 'investigacao', 'exploracao', 'viagem', 'sobrevivencia', 'combate', 'mista',
]);
const ATTRIBUTES = ['potencia', 'agilidade', 'vigor', 'intelecto', 'percepcao', 'presenca'];

export class ValidationError extends Error {
  constructor(message, code = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.status = 400;
  }
}

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(`${label} must be an object`);
  }
}

function assertString(value, label, { nullable = false } = {}) {
  if (nullable && value === null) return;
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`${label} must be a non-empty string`);
  }
}

export function validateCharacterImport(body) {
  assertObject(body, 'body');
  assertObject(body.creator_payload, 'creator_payload');
  assertObject(body.mechanics, 'mechanics');

  const attrs = body.mechanics.attributes;
  assertObject(attrs, 'mechanics.attributes');

  let total = 0;
  for (const key of ATTRIBUTES) {
    const value = attrs[key];
    if (!Number.isInteger(value) || value < 1 || value > 3) {
      throw new ValidationError(`mechanics.attributes.${key} must be an integer from 1 to 3`);
    }
    total += value;
  }
  if (total !== 13) {
    throw new ValidationError('initial attributes must total 13 (six base 1 values + 7 distributed points)');
  }

  const competencies = body.mechanics.competencies;
  if (!Array.isArray(competencies)) {
    throw new ValidationError('mechanics.competencies must be an array');
  }
  const ids = new Set();
  let level2 = 0;
  let level1 = 0;
  let specialties = 0;
  for (const item of competencies) {
    assertObject(item, 'competency');
    assertString(item.id, 'competency.id');
    if (ids.has(item.id)) throw new ValidationError(`duplicate competency: ${item.id}`);
    ids.add(item.id);
    if (![1, 2].includes(item.level)) {
      throw new ValidationError(`competency ${item.id} must start at level 1 or 2`);
    }
    if (item.level === 2) level2 += 1;
    if (item.level === 1) level1 += 1;
    const specs = item.specialties ?? [];
    if (!Array.isArray(specs)) throw new ValidationError(
`competency ${item.id}.specialties must be an array`);
    for (const spec of specs) {
      assertObject(spec, 'specialty');
      assertString(spec.id, 'specialty.id');
      if (spec.level !== 1) throw new ValidationError(`specialty ${spec.id} must start at level 1`);
      specialties += 1;
    }
  }
  if (level2 !== 2 || level1 !== 4 || specialties !== 2) {
    throw new ValidationError('initial competencies require exactly 2 at level 2, 4 at level 1, and 2 specialties at level 1');
  }

  const mana = body.mechanics.resources?.mana;
  const aura = body.mechanics.resources?.aura;
  for (const [name, resource] of [['mana', mana], ['aura', aura]]) {
    if (resource === undefined) continue;
    assertObject(resource, `mechanics.resources.${name}`);
    if (typeof resource.applicable !== 'boolean') {
      throw new ValidationError(`mechanics.resources.${name}.applicable must be boolean`);
    }
    if (resource.applicable) {
      if (!Number.isInteger(resource.maximum) || resource.maximum < 0) {
        throw new ValidationError(`mechanics.resources.${name}.maximum must be a non-negative integer when applicable`);
      }
    }
  }

  return body;
}

export function validateCampaignInit(body) {
  assertObject(body, 'body');
  assertString(body.character_id, 'character_id');
  if (!Number.isInteger(body.character_revision) || body.character_revision < 1) {
    throw new ValidationError('character_revision must be a positive integer');
  }
  if (!DIFFICULTIES.has(body.difficulty_mode)) throw new ValidationError('invalid difficulty_mode');
  if (!DURATIONS.has(body.duration_mode)) throw new ValidationError('invalid duration_mode');
  if (!REGIONS.has(body.region_selection))›ÝÈ™]È˜[Y][Û‘\œ›ÜŠ	Ú[˜[Y™YÚ[Û—ÜÙ[XÝ[Û‰ÊNÂˆYˆ
›ÙKœ™YÚ[Û—ÜÙ[XÝ[ÛˆOOH	ÜÙ[XÝY	ÊH\ÜÙ\Ýš[™Ê›ÙKœ™YÚ[Û—ÚY	Ü™YÚ[Û—ÚY	ÊNÂˆYˆ
›ÙKœ™YÚ[Û—ÜÙ[XÝ[ÛˆOOH	Ø]]ÉÈ	‰ˆ›ÙKœ™YÚ[Û—ÚYOOH[
HÂˆ›ÝÈ™]È˜[Y][Û‘\œ›ÜŠ	Ü™YÚ[Û—ÚY]\Ý™H[Ú[ˆ™YÚ[Û—ÜÙ[XÝ[Ûˆ\È]]ÉÊNÂˆBˆYˆ
PY‘S•T‘WÔ‘Q‘T‘SÑTËš\Ê›ÙK˜Y™[\™WÜ™Y™\™[˜ÙJJHÂˆ›ÝÈ™]È˜[Y][Û‘\œ›ÜŠ	Ú[˜[YY™[\™WÜ™Y™\™[˜ÙIÊNÂˆBˆYˆ
›ÙK˜Ø[\ZYÛ—Û˜[YHOOH[
H\ÜÙ\Ýš[™Ê›ÙK˜Ø[\ZYÛ—Û˜[YK	ØØ[\ZYÛ—Û˜[YIÊNÂˆ™]\›ˆ›ÙNÂŸB‚™^Ü[˜Ý[Ûˆ˜[Y]U\›”™\]Y\Ý
›ÙJHÂˆ\ÜÙ\Øš™XÝ
›ÙK	Ø›ÙIÊNÂˆ\ÜÙ\Ýš[™Ê›ÙKšY[\Ý[˜ÞWÚÙ^K	ÚY[\Ý[˜ÞWÚÙ^IÊNÂˆYˆ
›ÙKšY[\Ý[˜ÞWÚÙ^K›[™ÝˆLŒ
H›ÝÈ™]È˜[Y][Û‘\œ›ÜŠ	ÚY[\Ý[˜ÞWÚÙ^H\ÈÛÈÛ™ÉÊNÂˆYˆ
S[X™\‹š\Ò[YÙ\Š›ÙK™^XÝYÜÝ]WÝ™\œÚ[ÛŠH›ÙK™^XÝYÜÝ]WÝ™\œÚ[ÛˆJHÂˆ›ÝÈ™]È˜[Y][Û‘\œ›ÜŠ	Ù^XÝYÜÝ]WÝ™\œÚ[Ûˆ]\Ý™HHÜÚ]]™H[YÙ\‰ÊNÂˆBˆ\ÜÙ\Øš™XÝ
›ÙKœ^Y\—Ú[œ]	Ü^Y\—Ú[œ]	ÊNÂˆYˆ
VÉÜÝYÙÙ\ÝYØXÝ[Û‰Ë	Ùœ™YWØXÝ[Û‰Ë	ÜÞ\Ý[WØÛÛ[YI×Kš[˜ÛY\Ê›ÙKœ^Y\—Ú[œ]œÛÝ\˜ÙJJHÂˆ›ÝÈ™]È˜[Y][Û‘\œ›ÜŠ	Ú[˜[Y^Y\—Ú[œ]œÛÝ\˜ÙIÊNÂˆBˆYˆ
\[Ùˆ›ÙKœ^Y\—Ú[œ]œ˜]×Ý^OOH	ÜÝš[™ÉÊHÂˆ›ÝÈ™]È˜[Y][Û‘\œ›ÜŠ	Ü^Y\—Ú[œ]œ˜]×Ý^]\Ý™HHÝš[™ÉÊNÂˆBˆYˆ
›ÙKœ^Y\—Ú[œ]œÙ[XÝYØXÝ[Û—ÚYOOH[
HÂˆ\ÜÙ\Ýš[™Ê›ÙKœ^Y\—Ú[œ]œÙ[XÝYØXÝ[Û—ÚY	Ü^Y\—Ú[œ]œÙ[XÝYØXÝ[Û—ÚY	ÊNÂˆBˆ™]\›ˆ›ÙNÂŸB‚™^Ü[˜Ý[ÛˆÙ]ÛÛ\][˜ÞS]™[
YXÚ[šXÜËÛÛ\][˜ÞRY
HÂˆ™]\›ˆYXÚ[šXÜË˜ÛÛ\][˜ÚY\Ë™š[™

][JHOˆ][KšYOOHÛÛ\][˜ÞRY
OË›]™[ÏÈÂŸB