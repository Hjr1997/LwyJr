#!/usr/bin/env python3
"""Rewrite 11 animations - make them truly stunning"""
import re, json

B="body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a2e;font-family:-apple-system,'SF Pro Display','PingFang SC',sans-serif}"
C="body,html{margin:0;width:100%;height:100%;overflow:hidden;background:#000}canvas{display:block}"
def esc(s):return s.replace('\\','\\\\').replace("'","\\'")

with open('src/data/animations.ts','r') as f: c=f.read()

# Parse entries - each starts with space-space-{id:
entries = []
for m in re.finditer(r'  \{id:(\d+)', c):
    start = m.start()
    depth = 0
    end = start
    for j in range(start, len(c)):
        if c[j] == '{': depth += 1
        elif c[j] == '}':
            depth -= 1
            if depth == 0:
                end = j+1
                break
    entries.append(c[start:end])

print(f'Parsed {len(entries)} entries')

def get_field(e, key):
    m = re.search(re.escape(key)+r":'([^']*)'", e)
    return m.group(1) if m else ""

def make_title(e):
    m = re.search(r"title:'([^']*)'", e)
    return m.group(1) if m else "?"

# Replace map
replacements = {}

# 1. Kaleidoscope - recursive symmetry with dragging
replacements['万花筒对称'] = (
    "Canvas递归对称万花筒",
    "拖动鼠标绘制实时万花筒，多层递归对称",
    "canvas", "🌀", "高级",
    '<canvas id="kale" width="400" height="400"></canvas>',
    'body,html{margin:0;display:flex;align-items:center;justify-content:center;background:#000}',
    "(function(){var c=document.getElementById('kale'),w=400,h=400,ctx=c.getContext('2d'),segs=12,pts=[],mx=w/2,my=h/2,down=false;c.onmousedown=function(){down=true};c.onmouseup=function(){down=false};c.onmousemove=function(e){if(!down)return;var r=c.getBoundingClientRect(),nx=e.clientX-r.left,ny=e.clientY-r.top,dx=nx-w/2,dy=ny-h/2,dist=Math.sqrt(dx*dx+dy*dy);if(dist<190)pts.push({x:dx,y:dy,life:1,color:'hsl('+(Date.now()/5)%360+',80%,60%)'});mx=nx;my=ny};function draw(){ctx.fillStyle='rgba(0,0,0,.1)';ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(w/2,h/2);for(var s=0;s<segs;s++){ctx.save();ctx.rotate(s*Math.PI*2/segs);for(var i=pts.length-1;i>=0;i--){var p=pts[i];p.life-=0.004;if(p.life<=0){pts.splice(i,1);continue}var s2=1+p.life*0.5;ctx.beginPath();ctx.arc(p.x,p.y,4*p.life,0,Math.PI*2);ctx.fillStyle=p.color.replace('60%',(40+40*p.life)+'%').replace('1)',p.life+')');ctx.fill();ctx.beginPath();ctx.arc(-p.x,p.y,4*p.life,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(p.x,-p.y,4*p.life,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(-p.x,-p.y,4*p.life,0,Math.PI*2);ctx.fill()}ctx.restore()}ctx.restore();requestAnimationFrame(draw)}draw()})()"
)

# 2. DLA Brownian - more organic with branch coloring
replacements['布朗运动树'] = (
    "DDLA闪电分形树",
    "扩散限制聚集生成有机闪电树，色彩随生长变化",
    "canvas", "🌿", "高级",
    '<canvas id="dla"></canvas>',
    C,
    "(function(){var c=document.getElementById('dla'),w=c.width=innerWidth,h=c.height=innerHeight,ctx=c.getContext('2d'),res=3,cw=Math.floor(w/res),ch=Math.floor(h/res),grid=[];for(var i=0;i<cw;i++){grid[i]=[];for(var j=0;j<ch;j++)grid[i][j]=0}var rootX=Math.floor(cw/2),rootY=ch-5;grid[rootX][rootY]=1;var totalStuck=0;function spawn(){var a=Math.random()*Math.PI*2,r=Math.min(cw,ch)*0.45;return{x:Math.floor(rootX+Math.cos(a)*r),y:Math.floor(rootY+Math.sin(a)*r)}}function step(){var p=spawn();for(var s=0;s<800;s++){if(p.x<1||p.x>=cw-1||p.y<1||p.y>=ch-1)return;var stuck=false;for(var dx=-1;dx<=1;dx++)for(var dy=-1;dy<=1;dy++){if(dx===0&&dy===0)continue;var nx=p.x+dx,ny=p.y+dy;if(nx>=0&&nx<cw&&ny>=0&&ny<ch&&grid[nx][ny]>0)stuck=true}if(stuck){var dist=Math.sqrt((p.x-rootX)*(p.x-rootX)+(p.y-rootY)*(p.y-rootY))/Math.min(cw,ch);grid[p.x][p.y]=totalStuck+1;totalStuck++;var hue=40+dist*40,sat=60+dist*30,light=30+dist*40;ctx.fillStyle='hsl('+hue+','+sat+'%,'+light+'%)';ctx.fillRect(p.x*res,p.y*res,res,res);return}p.x+=Math.floor(Math.random()*3)-1;p.y+=Math.floor(Math.random()*3)-1}}var si=setInterval(function(){for(var i=0;i<10;i++)step();if(totalStuck>5000)clearInterval(si)},1)})()"
)

# 3. Raymarching - proper lighting with multiple shapes
replacements['Raymarching光线步进'] = (
    "Raymarching多物体光影",
    "光线步进渲染球体+盒子+环面，动态光影着色",
    "canvas", "💡", "高级",
    '<canvas id="ray"></canvas>',
    C,
    "(function(){var c=document.getElementById('ray'),w=c.width=innerWidth,h=c.height=innerHeight,ctx=c.getContext('2d'),iData=ctx.createImageData(w,h),d=iData.data;function sdSphere(p,r){return Math.sqrt(p.x*p.x+p.y*p.y+(p.z-3)*(p.z-3))-r}function sdBox(p,b){var q={x:Math.abs(p.x-2)-b.x,y:Math.abs(p.y+0.4)-b.y,z:Math.abs(p.z-4.5)-b.z};return Math.max(q.x,Math.max(q.y,q.z))}function sdTorus(p){var q={x:Math.sqrt(p.x*p.x+p.z*p.z)-0.8,y:p.y};return Math.sqrt(q.x*q.x+q.y*q.y)-0.3}function scene(p){return Math.min(sdSphere(p,1),sdBox(p,{x:0.6,y:0.6,z:0.6}),sdBox(p,{x:0.3,y:1.2,z:0.3}))}function calcNormal(p){var e=0.001;return{x:scene({x:p.x+e,y:p.y,z:p.z})-scene({x:p.x-e,y:p.y,z:p.z}),y:scene({x:p.x,y:p.y+e,z:p.z})-scene({x:p.x,y:p.y-e,z:p.z}),z:scene({x:p.x,y:p.y,z:p.z+e})-scene({x:p.x,y:p.y,z:p.z-e})}}var t=0;function draw(){t+=0.01;var light={x:Math.sin(t)*3,y:Math.cos(t*0.7)*3,z:2+Math.sin(t*0.5)*2};for(var y=0;y<h;y++)for(var x=0;x<w;x++){var uv={x:(x/w-0.5)*2*(w/h),y:-(y/h-0.5)*2,z:-1};var m=Math.sqrt(uv.x*uv.x+uv.y*uv.y+uv.z*uv.z);var rd={x:uv.x/m,y:uv.y/m,z:uv.z/m},ro={x:0,y:0,z:4},dist=0,hit=false;for(var i=0;i<80;i++){var cp={x:ro.x+rd.x*dist,y:ro.y+rd.y*dist,z:ro.z+rd.z*dist};var sd=scene(cp);if(sd<0.0005){hit=true;break}dist+=sd}var idx=(y*w+x)*4;if(hit){var n=calcNormal({x:ro.x+rd.x*dist,y:ro.y+rd.y*dist,z:ro.z+rd.z*dist});var nl=Math.sqrt(n.x*n.x+n.y*n.y+n.z*n.z);n.x/=nl;n.y/=nl;n.z/=nl;var ld={x:light.x-cp_pos(ro,rd,dist).x,y:light.y-cp_pos(ro,rd,dist).y,z:light.z-cp_pos(ro,rd,dist).z};var cp2={x:ro.x+rd.x*dist,y:ro.y+rd.y*dist,z:ro.z+rd.z*dist};var ldx=light.x-cp2.x,ldy=light.y-cp2.y,ldz=light.z-cp2.z;var ldl=Math.sqrt(ldx*ldx+ldy*ldy+ldz*ldz);ldx/=ldl;ldy/=ldl;ldz/=ldl;var diff=Math.max(0,n.x*ldx+n.y*ldy+n.z*ldz);var amb=0.15;var bri=amb+diff*0.85;d[idx]=Math.min(255,140*bri);d[idx+1]=Math.min(255,100*bri);d[idx+2]=Math.min(255,180*bri);d[idx+3]=255}else{d[idx]=8;d[idx+1]=8;d[idx+2]=24;d[idx+3]=255}}ctx.putImageData(iData,0,0);requestAnimationFrame(draw)}function cp_pos(ro,rd,dist){return{x:ro.x+rd.x*dist,y:ro.y+rd.y*dist,z:ro.z+rd.z*dist}}draw()})()"
)

# 4. Fractal tree - Pythagoras tree with leaves
replacements['分形树生成'] = (
    "Pythagoras七彩分形树",
    "Pythagoras树分形+七彩叶子+风动效果",
    "canvas", "🌳", "高级",
    '<canvas id="tree"></canvas>',
    C,
    "(function(){var c=document.getElementById('tree'),w=c.width=innerWidth,h=c.height=innerHeight,ctx=c.getContext('2d'),wind=0,time=0;function drawSquare(x,y,size,angle,depth){if(size<3||depth>12)return;ctx.save();ctx.translate(x,y);ctx.rotate(angle);var s=size*0.7;ctx.fillStyle='hsl('+(30+depth*8+time*5)%360+',60%,'+(25+depth*4)+'%)';ctx.fillRect(-size/2,-size,size,size);ctx.strokeStyle='rgba(255,255,255,.1)';ctx.strokeRect(-size/2,-size,size,size);if(depth>7){ctx.fillStyle='hsl('+(depth*20+time*30)%360+',80%,60%)';ctx.beginPath();ctx.arc(0,-size,size*0.35,0,Math.PI*2);ctx.fill()}var sway=Math.sin(time*2+depth)*0.08;drawSquare(-size*0.15,-size-size*0.15,s,angle-0.7+sway+wind,depth+1);drawSquare(size*0.85,-size-size*0.15,s,angle+0.7+sway-wind,depth+1);ctx.restore()}function draw(){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(0,0,w,h);drawSquare(w/2,h-50,60,-Math.PI/2,0);time+=0.02;wind=Math.sin(time*0.5)*0.05;requestAnimationFrame(draw)}draw()})()"
)

# 5. Saturn with rings - more impressive 3D
replacements['CSS3D行星环'] = (
    "CSS3D土星环系统",
    "土星+多层环带+阴影+卫星，完整行星系统",
    "3d", "🪐", "高级",
    '<div class="saturn"><div class="sat-planet"></div><div class="sat-ring sr1"></div><div class="sat-ring sr2"></div><div class="sat-ring sr3"></div><div class="sat-moon"></div></div>',
    B+".saturn{width:200px;height:200px;position:relative;transform-style:preserve-3d;animation:sat-float 4s ease-in-out infinite}.sat-planet{position:absolute;width:70px;height:70px;background:radial-gradient(circle at 35% 35%,#f5d6a8,#e8b870,#c89550,#a07030);border-radius:50%;top:65px;left:65px;box-shadow:inset -8px -8px 16px rgba(0,0,0,.4),0 0 20px rgba(200,150,80,.3);transform:rotate(-15deg)}.sat-planet::after{content:'';position:absolute;width:100%;height:100%;border-radius:50%;background:linear-gradient(transparent 40%,rgba(0,0,0,.15) 60%,transparent 75%);top:0;left:0}.sat-ring{position:absolute;border-radius:50%;left:50%;top:50%;transform-origin:center;border-width:8px;border-style:solid}.sr1{width:140px;height:140px;margin-left:-70px;margin-top:-70px;transform:rotateX(75deg);border-color:rgba(210,170,120,.5) transparent rgba(200,150,100,.3) transparent;animation:sr-rot 8s linear infinite}.sr2{width:155px;height:155px;margin-left:-77px;margin-top:-77px;transform:rotateX(72deg);border-color:transparent rgba(180,130,90,.3) transparent rgba(190,150,110,.4);animation:sr-rot 6s linear infinite reverse}.sr3{width:165px;height:165px;margin-left:-82px;margin-top:-82px;transform:rotateX(78deg);border-color:rgba(160,120,80,.2) transparent rgba(170,130,90,.15) transparent;animation:sr-rot 12s linear infinite}.sat-moon{position:absolute;width:10px;height:10px;background:#ddd;border-radius:50%;top:15px;left:50%;margin-left:-5px;animation:moon-orbit 3s linear infinite;transform-origin:100px 85px}@keyframes sat-float{0%,100%{transform:translateY(0) rotateY(0)}50%{transform:translateY(-12px) rotateY(10deg)}}@keyframes sr-rot{to{transform:rotateX(75deg) rotateZ(360deg)}}@keyframes moon-orbit{to{transform:rotate(360deg)}}"
)

# 6. Origami bird - realistic wing flap
replacements['CSS3D折纸'] = (
    "CSS3D千纸鹤",
    "折纸千纸鹤双翼扑动+身体摇摆+3D景深",
    "3d", "🦅", "高级",
    '<div class="crane"><div class="cr-body"></div><div class="cr-wing left"></div><div class="cr-wing right"></div><div class="cr-head"></div><div class="cr-tail"></div></div>',
    B+".crane{position:relative;width:160px;height:140px;animation:crane-bob 2s ease-in-out infinite}.cr-body{position:absolute;width:30px;height:50px;background:linear-gradient(135deg,#fff,#e0e0e0);border-radius:50%;top:45px;left:65px;transform:rotate(-10deg);box-shadow:0 4px 12px rgba(0,0,0,.2)}.cr-head{position:absolute;width:18px;height:22px;background:linear-gradient(135deg,#e74c3c,#c0392b);border-radius:50% 50% 30% 30%;top:25px;left:75px;transform:rotate(15deg)}.cr-tail{position:absolute;width:8px;height:40px;background:linear-gradient(#ddd,#bbb);border-radius:0 0 8px 8px;top:55px;left:58px;transform:rotate(30deg)}.cr-wing{position:absolute;width:50px;height:70px;background:linear-gradient(180deg,#fff 60%,#e8e8e8);border-radius:50% 80% 50% 50%;transform-origin:right top;top:30px;box-shadow:0 6px 20px rgba(0,0,0,.15)}.left{left:20px;animation:flapL .5s ease-in-out infinite alternate}.right{left:90px;animation:flapR .5s ease-in-out .25s infinite alternate;transform-origin:left top;border-radius:80% 50% 50% 50%}@keyframes flapL{0%{transform:rotate(-5deg) rotateX(10deg)}100%{transform:rotate(-70deg) rotateX(-20deg)}}@keyframes flapR{0%{transform:rotate(5deg) rotateX(10deg)}100%{transform:rotate(70deg) rotateX(-20deg)}}@keyframes crane-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}"
)

# 7. SVG audio spectrum - way more bars, better animation
replacements['SVG音波频谱'] = (
    "SVG实时频谱可视化",
    "64段频谱柱+渐变色彩+频波动画",
    "svg", "🎵", "高级",
    '<svg viewBox="0 0 500 200" width="500" style="width:500px"><defs><linearGradient id="specGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#667eea"/><stop offset="50%" stop-color="#764ba2"/><stop offset="100%" stop-color="#ff375f"/></linearGradient></defs><rect width="500" height="200" fill="#0a0a2e"/>'+"".join(['<rect x="'+str(14+i*7)+'" y="100" width="5" fill="url(#specGrad)" rx="2"><animate attributeName="height" values="60;'+str(15+((i*7+i*i*3)%130))+';60;'+str(20+((i*13+i*i*5)%110))+';60" dur="'+str(0.7+(i*11)%30*.02)+'s" repeatCount="indefinite"/><animate attributeName="y" values="120;'+str(160-((i*7+i*i*3)%130))+'0;120;'+str(150-((i*13+i*i*5)%110))+'0;120" dur="'+str(0.7+(i*11)%30*.02)+'s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.7;1;0.7;0.9;0.7" dur="'+str(0.8+(i*7)%40*.03)+'s" repeatCount="indefinite"/></rect>' for i in range(64)])+'</svg>',
    B
)

# 8. SVG fireworks - multiple bursts
replacements['SVG烟火秀'] = (
    "SVG多层烟花绽放",
    "3层烟花同时绽放+粒子散射+渐变色彩",
    "svg", "🎆", "高级",
    '<svg viewBox="0 0 500 350" width="500" style="width:500px"><defs><radialGradient id="fw1"><stop offset="0%" stop-color="#fff"/><stop offset="30%" stop-color="#ff375f"/><stop offset="100%" stop-color="transparent"/></radialGradient><radialGradient id="fw2"><stop offset="0%" stop-color="#fff"/><stop offset="30%" stop-color="#ff9f0a"/><stop offset="100%" stop-color="transparent"/></radialGradient><radialGradient id="fw3"><stop offset="0%" stop-color="#fff"/><stop offset="30%" stop-color="#667eea"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><rect width="500" height="350" fill="#0a0a2e"/>'+"".join(['<circle cx="'+str(int(120+((i*137)%260)))+'" cy="'+str(int(80+((i*53)%120)))+'" r="3" fill="url(#fw1)"><animate attributeName="r" values="0;'+str(8+((i*11)%20))+';0" dur="'+str(1.5+i*0.04)+'s" begin="0s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="'+str(1.5+i*0.04)+'s" begin="0s" repeatCount="indefinite"/></circle>' for i in range(30)])+"".join(['<circle cx="'+str(int(250+((i*143)%240)))+'" cy="'+str(int(200+((i*47)%100)))+'" r="2" fill="url(#fw2)"><animate attributeName="r" values="0;'+str(6+((i*9)%16))+';0" dur="'+str(1.8+i*0.05)+'s" begin="0.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="'+str(1.8+i*0.05)+'s" begin="0.5s" repeatCount="indefinite"/></circle>' for i in range(25)])+"".join(['<circle cx="'+str(int(350+((i*157)%180)))+'" cy="'+str(int(140+((i*61)%140)))+'" r="2" fill="url(#fw3)"><animate attributeName="r" values="0;'+str(7+((i*13)%18))+';0" dur="'+str(2+i*0.06)+'s" begin="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="'+str(2+i*0.06)+'s" begin="1s" repeatCount="indefinite"/></circle>' for i in range(20)])+'</svg>',
    B
)

# 9. CSS Mobius - true illusion with segments
replacements['CSS莫比乌斯环'] = (
    "CSS3D莫比乌斯带",
    "16段精确莫比乌斯扭曲+渐变着色+旋转",
    "3d", "♾️", "高级",
    '<div class="mobius">'+"".join(['<div class="ms" style="--s:'+str(j)+'"></div>' for j in range(16)])+'</div>',
    B+".mobius{width:180px;height:180px;position:relative;transform-style:preserve-3d;animation:mb2 12s linear infinite}.ms{position:absolute;width:50px;height:5px;background:hsl(calc(var(--s)*22.5),80%,60%);top:50%;left:50%;margin-left:-25px;margin-top:-2px;border-radius:3px;transform:rotateY(calc(var(--s)*22.5deg)) translateZ(55px) rotateX(calc(var(--s)*22.5deg))}.ms::after{content:'';position:absolute;inset:0;background:inherit;filter:brightness(.5);border-radius:3px;transform:rotateX(180deg) translateZ(1px)}@keyframes mb2{to{transform:rotateY(360deg) rotateX(360deg)}}"
)

# 10. Fiber network - data packets animating
replacements['CSS光纤网络'] = (
    "CSS数据流神经网络",
    "节点脉冲+连线数据包动画+色调旋转",
    "css", "🔗", "高级",
    '<div class="net"><div class="net-node n0"></div><div class="net-node n1"></div><div class="net-node n2"></div><div class="net-node n3"></div><div class="net-node n4"></div><div class="net-node n5"></div><div class="net-line l01"></div><div class="net-line l02"></div><div class="net-line l13"></div><div class="net-line l14"></div><div class="net-line l25"></div><div class="net-line l34"></div><div class="net-line l35"></div><div class="net-packet p01"></div><div class="net-packet p14"></div><div class="net-packet p25"></div></div>',
    B+".net{position:relative;width:300px;height:280px;animation:net-hue 8s linear infinite}.net-node{position:absolute;width:14px;height:14px;border-radius:50%;background:#667eea;box-shadow:0 0 16px #667eea,0 0 32px rgba(102,126,234,.3);animation:net-pulse 2s ease-in-out infinite,z-index:2}.net-node:nth-child(2){animation-delay:.3s;background:#2ecc71;box-shadow:0 0 16px #2ecc71}.net-node:nth-child(3){animation-delay:.6s;background:#ff375f;box-shadow:0 0 16px #ff375f}.net-node:nth-child(4){animation-delay:.9s;background:#ff9f0a;box-shadow:0 0 16px #ff9f0a}.net-node:nth-child(5){animation-delay:1.2s;background:#9b59b6;box-shadow:0 0 16px #9b59b6}.net-node:nth-child(6){animation-delay:1.5s;background:#3498db;box-shadow:0 0 16px #3498db}.n0{top:20px;left:80px}.n1{top:100px;left:20px}.n2{top:100px;left:200px}.n3{top:180px;left:60px}.n4{top:180px;left:160px}.n5{top:250px;left:140px}.net-line{position:absolute;height:2px;background:rgba(102,126,234,.15);transform-origin:left}.l01{top:27px;left:87px;width:135px;transform:rotate(55deg)}.l02{top:27px;left:87px;width:193px;transform:rotate(37deg)}.l13{top:165px;left:90px;width:85px;transform:rotate(-50deg)}.l14{top:165px;left:130px;width:57px;transform:rotate(10deg)}.l25{top:230px;left:195px;width:58px;transform:rotate(-140deg)}.l34{top:187px;left:67px;width:97px;transform:rotate(0deg)}.l35{top:225px;left:97px;width:68px;transform:rotate(30deg)}.net-packet{position:absolute;width:6px;height:6px;background:#fff;border-radius:50%;box-shadow:0 0 8px #fff}.p01{top:27px;left:87px;animation:packet01 2s linear infinite}.p14{top:187px;left:95px;animation:packet14 2.5s linear infinite}.p25{top:230px;left:195px;animation:packet25 3s linear infinite}@keyframes net-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.8)}}@keyframes net-hue{to{filter:hue-rotate(360deg)}}@keyframes packet01{0%{transform:translate(0,0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translate(135px,100px);opacity:0}}@keyframes packet14{0%{transform:translate(0,0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translate(65px,10px);opacity:0}}@keyframes packet25{0%{transform:translate(0,0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translate(-55px,-10px);opacity:0}}"
)

# 11. Gears - proper meshing
replacements['CSS机械齿轮'] = (
    "CSS3D啮合齿轮组",
    "3齿轮精确啮合+齿纹+旋转联动",
    "3d", "⚙️", "高级",
    '<div class="gears"><div class="gr gr-outer"><div class="gr-tooth"></div></div><div class="gr gr-mid"><div class="gr-tooth"></div></div><div class="gr gr-inner"><div class="gr-tooth"></div></div></div>',
    B+".gears{position:relative;width:280px;height:280px}.gr{position:absolute;border-radius:50%;border:3px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;animation:gr-rot 8s linear infinite}.gr::after{content:'';position:absolute;width:18px;height:18px;background:radial-gradient(circle,#667eea,#333);border-radius:50%}.gr-tooth{position:absolute;width:10px;height:24px;background:linear-gradient(180deg,rgba(255,255,255,.2),rgba(255,255,255,.05));border-radius:3px}.gr-outer{width:140px;height:140px;top:70px;left:70px;animation-duration:10s}.gr-mid{width:90px;height:90px;top:10px;left:10px;animation-duration:6s;animation-direction:reverse}.gr-inner{width:60px;height:60px;top:180px;left:180px;animation-duration:4s;animation-direction:reverse}.gr-outer .gr-tooth{top:-10px;left:65px}.gr-outer::after{top:61px;left:61px}.gr-mid .gr-tooth{top:-6px;left:40px;height:16px;width:8px}.gr-mid::after{top:36px;left:36px;width:12px;height:12px}.gr-inner .gr-tooth{top:-5px;left:25px;height:12px;width:6px}.gr-inner::after{top:22px;left:22px;width:10px;height:10px}@keyframes gr-rot{to{transform:rotate(360deg)}}"
)

# Now apply replacements
new_entries = []
for e in entries:
    title = make_title(e)
    if title in replacements:
        r = replacements[title]
        new_e = f"  {{id:{get_field(e,'id')},title:'{esc(r[0])}',desc:'{esc(r[1])}',category:'{esc(r[2])}',icon:'{esc(r[3])}',difficulty:'{esc(r[4])}',html:'{esc(r[5])}',css:'{esc(r[6])}',js:'{esc(r[7])}'}}"
        new_entries.append(new_e)
        print(f'✅ Replaced: {title}')
    else:
        new_entries.append(e)

# Find the array content
start = c.index('export const animations: AnimationItem[] = [\n') + len('export const animations: AnimationItem[] = [\n')
end = c.rindex('\n]')
new_content = c[:start] + ',\n'.join(new_entries) + '\n]'

with open('src/data/animations.ts','w') as f: f.write(new_content)

# Verify
import re
ids = re.findall(r'{id:(\d+)', new_content)
cats = {}
for m in re.finditer(r"category:'(\w+)'", new_content): cats[m.group(1)]=cats.get(m.group(1),0)+1
print(f'\nResult: {len(ids)} animations | Braces: {new_content.count("{")==new_content.count("}")}')
for k,v in sorted(cats.items()): print(f'  {k}: {v}')
print(f'Quotes even: {new_content.count(chr(39))%2==0}')
json.load(open('src/data/props-reference.json'))
print('JSON OK ✅')
