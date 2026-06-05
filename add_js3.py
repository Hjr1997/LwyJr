# -*- coding: utf-8 -*-
with open('src/data/tutorials.ts', 'r', encoding='utf-8') as f:
    content = f.read()

v1_start = content.find("{id:'v1',")
bg = 'body{padding:16px;font-family:Arial;background:#1a1a2e;color:#eee}'
b = 'padding:8px 18px;background:#f39c12;color:#fff;border:none;border-radius:6px;cursor:pointer'

def S(i,t,c,h='',css='',j='',tip=''):
    if h: return f"  {{id:'{i}',title:'{t}',content:'{c}',code:{{html:'{h}',css:'{css}',js:'{j}'}}}},\n"
    return f"  {{id:'{i}',title:'{t}',content:'{c}',tip:'{tip}'}},\n"

def T(i,t,d,steps):
    return f"{{id:'{i}',title:'{t}',desc:'{d}',category:'js',icon:'🔧',difficulty:'进阶',steps:[\n{''.join(steps)}]}},\n\n"

js_r = '\n\n'
js_r += T('j11','j11 异步——setTimeout/Promise','回调/setTimeout/setInterval/Promise/then/catch/finally/Promise.all',[
S('j11-1','比喻：预约餐厅','异步=点菜后不用干等,好了通知你。setTimeout(函数,毫秒)延迟执行一次。setInterval每隔一段时间重复。clearInterval取消。',
'<p id="jx11a" style="color:#2ecc71;font-size:1.3em"></p><p id="jx11b" style="color:#888;font-size:12px"></p>',bg,
'var cj=5;var t=setInterval(function(){cj--;document.getElementById("jx11a").textContent=cj+"s";if(cj<=0){clearInterval(t);document.getElementById("jx11a").textContent="GO!";setTimeout(function(){document.getElementById("jx11b").textContent="2秒后显示"},2000)}},1000)'),
S('j11-2','Promise——未来的承诺','Promise有三种状态:pending/fulfilled/rejected。new Promise((resolve,reject)=>{}).then(成功).catch(失败).finally(无论成败)。Promise.all全部完成。',
'<button id="jx11c" style="'+b+'">模拟网络请求</button><p id="jx11d" style="margin-top:8px;font-size:13px;color:#888"></p>',bg,
'document.getElementById("jx11c").onclick=function(){var btn=this,r=document.getElementById("jx11d");btn.disabled=true;r.textContent="加载中...";new Promise(function(ok,fail){setTimeout(function(){Math.random()>0.3?ok("成功!"):fail("错误")},1500)}).then(function(v){r.textContent=v;r.style.color="#2ecc71"}).catch(function(v){r.textContent=v;r.style.color="#e74c3c"}).finally(function(){btn.disabled=false})}'),
S('j11-3','🎮 小游戏：异步计时','等3次随机延迟完成!','<div style="display:flex;gap:6px"><button onclick="jx11e(0)" style="'+b+'">1</button><button onclick="jx11e(1)" style="'+b+'">2</button><button onclick="jx11e(2)" style="'+b+'">3</button></div><p id="jx11f" style="margin-top:6px;font-size:12px;color:#888;line-height:1.6"></p>',bg,
'var xd=[0,0,0];function jx11e(i){var d=Math.floor(Math.random()*3000)+500;var p=document.getElementById("jx11f");p.innerHTML+="请求"+(i+1)+"等待"+d+"ms<br>";new Promise(function(ok){setTimeout(function(){xd[i]=1;ok(i)},d)}).then(function(a){p.innerHTML+="完成"+(a+1)+"!<br>";if(xd[0]&&xd[1]&&xd[2])p.innerHTML+="全部完成!<br>"})}'),
]))

js_r += T('j12','j12 async/await + Fetch','async函数/await/fetch/GET/POST/headers/JSON解析',[
S('j12-1','比喻：外卖点餐','async标记函数为异步,await暂停等Promise完成。fetch(url)发请求,返回Promise。.json()解析JSON。POST需method+headers+body。',
'<button id="jx12a" style="'+b+'">模拟请求</button><pre id="jx12b" style="margin-top:8px;background:#1e1e30;padding:8px;border-radius:4px;color:#eee;font-size:12px"></pre>',bg,
'document.getElementById("jx12a").onclick=async function(){await new Promise(function(r){setTimeout(r,600)});var d=[{id:1,name:"小明",score:95},{id:2,name:"小红",score:88}];document.getElementById("jx12b").textContent=JSON.stringify(d,null,2)}'),
S('j12-2','🎮 小游戏：数据抓取','点按钮看模拟API返回!','<button id="jx12c" style="'+b+'">抓取</button><pre id="jx12d" style="margin-top:8px;background:#1e1e30;padding:8px;border-radius:4px;color:#eee;font-size:12px"></pre>',bg,
'document.getElementById("jx12c").onclick=async function(){var p=document.getElementById("jx12d");p.textContent="加载...";await new Promise(function(r){setTimeout(r,300)});p.textContent=[{name:"用户1",role:"admin"},{name:"用户2",role:"user"}].map(JSON.stringify).join("\n")}'),
]))

js_r += T('j13','j13 Storage——本地存储','localStorage/sessionStorage/setItem/getItem/removeItem/clear',[
S('j13-1','比喻：冰箱存食材','localStorage永久保存(关浏览器还在)。sessionStorage仅当前标签页。setItem(键,值)存,getItem(键)取,removeItem(键)删。只能存字符串,对象用JSON.stringify。',
'<input id="jx13a" placeholder="输入文字" style="padding:6px;width:160px;background:#333;color:#eee;border:1px solid #555;border-radius:4px"><button onclick="jx13s()" style="margin:4px;'+b+'">保存</button><button onclick="jx13l()" style="margin:4px;padding:6px 14px;background:#555;color:#eee;border:none;border-radius:4px;cursor:pointer">读取</button><p id="jx13b" style="margin-top:6px;font-size:12px;color:#888"></p>',bg,
'function jx13s(){var v=document.getElementById("jx13a").value;localStorage.setItem("j13d",v);document.getElementById("jx13b").textContent="已保存:"+v}function jx13l(){var v=localStorage.getItem("j13d")||"(空)";document.getElementById("jx13b").textContent="读取:"+v}'),
S('j13-2','🎮 小游戏：记事本','写东西保存,刷新后还在!','<textarea id="jx13c" placeholder="写点什么..." style="width:100%;height:50px;padding:6px;background:#333;color:#eee;border:1px solid #555;border-radius:4px;font-family:Arial"></textarea><button onclick="jx13gs()" style="margin:6px 4px;'+b+'">保存</button><button onclick="jx13gl()" style="margin:6px 4px;padding:6px 14px;background:#2ecc71;color:#fff;border:none;border-radius:4px;cursor:pointer">加载</button><p id="jx13d" style="font-size:12px;color:#888"></p>',bg,
'function jx13gs(){var t=document.getElementById("jx13c").value;localStorage.setItem("j13note",t);document.getElementById("jx13d").textContent="已保存"}function jx13gl(){document.getElementById("jx13c").value=localStorage.getItem("j13note")||"";document.getElementById("jx13d").textContent="已加载"}if(localStorage.getItem("j13note"))jx13gl()'),
]))

js_r += T('j14','j14 Date——日期时间','new Date/getFullYear/getMonth/getDate/getHours/getTime/toLocaleString',[
S('j14-1','比喻：日历钟表','new Date()当前时间,new Date("2025-01-15")指定日期。getFullYear年,getMonth月(0-11),getDate日,getHours时,getMinutes分,getSeconds秒,getTime时间戳。',
'<button onclick="jx14a()" style="'+b+'">显示时间</button><pre id="jx14b" style="margin-top:8px;background:#1e1e30;padding:8px;border-radius:4px;color:#eee;font-size:12px;line-height:1.6"></pre>',bg,
'function jx14a(){var d=new Date(),r=[];r.push("now:"+d);r.push(d.getFullYear()+"年"+(d.getMonth()+1)+"月"+d.getDate()+"日");r.push(d.getHours()+":"+d.getMinutes()+":"+d.getSeconds());r.push("时间戳:"+d.getTime());r.push(d.toLocaleString("zh-CN"));document.getElementById("jx14b").textContent=r.join("\n")}'),
S('j14-2','🎮 小游戏：倒计时','输入秒数开始!','<input id="jx14c" type="number" value="10" style="padding:6px;width:50px;background:#333;color:#eee;border:1px solid #555;border-radius:4px">秒<button onclick="jx14g()" style="margin:4px;'+b+'">开始</button><p id="jx14d" style="margin-top:6px;font-size:1.5em;color:#e74c3c"></p>',bg,
'var x14t=null;function jx14g(){var s=+document.getElementById("jx14c").value,r=document.getElementById("jx14d");if(x14t)clearInterval(x14t);x14t=setInterval(function(){if(s<=0){clearInterval(x14t);r.textContent="时间到!";r.style.color="#2ecc71";return}r.textContent=s;if(s<=3)r.style.color="#e74c3c";s--},1000)}'),
]))

js_r += T('j15','j15 Map/Set/call/apply/bind','Map.set/get/has/delete + Set.add/has/delete + call/apply/bind',[
S('j15-1','比喻：储物柜和名单','Map键可任意类型,set/get/has/delete/size。Set不重复集合,add/has/delete/size天然去重。','<button onclick="jx15a()" style="'+b+'">对比</button><pre id="jx15b" style="margin-top:8px;background:#1e1e30;padding:8px;border-radius:4px;color:#eee;font-size:12px;line-height:1.6"></pre>',bg,
'function jx15a(){var m=new Map();m.set("name","JS");m.set(1,"one");var s=new Set();s.add(1);s.add(2);s.add(2);var r=["Map:"+m.size+"  get="+m.get("name"),"Set:"+s.size+"  items="+Array.from(s)];document.getElementById("jx15b").textContent=r.join("\n")}'),
S('j15-2','call/apply/bind','call(obj,args)立即调用设this。apply(obj,[args])参数数组。bind(obj)返回新函数永久绑定。','<button onclick="jx15c()" style="'+b+'">测试</button><pre id="jx15d" style="margin-top:8px;background:#1e1e30;padding:8px;border-radius:4px;color:#eee;font-size:12px;line-height:1.6"></pre>',bg,
'function jx15c(){var o={name:"obj"};function g(v){return v+","+this.name}var r=["call:"+g.call(o,"Hi"),"apply:"+g.apply(o,["Hello"]),"bind:"+g.bind(o)("Hey")];document.getElementById("jx15d").textContent=r.join("\n")}'),
S('j15-3','🎮 小游戏：去重大师','添加随机数到Set,自动去重!','<button onclick="jx15e()" style="'+b+'">添加(1-10)</button><button onclick="jx15f()" style="margin:4px;padding:6px 14px;background:#e74c3c;color:#fff;border:none;border-radius:4px;cursor:pointer">清空</button><p id="jx15g" style="margin-top:6px;font-size:14px;color:#2ecc71"></p>',bg,
'var x15s=new Set();function jx15e(){x15s.add(Math.floor(Math.random()*10)+1);document.getElementById("jx15g").textContent="["+Array.from(x15s).sort().join(",")+"] ("+x15s.size+")"}function jx15f(){x15s.clear();document.getElementById("jx15g").textContent="已清空"}'),
]))

js_r += T('j16','j16 Class+Error——面向对象与错误','class/constructor/extends/super + try/catch/finally/throw',[
S('j16-1','比喻：图纸和房子','class是蓝图,new出来实例。constructor构造函数(new时调用)。extends继承,super调父类构造。static静态方法。',
'<button onclick="jx16a()" style="'+b+'">创建实例</button><pre id="jx16b" style="margin-top:8px;background:#1e1e30;padding:8px;border-radius:4px;color:#eee;font-size:12px;line-height:1.6"></pre>',bg,
'function jx16a(){class Animal{constructor(n){this.name=n}speak(){return this.name+" says hi"}}class Dog extends Animal{constructor(n,b){super(n);this.breed=b}bark(){return this.name+"("+this.breed+") woof!"}}var d=new Dog("Buddy","Husky");document.getElementById("jx16b").textContent=["name:"+d.name,"breed:"+d.breed,"bark:"+d.bark(),"speak:"+d.speak()].join("\n")}'),
S('j16-2','try/catch——抓住错误','try{可能出错}catch(e){处理}finally{无论成败都执行}。throw抛出错误。','<input id="jx16c" placeholder="输入JSON" value="ok" style="padding:6px;width:120px;background:#333;color:#eee;border:1px solid #555;border-radius:4px"><button onclick="jx16d()" style="margin:4px;'+b+'">解析</button><p id="jx16e" style="margin-top:6px;font-size:12px"></p>',bg,
'function jx16d(){var v=document.getElementById("jx16c").value,r=document.getElementById("jx16e");try{if(v==="ok"){r.textContent="输入JSON格式";r.style.color="#888";return}var o=JSON.parse(v);r.textContent="OK:"+JSON.stringify(o);r.style.color="#2ecc71"}catch(e){r.textContent="Error:"+e.message;r.style.color="#e74c3c"}}'),
S('j16-3','🎮 小游戏：类工厂','创建宠物实例,看继承效果!','<button onclick="jx16f()" style="'+b+'">随机宠物</button><pre id="jx16g" style="margin-top:8px;background:#1e1e30;padding:8px;border-radius:4px;color:#eee;font-size:12px;line-height:1.6"></pre>',bg,
'function Pet(n,t){this.name=n;this.type=t}Pet.prototype.info=function(){return this.name+"是"+this.type};var x16p=[new Pet("咪咪","🐱"),new Pet("旺财","🐶"),new Pet("小龟","🐢"),new Pet("波利","🦜")];var x16i=0;function jx16f(){x16i=(x16i+1)%4;var p=x16p[x16i];document.getElementById("jx16g").textContent=p.info()+" | 第"+(x16i+1)+"只"}'),
]))

content = content[:v1_start] + js_r + content[v1_start:]
with open('src/data/tutorials.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print(f'B3 done: j11-j16. Lines: {len(content.splitlines())}')
