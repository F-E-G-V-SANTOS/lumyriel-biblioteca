const SUBMISSIONS_FOLDER_ID = '1epajEdS3zafAAMYtTTi9TWN1QMNaUgJL';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      service: 'Lumyriel Character Intake',
      version: '1.1'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const raw = e && e.postData ? e.postData.contents : '';
  if (!raw) return json_({ ok: false, error: 'empty_payload' });
  if (raw.length > 200000) return json_({ ok: false, error: 'payload_too_large' });

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (err) {
    return json_({ ok: false, error: 'invalid_json' });
  }

  if (payload.website) return json_({ ok: true, ignored: true, reason: 'honeypot' });

  const name = sanitize_(payload.name || '');
  if (!name || name === 'Sem Nome') return json_({ ok: false, error: 'missing_name' });

  const fingerprintPayload = JSON.parse(JSON.stringify(payload));
  if (fingerprintPayload._meta) delete fingerprintPayload._meta.generated_at;
  delete fingerprintPayload.website;
  const fingerprint = digest_(JSON.stringify(fingerprintPayload));
  const cache = CacheService.getScriptCache();
  if (cache.get('dup_' + fingerprint)) {
    return json_({ ok: true, ignored: true, reason: 'duplicate_recent' });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (cache.get('dup_' + fingerprint)) {
      return json_({ ok: true, ignored: true, reason: 'duplicate_recent' });
    }

    const id = makeId_();
    const now = new Date();

    const record = {
      submission_id: id,
      status: 'PENDENTE_DE_AVALIACAO',
      canonical: false,
      source: 'Biblioteca de Lumyriel — Criador de Personagens',
      received_at: now.toISOString(),
      creator_version: payload._meta && payload._meta.creator_version ? payload._meta.creator_version : 'alpha',
      character: payload
    };

    const folder = DriveApp.getFolderById(SUBMISSIONS_FOLDER_ID);
    const jsonName = id + ' — ' + name + '.json';
    const txtName = id + ' — ' + name + ' — Dossie.txt';

    folder.createFile(jsonName, JSON.stringify(record, null, 2), MimeType.PLAIN_TEXT);
    folder.createFile(txtName, dossier_(record), MimeType.PLAIN_TEXT);

    cache.put('dup_' + fingerprint, '1', 600);

    return json_({ ok: true, submission_id: id, status: record.status });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

function digest_(text) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    text,
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(b) {
    const v = (b + 256) % 256;
    return ('0' + v.toString(16)).slice(-2);
  }).join('').slice(0, 32);
}

function makeId_() {
  const tz = Session.getScriptTimeZone() || 'America/Porto_Velho';
  const date = Utilities.formatDate(new Date(), tz, 'yyyyMMdd');
  const suffix = Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
  return 'LUM-CHAR-' + date + '-' + suffix;
}

function sanitize_(value) {
  return String(value).replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 80) || 'Sem Nome';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function dossier_(record) {
  const c = record.character || {};
  const lines = [
    'LUMYRIEL — DOSSIÊ DE PERSONAGEM',
    '',
    'ID: ' + record.submission_id,
    'STATUS: PENDENTE DE AVALIAÇÃO / NÃO CANÔNICO',
    'RECEBIDO EM: ' + record.received_at,
    'VERSÃO DO CRIADOR: ' + record.creator_version,
    'COERÊNCIA BIOLÓGICA: ' + coherence_(c.biologicalCoherence),
    '',
    'IDENTIDADE',
    'Nome: ' + val_(c.name),
    'Idade: ' + val_(c.age),
    'Povo / espécie: ' + val_(c.people),
    'Origem biológica: ' + val_(c.ancestryMode),
    'Origem da exceção biológica: ' + val_(c.biologyOrigin),
    'Notas biológicas: ' + val_(c.biologyNotes),
    'Ancestralidade 1: ' + val_(c.parentA),
    'Ancestralidade 2: ' + val_(c.parentB),
    'Status Mutari: ' + val_(c.mutariStatus),
    'Relação com Lumyriel: ' + val_(c.originStatus),
    'Origem: ' + val_(c.originPlace),
    'Gênero / identidade: ' + val_(c.gender),
    'Origem social: ' + val_(c.socialOrigin),
    '',
    'APARÊNCIA',
    'Altura: ' + val_(c.height),
    'Constituição: ' + val_(c.build),
    'Formato da cabeça: ' + val_(c.headShape),
    'Formato do rosto: ' + val_(c.faceShape),
    'Postura: ' + val_(c.posture),
    'Sobrancelhas: ' + val_(c.brows),
    'Pele: ' + val_(c.skin),
    'Olhos: ' + [c.eyeLeft, c.eyeRight].filter(Boolean).join(' / '),
    'Formato dos olhos: ' + val_(c.eyeShape),
    'Traço ocular: ' + val_(c.ocular),
    'Cabelo: ' + [c.hairColor, c.hairType, c.hairLength, c.hairDensity, c.hairstyle].filter(Boolean).join(' · '),
    'Nariz: ' + val_(c.nose),
    'Boca / lábios: ' + val_(c.mouth),
    'Dentes: ' + val_(c.teeth),
    'Orelhas: ' + val_(c.ears),
    'Cauda: ' + val_(c.tail),
    'Morfologia especial: ' + val_(c.specialMorphology),
    'Unhas / mãos: ' + val_(c.nails),
    'Voz: ' + val_(c.voice),
    'Jeito de falar: ' + val_(c.voiceTraits),
    'Marcas: ' + join_(c.markChoices, c.marks),
    '',
    'CULTURA E FÉ',
    'Cultura: ' + val_(c.culture),
    'Línguas: ' + val_(c.language),
    'Fé: ' + val_(c.faith),
    'Relação com a fé: ' + val_(c.faithRelation),
    'Formação: ' + val_(c.education),
    'Alfabetização: ' + val_(c.literacy),
    'Hábitos / códigos sociais: ' + join_(c.customChoices, c.customs),
    '',
    'HISTÓRICO',
    'Profissão: ' + val_(c.profession),
    'Fonte de treinamento: ' + val_(c.trainingSource),
    'Tempo de prática: ' + val_(c.yearsTraining),
    'Família / vínculos: ' + val_(c.family),
    'Passado: ' + join_(c.pastChoices, c.past),
    'Reputação: ' + val_(c.reputation),
    '',
    'HABILIDADES',
    'Arquétipo descritivo: ' + val_(c.archetype),
    'Corpo a corpo: ' + val_(c.skillMelee),
    'Distância: ' + val_(c.skillRanged),
    'Aura: ' + val_(c.skillAura),
    'Mana / artes mágicas: ' + val_(c.skillMana),
    'Runologia: ' + val_(c.skillRunes),
    'Sobrevivência: ' + val_(c.skillSurvival),
    'Ofício: ' + val_(c.skillCraft),
    'Conhecimento: ' + val_(c.skillKnowledge),
    'Social: ' + val_(c.skillSocial),
    'Mestrias: ' + join_(c.masteryChoices, c.masteries),
    'Limitações: ' + join_(c.limitationChoices, c.limitations),
    '',
    'EQUIPAMENTO',
    'Principal: ' + val_(c.weapon1),
    'Secundário: ' + val_(c.weapon2),
    'Proteção: ' + val_(c.armor),
    'Ferramentas: ' + val_(c.tools),
    'Itens especiais: ' + val_(c.specialItems),
    'Manutenção: ' + val_(c.maintenance),
    '',
    'PAPEL NARRATIVO',
    'Papel: ' + val_(c.role),
    'Temperamento: ' + val_(c.temperament),
    'Objetivos: ' + join_(c.goalChoices, c.goals),
    'Valores: ' + join_(c.valueChoices, c.values),
    'Limites morais: ' + val_(c.limits),
    'Lealdades: ' + val_(c.loyalties),
    'Medos / vulnerabilidades: ' + val_(c.fears),
    '',
    'BIOGRAFIA',
    val_(c.bio)
  ];
  return lines.join('\n');
}

function join_() {
  const out = [];
  for (let i = 0; i < arguments.length; i++) {
    const v = arguments[i];
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) {
      v.forEach(function(item) {
        if (item !== undefined && item !== null && String(item).trim() !== '') out.push(String(item).trim());
      });
    } else if (String(v).trim() !== '') {
      out.push(String(v).trim());
    }
  }
  return out.length ? out.join(' · ') : 'Não definido';
}

function coherence_(v) {
  if (!v) return 'Não definida';
  if (typeof v === 'string') return v;
  return v.label || v.status || 'Não definida';
}

function val_(v) {
  return v === undefined || v === null || String(v).trim() === '' ? 'Não definido' : String(v);
}