#!/usr/bin/env python3
"""HTML chapters h8-h14"""
import json
def B(h,c="",j=""): return {"html":h,"css":c,"js":j}
def S(text): return {"id":"","title":"📋 本章总结","content":text}
with open('src/data/h-tutorials.json','r',encoding='utf-8') as f: tuts=json.load(f)

# h8: 注释/实体/Emoji
tuts.append({"id":"h8","title":"h8 注释/实体/Emoji——页面中的隐藏内容","desc":"HTML注释/字符实体/Emoji编码/符号大全","category":"html","icon":"💬","difficulty":"入门","steps":[
    {"id":"h8-1","title":"<!-- 注释 -->——给开发者看的笔记","content":"注释内容浏览器不渲染。用途:解释代码逻辑、临时禁用代码(调试神器)、标记区块边界。不能嵌套注释!快捷键:Ctrl+/。💡复杂布局上方必须写注释,3个月后你会感谢自己。",
        "code":B('<!-- 这是一个注释,浏览器不会显示 -->\n<h3 style="color:#667eea">可见内容</h3>\n<!-- <p style="color:#e74c3c">这段被注释掉了,不会显示!</p> -->\n<p style="color:#ccc">上面有一段被注释隐藏了</p>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    {"id":"h8-2","title":"HTML 实体——显示特殊字符","content":"要用&lt;显示<、&gt;显示>、&amp;显示&(因为<和>是标签分隔符!)。常用:&copy;©、&reg;®、&trade;™、&nbsp;不换行空格、&mdash;—、&ndash;–、&quot;\"。&#数字;十进制编码,&#x十六进制;十六进制编码。",
        "code":B('<pre style="background:#1e1e30;padding:12px;border-radius:6px;color:#2ecc71;line-height:2">&amp;lt;    = &lt; (小于号)\n&amp;gt;    = &gt; (大于号)\n&amp;amp;   = &amp; (和号)\n&amp;copy;  = &copy; (版权)\n&amp;nbsp;  = 不换行空格\n&amp;mdash; = &mdash; (长破折号)\n\n十进制: &amp;#23383; = &#23383;\n十六进制: &amp;#x5B57; = &#x5B57;</pre>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    {"id":"h8-3","title":"Emoji——直接用或编码","content":"现代浏览器支持直接写Emoji:😀😂👍🚀。也可以用实体编码:&#128512;=😀、&#128151;=💗、&#x1F44D;=👍。Windows按Win+.打开Emoji面板。Emoji也是Unicode字符,可以像普通文字一样使用。",
        "code":B('<p style="font-size:2em;text-align:center">😀 😊 👍 🚀 🌟 💗</p><p style="color:#888;text-align:center;font-size:13px">上面是直接写的Emoji</p><p style="color:#888;text-align:center;font-size:13px">编码版: &#128512; &#128151; &#x1F44D;</p>','body{padding:40px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    S("✅注释:<!-- --> 不渲染,不能嵌套\n✅实体:&lt;&gt;&amp;&copy;&nbsp;&mdash;\n✅Emoji:直接写😀 或用&#128512;编码"),
]})

# h10: 链接 (id改为h10,后续类推)
tuts.append({"id":"h10","title":"h10 链接——网页间的桥梁","desc":"a标签全属性:href/target/rel/download/hreflang/type/media/ping","category":"html","icon":"🔗","difficulty":"进阶","steps":[
    {"id":"h10-1","title":"a标签基础——href和target","content":"href:链接目标URL(必须属性)。target:_self当前窗口/_blank新窗口/_parent父框架/_top顶层。外链用_blank+rel='noopener noreferrer'(防安全漏洞)。💡链接文字要描述目的地,不要用'点击这里'。",
        "code":B('<p><a href="https://www.w3school.com.cn" target="_blank" rel="noopener">W3School(新窗口)</a></p><p><a href="#section">跳转到页面锚点</a></p><p><a href="mailto:hello@example.com">发邮件</a></p><p><a href="tel:13800138000">打电话</a></p>','a{color:#667eea;text-decoration:none;transition:.2s}a:hover{color:#764ba2;text-decoration:underline}p{color:#ccc;line-height:2}body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    {"id":"h10-2","title":"a 标签全属性详解","content":"download:点击直接下载(给文件名)。hreflang:链接目标的语言。type:目标MIME类型。rel:关系(nofollow/noopener/noreferrer)。ping:点击时发送POST到指定URL(跟踪点击,浏览器不一定支持)。media:目标媒体类型。",
        "code":B('<pre style="background:#1e1e30;padding:12px;border-radius:6px;color:#2ecc71;line-height:1.8">href="url"          ← 目标地址(必须)\ntarget="_blank"     ← 新窗口\nrel="noopener"      ← 安全属性(防window.opener)\ndownload="文件名"    ← 点击下载\nhreflang="en"       ← 目标语言\ntype="text/html"    ← MIME类型\nping="跟踪URL"       ← 点击追踪\nmedia="screen"      ← 媒体类型</pre>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    S("✅a标签:href(必须)/target(窗口)/rel(安全/SEO)\n✅外部链接:target=_blank+rel=noopener\n✅特殊协议:mailto:/tel:/#锚点\n✅下载:download属性\n✅分类:nofollow(不给SEO权重)/noopener(安全)"),
]})

# h11: 图片
tuts.append({"id":"h11","title":"h11 图片——img/picture/figure全解","desc":"img全属性:src/alt/width/height/srcset/sizes/loading/crossorigin/picture/source/figure","category":"html","icon":"🖼️","difficulty":"进阶","steps":[
    {"id":"h11-1","title":"img标签——全属性详解","content":"src:图片URL(必须)。alt:替代文字(必须!无障碍+SEO)。width/height:尺寸(推荐CSS或属性)。loading='lazy':懒加载(滚动到才加载,性能利器)。srcset+sizes:响应式图片(不同屏幕不同图)。crossorigin:跨域设置。💡永远写alt!",
        "code":B('<pre style="background:#1e1e30;padding:12px;border-radius:6px;color:#2ecc71;line-height:1.8">src="image.jpg"      ← 图片URL(必须)\nalt="描述文字"        ← 替代文字(必须!无障碍)\nwidth="400"          ← 宽度\nheight="300"         ← 高度\nloading="lazy"       ← 懒加载(性能优化)\nsrcset="小.jpg 400w,大.jpg 800w" ← 响应式\nsizes="(max-width:600px) 400px"  ← 响应式\ncrossorigin="anonymous"  ← 跨域</pre>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    {"id":"h11-2","title":"picture/source——响应式图片","content":"<picture>根据屏幕宽度加载不同图(省流量)。<source>指定条件(media/min-width/srcset)。<img>兜底。还支持格式选择:source type='image/webp'。💡移动端用小图,桌面端用大图。",
        "code":B('<picture><source srcset="data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 200 80%27><rect fill=%27%232ecc71%27 width=%27200%27 height=%2780%27 rx=%278%27/><text fill=%27white%27 x=%27100%27 y=%2750%27 text-anchor=%27middle%27 font-size=%2716%27>宽屏(≥600px)</text></svg>" media="(min-width:600px)"><img src="data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 200 80%27><rect fill=%27%23667eea%27 width=%27200%27 height=%2780%27 rx=%278%27/><text fill=%27white%27 x=%27100%27 y=%2750%27 text-anchor=%27middle%27 font-size=%2712%27>窄屏(&lt;600px)</text></svg>" alt="响应式图片" style="max-width:100%;border-radius:8px"></picture><p style="color:#888;font-size:12px;text-align:center;margin-top:8px">缩小窗口看图片切换</p>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    {"id":"h11-3","title":"figure/figcaption——图文组合","content":"<figure>包裹图片/图表/代码等独立内容。<figcaption>给figure加标题。语义化标签,搜索引擎能理解这是图文组合。💡图片+标题=figure,这是标准的语义搭配。",
        "code":B('<figure style="text-align:center;margin:16px 0"><svg viewBox="0 0 250 120" style="border-radius:8px;display:block;margin:0 auto"><rect fill="#667eea" width="250" height="120" rx="8"/><text fill="white" x="125" y="70" text-anchor="middle" font-size="20">🌅 风景图</text></svg><figcaption style="color:#888;font-size:13px;margin-top:8px">图1: 一张美丽的风景照片</figcaption></figure>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    S("✅img:src(必须)/alt(必须)/loading=lazy(懒加载)\n✅响应式:srcset+sizes / picture+source\n✅figure+figcaption:语义化图文组合"),
]})

# h12: 列表
tuts.append({"id":"h12","title":"h12 列表——ul/ol/li/dl全属性","desc":"无序列表/有序列表/描述列表/嵌套/start/reversed/type/value","category":"html","icon":"📋","difficulty":"进阶","steps":[
    {"id":"h12-1","title":"ul——无序列表","content":"<ul>无序(圆点)。每项<li>。type属性(已废弃,用CSS list-style-type):disc圆点/circle圆圈/square方块。💡导航菜单=ul>li去圆点+flex水平排列。嵌套列表:ul>li>ul做多级菜单。",
        "code":B('<ul style="color:#ccc;line-height:2"><li>🍎 苹果</li><li>🍌 香蕉</li><li>🍊 橘子</li></ul><h4 style="color:#f39c12">嵌套列表:</h4><ul style="color:#ccc;line-height:2"><li>水果<ul style="color:#aaa;font-size:13px"><li>苹果</li><li>香蕉</li></ul></li><li>蔬菜<ul style="color:#aaa;font-size:13px"><li>白菜</li><li>萝卜</li></ul></li></ul>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    {"id":"h12-2","title":"ol——有序列表（全属性）","content":"<ol>有序(数字)。属性:start=起始编号,reversed倒序,type='1'数字/'A'大写/'a'小写/'I'罗马。li的value属性可单独设置编号。💡步骤/排名/教程用ol。",
        "code":B('<ol style="color:#ccc;line-height:2"><li>打开编辑器</li><li>写HTML代码</li><li>保存并预览</li></ol><ol start="5" style="color:#ccc;line-height:2"><li value="5">从5开始</li><li value="10">跳到10</li></ol><ol reversed style="color:#ccc;line-height:2"><li>倒序第一名</li><li>倒序第二名</li></ol>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}p{color:#888;font-size:12px}')},
    {"id":"h12-3","title":"dl——描述列表","content":"<dl>描述列表,<dt>术语,<dd>解释。<dt>和<dd>是一对多关系(一个术语可有多个解释)。💡FAQ/名词解释/元数据用dl。",
        "code":B('<dl style="color:#ccc;line-height:1.8"><dt style="color:#667eea;font-weight:bold;font-size:1.1em">HTML</dt><dd style="margin-left:16px;margin-bottom:8px;color:#aaa">超文本标记语言</dd><dt style="color:#667eea;font-weight:bold;font-size:1.1em">CSS</dt><dd style="margin-left:16px;color:#aaa">层叠样式表,负责网页的外观和布局</dd></dl>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    S("✅ul:无序。ol:有序(start/reversed/type)。li:value单独编号\n✅dl>dt+dd:描述列表(术语+解释)\n✅嵌套:ul>li>ul做多级菜单\n✅CSS list-style-type替代废弃的type属性"),
]})

with open('src/data/h-tutorials.json','w',encoding='utf-8') as f: json.dump(tuts,f,ensure_ascii=False,indent=2)
print(f'Done: {len(tuts)} tutorials')
