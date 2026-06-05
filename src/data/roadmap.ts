export interface RoadmapStep {
  id: number
  title: string
  phase: string
  phaseColor: string
  icon: string
  desc: string
  skills: string[]
  duration: string
  content: string
}

export const roadmapSteps: RoadmapStep[] = [
  { id: 1, title: '认识互联网', phase: '🌱 启蒙阶段', phaseColor: '#4ade80', icon: '🌐', desc: '了解浏览器如何工作，什么是前端什么是后端', duration: '1天', skills: ['浏览器原理', 'HTTP协议', '域名&IP'], content: '初步了解互联网的运作原理、浏览器的工作机制、以及前端和后端的区别。' },
  { id: 2, title: 'HTML 基础', phase: '🌱 启蒙阶段', phaseColor: '#4ade80', icon: '📄', desc: '学习HTML标签、语义化、表单', duration: '3天', skills: ['语义化标签', '表单元素', '多媒体标签'], content: '掌握HTML常用标签，理解语义化的重要性，学习如何书写结构良好的HTML文档。' },
  { id: 3, title: 'CSS 入门', phase: '🌱 启蒙阶段', phaseColor: '#4ade80', icon: '🎨', desc: '选择器、盒模型、布局基础', duration: '5天', skills: ['选择器', '盒模型', 'Flexbox', '定位'], content: '从CSS选择器开始，理解盒模型，掌握常用的布局方式和定位方法。' },
  { id: 4, title: 'CSS 进阶', phase: '🌿 成长阶段', phaseColor: '#60a5fa', icon: '✨', desc: '动画、过渡、Grid、响应式', duration: '5天', skills: ['动画过渡', 'Grid布局', '响应式设计', 'CSS变量'], content: '学习CSS动画和过渡效果，掌握Grid布局和CSS变量等现代CSS特性。' },
  { id: 5, title: 'JavaScript 基础', phase: '🌿 成长阶段', phaseColor: '#60a5fa', icon: '📜', desc: '变量、函数、DOM操作、事件', duration: '7天', skills: ['变量类型', '函数', 'DOM操作', '事件处理'], content: 'JavaScript编程基础，包括变量、函数、对象、数组、DOM操作和事件处理。' },
  { id: 6, title: 'JavaScript 进阶', phase: '🌿 成长阶段', phaseColor: '#60a5fa', icon: '⚡', desc: '异步编程、ES6+、模块化', duration: '7天', skills: ['Promise', 'Async/Await', 'ES6+', '模块化'], content: '深入理解异步编程，掌握Promise、async/await，学习ES6+新特性。' },
  { id: 7, title: 'Canvas & SVG', phase: '🌳 开花阶段', phaseColor: '#f59e0b', icon: '🎯', desc: 'Canvas绘图、SVG动画、特效开发', duration: '5天', skills: ['Canvas API', 'SVG', '动画帧', 'WebGL基础'], content: '学习Canvas 2D绘图和SVG矢量图形，掌握前端动画和特效开发能力。' },
  { id: 8, title: '构建工具', phase: '🌳 开花阶段', phaseColor: '#f59e0b', icon: '🔧', desc: 'Vite、Webpack、模块打包', duration: '3天', skills: ['Vite', '模块化', '环境变量', '构建优化'], content: '了解前端构建工具，掌握Vite的使用，理解模块打包和构建优化。' },
  { id: 9, title: 'Vue 3 框架', phase: '🌳 开花阶段', phaseColor: '#f59e0b', icon: '💚', desc: '组件化开发、响应式、路由', duration: '7天', skills: ['组件', 'Composition API', 'Vue Router', 'Pinia'], content: '深入学习Vue 3框架，掌握组件化开发思维、Composition API和状态管理。' },
  { id: 10, title: 'TypeScript', phase: '🌳 开花阶段', phaseColor: '#f59e0b', icon: '🔷', desc: '类型系统、泛型、工具类型', duration: '5天', skills: ['类型注解', '泛型', '接口', '工具类型'], content: '掌握TypeScript类型系统，为大型项目开发打下坚实基础。' },
  { id: 11, title: '项目实战', phase: '🌲 结果阶段', phaseColor: '#ef4444', icon: '🚀', desc: '完整项目从0到1开发', duration: '10天', skills: ['项目架构', '组件设计', '性能优化', '部署上线'], content: '开发一个完整的项目，从需求分析、架构设计到部署上线全流程。' },
  { id: 12, title: 'Node.js 入门', phase: '🌲 结果阶段', phaseColor: '#ef4444', icon: '🟢', desc: '服务端开发、Express框架', duration: '7天', skills: ['Node.js', 'Express', 'RESTful API', '数据库'], content: '从零开始学习服务端开发，掌握Node.js基础和Express框架。' },
  { id: 13, title: '数据库入门', phase: '🌲 结果阶段', phaseColor: '#ef4444', icon: '🗄️', desc: 'MySQL/MongoDB、CRUD操作', duration: '5天', skills: ['SQL基础', 'MongoDB', 'CRUD', '数据建模'], content: '学习关系型和非关系型数据库的基础知识，掌握数据操作。' },
  { id: 14, title: '前后端联调', phase: '🌲 结果阶段', phaseColor: '#ef4444', icon: '🔗', desc: 'API设计、数据交互、跨域', duration: '5天', skills: ['API设计', 'Axios', 'CORS', 'JWT认证'], content: '学习前后端如何通信，API设计规范和常见问题处理。' },
  { id: 15, title: '全栈项目实战', phase: '🏆 大牛阶段', phaseColor: '#8b5cf6', icon: '🏆', desc: '全栈项目开发、部署、运维', duration: '15天', skills: ['全栈架构', 'Docker', 'CI/CD', '云部署'], content: '独立完成一个全栈项目的开发、测试和部署，真正成为前后端大牛！' },
]
