<template>
  <div class="message-bubble" :class="{ 'user': isUser, 'assistant': !isUser }">
    <div class="message-header">
      <span class="role-label">{{ isUser ? '你' : 'AI' }}</span>
      <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
    </div>

    <div class="message-content">
      <!-- User message: rendered LaTeX -->
      <div v-if="isUser" class="user-content markdown-content" v-html="renderedContent"></div>

      <!-- Assistant message: rendered Markdown -->
      <div v-else class="assistant-content markdown-content" v-html="renderedContent"></div>
    </div>

    <div class="message-actions">
      <button @click="$emit('copy', message)" title="复制" class="action-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
      <button @click="$emit('delete', message.id)" title="删除" class="action-btn delete-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

defineEmits(['copy', 'delete'])

const { render } = useMarkdownRenderer()

const isUser = computed(() => props.message.role === 'user')

const renderedContent = computed(() => {
  return render(props.message.content)
})

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.message-bubble {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-bubble.user {
  align-self: flex-end;
  background: #4a90e2;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble.assistant {
  align-self: flex-start;
  background: white;
  border: 1px solid #e5e7eb;
  color: #1f2937;
  border-bottom-left-radius: 4px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  gap: 12px;
}

.message-bubble.user .message-header {
  opacity: 0.9;
}

.message-bubble.assistant .message-header {
  opacity: 0.7;
}

.role-label {
  font-weight: 600;
}

.timestamp {
  font-size: 11px;
}

.message-content {
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.user-content {
  color: white;
}

/* User message specific styles for better readability on blue background */
.message-bubble.user .markdown-content :deep(code) {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.message-bubble.user .markdown-content :deep(.katex) {
  color: white;
}

.message-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-bubble:hover .message-actions {
  opacity: 1;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.message-bubble.user .action-btn {
  color: white;
}

.message-bubble.user .action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.message-bubble.assistant .action-btn {
  color: #6b7280;
}

.message-bubble.assistant .action-btn:hover {
  background: #f3f4f6;
}

.delete-btn:hover {
  color: #dc2626 !important;
}

/* Markdown content styles (reused from SolutionDisplay) */
.markdown-content {
  font-size: 14px;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-content :deep(h1) { font-size: 1.5em; }
.markdown-content :deep(h2) { font-size: 1.3em; }
.markdown-content :deep(h3) { font-size: 1.1em; }

.markdown-content :deep(p) {
  margin: 0.8em 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.8em 0;
  padding-left: 2em;
}

.markdown-content :deep(li) {
  margin: 0.4em 0;
}

.markdown-content :deep(code) {
  background: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background: #1f2937;
  color: #f9fafb;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1em 0;
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1em;
  margin: 1em 0;
  color: #6b7280;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 0.5em;
  text-align: left;
}

.markdown-content :deep(th) {
  background: #f9fafb;
  font-weight: 600;
}

.markdown-content :deep(a) {
  color: #4a90e2;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

/* KaTeX math styles */
.markdown-content :deep(.katex) {
  font-size: 1.1em;
}

.markdown-content :deep(.katex-display) {
  margin: 1em 0;
  overflow-x: auto;
  overflow-y: hidden;
}

/* 隐藏紧跟在section标签后面的br标签，避免行间公式下方出现多余空行 */
.markdown-content :deep(section + br) {
  display: none;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .message-bubble {
    max-width: 90%;
    padding: 10px 12px;
  }

  .message-actions {
    opacity: 1; /* Always show on mobile */
  }
}
</style>
