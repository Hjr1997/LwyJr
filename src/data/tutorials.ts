export interface Tutorial {
  id: string
  title: string
  desc: string
  category: string
  difficulty: string
  icon: string
  steps: TutorialStep[]
}

export interface TutorialStep {
  id: string
  title: string
  content: string
  code?: { html: string; css: string; js: string }
  tip?: string
  propRef?: string
}

import htmlData from './h-tutorials.json'
import cssData from './c-tutorials.json'
import jsData from './j-tutorials.json'
import tsData from './t-tutorials.json'
import reactData from './r-tutorials.json'
import zustandData from './z-tutorials.json'
import dvaData from './d-tutorials.json'
import vueData from './v-tutorials.json'
import piniaData from './p-tutorials.json'
import viteData from './i-tutorials.json'
import fullstackData from './n-tutorials.json'

// Node.js data split into small files to avoid Vite SFC compiler memory limits
const nodeModules = import.meta.glob<{ default: Tutorial[] }>('./node-*.json', { eager: true })

export const tutorials: Tutorial[] = [
  ...htmlData,
  ...cssData,
  ...jsData,
  ...tsData,
  ...reactData,
  ...zustandData,
  ...dvaData,
  ...vueData,
  ...piniaData,
  ...viteData,
  ...fullstackData,
  ...Object.values(nodeModules).flatMap(m => m.default),
] as Tutorial[]
