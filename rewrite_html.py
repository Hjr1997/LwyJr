#!/usr/bin/env python3
"""HTML 细粒度重写: 每个标签组独立成章,末尾总结,全属性列举"""
import json
def B(h,c="",j=""): return {"html":h,"css":c,"js":j}
def sum(text): return {"id":"","title":"📋 本章总结","content":text}

tuts=[]

# ====== h0: 大纲 ======
tuts.append({"id":"h0","title":"📑 HTML 完全学习大纲","desc":"21章 · 零基础到精通 · 点击跳转任意章节","category":"html","icon":"📑","difficulty":"入门","steps":[
    {"id":"h0-1","title":"大纲——点击任意章节开始","content":"21章覆盖HTML全部标签与属性,每章末尾有总结速查表。","code":B(
        "<h2 style='text-align:center;color:#f39c12'>📑 HTML 完全学习大纲</h2>"
        "<p style='text-align:center;color:#888;font-size:12px;margin-bottom:12px'>21章覆盖全部标签及属性 · 点击跳转</p>"
        "<table style='width:100%;border-collapse:collapse;font-size:11px'>"
        +"".join([f"<tr style='background:{c}'><td colspan='4' style='padding:6px 8px;color:#fff;font-weight:bold;font-size:12px'>{s}</td></tr>"
        +"".join([f"<tr style='background:{'#1e1e30' if j%2==0 else 'transparent'}'><td style='padding:5px 8px;border-bottom:1px solid #333'><b style='color:#f39c12'>{t[0]}</b></td><td style='padding:5px 8px;border-bottom:1px solid #333;color:#eee;font-size:11px'>{t[1]}</td><td style='padding:5px 8px;border-bottom:1px solid #333;color:#888;font-size:10px'>{t[2]}</td><td style='padding:5px 8px;text-align:center;border-bottom:1px solid #333'><span onclick=\"parent.document.dispatchEvent(new CustomEvent('tutNav',{{detail:'{t[0]}'}}))\" style='display:inline-block;padding:3px 10px;background:#f39c12;color:#fff;border-radius:3px;cursor:pointer;font-size:11px'>📖</span></td></tr>"
        for j,t in enumerate(items)])
        for s,c,items in [
            ("🌐 入门基础","linear-gradient(135deg,#f39c12,#e74c3c)",[("h1","HTML骨架","DOCTYPE/html/head/meta/title"),("h2","语法规则","标签语法/属性/嵌套规范")]),
            ("📝 文本标签","linear-gradient(135deg,#667eea,#764ba2)",[("h3","标题","h1-h6全属性"),("h4","段落换行","p/br/hr"),("h5","文本格式化","b/strong/i/em/mark/small/del/ins/sub/sup"),("h6","引用标签","blockquote/q/cite"),("h7","代码相关","pre/code/kbd/samp/var"),("h8","缩写地址","abbr/address/bdo"),("h9","注释实体Emoji","注释/HTML实体/Emoji")]),
            ("🔗 链接与媒体","linear-gradient(135deg,#2ecc71,#1abc9c)",[("h10","链接a","href/target/rel/download全属性"),("h11","图片","img全属性/picture/figure")]),
            ("📊 展示标签","linear-gradient(135deg,#3498db,#9b59b6)",[("h12","列表","ul/ol/li全属性/dl"),("h13","表格","table/tr/td/th/合并单元格")]),
            ("📋 表单标签","linear-gradient(135deg,#e74c3c,#f39c12)",[("h14","表单容器","form/input全type"),("h15","表单控件","radio/checkbox/select/textarea/button")]),
            ("🏗️ 结构标签","linear-gradient(135deg,#1abc9c,#3498db)",[("h16","语义化","header/nav/main/section/article/aside/footer"),("h17","容器","div/span/class/id"),("h18","多媒体","video/audio全属性/iframe"),("h19","全局属性","id/class/style/data-*/hidden等")]),
            ("📑 总结","#f39c12",[("h20","全标签速查","所有标签+核心属性+示例")]),
        ]])+"</table>"
    ,"body{margin:0;padding:0;font-family:Arial;background:#1a1a2e;color:#eee}")}
]})

# ====== h1: HTML骨架 ======
tuts.append({"id":"h1","title":"h1 HTML骨架——每个网页的'出生证明'","desc":"DOCTYPE/html/head/meta/title/base/link 全属性详解","category":"html","icon":"🌐","difficulty":"入门","steps":[
    {"id":"h1-1","title":"<!DOCTYPE> + <html> —— 网页的'身份证'","content":"<!DOCTYPE html> 告诉浏览器'我是HTML5!'，必须写在第一行。<html lang='zh'> 是根元素，包裹整个页面。lang属性告诉搜索引擎这是什么语言(SEO关键!)。💡所有HTML文件的第一行和第二行永远是固定的这两行。","code":B('<!DOCTYPE html>\n<html lang="zh">\n<body>\n  <h1>Hello World</h1>\n  <p>这就是HTML的基本骨架开始</p>\n</body>\n</html>','body{text-align:center;padding:50px;font-family:Arial;background:#1a1a2e;color:#eee}h1{color:#667eea}')},
    {"id":"h1-2","title":"<head> —— 页面的'后台控制中心'","content":"<head>里的内容用户看不见，但对浏览器/搜索引擎至关重要。包含:<title>标签页标题、<meta>元数据、<link>引入CSS、<style>内嵌样式、<script>引入JS。<base>设置全局基准URL。💡每个页面必须有 title 和 meta charset！","code":B('<p>查看标签页标题👆</p><p style="color:#888;font-size:14px">head中设置了title/charset/viewport</p>','body{text-align:center;padding:40px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    {"id":"h1-3","title":"<meta> —— 元数据标签（全属性）","content":"charset='UTF-8'(字符编码，防乱码)。name='viewport'(响应式必备)。name='description'(搜索摘要，SEO关键)。name='keywords'(关键词)。name='author'(作者)。http-equiv='refresh'(定时刷新)。property='og:title'(社交分享)。💡viewport和description是两个最重要的meta。",
        "code":B('<p style="color:#2ecc71;font-weight:bold">常用meta属性清单:</p>\n<pre style="background:#1e1e30;padding:12px;border-radius:6px;color:#aaa;font-size:12px;line-height:1.8">charset="UTF-8"      ← 防中文乱码\nname="viewport"      ← 响应式必备\nname="description"   ← SEO搜索摘要\nname="keywords"      ← 关键词\nname="author"        ← 作者\nhttp-equiv="refresh" ← 定时刷新(慎用)\nproperty="og:title"  ← 社交分享标题</pre>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    {"id":"h1-4","title":"<title> + <link> —— 标题与资源引入","content":"<title>设置浏览器标签页文字(SEO排名核心因素!)。<link rel='stylesheet' href='style.css'>引入CSS。<link rel='icon' href='favicon.ico'>设置网站小图标(favicon)。<link rel='canonical'>指定规范URL(防重复内容)。<link rel='preload'>预加载资源(性能优化)。",
        "code":B('<p style="color:#2ecc71;font-weight:bold">link 常用 rel 值:</p>\n<pre style="background:#1e1e30;padding:12px;border-radius:6px;color:#aaa;font-size:12px;line-height:1.8">rel="stylesheet"   → 引入CSS\nrel="icon"         → 网站小图标\nrel="canonical"    → 规范URL(SEO)\nrel="preload"      → 预加载资源\nrel="preconnect"   → 预连接(性能)\nrel="dns-prefetch" → DNS预解析</pre>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    {"id":"h1-5","title":"<script> —— 引入JavaScript","content":"<script src='app.js'>引入外部JS文件。内联写法:<script>代码</script>。推荐放在</body>之前(不阻塞页面渲染)。defer:HTML解析完再执行JS。async:异步加载,谁先下载完谁先执行。💡生产环境:script放底部+defer = 最佳性能。",
        "code":B('<button onclick="this.textContent=\'JS生效了!\';this.style.background=\'#2ecc71\'" style="padding:10px 20px;background:#667eea;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:16px">点击看JS是否生效</button>','body{padding:60px;text-align:center;font-family:Arial;background:#1a1a2e;color:#eee}','console.log("JS加载成功!")')},
    sum("✅本章学了:DOCTYPE声明/html根元素/lang属性\n✅head标签:title(标签页标题)/meta(charset+viewport+description)/link(引入CSS+icon)/script(引入JS,放底部+defer)\n✅核心属性:charset/name/content/rel/href/src/defer/async"),
]})

# ====== h2: 语法规则 ======
tuts.append({"id":"h2","title":"h2 语法规则——写出正确的HTML","desc":"标签语法/嵌套规则/大小写规范/属性引号/布尔属性/自闭合标签","category":"html","icon":"📏","difficulty":"入门","steps":[
    {"id":"h2-1","title":"标签语法——正确书写每个标签","content":"<开始标签 属性='值'>内容</结束标签>是一个完整的元素。部分标签是自闭合(空元素):<br>、<hr>、<img>、<input>、<meta>、<link>。HTML5中自闭合标签末尾的/可选,但建议加(更规范)。标签名全小写(行业铁律!)。",
        "code":B('<h3>成对标签:</h3>\n<p style="color:#2ecc71">这是一个正确的段落。</p>\n<h3>自闭合标签:</h3>\n<p style="color:#888">换行<br>分割线<hr>图片<img>输入框<input></p>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}h3{color:#f39c12;font-size:16px;margin:12px 0 4px}hr{border-color:#555}input{padding:4px}')},
    {"id":"h2-2","title":"嵌套规则——正确的包含关系","content":"标签可以嵌套,但必须正确关闭:先进后出(像括号)。<div><p>内容</p></div> ✅。某些标签有严格嵌套约束:<ul>里只能放<li>,<p>里不能放块级元素。<table>下的<thead>/<tbody>/<tfoot>/<tr>/<td>有严格的父子关系。💡用HTML验证器检查嵌套错误。",
        "code":B('<div style="border:2px solid #667eea;padding:16px;border-radius:8px"><h3 style="color:#667eea;margin:0 0 8px">正确嵌套</h3><p style="color:#ccc">div > h3 + p，这是正确的嵌套。</p></div><div style="border:2px solid #e74c3c;padding:16px;border-radius:8px;margin-top:8px"><h3 style="color:#e74c3c;margin:0 0 8px">常见错误</h3><p style="color:#e74c3c">&lt;ul&gt;里不能直接放文字,要放&lt;li&gt;</p></div>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    {"id":"h2-3","title":"属性的规范写法","content":"属性值用双引号包裹(class='btn')。布尔属性:checked / disabled / required / readonly / selected 只写属性名即可(不必写值)。多个属性用空格分隔。data-*自定义属性(JS读取)。💡规范:标签名全小写,属性值双引号,布尔属性不写值。",
        "code":B('<input type="text" placeholder="必须有值" required>\n<p style="color:#888;font-size:13px">↑ required 是布尔属性,只写属性名就行</p>\n\n<button disabled>禁用按钮</button>\n<p style="color:#888;font-size:13px">↑ disabled 也是布尔属性</p>\n\n<div data-user-id="123" data-role="admin">\n  <span style="color:#667eea">data-*自定义属性,JS可以读取</span>\n</div>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}input{padding:6px;width:200px;background:#333;color:#eee;border:1px solid #555;border-radius:4px}button{padding:8px 16px;margin:8px 0}button:disabled{opacity:.5}')},
    sum("✅标签全小写,属性值双引号\n✅嵌套规则:先进后出,不交叉\n✅布尔属性:只写属性名(checked/disabled/required/readonly)\n✅自定义属性:data-*格式\n✅空元素:br/hr/img/input/meta/link"),
]})

with open('src/data/h-tutorials.json','w',encoding='utf-8') as f: json.dump(tuts,f,ensure_ascii=False,indent=2)
print(f'h0-h2: {len(tuts)} tutorials')
