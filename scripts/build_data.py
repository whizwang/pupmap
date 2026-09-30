"""Rebuild with: python scripts/build_data.py --download (requires shapely).
Only derived summaries and simplified public geometry are shipped to the browser.
"""
import json, re, sys, urllib.request
from pathlib import Path
from collections import Counter, defaultdict
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
ROOT=Path(__file__).resolve().parents[1]
CACHE=Path('/tmp')
SOURCES={
 'records': 'https://data.cityofnewyork.us/resource/nu7n-tubp.json?%24where=extract_year%3D%272024%27&%24limit=150000',
 'geo': 'https://data.cityofnewyork.us/resource/35j5-n34v.geojson?%24limit=1000',
 'boroughs': 'https://data.cityofnewyork.us/resource/gthc-hcne.geojson?%24limit=10'}
if '--download' in sys.argv:
 for key,url in SOURCES.items(): urllib.request.urlretrieve(url,CACHE/f'pupmap-{key}.json')
raw=json.loads((CACHE/'pupmap-records.json').read_text())
assert isinstance(raw,list) and len(raw)<150000 and all(r['extract_year']=='2024' for r in raw)
# Exact equality of ALL source columns, before normalization. No dog-level inference.
records=list({json.dumps(r,sort_keys=True):r for r in raw}.values())
boroughs=json.loads((CACHE/'pupmap-boroughs.json').read_text())
boros=[(f['properties']['boroname'],shape(f['geometry']).buffer(0)) for f in boroughs['features']]
land=unary_union([g for _,g in boros])
geo=json.loads((CACHE/'pupmap-geo.json').read_text())
features=[]; lookup={}
for f in geo['features']:
 z=f['properties']['zcta5']; g=shape(f['geometry']).buffer(0).intersection(land)
 # Source subset includes adjacent non-NYC areas. Require a NYC postal prefix and land overlap.
 if not re.fullmatch(r'(?:(100|101|102|103|104|111|112|113|114|116)\d{2}|11004|11005)',z) or g.is_empty: continue
 overlaps=[(n,g.intersection(b).area) for n,b in boros]
 names=[n for n,a in overlaps if a>g.area*.01]
 lookup[z]=' / '.join(names)
 g=g.simplify(.000025,preserve_topology=True)
 features.append({'type':'Feature','properties':{'zip':z,'borough':lookup[z]},'geometry':mapping(g)})
# Documented clear label synonyms only; mixed categories are never folded into purebreds.
ALIASES={'bull dog, french':'French Bulldog','retriever, labrador':'Labrador Retriever','retriever, golden':'Golden Retriever','dachshund smooth coat':'Dachshund, Smooth Coat'}
BAD_NAMES={'','unknown','name not provided','not provided','n/a','na','none','no name','unnamed','dog','name','null','unavailable','not named','tbd'}
BAD_BREEDS={'','unknown','n/a','na','none','not provided','name not provided','null'}
def norm(s): return ' '.join(str(s or '').split()).casefold()
byzip=defaultdict(list)
for r in records:
 z=r.get('zipcode','')
 if re.fullmatch(r'(?:(100|101|102|103|104|111|112|113|114|116)\d{2}|11004|11005)',z): byzip[z].append(r)
def ranking(c):
 return [{'name':n,'count':v} for n,v in sorted(c.items(),key=lambda x:(-x[1],x[0]))]
summaries={}
for z,rows in byzip.items():
 breeds=Counter(); names=Counter()
 for r in rows:
  b=norm(r.get('breedname')); n=norm(r.get('animalname'))
  if b not in BAD_BREEDS: breeds[ALIASES.get(b,b.title())]+=1
  if n not in BAD_NAMES and not re.fullmatch(r'[\W\d_]+',n): names[n.title()]+=1
 summaries[z]={'total':len(rows),'breedRecords':sum(breeds.values()),'namedRecords':sum(names.values()),'breeds':ranking(breeds),'names':[n for n in ranking(names) if n['count']==max(names.values(),default=0)],'borough':lookup.get(z)}
 # Keep top three distinct count tiers, preserving every tie at each tier.
 tiers=sorted(set(breeds.values()),reverse=True)[:3]
 summaries[z]['breeds']=[b for b in summaries[z]['breeds'] if b['count'] in tiers]
meta={'year':2024,'retrieved':'2026-09-30','sourceRecords':len(raw),'exactDuplicatesRemoved':len(raw)-len(records),'retainedRecords':len(records),'nycRecords':sum(s['total'] for s in summaries.values()),'availableYears':[2026,2024,2023,2022,2018,2017,2016],'breedAliases':ALIASES,'excludedNames':sorted(BAD_NAMES),'excludedBreeds':sorted(BAD_BREEDS),'sources':SOURCES}
for name,data in [('summary',{'meta':meta,'zips':summaries}),('zip-areas',{'type':'FeatureCollection','features':features}),('boroughs',{'type':'FeatureCollection','features':[{'type':'Feature','properties':{'name':n},'geometry':mapping(g.simplify(.00004,preserve_topology=True))} for n,g in boros]})]:
 (ROOT/'public'/'data'/f'{name}.json').write_text(json.dumps(data,separators=(',',':')))
print(json.dumps(meta,indent=2)); print(len(summaries),'ZIP summaries;',len(features),'map areas')
