#!/usr/bin/env python3
"""Rewrite 11 animations - truly stunning versions"""
import re, json, os

B="body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a2e;font-family:-apple-system,'SF Pro Display','PingFang SC',sans-serif}"
C="body,html{margin:0;width:100%;height:100%;overflow:hidden;background:#000}canvas{display:block}"
def esc(s):return s.replace('\\','\\\\').replace("'","\\'")

with open('src/data/animations.ts','r') as f: c=f.read()

# Parse entries
entries = []
for m in re.finditer(r'  \{id:\d+', c):
    start = m.start()
    depth = 0
    for j in range(start, len(c)):
        if c[j]=='{':depth+=1
        elif c[j]=='}':
            depth-=1
            if depth==0:entries.append(c[start:j+1]);break

print(f'Parsed {len(entries)} entries')

def get_id(e):
    m=re.search(r'id:(\d+)',e)
    return m.group(1) if m else "0"

def get_title(e):
    m=re.search(r"title:'([^']*)'",e)
    return m.group(1) if m else "?"

# === Build replacements ===
R={}

R['万花筒对称']=(get_title,get_id,"Canvas递归对称万花筒","拖动绘制实时对称万花筒，多层递归反射", "canvas","🌀","高级",
    '<canvas id="kale" width="400" height="400"></canvas>',
    'body,html{margin:0;display:flex;align-items:center;justify-content:center;background:#000}',
    "(function(){var c=document.getElementById('kale'),w=400,h=400,ctx=c.getContext('2d'),segs=14,pts=[],down=false;c.onmousedown=function(){down=true};c.onmouseup=function(){down=false};c.onmousemove=function(e){if(!down)return;var r=c.getBoundingClientRect(),nx=e.clientX-r.left,ny=e.clientY-r.top,dx=nx-w/2,dy=ny-h/2,dist=Math.sqrt(dx*dx+dy*dy);if(dist<190)pts.push({x:dx,y:dy,life:1,color:'hsl('+(Date.now()/5)%360+',80%,60%)'})};function draw(){ctx.fillStyle='rgba(0,0,0,.1)';ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(w/2,h/2);for(var s=0;s<segs;s++){ctx.save();ctx.rotate(s*Math.PI*2/segs);for(var i=pts.length-1;i>=0;i--){var p=pts[i];p.life-=0.004;if(p.life<=0){pts.splice(i,1);continue}ctx.beginPath();ctx.arc(p.x,p.y,5*p.life,0,Math.PI*2);ctx.fillStyle=p.color.replace('60%',(40+40*p.life)+'%').replace('1)',p.life+')');ctx.fill();ctx.beginPath();ctx.arc(-p.x,p.y,5*p.life,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(p.x,-p.y,5*p.life,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(-p.x,-p.y,5*p.life,0,Math.PI*2);ctx.fill()}ctx.restore()}ctx.restore();requestAnimationFrame(draw)}draw()})()")

R['布朗运动树']=(get_title,get_id,"DDLA闪电分形树","扩散限制聚集+有机闪电分形+渐变着色", "canvas","🌿","高级",
    '<canvas id="dla"></canvas>',C,
    "(function(){var c=document.getElementById('dla'),w=c.width=innerWidth,h=c.height=innerHeight,ctx=c.getContext('2d'),res=3,cw=Math.floor(w/res),ch=Math.floor(h/res),grid=[];for(var i=0;i<cw;i++){grid[i]=[];for(var j=0;j<ch;j++)grid[i][j]=0}var rx=Math.floor(cw/2),ry=ch-5;grid[rx][ry]=1;var total=0;function spawn(){var a=Math.random()*Math.PI*2,r=Math.min(cw,ch)*.45;return{x:Math.floor(rx+Math.cos(a)*r),y:Math.floor(ry+Math.sin(a)*r)}}function step(){var p=spawn();for(var s=0;s<800;s++){if(p.x<1||p.x>=cw-1||p.y<1||p.y>=ch-1)return;var stuck=false;for(var dx=-1;dx<=1;dx++)for(var dy=-1;dy<=1;dy++){if(dx===0&&dy===0)continue;var nx=p.x+dx,ny=p.y+dy;if(nx>=0&&nx<cw&&ny>=0&&ny<ch&&grid[nx][ny]>0)stuck=true}if(stuck){var dist=Math.sqrt((p.x-rx)*(p.x-rx)+(p.y-ry)*(p.y-ry))/Math.min(cw,ch);grid[p.x][p.y]=total+1;total++;var hue=40+dist*50,sat=60+dist*30,light=30+dist*50;ctx.fillStyle='hsl('+hue+','+sat+'%,'+light+'%)';ctx.fillRect(p.x*res,p.y*res,res,res);return}p.x+=Math.floor(Math.random()*3)-1;p.y+=Math.floor(Math.random()*3)-1}}var si=setInterval(function(){for(var i=0;i<5;i++)step();if(total>5000)clearInterval(si)},1)})()")

R['Raymarching光线步进']=(get_title,get_id,"Raymarching动态光影","光线步进球体+盒子+环面+Phong着色", "canvas","💡","高级",
    '<canvas id="ray"></canvas>',C,
    "(function(){var c=document.getElementById('ray'),w=c.width=innerWidth,h=c.height=innerHeight,ctx=c.getContext('2d'),d=new Uint8ClampedArray(w*h*4);function sdSphere(p,r){var dx=p.x,dy=p.y,dz=p.z-3;return Math.sqrt(dx*dx+dy*dy+dz*dz)-r}function sdBox(p,b){var q={x:Math.abs(p.x-2)-b.x,y:Math.abs(p.y+0.3)-b.y,z:Math.abs(p.z-4.5)-b.z};return Math.max(Math.max(q.x,q.y),q.z)}function scene(p){return Math.min(sdSphere(p,1),sdBox(p,{x:.5,y:.5,z:.5}),sdBox(p,{x:.3,y:1.5,z:.3}))}function nrm(p){var e=.001;return{x:scene({x:p.x+e,y:p.y,z:p.z})-scene({x:p.x-e,y:p.y,z:p.z}),y:scene({x:p.x,y:p.y+e,z:p.z})-scene({x:p.x,y:p.y-e,z:p.z}),z:scene({x:p.x,y:p.y,z:p.z+e})-scene({x:p.x,y:p.y,z:p.z-e})}}var tm=0;function draw(){tm+=.008;var lt={x:Math.sin(tm)*3,y:Math.cos(tm*.7)*3,z:2+Math.sin(tm*.5)*2};for(var y=0;y<h;y++)for(var x=0;x<w;x++){var uv={x:(x/w-.5)*2*(w/h),y:-(y/h-.5)*2,z:-1},ml=Math.sqrt(uv.x*uv.x+uv.y*uv.y+uv.z*uv.z),rd={x:uv.x/ml,y:uv.y/ml,z:uv.z/ml},ro={x:0,y:0,z:4},dst=0;for(var j=0;j<80;j++){var cp={x:ro.x+rd.x*dst,y:ro.y+rd.y*dst,z:ro.z+rd.z*dst},s=scene(cp);if(s<.0005){var p={x:cp.x,y:cp.y,z:cp.z},n=nrm(p),nl=Math.sqrt(n.x*n.x+n.y*n.y+n.z*n.z);n.x/=nl;n.y/=nl;n.z/=nl;var lx=lt.x-p.x,ly=lt.y-p.y,lz=lt.z-p.z,ll=Math.sqrt(lx*lx+ly*ly+lz*lz);lx/=ll;ly/=ll;lz/=ll;var diff=Math.max(0,n.x*lx+n.y*ly+n.z*lz),amb=.12,br=amb+diff*.88,idx=(y*w+x)*4;d[idx]=Math.min(255,140*br);d[idx+1]=Math.min(255,90*br);d[idx+2]=Math.min(255,200*br);d[idx+3]=255;break}dst+=s}if(j===80){var idy=(y*w+x)*4;d[idy]=8;d[idy+1]=8;d[idy+2]=22;d[idy+3]=255}}ctx.putImageData(new ImageData(d,w,h),0,0);requestAnimationFrame(draw)}draw()})()")

R['分形树生成']=(get_title,get_id,"Pythagoras七彩分形树","Pythagoras树分形+时节变化+风动", "canvas","🌳","高级",
    '<canvas id="tree"></canvas>',C,
    "(function(){var c=document.getElementById('tree'),w=c.width=innerWidth,h=c.height=innerHeight,ctx=c.getContext('2d'),tm=0,wind=0;function leaf(x,y,s){ctx.beginPath();ctx.ellipse(x,y,s,s*.6,0,0,Math.PI*2);ctx.fillStyle='hsl('+(80+tm*30%360)+',80%,'+((s>8?55:45))+'(%)')';ctx.fill()}function rect(x,y,w2,h2,a){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle='hsl('+(25+tm*10%360)+',55%,'+(20+w2*.4)+'%)';ctx.fillRect(-w2/2,-h2/2,w2,h2);ctx.strokeStyle='rgba(255,255,255,.08)';ctx.strokeRect(-w2/2,-h2/2,w2,h2);ctx.restore()}function branch(x,y,sz,a,dp){if(sz<3||dp>12)return;var wd=sz*.7;var nx=x+Math.sin(a)*sz,ny=y-Math.cos(a)*sz;rect(x,y,wd,sz,a);if(dp>7&&sz<10){var lx=x+Math.sin(a)*sz*.6,ly=y-Math.cos(a)*sz*.6;leaf(lx,ly,sz*.8)}var sw=Math.sin(tm*2+dp)*.06;branch(nx,ny,wd,a-.65+sw+wind,dp+1);branch(nx,ny,wd,a+.65-sw-wind,dp+1);if(dp>5)branch(nx,ny,wd*.8,a-.2+sw,dp+1)}function draw(){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(0,0,w,h);branch(w/2,h-40,70,-1.57,0);tm+=.015;wind=Math.sin(tm*.4)*.04;requestAnimationFrame(draw)}draw()})()")

R['CSS3D行星环']=(get_title,get_id,"CSS3D土星环系统","土星+3层环带+卫星绕行+光影", "3d","🪐","高级",
    '<div class="saturn"><div class="sat-planet"></div><div class="sat-ring sr1"></div><div class="sat-ring sr2"></div><div class="sat-ring sr3"></div><div class="sat-moon"></div></div>',
    B+".saturn{width:200px;height:200px;position:relative;transform-style:preserve-3d;animation:sf 4s ease-in-out infinite}.sat-planet{position:absolute;width:70px;height:70px;background:radial-gradient(circle at 35% 35%,#f5d6a8,#e8b870,#c89550,#a07030);border-radius:50%;top:65px;left:65px;box-shadow:inset -8px -8px 16px rgba(0,0,0,.4),0 0 20px rgba(200,150,80,.3);transform:rotate(-15deg)}.sat-planet::after{content:'';position:absolute;width:100%;height:100%;border-radius:50%;background:linear-gradient(transparent 40%,rgba(0,0,0,.12) 60%,transparent 75%);top:0;left:0}.sat-ring{position:absolute;border-radius:50%;left:50%;top:50%;transform-origin:center;border-width:8px;border-style:solid}.sr1{width:140px;height:140px;margin:-70px;transform:rotateX(75deg);border-color:rgba(210,170,120,.5) transparent rgba(200,150,100,.3) transparent;animation:srr 8s linear infinite}.sr2{width:155px;height:155px;margin:-77px;transform:rotateX(72deg);border-color:transparent rgba(180,130,90,.3) transparent rgba(190,150,110,.4);animation:srr 6s linear infinite reverse}.sr3{width:165px;height:165px;margin:-82px;transform:rotateX(78deg);border-color:rgba(160,120,80,.2) transparent rgba(170,130,90,.15) transparent;animation:srr 12s linear infinite}.sat-moon{position:absolute;width:10px;height:10px;background:radial-gradient(circle,#fff,#ccc);border-radius:50%;top:15px;left:50%;margin-left:-5px;animation:mo 3s linear infinite}@keyframes sf{0%,100%{transform:translateY(0) rotateY(0)}50%{transform:translateY(-10px) rotateY(8deg)}}@keyframes srr{to{transform:rotateX(75deg) rotateZ(360deg)}}@keyframes mo{from{transform:rotate(0) translateX(100px) rotate(0)}to{transform:rotate(360deg) translateX(100px) rotate(-360deg)}}")

R['CSS3D折纸']=(get_title,get_id,"CSS3D千纸鹤","双翼扑动+身体摇摆+3D景深", "3d","🦅","高级",
    '<div class="crane"><div class="cr-body"></div><div class="cr-wing left"></div><div class="cr-wing right"></div><div class="cr-head"></div><div class="cr-tail"></div></div>',
    B+".crane{position:relative;width:160px;height:160px;animation:cr-bob 2.5s ease-in-out infinite;transform-style:preserve-3d}.cr-body{position:absolute;width:28px;height:50px;background:linear-gradient(135deg,#fff,#ddd);border-radius:50%;top:55px;left:66px;transform:rotate(-10deg);box-shadow:0 4px 14px rgba(0,0,0,.2);z-index:2}.cr-head{position:absolute;width:16px;height:20px;background:linear-gradient(135deg,#ff375f,#c0392b);border-radius:50% 50% 30% 30%;top:32px;left:77px;transform:rotate(15deg);z-index:3}.cr-tail{position:absolute;width:7px;height:42px;background:linear-gradient(#ddd,#bbb);border-radius:0 0 8px 8px;top:65px;left:58px;transform:rotate(30deg);z-index:1}.cr-wing{position:absolute;width:52px;height:72px;background:linear-gradient(180deg,#fff 60%,#e8e8e8);border-radius:50% 80% 50% 50%;top:42px;box-shadow:0 8px 22px rgba(0,0,0,.15);z-index:2}.left{left:16px;transform-origin:right top;animation:flL .45s ease-in-out infinite alternate}.right{left:92px;transform-origin:left top;animation:flR .45s ease-in-out .22s infinite alternate;border-radius:80% 50% 50% 50%}@keyframes flL{0%{transform:rotate(-5deg) rotateX(15deg)}100%{transform:rotate(-75deg) rotateX(-25deg)}}@keyframes flR{0%{transform:rotate(5deg) rotateX(15deg)}100%{transform:rotate(75deg) rotateX(-25deg)}}@keyframes cr-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}")

R['SVG音波频谱']=(get_title,get_id,"SVG 64段频谱可视化","64段渐变频谱柱+非线性频波动画", "svg","🎵","高级",
    '<svg viewBox="0 0 500 200" width="500" style="width:500px"><defs><linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#667eea"/><stop offset="50%" stop-color="#764ba2"/><stop offset="100%" stop-color="#ff375f"/></linearGradient></defs><rect width="500" height="200" fill="#0a0a2e"/>'+
    "".join(['<rect x="'+str(10+i*7)+'" y="100" width="5" fill="url(#sg2)" rx="2"><animate attributeName="height" values="50;'+str(15+((i*7+i*i*3)%130))+';50;'+str(20+((i*13+i*i*5)%110))+';50" dur="'+str(0.6+(i*11)%30*.02)+'s" repeatCount="indefinite"/><animate attributeName="y" values="130;'+str(155-((i*7+i*i*3)%130))+'0;130;'+str(150-((i*13+i*i*5)%110))+'0;130" dur="'+str(0.6+(i*11)%30*.02)+'s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;1;.6;.9;.6" dur="'+str(0.7+(i*7)%40*.03)+'s" repeatCount="indefinite"/></rect>' for i in range(64)])+
    '</svg>',B)

R['SVG烟火秀']=(get_title,get_id,"SVG三层烟花盛宴","3色烟花集群绽放+径向渐变粒子", "svg","🎆","高级",
    '<svg viewBox="0 0 500 350" width="500" style="width:500px"><defs><radialGradient id="fr1"><stop offset="0%" stop-color="#fff"/><stop offset="30%" stop-color="#ff375f"/><stop offset="100%" stop-color="transparent"/></radialGradient><radialGradient id="fr2"><stop offset="0%" stop-color="#fff"/><stop offset="30%" stop-color="#ff9f0a"/><stop offset="100%" stop-color="transparent"/></radialGradient><radialGradient id="fr3"><stop offset="0%" stop-color="#fff"/><stop offset="30%" stop-color="#667eea"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><rect width="500" height="350" fill="#0a0a2e"/>'+
    "".join(['<circle cx="'+str(int(110+((i*137)%280)))+'" cy="'+str(int(80+((i*53)%130)))+'" r="3" fill="url(#fr1)"><animate attributeName="r" values="0;'+str(8+((i*11)%22))+';0" dur="'+str(1.4+i*.04)+'s" begin="0s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="'+str(1.4+i*.04)+'s" begin="0s" repeatCount="indefinite"/></circle>' for i in range(30)])+
    "".join(['<circle cx="'+str(int(240+((i*143)%250)))+'" cy="'+str(int(190+((i*47)%110)))+'" r="2" fill="url(#fr2)"><animate attributeName="r" values="0;'+str(6+((i*9)%18))+';0" dur="'+str(1.6+i*.05)+'s" begin=".5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="'+str(1.6+i*.05)+'s" begin=".5s" repeatCount="indefinite"/></circle>' for i in range(25)])+
    "".join(['<circle cx="'+str(int(340+((i*157)%200)))+'" cy="'+str(int(130+((i*61)%150)))+'" r="2" fill="url(#fr3)"><animate attributeName="r" values="0;'+str(7+((i*13)%20))+';0" dur="'+str(1.8+i*.06)+'s" begin="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="'+str(1.8+i*.06)+'s" begin="1s" repeatCount="indefinite"/></circle>' for i in range(20)])+
    '</svg>',B)

R['CSS莫比乌斯环']=(get_title,get_id,"CSS3D莫比乌斯带","16段精确莫比乌斯扭曲+渐变", "3d","♾️","高级",
    '<div class="mobius">'+"".join(['<div class="ms" style="--s:'+str(j)+'"></div>' for j in range(16)])+'</div>',
    B+".mobius{width:180px;height:180px;position:relative;transform-style:preserve-3d;animation:mb2 14s linear infinite}.ms{position:absolute;width:50px;height:4px;background:hsl(calc(var(--s)*22.5),80%,60%);top:50%;left:50%;margin:-2px 0 0 -25px;border-radius:2px;transform:rotateY(calc(var(--s)*22.5deg)) translateZ(55px) rotateX(calc(var(--s)*22.5deg))}.ms::after{content:'';position:absolute;inset:0;background:inherit;filter:brightness(.45);border-radius:2px;transform:rotateX(180deg) translateZ(1px)}@keyframes mb2{to{transform:rotateX(360deg) rotateY(720deg)}}")

R['CSS光纤网络']=(get_title,get_id,"CSS神经网络脉冲","6节点+数据包+色调旋转", "css","🔗","高级",
    '<div class="net"><div class="net-node n0"></div><div class="net-node n1"></div><div class="net-node n2"></div><div class="net-node n3"></div><div class="net-node n4"></div><div class="net-node n5"></div><div class="net-packet p01"></div><div class="net-packet p14"></div><div class="net-packet p25"></div></div>',
    B+".net{position:relative;width:300px;height:280px;animation:nhue 8s linear infinite}.net-node{position:absolute;width:14px;height:14px;border-radius:50%;animation:np 2s ease-in-out infinite;z-index:2}.net-node:nth-child(1){top:20px;left:80px;background:#667eea;box-shadow:0 0 16px #667eea}.net-node:nth-child(2){top:100px;left:20px;background:#2ecc71;box-shadow:0 0 16px #2ecc71;animation-delay:.3s}.net-node:nth-child(3){top:100px;left:200px;background:#ff375f;box-shadow:0 0 16px #ff375f;animation-delay:.6s}.net-node:nth-child(4){top:180px;left:60px;background:#ff9f0a;box-shadow:0 0 16px #ff9f0a;animation-delay:.9s}.net-node:nth-child(5){top:180px;left:160px;background:#9b59b6;box-shadow:0 0 16px #9b59b6;animation-delay:1.2s}.net-node:nth-child(6){top:250px;left:140px;background:#3498db;box-shadow:0 0 16px #3498db;animation-delay:1.5s}.net-packet{position:absolute;width:6px;height:6px;background:#fff;border-radius:50%;box-shadow:0 0 8px #fff;z-index:1}.p01{top:27px;left:87px;animation:p01a 2s linear infinite}.p14{top:187px;left:95px;animation:p14a 2.5s linear infinite}.p25{top:230px;left:195px;animation:p25a 3s linear infinite}@keyframes np{0%,100%{transform:scale(1)}50%{transform:scale(1.6)}}@keyframes nhue{to{filter:hue-rotate(360deg)}}@keyframes p01a{0%,100%{transform:translate(0,0);opacity:0}15%,85%{opacity:1}50%{transform:translate(130px,95px);opacity:1}}@keyframes p14a{0%,100%{transform:translate(0,0);opacity:0}15%,85%{opacity:1}50%{transform:translate(60px,12px);opacity:1}}@keyframes p25a{0%,100%{transform:translate(0,0);opacity:0}15%,85%{opacity:1}50%{transform:translate(-60px,-18px);opacity:1}}")

R['CSS机械齿轮']=(get_title,get_id,"CSS3D啮合齿轮组","3齿轮带齿纹+精确啮合旋转", "3d","⚙️","高级",
    '<div class="gears"><div class="gr gr-outer"><div class="gt"></div></div><div class="gr gr-mid"><div class="gt"></div></div><div class="gr gr-inner"><div class="gt"></div></div></div>',
    B+".gears{position:relative;width:280px;height:280px}.gr{position:absolute;border-radius:50%;border:3px solid rgba(255,255,255,.2);animation:gro 8s linear infinite}.gr::after{content:'';position:absolute;background:radial-gradient(circle,#667eea,#333);border-radius:50%}.gt{position:absolute;width:10px;height:22px;background:linear-gradient(180deg,rgba(255,255,255,.25),rgba(255,255,255,.05));border-radius:3px}.gr-outer{width:140px;height:140px;top:70px;left:70px;animation-duration:12s}.gr-outer::after{width:18px;height:18px;top:61px;left:61px}.gr-outer .gt{top:-9px;left:65px}.gr-mid{width:90px;height:90px;top:10px;left:10px;animation-duration:7s;animation-direction:reverse}.gr-mid::after{width:12px;height:12px;top:39px;left:39px}.gr-mid .gt{top:-5px;left:40px;height:16px;width:8px}.gr-inner{width:55px;height:55px;top:190px;left:190px;animation-duration:4s;animation-direction:reverse}.gr-inner::after{width:10px;height:10px;top:22px;left:22px}.gr-inner .gt{top:-4px;left:22px;height:12px;width:6px}@keyframes gro{to{transform:rotate(360deg)}}")

# Apply replacements
new_entries = []
count = 0
for e in entries:
    title = get_title(e)
    if title in R:
        r = R[title]
        tid = get_id(e)
        new_e = f"  {{id:{tid},title:'{esc(r[2])}',desc:'{esc(r[3])}',category:'{esc(r[4])}',icon:'{esc(r[5])}',difficulty:'{esc(r[6])}',html:'{esc(r[7])}',css:'{esc(r[8])}',js:'{esc(r[9])}'}}"
        new_entries.append(new_e)
        count += 1
        print(f'✅ {title} → {r[2]}')
    else:
        new_entries.append(e)

# Rebuild file
prefix = c[:c.index('export const animations: AnimationItem[] = [\n') + len('export const animations: AnimationItem[] = [\n')]
suffix = c[c.rindex('\n]'):]
new_c = prefix + ',\n'.join(new_entries) + suffix

with open('src/data/animations.ts','w') as f: f.write(new_c)

# Verify
ids2 = re.findall(r'{id:(\d+)', new_c)
cats2 = {}
for m in re.finditer(r"category:'(\w+)'", new_c): cats2[m.group(1)]=cats2.get(m.group(1),0)+1
print(f'\nReplaced: {count} | Total: {len(ids2)} | Braces: {new_c.count("{")==new_c.count("}")}')
for k,v in sorted(cats2.items()): print(f'  {k}: {v}')
json.load(open('src/data/props-reference.json'))
print('JSON OK')

# esbuild check
import subprocess
r = subprocess.run(['npx','esbuild','src/data/animations.ts','--bundle','--format=esm','--outfile=/dev/null'], capture_output=True, text=True)
if r.returncode == 0: print('esbuild ✅')
else: print('esbuild FAIL:', r.stderr[:200])
