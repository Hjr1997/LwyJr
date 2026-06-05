export interface SplashPreset {
  id: number
  name: string
  bg: string        // CSS background
  mesh: string      // gradient mesh overlay
  particles: string // particle type
  titleGradient: string
  titleShadow: string
  logoStyle: Record<string,string>
  codeTheme: Record<string,string>
  accentColor: string
  accentColor2: string
  textGlow: string
  exitEffect: string
  noiseOpacity: number
  particleCount: number
  particleColors: string[]
  geoCount: number
  geoShapes: string[] // circle, square, rounded, diamond, triangle, hex
  ctaGradient: string
  ctaGlow: string
  progressGradient: string
}

const presets: SplashPreset[] = [
  // 1-10: Aurora / Northern Lights
  { id:1, name:'Aurora', bg:'#020210', mesh:'radial-gradient(ellipse 60% 50% at 30% 50%,rgba(0,255,65,.12),transparent 50%), radial-gradient(ellipse 50% 60% at 70% 30%,rgba(0,113,227,.1),transparent 50%), radial-gradient(ellipse 40% 40% at 50% 80%,rgba(88,86,214,.08),transparent 50%)', particles:'aurora', titleGradient:'linear-gradient(135deg,#00ff41,#00d4ff,#00ff41)', titleShadow:'0 0 40px rgba(0,255,65,.3)', logoStyle:{border:'2px solid rgba(0,255,65,.3)','box-shadow':'0 0 30px rgba(0,255,65,.2)'}, codeTheme:{bg:'rgba(0,8,20,.9)','border-color':'rgba(0,255,65,.08)'}, accentColor:'#00ff41', accentColor2:'#00d4ff', textGlow:'0 0 20px rgba(0,255,65,.2)', exitEffect:'aurora', noiseOpacity:.015, particleCount:50, particleColors:['rgba(0,255,65,.15)','rgba(0,212,255,.12)','rgba(88,86,214,.1)'], geoCount:3, geoShapes:['circle','circle','circle'], ctaGradient:'linear-gradient(135deg,#00ff41,#00d4ff)', ctaGlow:'0 0 40px rgba(0,255,65,.3)', progressGradient:'linear-gradient(90deg,#00ff41,#00d4ff)' },
  { id:2, name:'Purple Aurora', bg:'#050510', mesh:'radial-gradient(ellipse 70% 60% at 20% 60%,rgba(138,43,226,.1),transparent 50%), radial-gradient(ellipse 50% 50% at 80% 40%,rgba(0,200,255,.08),transparent 50%)', particles:'aurora', titleGradient:'linear-gradient(135deg,#a855f7,#7dd3fc,#a855f7)', titleShadow:'0 0 40px rgba(168,85,247,.3)', logoStyle:{border:'2px solid rgba(168,85,247,.3)','box-shadow':'0 0 30px rgba(168,85,247,.2)'}, codeTheme:{bg:'rgba(10,5,25,.9)','border-color':'rgba(168,85,247,.08)'}, accentColor:'#a855f7', accentColor2:'#7dd3fc', textGlow:'0 0 20px rgba(168,85,247,.2)', exitEffect:'aurora', noiseOpacity:.015, particleCount:45, particleColors:['rgba(168,85,247,.12)','rgba(125,211,252,.1)'], geoCount:4, geoShapes:['circle','circle','rounded','circle'], ctaGradient:'linear-gradient(135deg,#a855f7,#7dd3fc)', ctaGlow:'0 0 40px rgba(168,85,247,.3)', progressGradient:'linear-gradient(90deg,#a855f7,#7dd3fc)' },
  { id:3, name:'Sunset Aurora', bg:'#080504', mesh:'radial-gradient(ellipse 60% 50% at 50% 30%,rgba(255,55,95,.1),transparent 50%), radial-gradient(ellipse 50% 60% at 30% 70%,rgba(255,159,10,.08),transparent 50%)', particles:'aurora', titleGradient:'linear-gradient(135deg,#ff375f,#ff9f0a,#ff375f)', titleShadow:'0 0 40px rgba(255,55,95,.3)', logoStyle:{border:'2px solid rgba(255,55,95,.3)','box-shadow':'0 0 30px rgba(255,55,95,.2)'}, codeTheme:{bg:'rgba(15,5,5,.9)','border-color':'rgba(255,55,95,.08)'}, accentColor:'#ff375f', accentColor2:'#ff9f0a', textGlow:'0 0 20px rgba(255,55,95,.2)', exitEffect:'aurora', noiseOpacity:.015, particleCount:48, particleColors:['rgba(255,55,95,.12)','rgba(255,159,10,.1)'], geoCount:3, geoShapes:['circle','rounded','circle'], ctaGradient:'linear-gradient(135deg,#ff375f,#ff9f0a)', ctaGlow:'0 0 40px rgba(255,55,95,.3)', progressGradient:'linear-gradient(90deg,#ff375f,#ff9f0a)' },

  // 11-20: Geometric / Minimalist
  { id:11, name:'Hex Grid', bg:'#060608', mesh:'', particles:'hex', titleGradient:'linear-gradient(135deg,#fff,#ccc)', titleShadow:'none', logoStyle:{border:'1px solid rgba(255,255,255,.1)','box-shadow':'none'}, codeTheme:{bg:'rgba(10,10,12,.95)','border-color':'rgba(255,255,255,.04)'}, accentColor:'#ffffff', accentColor2:'#888888', textGlow:'none', exitEffect:'geometric', noiseOpacity:.008, particleCount:60, particleColors:['rgba(255,255,255,.03)','rgba(255,255,255,.05)'], geoCount:6, geoShapes:['hex','hex','hex','hex','hex','hex'], ctaGradient:'linear-gradient(135deg,#333,#666)', ctaGlow:'none', progressGradient:'linear-gradient(90deg,#444,#888,#444)' },
  { id:12, name:'Diagonal Lines', bg:'#050507', mesh:'', particles:'lines', titleGradient:'#f5f5f7', titleShadow:'none', logoStyle:{border:'1px solid rgba(255,255,255,.08)'}, codeTheme:{bg:'rgba(8,8,10,.95)','border-color':'rgba(255,255,255,.03)'}, accentColor:'#f5f5f7', accentColor2:'#999', textGlow:'none', exitEffect:'slide', noiseOpacity:.005, particleCount:20, particleColors:['rgba(255,255,255,.04)'], geoCount:0, geoShapes:[], ctaGradient:'#333', ctaGlow:'none', progressGradient:'linear-gradient(90deg,#555,#888)' },
  { id:13, name:'Circle Packing', bg:'#08080a', mesh:'', particles:'circles', titleGradient:'#f5f5f7', titleShadow:'none', logoStyle:{border:'2px solid rgba(255,255,255,.06)','border-radius':'50%'}, codeTheme:{bg:'rgba(12,12,16,.95)'}, accentColor:'#f5f5f7', accentColor2:'#aaa', textGlow:'none', exitEffect:'scale', noiseOpacity:.003, particleCount:80, particleColors:['rgba(255,255,255,.02)','rgba(255,255,255,.04)'], geoCount:8, geoShapes:['circle','circle','circle','circle','circle','circle','circle','circle'], ctaGradient:'#2a2a2a', ctaGlow:'none', progressGradient:'linear-gradient(90deg,#555,#999)' },
  { id:14, name:'Grid Lines', bg:'#040406', mesh:'', particles:'grid', titleGradient:'#f5f5f7', titleShadow:'none', logoStyle:{border:'1px solid #333'}, codeTheme:{bg:'rgba(6,6,8,.95)','border-color':'#222'}, accentColor:'#f5f5f7', accentColor2:'#777', textGlow:'none', exitEffect:'grid', noiseOpacity:.002, particleCount:0, geoCount:0, geoShapes:[], ctaGradient:'#222', ctaGlow:'none', progressGradient:'linear-gradient(90deg,#444,#888)' },

  // 21-30: Matrix / Code Rain
  { id:21, name:'Matrix', bg:'#000', mesh:'', particles:'matrix', titleGradient:'#00ff41', titleShadow:'0 0 20px rgba(0,255,65,.5)', logoStyle:{border:'1px solid rgba(0,255,65,.4)','box-shadow':'0 0 20px rgba(0,255,65,.3)'}, codeTheme:{bg:'rgba(0,10,0,.95)','border-color':'rgba(0,255,65,.1)'}, accentColor:'#00ff41', accentColor2:'#003300', textGlow:'0 0 10px rgba(0,255,65,.3)', exitEffect:'matrix', noiseOpacity:.01, particleCount:80, particleColors:['rgba(0,255,65,.1)','rgba(0,255,65,.05)'], geoCount:0, geoShapes:[], ctaGradient:'#003300', ctaGlow:'0 0 20px rgba(0,255,65,.4)', progressGradient:'linear-gradient(90deg,#003300,#00ff41)' },
  { id:22, name:'Blue Matrix', bg:'#000510', mesh:'', particles:'matrix-blue', titleGradient:'#00d4ff', titleShadow:'0 0 20px rgba(0,212,255,.5)', logoStyle:{border:'1px solid rgba(0,212,255,.4)','box-shadow':'0 0 20px rgba(0,212,255,.3)'}, codeTheme:{bg:'rgba(0,5,16,.95)','border-color':'rgba(0,212,255,.1)'}, accentColor:'#00d4ff', accentColor2:'#003040', textGlow:'0 0 10px rgba(0,212,255,.3)', exitEffect:'matrix', noiseOpacity:.01, particleCount:75, particleColors:['rgba(0,212,255,.1)','rgba(0,212,255,.04)'], geoCount:0, geoShapes:[], ctaGradient:'#003040', ctaGlow:'0 0 20px rgba(0,212,255,.4)', progressGradient:'linear-gradient(90deg,#003040,#00d4ff)' },
  { id:23, name:'Red Matrix', bg:'#050000', mesh:'', particles:'matrix-red', titleGradient:'#ff3333', titleShadow:'0 0 20px rgba(255,51,51,.5)', logoStyle:{border:'1px solid rgba(255,51,51,.4)','box-shadow':'0 0 20px rgba(255,51,51,.3)'}, codeTheme:{bg:'rgba(8,0,0,.95)','border-color':'rgba(255,51,51,.1)'}, accentColor:'#ff3333', accentColor2:'#300000', textGlow:'0 0 10px rgba(255,51,51,.3)', exitEffect:'matrix', noiseOpacity:.01, particleCount:70, particleColors:['rgba(255,51,51,.1)','rgba(255,51,51,.04)'], geoCount:0, geoShapes:[], ctaGradient:'#300000', ctaGlow:'0 0 20px rgba(255,51,51,.4)', progressGradient:'linear-gradient(90deg,#300000,#ff3333)' },

  // 31-40: Fire / Energy
  { id:31, name:'Inferno', bg:'#0a0200', mesh:'radial-gradient(ellipse 50% 60% at 50% 80%,rgba(255,60,0,.15),transparent 60%)', particles:'fire', titleGradient:'linear-gradient(180deg,#ffcc00,#ff6600,#ff3300)', titleShadow:'0 0 50px rgba(255,100,0,.4)', logoStyle:{border:'2px solid rgba(255,100,0,.4)','box-shadow':'0 0 40px rgba(255,60,0,.3)'}, codeTheme:{bg:'rgba(15,3,0,.9)','border-color':'rgba(255,100,0,.1)'}, accentColor:'#ff6600', accentColor2:'#ffcc00', textGlow:'0 0 30px rgba(255,100,0,.3)', exitEffect:'fire', noiseOpacity:.01, particleCount:60, particleColors:['rgba(255,100,0,.08)','rgba(255,200,0,.06)','rgba(255,50,0,.1)'], geoCount:3, geoShapes:['circle','circle','circle'], ctaGradient:'linear-gradient(135deg,#ff3300,#ff6600,#ffcc00)', ctaGlow:'0 0 50px rgba(255,100,0,.4)', progressGradient:'linear-gradient(90deg,#ff3300,#ffcc00)' },
  { id:32, name:'Solar', bg:'#000005', mesh:'radial-gradient(ellipse 30% 30% at 50% 40%,rgba(255,200,0,.2),transparent 70%)', particles:'orbit', titleGradient:'linear-gradient(180deg,#fff,#ffcc00,#ff6600)', titleShadow:'0 0 60px rgba(255,200,0,.4)', logoStyle:{border:'2px solid rgba(255,200,0,.4)','box-shadow':'0 0 40px rgba(255,200,0,.3)'}, codeTheme:{bg:'rgba(5,3,0,.9)','border-color':'rgba(255,200,0,.1)'}, accentColor:'#ffcc00', accentColor2:'#ff8800', textGlow:'0 0 30px rgba(255,200,0,.3)', exitEffect:'solar', noiseOpacity:.012, particleCount:30, particleColors:['rgba(255,200,0,.1)','rgba(255,150,0,.08)'], geoCount:0, geoShapes:[], ctaGradient:'linear-gradient(135deg,#ff8800,#ffcc00)', ctaGlow:'0 0 50px rgba(255,200,0,.5)', progressGradient:'linear-gradient(90deg,#ff8800,#ffcc00)' },

  // 41-50: Ocean / Water
  { id:41, name:'Deep Ocean', bg:'#000510', mesh:'radial-gradient(ellipse 70% 80% at 50% 60%,rgba(0,100,200,.12),transparent 50%)', particles:'bubbles', titleGradient:'linear-gradient(180deg,#7dd3fc,#0284c7,#0c4a6e)', titleShadow:'0 0 40px rgba(2,132,199,.4)', logoStyle:{border:'2px solid rgba(2,132,199,.3)','box-shadow':'0 0 30px rgba(2,132,199,.2)'}, codeTheme:{bg:'rgba(0,5,15,.9)','border-color':'rgba(2,132,199,.08)'}, accentColor:'#0284c7', accentColor2:'#7dd3fc', textGlow:'0 0 20px rgba(2,132,199,.3)', exitEffect:'ocean', noiseOpacity:.012, particleCount:40, particleColors:['rgba(125,211,252,.1)','rgba(2,132,199,.08)','rgba(255,255,255,.04)'], geoCount:3, geoShapes:['circle','circle','circle'], ctaGradient:'linear-gradient(135deg,#0c4a6e,#0284c7,#7dd3fc)', ctaGlow:'0 0 40px rgba(2,132,199,.4)', progressGradient:'linear-gradient(90deg,#0c4a6e,#7dd3fc)' },
  { id:42, name:'Teal Ocean', bg:'#000a08', mesh:'radial-gradient(ellipse 60% 70% at 40% 50%,rgba(20,184,166,.12),transparent 50%)', particles:'bubbles', titleGradient:'linear-gradient(180deg,#5eead4,#14b8a6,#0f766e)', titleShadow:'0 0 40px rgba(20,184,166,.4)', logoStyle:{border:'2px solid rgba(20,184,166,.3)'}, codeTheme:{bg:'rgba(0,8,6,.9)','border-color':'rgba(20,184,166,.08)'}, accentColor:'#14b8a6', accentColor2:'#5eead4', textGlow:'0 0 20px rgba(20,184,166,.3)', exitEffect:'ocean', noiseOpacity:.012, particleCount:35, particleColors:['rgba(94,234,212,.1)','rgba(20,184,166,.08)'], geoCount:3, geoShapes:['circle','circle','rounded'], ctaGradient:'linear-gradient(135deg,#0f766e,#14b8a6,#5eead4)', ctaGlow:'0 0 40px rgba(20,184,166,.4)', progressGradient:'linear-gradient(90deg,#0f766e,#5eead4)' },

  // 51-60: Cosmic / Space
  { id:51, name:'Nebula', bg:'#020008', mesh:'radial-gradient(ellipse 40% 40% at 60% 30%,rgba(255,0,128,.08),transparent 60%), radial-gradient(ellipse 30% 30% at 30% 60%,rgba(0,200,255,.06),transparent 60%), radial-gradient(ellipse 20% 20% at 70% 70%,rgba(80,255,0,.05),transparent 60%)', particles:'stars', titleGradient:'linear-gradient(135deg,#f0abfc,#7dd3fc,#a78bfa)', titleShadow:'0 0 50px rgba(240,171,252,.3)', logoStyle:{border:'2px solid rgba(240,171,252,.3)','box-shadow':'0 0 40px rgba(167,139,250,.2)'}, codeTheme:{bg:'rgba(5,2,15,.9)','border-color':'rgba(240,171,252,.08)'}, accentColor:'#c084fc', accentColor2:'#7dd3fc', textGlow:'0 0 25px rgba(192,132,252,.3)', exitEffect:'cosmic', noiseOpacity:.01, particleCount:100, particleColors:['rgba(255,255,255,.08)','rgba(240,171,252,.06)','rgba(125,211,252,.05)'], geoCount:5, geoShapes:['circle','circle','circle','circle','circle'], ctaGradient:'linear-gradient(135deg,#7c3aed,#a78bfa,#c084fc)', ctaGlow:'0 0 50px rgba(192,132,252,.4)', progressGradient:'linear-gradient(90deg,#7c3aed,#c084fc)' },
  { id:52, name:'Galaxy', bg:'#010108', mesh:'radial-gradient(ellipse 40% 40% at 50% 40%,rgba(138,43,226,.1),transparent 55%), conic-gradient(from 45deg at 50% 45%,rgba(138,43,226,.03),transparent 20%,rgba(0,200,255,.03),transparent 40%,transparent 100%)', particles:'stars', titleGradient:'linear-gradient(180deg,#e9d5ff,#a855f7,#7c3aed)', titleShadow:'0 0 50px rgba(168,85,247,.4)', logoStyle:{border:'2px solid rgba(168,85,247,.3)'}, codeTheme:{bg:'rgba(3,2,10,.9)','border-color':'rgba(168,85,247,.08)'}, accentColor:'#a855f7', accentColor2:'#e9d5ff', textGlow:'0 0 25px rgba(168,85,247,.3)', exitEffect:'cosmic', noiseOpacity:.008, particleCount:120, particleColors:['rgba(255,255,255,.1)','rgba(168,85,247,.06)','rgba(125,211,252,.05)'], geoCount:5, geoShapes:['circle','circle','circle','circle','circle'], ctaGradient:'linear-gradient(135deg,#6d28d9,#a855f7,#c084fc)', ctaGlow:'0 0 50px rgba(168,85,247,.5)', progressGradient:'linear-gradient(90deg,#6d28d9,#c084fc)' },

  // 61-70: Neon / Cyberpunk
  { id:61, name:'Neon Night', bg:'#0a0a0f', mesh:'', particles:'neon', titleGradient:'#ff00ff', titleShadow:'0 0 30px rgba(255,0,255,.6), 0 0 60px rgba(255,0,255,.3), 0 0 90px rgba(0,255,255,.2)', logoStyle:{border:'3px solid rgba(255,0,255,.5)','box-shadow':'0 0 40px rgba(255,0,255,.4), inset 0 0 20px rgba(255,0,255,.1)'}, codeTheme:{bg:'rgba(12,0,15,.9)','border-color':'rgba(255,0,255,.1)'}, accentColor:'#ff00ff', accentColor2:'#00ffff', textGlow:'0 0 20px rgba(255,0,255,.4)', exitEffect:'neon', noiseOpacity:.015, particleCount:40, particleColors:['rgba(255,0,255,.15)','rgba(0,255,255,.12)'], geoCount:4, geoShapes:['rounded','rounded','rounded','rounded'], ctaGradient:'linear-gradient(135deg,#ff00ff,#00ffff)', ctaGlow:'0 0 50px rgba(255,0,255,.5)', progressGradient:'linear-gradient(90deg,#ff00ff,#00ffff)' },
  { id:62, name:'Cyber Green', bg:'#050a05', mesh:'', particles:'neon', titleGradient:'#00ff41', titleShadow:'0 0 30px rgba(0,255,65,.6), 0 0 60px rgba(0,255,65,.3)', logoStyle:{border:'3px solid rgba(0,255,65,.5)','box-shadow':'0 0 30px rgba(0,255,65,.4)'}, codeTheme:{bg:'rgba(0,10,0,.9)','border-color':'rgba(0,255,65,.1)'}, accentColor:'#00ff41', accentColor2:'#00cc00', textGlow:'0 0 20px rgba(0,255,65,.4)', exitEffect:'neon', noiseOpacity:.01, particleCount:35, particleColors:['rgba(0,255,65,.15)','rgba(0,200,0,.1)'], geoCount:3, geoShapes:['hex','hex','hex'], ctaGradient:'linear-gradient(135deg,#003300,#00ff41)', ctaGlow:'0 0 40px rgba(0,255,65,.6)', progressGradient:'linear-gradient(90deg,#003300,#00ff41)' },
  { id:63, name:'Synthwave', bg:'#0a0014', mesh:'radial-gradient(ellipse 80% 60% at 50% 100%,rgba(255,0,128,.1),transparent 50%)', particles:'synthwave', titleGradient:'linear-gradient(180deg,#ff00ff,#ff0066,#ff6600)', titleShadow:'0 0 50px rgba(255,0,102,.5)', logoStyle:{border:'2px solid rgba(255,0,102,.4)'}, codeTheme:{bg:'rgba(10,0,15,.9)','border-color':'rgba(255,0,102,.1)'}, accentColor:'#ff0066', accentColor2:'#ff00ff', textGlow:'0 0 25px rgba(255,0,102,.4)', exitEffect:'synthwave', noiseOpacity:.012, particleCount:45, particleColors:['rgba(255,0,128,.1)','rgba(255,0,102,.08)'], geoCount:2, geoShapes:['rounded','rounded'], ctaGradient:'linear-gradient(180deg,#ff00ff,#ff0066,#ff6600)', ctaGlow:'0 0 50px rgba(255,0,102,.5)', progressGradient:'linear-gradient(90deg,#ff00ff,#ff6600)' },

  // 71-80: Glass / Minimal
  { id:71, name:'Frosted Glass', bg:'#f5f5f7', mesh:'', particles:'light', titleGradient:'#1d1d1f', titleShadow:'none', logoStyle:{border:'1px solid rgba(0,0,0,.05)','background':'rgba(255,255,255,.8)','backdrop-filter':'blur(20px)'}, codeTheme:{bg:'rgba(255,255,255,.8)','border-color':'rgba(0,0,0,.06)','color':'#333','--code-bg':'#f5f5f7'}, accentColor:'#1d1d1f', accentColor2:'#86868b', textGlow:'none', exitEffect:'fade', noiseOpacity:0, particleCount:20, particleColors:['rgba(0,0,0,.03)','rgba(0,0,0,.05)'], geoCount:0, geoShapes:[], ctaGradient:'linear-gradient(135deg,#1d1d1f,#333)', ctaGlow:'none', progressGradient:'linear-gradient(90deg,#1d1d1f,#86868b)' },
  { id:72, name:'Dark Glass', bg:'#0a0a0a', mesh:'', particles:'light', titleGradient:'#f5f5f7', titleShadow:'0 0 20px rgba(255,255,255,.05)', logoStyle:{border:'1px solid rgba(255,255,255,.06)','background':'rgba(30,30,30,.5)','backdrop-filter':'blur(20px)'}, codeTheme:{bg:'rgba(20,20,24,.8)','border-color':'rgba(255,255,255,.04)'}, accentColor:'#f5f5f7', accentColor2:'#999', textGlow:'none', exitEffect:'glass', noiseOpacity:.004, particleCount:15, particleColors:['rgba(255,255,255,.02)'], geoCount:0, geoShapes:[], ctaGradient:'rgba(255,255,255,.08)', ctaGlow:'none', progressGradient:'linear-gradient(90deg,#333,#999)' },

  // 81-90: Retro / 8-bit
  { id:81, name:'8-Bit', bg:'#1a1a2e', mesh:'', particles:'pixel', titleGradient:'#f39c12', titleShadow:'4px 4px 0 #e67e22', logoStyle:{border:'3px solid #f39c12','border-radius':'0','box-shadow':'4px 4px 0 #e67e22'}, codeTheme:{bg:'#0d0d1a','border-color':'#f39c12'}, accentColor:'#f39c12', accentColor2:'#e67e22', textGlow:'none', exitEffect:'pixel', noiseOpacity:.02, particleCount:50, particleColors:['rgba(243,156,18,.1)','rgba(230,126,34,.08)'], geoCount:4, geoShapes:['square','square','square','square'], ctaGradient:'#f39c12', ctaGlow:'4px 4px 0 #e67e22', progressGradient:'linear-gradient(90deg,#f39c12,#e67e22)' },
  { id:82, name:'Vaporwave', bg:'#ff71ce', mesh:'', particles:'pixel', titleGradient:'#01cdfe', titleShadow:'4px 4px 0 #05ffa1', logoStyle:{border:'4px solid #b967ff','border-radius':'0','box-shadow':'6px 6px 0 #01cdfe'}, codeTheme:{bg:'rgba(255,113,206,.2)','border-color':'#01cdfe'}, accentColor:'#01cdfe', accentColor2:'#b967ff', textGlow:'none', exitEffect:'pixel', noiseOpacity:.015, particleCount:40, particleColors:['rgba(1,205,254,.1)','rgba(185,103,255,.1)'], geoCount:3, geoShapes:['square','square','square'], ctaGradient:'#b967ff', ctaGlow:'4px 4px 0 #01cdfe', progressGradient:'linear-gradient(90deg,#01cdfe,#b967ff)' },

  // 91-100: Premium / Luxury
  { id:91, name:'Gold', bg:'#0a0a08', mesh:'radial-gradient(ellipse 40% 40% at 50% 30%,rgba(212,175,55,.12),transparent 60%)', particles:'gold', titleGradient:'linear-gradient(135deg,#d4af37,#fff8dc,#d4af37)', titleShadow:'0 0 40px rgba(212,175,55,.3)', logoStyle:{border:'2px solid rgba(212,175,55,.4)','box-shadow':'0 0 30px rgba(212,175,55,.2)'}, codeTheme:{bg:'rgba(10,8,5,.9)','border-color':'rgba(212,175,55,.1)'}, accentColor:'#d4af37', accentColor2:'#fff8dc', textGlow:'0 0 20px rgba(212,175,55,.2)', exitEffect:'gold', noiseOpacity:.008, particleCount:30, particleColors:['rgba(212,175,55,.1)','rgba(255,248,220,.08)'], geoCount:3, geoShapes:['diamond','circle','diamond'], ctaGradient:'linear-gradient(135deg,#b8860b,#d4af37,#fff8dc)', ctaGlow:'0 0 40px rgba(212,175,55,.4)', progressGradient:'linear-gradient(90deg,#b8860b,#fff8dc)' },
  { id:92, name:'Platinum', bg:'#08080a', mesh:'radial-gradient(ellipse 40% 40% at 50% 30%,rgba(192,192,192,.1),transparent 60%)', particles:'gold', titleGradient:'linear-gradient(135deg,#e5e7eb,#fff,#9ca3af)', titleShadow:'0 0 30px rgba(255,255,255,.15)', logoStyle:{border:'2px solid rgba(192,192,192,.3)'}, codeTheme:{bg:'rgba(12,12,14,.9)','border-color':'rgba(192,192,192,.08)'}, accentColor:'#e5e7eb', accentColor2:'#9ca3af', textGlow:'0 0 15px rgba(255,255,255,.1)', exitEffect:'gold', noiseOpacity:.006, particleCount:25, particleColors:['rgba(192,192,192,.08)','rgba(255,255,255,.05)'], geoCount:2, geoShapes:['diamond','diamond'], ctaGradient:'linear-gradient(135deg,#4b5563,#9ca3af,#e5e7eb)', ctaGlow:'0 0 30px rgba(255,255,255,.2)', progressGradient:'linear-gradient(90deg,#4b5563,#fff)' },
]

// Generate remaining presets to reach 100 by varying colors/themes
const baseThemes = [
  { name:'Forest', c1:'#228B22', c2:'#90EE90', bg:'#020802' },
  { name:'Lavender', c1:'#9678d3', c2:'#e0c3fc', bg:'#080410' },
  { name:'Mint', c1:'#00e5a0', c2:'#a8ffd0', bg:'#020c08' },
  { name:'Coral', c1:'#ff6b6b', c2:'#ffd93d', bg:'#0a0402' },
  { name:'Midnight', c1:'#2d2d6b', c2:'#6b6bff', bg:'#020208' },
  { name:'Sunrise', c1:'#ff7e5f', c2:'#feb47b', bg:'#0a0502' },
  { name:'Ocean', c1:'#1e90d4', c2:'#39d4ff', bg:'#02080a' },
  { name:'Rose', c1:'#e86a92', c2:'#f7c8d6', bg:'#0a0204' },
]

for (let i = 0; i < baseThemes.length; i++) {
  const t = baseThemes[i]
  const id = 93 + i
  presets.push({
    id, name:t.name, bg:t.bg,
    mesh:`radial-gradient(ellipse 50% 50% at 50% 40%,${t.c1}15,transparent 60%)`,
    particles:i%3===0?'aurora':i%3===1?'stars':'bubbles',
    titleGradient:`linear-gradient(135deg,${t.c2},${t.c1},${t.c2})`,
    titleShadow:`0 0 40px ${t.c1}44`,
    logoStyle:{border:`2px solid ${t.c1}44`,'box-shadow':`0 0 25px ${t.c1}33`},
    codeTheme:{bg:'rgba(6,4,12,.9)','border-color':`${t.c1}11`},
    accentColor:t.c1, accentColor2:t.c2, textGlow:`0 0 20px ${t.c1}33`,
    exitEffect:'aurora', noiseOpacity:.012,
    particleCount:40 + i*5,
    particleColors:[`${t.c1}12`,`${t.c2}08`],
    geoCount:3, geoShapes:['circle','rounded','circle'],
    ctaGradient:`linear-gradient(135deg,${t.c1},${t.c2})`,
    ctaGlow:`0 0 40px ${t.c1}44`,
    progressGradient:`linear-gradient(90deg,${t.c1},${t.c2})`,
  })
}

export default presets

export function randomPreset(): SplashPreset {
  const idx = Math.floor(Math.random() * presets.length)
  return presets[idx]
}
