#!/usr/bin/env python3
"""Focused regression checks for catalog routes, editions, and split-volume integrity."""
import base64,gzip,json,subprocess,tempfile
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
ROOT=Path(__file__).resolve().parent.parent
class Document(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[];self.capture=False;self.buffer='';self.scripts=[]
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if 'id' in attrs:self.ids.append(attrs['id'])
  for attr in ('src','href'):
   if attrs.get(attr):self.links.append(attrs[attr])
  if tag=='script':self.capture='src' not in attrs;self.buffer=''
 def handle_data(self,value):
  if self.capture:self.buffer+=value
 def handle_endtag(self,tag):
  if tag=='script' and self.capture:self.scripts.append(self.buffer);self.capture=False
catalog=json.loads((ROOT/'data/catalog.json').read_text());byid={b['id']:b for b in catalog['books']}
assert len(byid)==7
assert {b['id'] for b in byid.values() if b['category']=='derived'}=={'construindo','narrar'}
assert byid['filho']['data']=='books/lmy-odm-b15.dat'
for book in byid.values():assert (ROOT/urlsplit(book['url']).path).is_file() and (ROOT/book['data']).is_file()
assert 'lmy-odm-b13.dat' not in (ROOT/'assets/reader-recovery.js').read_text()
assert '__LUMYRIEL_READER_STARTED__' in (ROOT/'assets/reader-recovery.js').read_text()
pages=['index.html','biblioteca.html','galeria.html','atlas.html','ferramentas.html','sobre.html','reader.html','biology-reader.html','construindo-reader.html','narrar-reader.html']
for name in pages:
 doc=Document();doc.feed((ROOT/name).read_text());assert len(doc.ids)==len(set(doc.ids)),name
 for link in doc.links:
  uri=urlsplit(link)
  if not uri.scheme and uri.path:assert (ROOT/unquote(uri.path)).exists(),(name,link)
 for script in doc.scripts:
  with tempfile.NamedTemporaryFile(suffix='.js',mode='w') as tmp:
   tmp.write(script);tmp.flush();subprocess.run(['node','--check',tmp.name],check=True,capture_output=True)
for name in ['library.js','reader-preferences.js','reader-recovery.js','reader-integration.js','catalog.js']:
 subprocess.run(['node','--check',str(ROOT/'assets'/name)],check=True,capture_output=True)
def decode(path):return json.loads(gzip.decompress(base64.b64decode(path.read_text())))
old=decode(ROOT/'books/lmy-cm-integral-v1.dat')
original=json.loads(gzip.decompress(base64.b64decode(''.join((ROOT/f).read_text() for f in old['segments']))))
manifest=json.loads((ROOT/byid['construindo']['data']).read_text())
new={k:v for k,v in manifest.items() if k not in ('schema','volumes')};new['volumes']=[decode(ROOT/v['file']) for v in manifest['volumes']]
assert new==original,'Split changed book content'
assert len(new['volumes'])==14 and sum(len(v['chapters']) for v in new['volumes'])==808
print('PASS: 7 books, 10 page link/ID checks, JS syntax, canonical categories, Beta 15 and recovery guard.')
print('PASS: split Construindo Mundos reconstructs all 14 volumes / 808 chapters exactly.')
