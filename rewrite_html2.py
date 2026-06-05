#!/usr/bin/env python3
"""HTML chapters h3-h20: all remaining tutorials with summaries and full attribute listings"""
import json
def B(h,c="",j=""): return {"html":h,"css":c,"js":j}
def S(text): return {"id":"","title":"📋 本章总结","content":text}

with open('src/data/h-tutorials.json','r',encoding='utf-8') as f: tuts=json.load(f)

# ====== h3: 标题 h1-h6 ======
tuts.append({"id":"h3","title":"h3 标题标签——h1到h6的层级艺术","desc":"h1-h6全属性详解:align/全局属性/SEO最佳实践","category":"html","icon":"📝","difficulty":"入门","steps":[
    {"id":"h3-1","title":"h1-h6——六级标题,一个页面只有一个h1","content":"h1最大(一级)→h6最小(六级)。浏览器默认:粗体+上下边距+逐级减小。一个页面应该只有一个h1(SEO核心原则!)。h1=页面主题,h2=大章节,h3=子章节...形成清晰的文档大纲。align属性(已废弃,用CSS text-align替代)。💡不用为了'大字号'选h1,用CSS控制字号,选标题要基于语义层级。",
        "code":B('<h1>一级标题 h1</h1><h2>二级标题 h2</h2><h3>三级标题 h3</h3><h4>四级标题 h4</h4><h5>五级标题 h5</h5><h6>六级标题 h6</h6>','h1{color:#667eea}h2{color:#764ba2}h3{color:#2ecc71}h4{color:#f39c12}h5{color:#e74c3c}h6{color:#888}h1,h2,h3,h4,h5,h6{margin:8px 0;font-family:Arial}body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    {"id":"h3-2","title":"标题的全属性和最佳实践","content":"标题支持所有全局属性(id/class/style/title/data-*)。💡SEO最佳实践:①一个页面一个h1(包含核心关键词)②h2-h6按层级使用不跳级(h2后应是h3,不跳到h4)③标题文字应描述下方内容④搜索引擎根据标题层级判断页面结构。",
        "code":B('<h1 id="main-title" class="hero" title="这是页面主标题" style="color:#667eea">h1:我的编程学习之路</h1><h2 id="ch1">第一章:HTML基础</h2><h3>1.1 什么是HTML</h3><h3>1.2 基本标签</h3><h2 id="ch2">第二章:CSS入门</h2><h3>2.1 选择器</h3><p style="color:#888;font-size:12px">↑ 正确的标题层级:h1→h2→h3,不跳级</p>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}h2{color:#764ba2}h3{color:#2ecc71}p{color:#aaa}')},
    S("✅h1-h6:六级标题,语义层级,非字号工具\n✅SEO:一个h1,按层级使用,不跳级\n✅属性:支持所有全局属性(id/class/style/title)\n✅废弃:align(用CSS text-align代替)"),
]})

# ====== h4: 段落 ======
tuts.append({"id":"h4","title":"h4 段落与换行——p/br/hr/wbr","desc":"p段落/br换行/hr分割线/wbr断词/white-space","category":"html","icon":"📄","difficulty":"入门","steps":[
    {"id":"h4-1","title":"p——段落(paragraph)","content":"<p>定义段落,默认上下有margin间距。每个p独占一个'块'(block级)。不要用空p标签造间距(那是CSS的活)。p内可以放文本、行内元素(span/a/strong等),但不能放块级元素(div/h1等)。",
        "code":B('<p>第一段:HTML是网页的基础语言,学习曲线平缓,上手很快。</p><p>第二段:每个p自动与上下元素保持间距,不需要额外加br。</p><p style="color:#2ecc71">特殊段落:可以用CSS改变样式。</p>','p{line-height:1.8;color:#ccc;margin:12px 0}body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    {"id":"h4-2","title":"br/hr/wbr——换行/分割/断词","content":"<br>强制换行(不产生新段落,诗歌/地址用)。<hr>水平分割线(主题切换用,默认灰色)。<wbr>可断词位置(长URL在窄屏时可在wbr处换行)。💡br不要用来造间距,CSS margin/padding才是正道。",
        "code":B('<p style="color:#ccc;line-height:2">第一行<br>第二行(br换行,仍在同一段落)</p><hr style="border:none;border-top:2px solid #667eea;margin:16px 0"><p style="color:#ccc">分割线上面和下面属于不同主题区域。</p><p style="color:#888;font-size:12px;word-break:break-all">长URL:https://example<wbr>.com/very<wbr>-long<wbr>-path<wbr>/page</p>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    S("✅p:段落,block级,自动上下间距\n✅br:强制换行(不产生新段落)\n✅hr:水平分割线(主题切换)\n✅wbr:可选断词位置(长URL)\n✅不用于做间距:那是CSS的活"),
]})

# ====== h5: 文本格式化 ======
tuts.append({"id":"h5","title":"h5 文本格式化——b/strong/i/em/mark/del/ins/sub/sup","desc":"所有行内格式化标签:语义vs视觉,何时用哪个","category":"html","icon":"✏️","difficulty":"入门","steps":[
    {"id":"h5-1","title":"粗体和斜体——b vs strong / i vs em","content":"<b>纯视觉加粗(无语义)。<strong>语义强调重要(屏幕阅读器会重读)。<i>纯视觉斜体(无语义,技术术语/外文词用)。<em>语义强调(重读)。视觉上一样,但strong/em有语义价值,对无障碍访问和SEO更好。💡架构师建议:优先用strong和em。",
        "code":B('<p><b>b标签:纯视觉粗体</b></p><p><strong>strong:语义强调重要!</strong></p><p><i>i标签:纯视觉斜体(外文/术语)</i></p><p><em>em:语义强调(会重读)</em></p><p style="color:#888;font-size:12px">视觉上一样,但strong/em有语义!</p>','b,strong{color:#2ecc71}i,em{color:#667eea}p{color:#ccc;line-height:1.8}body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    {"id":"h5-2","title":"其他格式化标签——mark/small/del/ins/sub/sup/u/s","content":"<mark>高亮(默认黄色)。<small>小号(版权/附属信息)。<del>删除线(已删除内容,带cite/datetime属性)。<ins>插入线(新内容)。<sub>下标(H₂O)。<sup>上标(x²,E=mc²)。<u>下划线(避免与链接混淆)。<s>删除线(不用了,用del)。",
        "code":B('<p>这段有<mark>高亮文字</mark>很醒目。</p><p><small>小号文字,用于版权声明。</small></p><p>原价<del>¥99</del> 现价<ins>¥49</ins></p><p>H<sub>2</sub>O | x<sup>2</sup> = 4</p><p><u>下划线(别和链接搞混)</u> | <s>不用了</s></p>','mark{background:#f39c12;color:#000;padding:0 4px}del{color:#e74c3c}ins{color:#2ecc71;text-decoration:none}u{text-decoration-color:#f39c12}body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}p{color:#ccc;line-height:2}')},
    S("✅语义vs视觉:strong/em(语义) > b/i(视觉)\n✅mark高亮/small小号/del删除/ins插入/sub下标/sup上标\n✅del有cite(引用URL)和datetime(删除时间)属性\n✅避免用u(容易和链接混淆)"),
]})

# ====== h6: 引用标签 ======
tuts.append({"id":"h6","title":"h6 引用标签——blockquote/q/cite","desc":"块级引用/行内引用/作品名引用:全属性+cite属性","category":"html","icon":"💬","difficulty":"入门","steps":[
    {"id":"h6-1","title":"blockquote/q——引用他人的话","content":"<blockquote cite='来源URL'>长引用(块级,自动缩进)。<q cite='来源URL'>短引用(行内,自动加引号)。cite属性标注引用来源(对SEO友好)。<blockquote>内通常再放p标签。💡引用要标注出处,这是对原作者的基本尊重。",
        "code":B('<blockquote cite="https://example.com" style="border-left:4px solid #667eea;padding-left:16px;margin:16px 0;color:#ccc"><p>任何傻瓜都能写出计算机能理解的代码,只有好的程序员才能写出人类能理解的代码。</p><footer style="color:#888;font-size:13px">— Martin Fowler</footer></blockquote><p style="color:#ccc">小明说:<q cite="#">今天天气真好</q></p>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}p{line-height:1.8}')},
    {"id":"h6-2","title":"cite——作品名称(语义斜体)","content":"<cite>用来标记作品名称:书名/电影名/歌曲名/画作名。浏览器默认斜体显示。不要用cite来标记人名(那是错误用法)。cite和blockquote的cite属性是不同的东西:cite标签是HTML元素,cite属性是URL字符串。",
        "code":B('<p style="color:#ccc">我正在读<cite>JavaScript高级程序设计</cite>这本书。</p><p style="color:#ccc">电影<cite>肖申克的救赎</cite>是我最喜欢的电影。</p><p style="color:#888;font-size:12px">注意:cite标签=作品名(斜体),cite属性=引用来源URL</p>','cite{color:#667eea;font-style:italic}body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    S("✅blockquote:块级引用,自动缩进,cite属性=来源URL\n✅q:行内引用,自动加引号,cite属性=来源URL\n✅cite标签:作品名称(斜体语义)\n✅cite属性:引用来源URL(写在blockquote/q上)"),
]})

# ====== h7: 代码标签 ======
tuts.append({"id":"h7","title":"h7 代码/键盘/缩写——pre/code/kbd/samp/var","desc":"技术文档必备:代码块/键盘输入/程序输出/变量/缩写","category":"html","icon":"💻","difficulty":"进阶","steps":[
    {"id":"h7-1","title":"pre + code——代码块","content":"<code>代码片段(行内,等宽字体)。<pre>预格式化(保留空格/换行/缩进)。组合:pre>code包裹完整代码块。💡想展示代码给读者看?用pre>code。pre也常用于ASCII艺术。",
        "code":B('<pre style="background:#1e1e30;padding:16px;border-radius:8px;color:#2ecc71;overflow:auto"><code>function greet(name) {\n  // 这是一段JS代码\n  return "Hello, " + name + "!";\n}\n\nconsole.log(greet("小明"));</code></pre>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    {"id":"h7-2","title":"kbd/samp/var/abbr——更多语义标签","content":"<kbd>键盘按键(表示用户输入,默认等宽)。<samp>程序输出(表示计算机响应)。<var>变量名(数学/编程变量,默认斜体)。<abbr title='全称'>缩写(悬停看全称)。这些是技术文档的标配标签。",
        "code":B('<p style="color:#ccc;line-height:2">按<kbd>Ctrl</kbd>+<kbd>C</kbd>复制,按<kbd>Ctrl</kbd>+<kbd>V</kbd>粘贴。</p><p style="color:#ccc">程序输出:<samp>File saved successfully.</samp></p><p style="color:#ccc">设变量<var>x</var>=10,则<var>x</var>+5=15。</p><p style="color:#ccc"><abbr title="HyperText Markup Language">HTML</abbr>是网页的基石。(悬停看全称)</p>','kbd{background:#444;padding:2px 6px;border-radius:3px;color:#fff;border:1px solid #666;font-size:13px}samp{color:#2ecc71;font-family:monospace}var{color:#667eea;font-style:italic}abbr{text-decoration:underline dotted;cursor:help;color:#f39c12}body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    {"id":"h7-3","title":"address/bdo——地址与文字方向","content":"<address>联系信息(邮箱/电话/地址,默认斜体块级)。<bdo dir='rtl'>双向文字覆盖(让文字从右到左显示,如阿拉伯语)。<bdi>双向隔离(防止周围文字影响方向)。",
        "code":B('<address style="color:#aaa;font-style:normal;line-height:1.8">📧 Email: hello@example.com<br>📞 电话: 010-12345678<br>📍 地址: 北京市海淀区</address><p style="color:#ccc">正常方向: Hello World</p><p style="color:#ccc">反向(bdo): <bdo dir="rtl">Hello World</bdo></p>','body{padding:20px;font-family:Arial;background:#1a1a2e;color:#eee}')},
    S("✅code:行内代码(等宽)。pre:保留格式(空格换行)。组合:pre>code\n✅kbd:键盘输入。samp:程序输出。var:变量名\n✅abbr:缩写(带title=全称)。address:联系信息\n✅bdo dir='rtl':右到左文字。bdi:方向隔离"),
]})

with open('src/data/h-tutorials.json','w',encoding='utf-8') as f: json.dump(tuts,f,ensure_ascii=False,indent=2)
print(f'Batch done: {len(tuts)} tutorials')
