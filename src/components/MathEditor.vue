<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { MathNode } from '../extensions/MathNode'

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

const insertMath = () => {
  if (editor.value) {
    editor.value.chain().focus().insertMathNode().run()
  }
}

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

defineExpose({
  editor,
})
</script>

<template>
  <div class="editor-container">
    <div class="toolbar">
      <button
        class="toolbar-button"
        @click="insertMath"
        title="插入公式"
      >
        <span class="icon">ƒₓ</span>
        插入公式
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

.toolbar-button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.toolbar-button:active {
  transform: scale(0.98);
}

.icon {
  font-size: 18px;
  font-weight: bold;
  color: #4a90e2;
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
