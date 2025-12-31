<script setup>
import { computed, watch, nextTick, ref } from 'vue'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

const { render } = useMarkdownRenderer()
const contentRef = ref(null)

const renderedContent = computed(() => {
  return props.content ? render(props.content) : ''
})

// 自动滚动到底部
watch(() => props.content, async () => {
  await nextTick()
  if (contentRef.value) {
    contentRef.value.scrollTop = contentRef.value.scrollHeight
  }
})
</script>

<template>
  <div class="solution-display" ref="contentRef">
    <div v-if="isLoading && !content" class="loading">
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p>AI正在思考...</p>
    </div>

    <div v-else-if="error" class="error">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>{{ error }}</p>
    </div>

    <div v-else-if="content" class="content markdown-content" v-html="renderedContent"></div>

    <div v-else class="empty">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <p>输入题目后点击"求解"按钮</p>
      <p class="sub-text">AI将为你详细解答数学问题</p>
    </div>
  </div>
</template>

<style scoped>
.solution-display {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: white;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.typing-indicator {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #4a90e2;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #dc2626;
}

.error svg {
  margin-bottom: 12px;
}

.error p {
  margin: 0;
  font-size: 14px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.empty svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty p {
  margin: 4px 0;
  font-size: 16px;
}

.empty .sub-text {
  font-size: 14px;
  color: #d1d5db;
}

.content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Markdown内容样式 */
.markdown-content {
  line-height: 1.8;
  color: #1f2937;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  color: #111827;
}

.markdown-content :deep(h1) {
  font-size: 1.875em;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.markdown-content :deep(h2) {
  font-size: 1.5em;
}

.markdown-content :deep(h3) {
  font-size: 1.25em;
}

.markdown-content :deep(p) {
  margin: 1em 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}

.markdown-content :deep(li) {
  margin: 0.5em 0;
}

.markdown-content :deep(code) {
  background: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', Consolas, Monaco, monospace;
  font-size: 0.9em;
  color: #e11d48;
}

.markdown-content :deep(pre) {
  background: #1f2937;
  color: #f9fafb;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1.5em 0;
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: 0.875em;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #4a90e2;
  padding-left: 1em;
  margin: 1.5em 0;
  color: #6b7280;
  font-style: italic;
}

.markdown-content :deep(a) {
  color: #4a90e2;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5em 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 0.75em;
  text-align: left;
}

.markdown-content :deep(th) {
  background: #f9fafb;
  font-weight: 600;
}

/* KaTeX公式样式 */
.markdown-content :deep(.katex-display) {
  margin: 1.5em 0;
  overflow-x: auto;
  overflow-y: hidden;
}

/* 隐藏紧跟在section标签后面的br标签，避免行间公式下方出现多余空行 */
.markdown-content :deep(section + br) {
  display: none;
}

.markdown-content :deep(.katex) {
  font-size: 1.1em;
}
</style>
