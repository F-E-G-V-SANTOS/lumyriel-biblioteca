const SUBMISSIONS_FOLDER_ID = '1epajEdS3zafAAMYtTTi9TWN1QMNaUgJL';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'Lumyriel Character Intake' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const raw = e && e.postData ? e.postData.contents : '';
    if (!raw) return json_({ ok: false, error: 'empty_payload' });

    const payload = JSON.parse(raw);
    if (payload.website) return json_({ ok: true, ignored: true }); // honeypot

    const id = makeId_();
    const now = new Date();
    const name = sanitize_(payload.name || 'Sem Nome');

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

    return json_({ ok: true, submission_id: id, status: record.status });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
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
    '',
    'IDENTIDADE',
    'Nome: ' + val_(c.name),
    'Idade: ' + val_(c.age),
    'Povo / espécie: ' + val_(c.people),
    'Origem biológica: ' + val_(c.ancestryMode),
    'Traço animaliforme: ' + val_(c.animalMorph),
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
    'Marcas: ' + val_(c.marks),
    '',
    'CULTURA E FÉ',
    'Cultura: ' + val_(c.culture),
    'Línguas: ' + val_(c.language),
    'Fé: ' + val_(c.faith),
    'Relação com a fé: ' + val_(c.faithRelation),
    'Formação: ' + val_(c.education),
    'Alfabetização: ' + val_(c.literacy),
    'Costumes: ' + val_(c.customs),
    '',
    'HISTÓRICO',
    'Profissão: ' + val_(c.profession),
    'Fonte de treinamento: ' + val_(c.trainingSource),
    'Tempo de prática: ' + val_(c.yearsTraining),
    'Família / vínculos: ' + val_(c.family),
    'Passado: ' + val_(c.past),
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
    'Mestrias: ' + val_(c.masteries),
    'Limitações: ' + val_(c.limitations),
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
    'Objetivos: ' + val_(c.goals),
    'Valores: ' + val_(c.values),
    'Limites morais: ' + val_(c.limits),
    'Lealdades: ' + val_(c.loyalties),
    'Medos / vulnerabilidades: ' + val_(c.fears),
    '',
    'BIOGRAFIA',
    val_(c.bio)
  ];
  return lines.join('\n');
}

function val_(v) {
  return v === undefined || v === null || String(v).trim() === '' ? 'Não definido' : String(v);
}