#!/usr/bin/env python3
from pathlib import Path
import base64, gzip, json, re, subprocess, tempfile, urllib.request, shutil

ROOT=Path(__file__).resolve().parents[1]
BOOK_OUT=ROOT/'books'/'lmy-aml-b1.dat'
FIG_OUT=ROOT/'assets'/'books'/'artes-magicas'
READER=ROOT/'reader.html'
OLD_READER=ROOT/'magic-reader.html'
SITE_CONFIG=ROOT/'assets'/'site-config.js'
INTEGRATION=ROOT/'assets'/'magic-site-integration.js'
TEMPLATE=ROOT/'tools'/'magic-reader-template.html.gz.b64'

SOURCES=[
 ('I','Fundamentos','v1.5',65,'1-sUQAA6TOPC4mpxkrtXl1hs26bixeXUp'),
 ('II','Mana, Acoplamento e Construção de Técnicas','v1.5',68,'1Ef4nC_VexmiM0ITs7dXDceMWaGQ5N3HK'),
 ('III','Aura, Corpo e Presença','v1.8',53,'1e5GipfFlZTNPmIV8wS2rUq3jIxAK7auB'),
 ('IV','Runologia, Pergaminhos, Matrizes e Artefatos','v1.12',74,'1DuFrntXeNF9Js7bxuwdCDCifPqnBj16N'),
 ('V','Fenomenologia, Campo e Investigação Mágica','v0.21',66,'1Fqb6111FZWJ82luJgV2Q3XGZtWL3IqDZ'),
 ('VI','Artes Avançadas, Alto Risco e Fronteiras do Conhecimento','v0.20',66,'1knJa-s_k7ctNcGkcC6eTdpoFdw8zIHVx'),
]
FIG_MAP={5:1,13:2,19:3,21:4,23:5,25:6,33:7,37:8,38:9,39:10,40:11}
FIG_TITLES={
 1:'Anatomia Funcional de uma Estrutura Rúnica',
 2:'As oito camadas e suas responsabilidades',
 3:'Do substrato à retirada de serviço',
 4:'Pulso, Silêncio e limiares',
 5:'Linha de comando e sustento',
 6:'Retenção, retorno e Eco operacional',
 7:'Quatro arquiteturas de pergaminho',
 8:'Classe, risco e circulação',
 9:'Cadeia de decisão para pergaminho desconhecido',
 10:'Grimório, pergaminho e artefato reutilizável',
 11:'Do requisito ao ciclo de vida',
}
HEADINGS=[
 re.compile(r'^\d+\.\d+(?:\.\d+)?\s+\S',re.I),
 re.compile(r'^(Pergunta de abertura|Objetivos de aprendizagem|Erro comum|Exercício(?:\s.*)?|Atividade(?:\s.*)?|Verificação|Resumo|Segurança|Conexão|Exemplo resolvido(?:\s.*)?|Diagrama ou modelo|Princípio de estudo)(?:\s.*)?$',re.I),
]

def run(*args):
 subprocess.run(args,check=True)

def download(fid,dest):
 url=f'https://drive.usercontent.google.com/download?id={fid}&export=download&confirm=t'
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
 with urllib.request.urlopen(req,timeout=90) as r, open(dest,'wb') as f:
  shutil.copyfileobj(r,f)
 if dest.stat().st_size<10000: raise RuntimeError(f'Download inválido: {dest}')

def upper_cont(line):
 s=line.strip()
 if not s or len(s)>90:return False
 letters=[c for c in s if c.isalpha()]
 return bool(letters) and all(not c.islower() for c in letters)

def title_from(lines,i,initial):
 parts=[initial.strip()]; j=i+1
 while j<len(lines):
  s=lines[j].strip()
  if s and upper_cont(s) and not re.match(r'^(PARTE|CAP[IÍ]TULO)\b',s): parts.append(s); j+=1
  else: break
 return ' '.join(parts),j

def paragraphs(lines):
 while lines and not lines[0].strip():lines=lines[1:]
 while lines and not lines[-1].strip():lines=lines[:-1]
 groups=[]; cur=[]
 for line in lines:
  s=line.strip()
  if not s:
   if cur:groups.append(cur);cur=[]
  else:cur.append(s)
 if cur:groups.append(cur)
 out=[]
 for g in groups:
  if len(g)>=2 and any(rx.match(g[0]) for rx in HEADINGS):
   out+=['## '+g[0],' '.join(g[1:])]
  else:
   joined=' '.join(g)
   out.append(('## '+joined) if len(joined)<140 and any(rx.match(joined) for rx in HEADINGS) else joined)
 return '\n\n'.join(x for x in out if x.strip())

def parse_volume(txt_path,vi):
 lines=txt_path.read_text(encoding='utf-8',errors='replace').replace('\r','').splitlines()
 events=[]
 for idx,line in enumerate(lines):
  s=line.strip()
  m=re.match(r'^PARTE\s+([IVX]+)\s+[—-]\s+(.+)$',s)
  if m:
   title,j=title_from(lines,idx,m.group(2));events.append(('part',idx,j,m.group(1),title))
  m=re.match(r'^CAP[IÍ]TULO\s+(\d+)\s+[—-]\s+(.+)$',s)
  if m:
   title,j=title_from(lines,idx,m.group(2));events.append(('chapter',idx,j,int(m.group(1)),title))
 parts=[e for e in events if e[0]=='part']; chapters=[e for e in events if e[0]=='chapter']
 if len(parts)!=8 or len(chapters)!=40:raise RuntimeError(f'Estrutura inesperada v{vi+1}: {len(parts)} partes, {len(chapters)} capítulos')
 intro=paragraphs(lines[3:parts[0][1]])
 pinfos=[]
 for p in parts:
  _,pidx,pcontent,roman,ptitle=p
  next_ch=min(c[1] for c in chapters if c[1]>pidx)
  pinfos.append({'roman':roman,'title':ptitle,'intro':paragraphs(lines[pcontent:next_ch])})
 parsed=[]; seen=set()
 for c in chapters:
  _,cidx,ccontent,num,title=c
  pos=events.index(c); end=events[pos+1][1] if pos+1<len(events) else len(lines)
  body=paragraphs(lines[ccontent:end])
  pi=max(i for i,p in enumerate(parts) if p[1]<cidx); p=pinfos[pi]
  item={'number':num,'title':title,'part':f"Parte {p['roman']} — {p['title']}",'body':body}
  if pi not in seen:item['partIntro']=p['intro'];seen.add(pi)
  if vi==3 and num in FIG_MAP:
   n=FIG_MAP[num]; marker=f'[[FIGURE:{n:02d}|{FIG_TITLES[n]}|Figura didática do Volume IV.]]'
   blocks=item['body'].split('\n\n');blocks.insert(min(2,len(blocks)),marker);item['body']='\n\n'.join(blocks)
  parsed.append(item)
 roman,title,version,pages,_=SOURCES[vi]
 return {'roman':roman,'title':title,'version':version,'pages':pages,'intro':intro,'chapters':parsed}

def build_data(work):
 volumes=[]; pdfs=[]
 for i,src in enumerate(SOURCES):
  pdf=work/f'volume-{i+1}.pdf'; txt=work/f'volume-{i+1}.txt'
  print(f'Baixando Volume {src[0]}...');download(src[4],pdf);pdfs.append(pdf)
  run('pdftotext',str(pdf),str(txt));volumes.append(parse_volume(txt,i))
 data={'title':'Artes Mágicas Lumyrielianas','subtitle':'Coleção didática · 6 volumes','edition':'RC1 aprovado · Leitura Beta · F E G V Santos','author':'F E G V Santos','format':'volumes','source':'RC1 · 6/6 volumes QA PDF PASS · 392 páginas','volumes':volumes}
 raw=json.dumps(data,ensure_ascii=False,separators=(',',':')).encode('utf-8')
 BOOK_OUT.parent.mkdir(parents=True,exist_ok=True)
 BOOK_OUT.write_text(base64.b64encode(gzip.compress(raw,9)).decode('ascii'),encoding='ascii')
 print('Dados:',len(raw),'bytes; capítulos:',sum(len(v['chapters']) for v in volumes))
 return pdfs

def build_figures(pdf4,work):
 ext=work/'figures';ext.mkdir();run('pdfimages','-png',str(pdf4),str(ext/'fig'))
 imgs=sorted(ext.glob('fig-*.png'))
 if len(imgs)!=11:raise RuntimeError(f'Esperadas 11 figuras no Volume IV; encontradas {len(imgs)}')
 FIG_OUT.mkdir(parents=True,exist_ok=True)
 for i,img in enumerate(imgs,1):run('cwebp','-quiet','-q','90',str(img),'-o',str(FIG_OUT/f'volume-iv-figura-{i:02d}.webp'))

def patch_site():
 READER.write_bytes(gzip.decompress(base64.b64decode(TEMPLATE.read_text().strip())))
 redirect='''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=reader.html?book=magia&v=0&intro=1"><title>Artes Mágicas Lumyrielianas</title></head><body><script>location.replace('reader.html?book=magia&v=0&intro=1');</script><p><a href="reader.html?book=magia&v=0&intro=1">Abrir Artes Mágicas Lumyrielianas</a></p></body></html>'''
 OLD_READER.write_text(redirect,encoding='utf-8')
 integ=INTEGRATION.read_text(encoding='utf-8').replace("const READER_URL = 'magic-reader.html';","const READER_URL = 'reader.html?book=magia&v=0&intro=1';")
 INTEGRATION.write_text(integ,encoding='utf-8')
 cfg=SITE_CONFIG.read_text(encoding='utf-8')
 old="load('assets/site-catalog.js');"
 new="load('assets/site-catalog.js', () => {\n      if (document.getElementById('libraryGrid')) load('assets/magic-site-integration.js');\n    });"
 if old in cfg:cfg=cfg.replace(old,new,1)
 SITE_CONFIG.write_text(cfg,encoding='utf-8')

if __name__=='__main__':
 with tempfile.TemporaryDirectory(prefix='lumyriel-magic-') as td:
  work=Path(td);pdfs=build_data(work);build_figures(pdfs[3],work)
 patch_site()
 print('PASS: leitor nativo preparado.')
