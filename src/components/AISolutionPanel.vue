<script setup>
import { ref, computed } from 'vue'
import { useApiConfig } from '../composables/useApiConfig'
import { useAISolver } from '../composables/useAISolver'
import { useHistory } from '../composables/useHistory'
import { extractQuestionFromEditor, isEditorEmpty } from '../utils/contentExtractor'
import SolutionDisplay from './SolutionDisplay.vue'
import HistoryPanel from './HistoryPanel.vue'

const props = defineProps({
  editorRef: {
    type: Object,
    default: null
  }
})

const { config, isConfigValid } = useApiConfig()
const { isSolving, currentAnswer, error, solve, clear } = useAISolver(config)
const { history, addHistory, deleteHistory, clearHistory } = useHistory()

const showHistory = ref(false)
const lastQuestion = ref('')

// 求解按钮点击
const handleSolve = async () => {
  if (!props.editorRef) {
    alert('编辑器未初始化')
    return
  }

  if (!isConfigValid()) {
    alert('请先配置API设置')
    return
  }

  const editor = props.editorRef.editor
  if (isEditorEmpty(editor)) {
    alert('请先输入题目')
    return
  }

  // 提取题目内容
  const question = extractQuestionFromEditor(editor)
  lastQuestion.value = question

  // 清空之前的解答
  clear()

  // 调用AI求解
  const answer = await solve(question)

  // 保存到历史记录
  if (answer) {
    addHistory(question, answer, config.value.model)
  }
}

// 重新生成
const handleRegenerate = async () => {
  if (!lastQuestion.value) {
    alert('没有可重新生成的题目')
    return
  }

  if (!isConfigValid()) {
    alert('请先配置API设置')
    return
  }

  // 清空之前的解答
  clear()

  // 重新求解
  const answer = await solve(lastQuestion.value)

  // 保存到历史记录
  if (answer) {
    addHistory(lastQuestion.value, answer, config.value.model)
  }
}

// 复制解答
const handleCopy = async () => {
  if (!currentAnswer.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(currentAnswer.value)
    alert('已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制')
  }
}

// 切换历史记录面板
const toggleHistory = () => {
  showHistory.value = !showHistory.value
}

// 选择历史记录
const handleSelectHistory = (item) => {
  lastQuestion.value = item.question
  clear()
  currentAnswer.value = item.answer
  showHistory.value = false
}

// 删除历史记录
const handleDeleteHistory = (id) => {
  deleteHistory(id)
}

// 清空历史记录
const handleClearHistory = () => {
  clearHistory()
}

// 按钮禁用状态
const isSolveDisabled = computed(() => {
  return isSolving.value || !isConfigValid()
})

const isRegenerateDisabled = computed(() => {
  return isSolving.value || !lastQuestion.value || !isConfigValid()
})

const isCopyDisabled = computed(() => {
  return !currentAnswer.value
})
</script>

<template>
  <div class="ai-solution-panel">
    <div class="toolbar">
      <button
        class="toolbar-button primary"
        @click="handleSolve"
        :disabled="isSolveDisabled"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        {{ isSolving ? '求解中...' : '求解' }}
      </button>

      <button
        class="toolbar-button"
        @click="handleRegenerate"
        :disabled="isRegenerateDisabled"
        title="重新生成"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
      </button>

      <button
        class="toolbar-button"
        @click="handleCopy"
        :disabled="isCopyDisabled"
        title="复制解答"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>

      <button
        class="toolbar-button"
        @click="toggleHistory"
        title="历史记录"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span class="history-count" v-if="history.length > 0">{{ history.length }}</span>
      </button>
    </div>

    <SolutionDisplay
      :content="currentAnswer"
      :isLoading="isSolving"
      :error="error"
    />

    <HistoryPanel
      v-if="showHistory"
      :history="history"
      @select="handleSelectHistory"
      @delete="handleDeleteHistory"
      @clear="handleClearHistory"
      @close="toggleHistory"
    />
  </div>
</template>

<style scoped>
.ai-solution-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.toolbar-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s;
  position: relative;
}

.toolbar-button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.toolbar-button:active:not(:disabled) {
  transform: scale(0.98);
}

.toolbar-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-button.primary {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.toolbar-button.primary:hover:not(:disabled) {
  background: #3b7dd6;
  border-color: #3b7dd6;
}

.toolbar-button svg {
  flex-shrink: 0;
}

.history-count {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .toolbar {
    flex-wrap: wrap;
  }

  .toolbar-button {
    flex: 1;
    min-width: calc(50% - 4px);
  }

  .toolbar-button.primary {
    flex: 1 1 100%;
  }
}
</style>
