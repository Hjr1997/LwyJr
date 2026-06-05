<template>
  <div ref="container" class="monaco-editor"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue'
import '@/monaco-env'
import * as monaco from 'monaco-editor'

const props = withDefaults(defineProps<{
  modelValue: string
  language?: string
  readOnly?: boolean
}>(), {
  language: 'html',
  readOnly: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const container = ref<HTMLDivElement>()
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null)
let model: monaco.editor.ITextModel | null = null

function getTheme(): string {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'vs-dark' : 'vs'
}

let observer: MutationObserver | null = null

onMounted(() => {
  if (!container.value) return

  observer = new MutationObserver(() => {
    editor.value?.updateOptions({ theme: getTheme() })
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  model = monaco.editor.createModel(props.modelValue, props.language)

  // Use ResizeObserver instead of automaticLayout to avoid scroll-event thrashing
  let resizeRaf = 0
  const resizeObs = new ResizeObserver(() => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf)
    resizeRaf = requestAnimationFrame(() => editor.value?.layout())
  })
  resizeObs.observe(container.value)

  editor.value = monaco.editor.create(container.value, {
    model,
    theme: getTheme(),
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 13,
    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
    lineHeight: 1.65,
    tabSize: 2,
    wordWrap: 'on',
    readOnly: props.readOnly,
    automaticLayout: false,
    renderLineHighlight: 'none',
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6, vertical: 'auto' },
    padding: { top: 12, bottom: 12 },
    lineNumbers: 'on',
    folding: true,
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true },
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    formatOnPaste: true,
    formatOnType: false,
    // Performance: reduce decorations overhead
    renderWhitespace: 'none',
    occurrencesHighlight: 'off',
    codeLens: false,
    stickyScroll: { enabled: false },
  })

  editor.value.onDidChangeModelContent(() => {
    const value = editor.value?.getValue() ?? ''
    emit('update:modelValue', value)
  })

  // Store cleanup refs
  ;(container.value as any).__resizeObs = resizeObs
})

watch(() => props.modelValue, (val) => {
  if (editor.value && model) {
    const current = model.getValue()
    if (val !== current) {
      model.setValue(val)
    }
  }
})

watch(() => props.language, (lang) => {
  if (model) {
    monaco.editor.setModelLanguage(model, lang)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  const ro = container.value && (container.value as any).__resizeObs
  if (ro) { ro.disconnect(); delete (container.value as any).__resizeObs }
  model?.dispose()
  editor.value?.dispose()
})
</script>

<style scoped>
.monaco-editor {
  width: 100%;
  height: 100%;
  min-height: 220px;
}
</style>
