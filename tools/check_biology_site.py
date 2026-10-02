#!/usr/bin/env python3
from pathlib import Path
import base64, gzip, json, re, subprocess, tempfile

ROOT = Path(__file__).resolve().parents[1]
PAYLOAD = ROOT / 'books' / 'lmy-bio-rc1.dat'
QA = ROOT / 'books' / 'lmy-bio-rc1.qa.json'
READER = ROOT / 'biology-reader.html'
INTEGRATION = ROOT / 'assets' / 'biology-site-integration.js'
STATUS = ROOT / 'site-status.json'


def fail(message):
    raise SystemExit('FAIL: ' + message)


def node_check(path):
    subprocess.run(['node', '--check', str(path)], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)


for path in (PAYLOAD, QA, READER, INTEGRATION, STATUS):
    if not path.exists():
        fail(f'arquivo ausente: {path.relative_to(ROOT)}')

encoded = PAYLOAD.read_text(encoding='ascii').strip()
try:
    book = json.loads(gzip.decompress(base64.b64decode(encoded)).decode('utf-8'))
except Exception as exc:
    fail(f'payload .dat inválido: {exc}')

if book.get('schema') != 'lumyriel-reader-biology-v1':
    fail('schema inesperado')
volumes = book.get('volumes') or []
parts = set()
chapters = 0
for volume in volumes:
    volume_chapters = volume.get('chapters') or []
    chapters += len(volume_chapters)
    for chapter in volume_chapters:
        if chapter.get('part'):
            parts.add((volume.get('roman'), chapter['part']))
    if not volume.get('references') or not volume.get('continuity'):
        fail(f"volume {volume.get('roman')} sem referências ou mapa")

if len(volumes) != 6 or len(parts) != 33 or chapters != 138:
    fail(f'totais inesperados: volumes={len(volumes)}, partes={len(parts)}, capítulos={chapters}')

qa = json.loads(QA.read_text(encoding='utf-8'))
if qa.get('status') != 'PASS' or qa.get('chapters') != 138 or qa.get('pages') != 514:
    fail('arquivo QA do payload não está em PASS')

reader = READER.read_text(encoding='utf-8')
required_reader = [
    "const DATA='books/lmy-bio-rc1.dat'",
    'Biologia de Lumyriel',
    'volumeSelector',
    'Referências e notas de fronteira',
    'Mapa de continuidade da coleção',
]
for marker in required_reader:
    if marker not in reader:
        fail(f'leitor sem marcador obrigatório: {marker}')

scripts = re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>', reader, flags=re.S | re.I)
inline = '\n'.join(script for script in scripts if script.strip())
with tempfile.NamedTemporaryFile('w', suffix='.js', encoding='utf-8', delete=False) as handle:
    handle.write(inline)
    inline_path = Path(handle.name)
try:
    node_check(inline_path)
finally:
    inline_path.unlink(missing_ok=True)
node_check(INTEGRATION)

status = json.loads(STATUS.read_text(encoding='utf-8'))
bio_status = (status.get('books') or {}).get('biologia-de-lumyriel') or {}
if not bio_status.get('public_reading') or bio_status.get('reader_payload') != 'books/lmy-bio-rc1.dat':
    fail('site-status não aponta para o .dat público')

print('PASS: publicação nativa .dat de Biologia validada.')
print(f'6 volumes · 33 partes · {chapters} capítulos · 514 páginas-fonte · payload {PAYLOAD.stat().st_size} bytes')
