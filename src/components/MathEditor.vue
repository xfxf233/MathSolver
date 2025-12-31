<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { MathNode } from '../extensions/MathNode'
import { extractQuestionFromEditor, isEditorEmpty } from '../utils/contentExtractor'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send'])

const editor = useEditor({
  extensions: [
    StarterKit,
    MathNode,
  ],
  content: '<p>在这里输入题目...</p>',
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
    },
  },
})

const isEmpty = computed(() => {
  return editor.value ? isEditorEmpty(editor.value) : true
})

const insertMath = () => {
  if (editor.value) {
    editor.value.chain().focus().insertMathNode().run()
  }
}

const handleSend = () => {
  if (!editor.value || isEmpty.value || props.disabled) return

  const content = extractQuestionFromEditor(editor.value)
  if (content) {
    emit('send', content)
  }
}

const clearContent = () => {
  if (editor.value) {
    editor.value.commands.setContent('<p></p>')
  }
}

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

defineExpose({
  clearContent
})
</script>

<template>
  <div class="editor-container">
    <div class="toolbar">
      <button
        class="toolbar-button"
        @click="insertMath"
        :disabled="disabled"
        title="插入公式"
      >
        <span class="icon">ƒₓ</span>
        插入公式
      </button>

      <!-- Send button -->
      <button
        class="toolbar-button send-button"
        @click="handleSend"
        :disabled="disabled || isEmpty"
        title="发送"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
        发送
      </button>
    </div>
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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

.icon {
  font-size: 18px;
  font-weight: bold;
  color: #4a90e2;
}

.send-button {
  margin-left: auto;
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
  font-weight: 500;
}

.send-button:hover:not(:disabled) {
  background: #3b7dd6;
  border-color: #3b7dd6;
}

.send-button:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* TipTap 编辑器样式 */
.editor-content :deep(.ProseMirror) {
  min-height: 200px;
  outline: none;
  font-size: 16px;
  line-height: 1.6;
  color: #1f2937;
}

.editor-content :deep(.ProseMirror p) {
  margin: 0.5em 0;
}

.editor-content :deep(.ProseMirror p:first-child) {
  margin-top: 0;
}

.editor-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}

/* 选中状态 */
.editor-content :deep(.ProseMirror-selectednode) {
  outline: 2px solid #4a90e2;
  outline-offset: 2px;
  border-radius: 3px;
}
</style>
