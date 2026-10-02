#!/usr/bin/env python3
from pathlib import Path
import base64, gzip, hashlib, json, re, shutil, subprocess, tempfile, urllib.request

ROOT = Path(__file__).resolve().parents[1]
BOOK_OUT = ROOT / 'books' / 'lmy-bio-rc1.dat'
QA_OUT = ROOT / 'books' / 'lmy-bio-rc1.qa.json'

SOURCES = [
    ('I', 'Fundamentos da Vida', 5, 19, 88, '1_AMlW7irgSX5UZaWe0UaVo_isgfnXE_I'),
    ('II', 'Hereditariedade, Desenvolvimento e Evolução', 5, 22, 94, '1Voz8TrxM1Be8LZUezKMcKgvihiwpukeq'),
    ('III', 'Forma, Função e Fisiologia Comparada', 6, 23, 150, '1gpJDru_PGeFFbbD84rjg8m0re3vOm8nb'),
    ('IV', 'Ecologia, Biomas e Redes da Vida', 6, 27, 91, '1XbRQzR0c0F7tX6sy20Yuo2hFEBsSj4TG'),
    ('V', 'Diversidade, Classificação e História da Vida', 5, 22, 53, '1Tuz7UTOjTCl4hg15l_Y1jJK5_qocaQAb'),
    ('VI', 'Doença, Reparo, Regeneração e Medicina', 6, 25, 38, '19CE7C_xn1GsbUh6WKlkSyiyer4TFqzd6'),
]


def run(*args):
    subprocess.run(args, check=True)


def download(fid, dest):
    url = f'https://drive.usercontent.google.com/download?id={fid}&export=download&confirm=t'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=120) as response, open(dest, 'wb') as handle:
        shutil.copyfileobj(response, handle)
    if dest.stat().st_size < 10000:
        raise RuntimeError(f'Download inválido: {dest}')


def clean_lines(text):
    return text.replace('\r', '').replace('\f', '\n').splitlines()


def upper_cont(line):
    text = line.strip()
    if not text or len(text) > 120:
        return False
    if re.match(r'^\d+(?:\.\d+)*[.)]?\s+', text):
        return False
    if re.match(r'^(PARTE|CAPÍTULO|REFERÊNCIAS|MAPA DE CONTINUIDADE)\b', text, re.I):
        return False
    letters = [c for c in text if c.isalpha()]
    return bool(letters) and all(not c.islower() for c in letters)


def title_from(lines, index, initial):
    pieces = [initial.strip()]
    cursor = index + 1
    while cursor < len(lines):
        text = lines[cursor].strip()
        if text and upper_cont(text):
            pieces.append(text)
            cursor += 1
        else:
            break
    return ' '.join(pieces), cursor


def is_subheading(text):
    text = text.strip()
    if not text:
        return False
    if re.match(r'^\d+(?:\.\d+)*[.)]?\s+\S', text):
        return True
    if re.match(r'^(REVISÃO|RESUMO CAUSAL|NOTA DE FRONTEIRA|APLICAÇÃO EM LUMYRIEL|PERGUNTA DE ABERTURA|OBJETIVOS DE APRENDIZAGEM)\b', text, re.I):
        return True
    letters = [c for c in text if c.isalpha()]
    return len(text) <= 105 and len(letters) >= 4 and all(not c.islower() for c in letters) and '≠' not in text and '=' not in text


def paragraphs(lines):
    lines = list(lines)
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    groups, current = [], []
    for line in lines:
        text = line.strip()
        if not text:
            if current:
                groups.append(current)
                current = []
        else:
            current.append(text)
    if current:
        groups.append(current)
    output = []
    for group in groups:
        if is_subheading(group[0]):
            output.append('## ' + group[0])
            if len(group) > 1:
                output.append(' '.join(group[1:]))
        else:
            output.append(' '.join(group))
    return '\n\n'.join(x for x in output if x.strip())


def canonical(text):
    return re.sub(r'\s+', ' ', text.replace('## ', '')).strip()


def parse_volume(txt_path, source):
    roman, title, expected_parts, expected_chapters, pages, _ = source
    raw = txt_path.read_text(encoding='utf-8', errors='replace').replace('\r', '')
    lines = clean_lines(raw)
    events = []
    for index, line in enumerate(lines):
        text = line.strip()
        part = re.match(r'^PARTE\s+([IVX]+)\s+[—-]\s+(.+)$', text)
        if part:
            part_title, content_index = title_from(lines, index, part.group(2))
            events.append(('part', index, content_index, part.group(1), part_title))
        chapter = re.match(r'^CAPÍTULO\s+(\d+)\s+[—-]\s+(.+)$', text)
        if chapter:
            chapter_title, content_index = title_from(lines, index, chapter.group(2))
            events.append(('chapter', index, content_index, int(chapter.group(1)), chapter_title))

    parts = [event for event in events if event[0] == 'part']
    chapters = [event for event in events if event[0] == 'chapter']
    if len(parts) != expected_parts or len(chapters) != expected_chapters:
        raise RuntimeError(f'Estrutura inesperada Volume {roman}: {len(parts)} partes / {len(chapters)} capítulos')

    intro_index = next(i for i, line in enumerate(lines) if line.strip() in ('NOTA AO LEITOR', 'APRESENTAÇÃO DO VOLUME'))
    refs_index = next(i for i, line in enumerate(lines) if line.strip() == 'REFERÊNCIAS E NOTAS DE FRONTEIRA')
    map_index = next(i for i, line in enumerate(lines) if line.strip() == 'MAPA DE CONTINUIDADE DA COLEÇÃO')
    intro_title = lines[intro_index].strip()
    intro = paragraphs(lines[intro_index + 1:parts[0][1]])
    references = paragraphs(lines[refs_index + 1:map_index])
    continuity = paragraphs(lines[map_index + 1:])

    part_info = []
    for part in parts:
        _, part_index, content_index, part_roman, part_title = part
        first_chapter = min(ch[1] for ch in chapters if ch[1] > part_index)
        part_info.append({
            'roman': part_roman,
            'title': part_title,
            'intro': paragraphs(lines[content_index:first_chapter]),
        })

    parsed, seen_parts = [], set()
    for chapter in chapters:
        _, chapter_index, content_index, number, chapter_title = chapter
        end = min([event[1] for event in events if event[1] > chapter_index] + [refs_index])
        part_pos = max(i for i, part in enumerate(parts) if part[1] < chapter_index)
        part = part_info[part_pos]
        item = {
            'number': number,
            'title': chapter_title,
            'part': f"Parte {part['roman']} — {part['title']}",
            'body': paragraphs(lines[content_index:end]),
        }
        if part_pos not in seen_parts:
            item['partIntro'] = part['intro']
            seen_parts.add(part_pos)
        parsed.append(item)

    volume = {
        'roman': roman,
        'title': title,
        'pages': pages,
        'introTitle': intro_title,
        'intro': intro,
        'chapters': parsed,
        'references': references,
        'continuity': continuity,
    }

    reconstructed = [intro_title, intro]
    for part in part_info:
        label = f"Parte {part['roman']} — {part['title']}"
        reconstructed.append(f"PARTE {part['roman']} — {part['title']}")
        if part['intro']:
            reconstructed.append(part['intro'])
        for chapter in [entry for entry in parsed if entry['part'] == label]:
            reconstructed.extend([f"CAPÍTULO {chapter['number']} — {chapter['title']}", chapter['body']])
    reconstructed.extend(['REFERÊNCIAS E NOTAS DE FRONTEIRA', references, 'MAPA DE CONTINUIDADE DA COLEÇÃO', continuity])

    expected = canonical('\n'.join(lines[intro_index:]))
    rebuilt = canonical('\n'.join(reconstructed))
    if expected != rebuilt:
        raise RuntimeError(f'Equivalência textual falhou no Volume {roman}')

    volume['qa'] = {
        'canonical_tokens': len(expected.split()),
        'canonical_sha256': hashlib.sha256(expected.encode('utf-8')).hexdigest(),
    }
    return volume


def build():
    volumes, source_files = [], []
    with tempfile.TemporaryDirectory(prefix='lumyriel-bio-') as directory:
        work = Path(directory)
        for index, source in enumerate(SOURCES, 1):
            pdf = work / f'volume-{index}.pdf'
            txt = work / f'volume-{index}.txt'
            print(f'Baixando Volume {source[0]}...')
            download(source[5], pdf)
            run('pdftotext', '-layout', str(pdf), str(txt))
            volumes.append(parse_volume(txt, source))
            source_files.append({'volume': source[0], 'drive_file_id': source[5], 'bytes': pdf.stat().st_size})

    book = {
        'schema': 'lumyriel-reader-biology-v1',
        'title': 'Biologia de Lumyriel',
        'subtitle': 'Primeira Edição · 6 volumes',
        'edition': 'RC1 · Primeira Edição · F E G V Santos',
        'author': 'F E G V Santos',
        'format': 'volumes',
        'source': 'RC1 · 6/6 volumes · E7-PDF PASS · 514 páginas',
        'volumes': volumes,
    }
    raw = json.dumps(book, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    encoded = base64.b64encode(gzip.compress(raw, 9)).decode('ascii')
    BOOK_OUT.parent.mkdir(parents=True, exist_ok=True)
    BOOK_OUT.write_text(encoded, encoding='ascii')

    qa = {
        'schema': 'lumyriel-reader-biology-qa-v1',
        'status': 'PASS',
        'volumes': len(volumes),
        'parts': sum(source[2] for source in SOURCES),
        'chapters': sum(len(volume['chapters']) for volume in volumes),
        'pages': sum(source[4] for source in SOURCES),
        'raw_json_bytes': len(raw),
        'payload_bytes': BOOK_OUT.stat().st_size,
        'sources': source_files,
        'volume_checks': [
            {'roman': volume['roman'], 'chapters': len(volume['chapters']), **volume['qa']}
            for volume in volumes
        ],
    }
    QA_OUT.write_text(json.dumps(qa, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(qa, ensure_ascii=False, indent=2))
    if qa['volumes'] != 6 or qa['parts'] != 33 or qa['chapters'] != 138 or qa['pages'] != 514:
        raise RuntimeError('Totais editoriais inesperados')
    print('PASS: payload nativo de Biologia preparado.')


if __name__ == '__main__':
    build()
