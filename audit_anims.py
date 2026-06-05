#!/usr/bin/env python3
"""Audit all 100 animations: check uniqueness, issues, centering"""
import re, json

with open('src/data/animations.ts','r') as f: c=f.read()

entries=[]
for m in re.finditer(r'  \{id:(\d+)',c):
    s=m.start();d=0
    for j in range(s,len(c)):
        if c[j]=='{':d+=1
        elif c[j]=='}':
            d-=1
            if d==0:entries.append((m.group(1),c[s:j+1]));break

def g(e,key):
    if key=='id':
        m=re.search(r'id:(\d+)',e);return m.group(1) if m else '?'
    m=re.search(re.escape(key)+r":'([^']*)'",e)
    return m.group(1) if m else ''

issues=[]
unique_cats={}

for eid,e in entries:
    title=g(e,'title')
    cat=g(e,'category')
    js=g(e,'js')
    css=g(e,'css')
    html=g(e,'html')
    
    # 1. Basic health checks
    if not js.strip():
        issues.append(f'[{eid}] {title}: EMPTY JS')
        continue
    if len(js)<100:
        issues.append(f'[{eid}] {title}: JS too short ({len(js)} chars)')
    
    # 2. Check if Three.js import exists
    has_three_cdn = 'unpkg.com/three' in html or 'importmap' in html
    has_three_import = 'import*as THREE' in js or 'import * as THREE' in js or 'import{SphereGeometry' in js
    
    if not has_three_cdn and not has_three_import:
        issues.append(f'[{eid}] {title}: Missing ThreeJS import')
    
    # 3. Check for common bugs
    js_bugs=[]
    # Camera fov with no canvas
    if 'new THREE.PerspectiveCamera' not in js:
        js_bugs.append('No PerspectiveCamera')
    if 'new THREE.WebGLRenderer' not in js:
        js_bugs.append('No WebGLRenderer')
    if 'render(' not in js and 'r.render' not in js:
        js_bugs.append('No render call')
    if 'requestAnimationFrame' not in js:
        js_bugs.append('No animation loop')
    if 'canvas' not in js.lower() and 'document.getElementById' not in js:
        js_bugs.append('No canvas reference')
    
    if js_bugs:
        issues.append(f'[{eid}] {title}: MISSING: {", ".join(js_bugs)}')
    
    # 4. Check centering - camera position
    cam_match=re.search(r'cam\.position\.set\(([^)]+)\)',js)
    if not cam_match:
        cam_match=re.search(r'cam\.position\s*=\s*new.*?\(([^)]+)\)',js)
    if cam_match:
        pass  # camera position exists
    else:
        issues.append(f'[{eid}] {title}: No camera position')
    
    # 5. Track patterns for dedup
    # Extract geometry type
    geo_types=[]
    for gtype in ['SphereGeometry','BoxGeometry','TorusGeometry','TorusKnotGeometry',
                  'Points','Line','ConeGeometry','CylinderGeometry','PlaneGeometry',
                  'IcosahedronGeometry','DodecahedronGeometry','OctahedronGeometry',
                  'TubeGeometry','RingGeometry','ExtrudeGeometry','CircleGeometry']:
        if gtype in js: geo_types.append(gtype)
    
    # Simple feature vector
    features=f"{cat}|{','.join(sorted(geo_types))}|{'PointLight' in js}|{'AdditiveBlending' in js}|{'StandardMaterial' in js}|{'PhysicalMaterial' in js}"
    if features not in unique_cats:
        unique_cats[features]=[]
    unique_cats[features].append((eid,title))

print(f'Audited {len(entries)} entries')
print(f'\n{"="*50}')
print(f'ISSUES FOUND: {len(issues)}')
print(f'{"="*50}')
for i in issues[:30]:
    print(f'  {i}')

# Dedup analysis
print(f'\n{"="*50}')
print(f'UNIQUE PATTERNS: {len(unique_cats)}')
print(f'{"="*50}')

dupes=[]
for feat,items in unique_cats.items():
    if len(items)>1:
        dupes.append(items)

if dupes:
    print(f'\nSIMILAR GROUPS ({len(dupes)}):')
    for items in sorted(dupes,key=len,reverse=True)[:15]:
        names=[f'{eid}:{t}' for eid,t in items]
        print(f'  [{len(items)}x] {", ".join(names[:5])}'+('...' if len(items)>5 else ''))
else:
    print('No duplicates found')

# Recommend which to keep
print(f'\n{"="*50}')
print(f'RECOMMENDED: Keep ~40 best')
print(f'{"="*50}')
print(f'Remove entries: empty JS, missing render/animation loop, no Three.js')
print(f'Keep 1 per similar group (keep the most complex one)')
