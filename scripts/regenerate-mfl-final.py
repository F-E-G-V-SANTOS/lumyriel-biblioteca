#!/usr/bin/env python3
from pathlib import Path
import base64, gzip, hashlib, json, re, sys

SOURCE_SHA256 = "7f12ac519874dbfbdc1d52d58aecf51e58af6b00c197d18a7ff2368e2dfb4fc2"
CANONICAL_SHA256 = {
    "s09": "309ecc6eb87037535b245a85b59921732b4eba0606f69b53462f00426f7fdbd0",
    "s10": "f454f7ce464fd41c710d0f6112821daf20113f7072b89002eafcdc1dcb7da2b5",
    "s13": "0535de7f9d567ac53a2b8e90f1e9fbad33dc50fdfff0d34552c6298bf35e219d",
}

SECTIONS = {
    "s09": {
        "roman": "X", "title": "SISTEMAS QUE EVOLUEM",
        "label": "PARTE X — SISTEMAS QUE EVOLUEM", "kind": "part",
        "next": "PARTE XI — LÓGICA, COMBINATÓRIA E REDES",
        "chapters": [
            ("34", "ESTADO, EQUILÍBRIO E ESTABILIDADE"),
            ("35", "SISTEMAS ACOPLADOS"),
            ("36", "MUDANÇAS DE REGIME"),
            ("37", "CAOS, SINCRONIZAÇÃO E ESCALAS LENTAS"),
        ],
    },
    "s10": {
        "roman": "XI", "title": "LÓGICA, COMBINATÓRIA E REDES",
        "label": "PARTE XI — LÓGICA, COMBINATÓRIA E REDES", "kind": "part",
        "next": "PARTE XII — MODELAGEM, OTIMIZAÇÃO E SIMULAÇÃO",
        "chapters": [
            ("38", "CONDIÇÕES, CONJUNTOS E RELAÇÕES"),
            ("39", "CONTAR, REPETIR E ORGANIZAR"),
            ("40", "GRAFOS, ÁRVORES E REDES"),
        ],
    },
    "s13": {
        "roman": "AP", "title": "Apêndices", "label": "APÊNDICES",
        "kind": "appendices", "next": None,
        "chapters": [
            ("A", "NOTAÇÃO, SÍMBOLOS, UNIDADES E CONVENÇÕES"),
            ("B", "REVISÃO MATEMÁTICA MÍNIMA E MAPA DE PRÉ-REQUISITOS"),
            ("C", "PROCESSAMENTO DE SINAIS AVANÇADO"),
            ("D", "ESTATÍSTICA AVANÇADA E INFERÊNCIA ROBUSTA"),
            ("E", "MÉTODOS NUMÉRICOS PARA EQUAÇÕES DIFERENCIAIS PARCIAIS"),
            ("F", "MÉTODOS ASSINTÓTICOS"),
            ("G", "HOMOGENEIZAÇÃO, AVERAGING E MODELOS EFETIVOS MULTIESCALA"),
            ("H", "RESPOSTAS COMENTADAS E SOLUÇÕES SELECIONADAS"),
        ],
    },
}

def normalize(block):
    block = block.replace("\r\n", "\n").replace("\r", "\n")
    block = "\n".join("" if line.strip() == "" else line.rstrip() for line in block.split("\n"))
    return re.sub(r"\n{3,}", "\n\n", block).strip()

def heading(number, title, appendix):
    return f"{'APÊNDICE' if appendix else 'CAPÍTULO'} {number} — {title}"

def build(text, spec):
    appendix = spec["kind"] == "appendices"
    section_start = text.index(spec["label"]) + len(spec["label"])
    first_num, first_title = spec["chapters"][0]
    first_heading = heading(first_num, first_title, appendix)
    first_pos = text.index(first_heading, section_start)
    intro = "" if appendix else normalize(text[section_start:first_pos])
    chapters = []
    for i, (number, title) in enumerate(spec["chapters"]):
        h = heading(number, title, appendix)
        start = text.index(h, section_start) + len(h)
        if i + 1 < len(spec["chapters"]):
            nnum, ntitle = spec["chapters"][i + 1]
            end = text.index(heading(nnum, ntitle, appendix), start)
        elif spec["next"]:
            end = text.index(spec["next"], start)
        else:
            end = len(text)
        chapters.append({"number": number, "title": title, "appendix": appendix, "body": normalize(text[start:end])})
    return {
        "schema": "lumyriel-reader-math-section-v1",
        "roman": spec["roman"], "title": spec["title"], "label": spec["label"],
        "kind": spec["kind"], "intro": intro, "chapters": chapters,
    }

def main():
    source = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/mfl.txt")
    raw = source.read_bytes()
    got_source_sha = hashlib.sha256(raw).hexdigest()
    if got_source_sha != SOURCE_SHA256:
        raise SystemExit(f"Fonte RC1 divergente: {got_source_sha}")
    text = raw.decode("utf-8-sig")
    out_dir = Path("books")
    for key, spec in SECTIONS.items():
        obj = build(text, spec)
        canonical = json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
        got = hashlib.sha256(canonical).hexdigest()
        want = CANONICAL_SHA256[key]
        if got != want:
            raise SystemExit(f"{key}: QA textual divergente: {got} != {want}")
        packed = json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        payload = base64.b64encode(gzip.compress(packed, mtime=0)).decode("ascii")
        path = out_dir / f"lmy-mfl-{key}.dat"
        path.write_text(payload, encoding="utf-8")
        print(f"{key}: PASS — {len(obj['chapters'])} leituras — canonical {got}")

if __name__ == "__main__":
    main()
