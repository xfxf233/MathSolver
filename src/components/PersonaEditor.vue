<template>
  <div class="editor-overlay" @click.self="$emit('cancel')">
    <div class="editor-dialog">
      <div class="editor-header">
        <h3>{{ isEditing ? '编辑AI形象' : '创建AI形象' }}</h3>
        <button class="close-btn" @click="$emit('cancel')" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSave" class="editor-form">
        <!-- 基本信息 -->
        <div class="form-section">
          <h4>基本信息</h4>

          <div class="form-group">
            <label for="name">形象名称 *</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="例如: 数学专家"
              required
              maxlength="20"
            />
          </div>

          <div class="form-group">
            <label for="nickname">AI昵称 *</label>
            <input
              id="nickname"
              v-model="formData.nickname"
              type="text"
              placeholder="例如: AI助手"
              required
              maxlength="20"
            />
            <span class="form-hint">显示在消息气泡上的名称</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>头像</label>
              <div class="avatar-picker">
                <div
                  v-for="emoji in avatarOptions"
                  :key="emoji"
                  class="avatar-option"
                  :class="{ selected: formData.avatar === emoji }"
                  @click="formData.avatar = emoji"
                >
                  {{ emoji }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>主题颜色</label>
              <div class="color-picker">
                <div
                  v-for="color in colorOptions"
                  :key="color"
                  class="color-option"
                  :class="{ selected: formData.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="formData.color = color"
                >
                  <svg v-if="formData.color === color" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 对话风格 -->
        <div class="form-section">
          <h4>对话风格</h4>

          <div class="tone-selector">
            <div
              v-for="tone in toneOptions"
              :key="tone.value"
              class="tone-option"
              :class="{ selected: formData.tone === tone.value }"
              @click="formData.tone = tone.value"
            >
              <div class="tone-icon">{{ tone.icon }}</div>
              <div class="tone-label">{{ tone.label }}</div>
              <div class="tone-desc">{{ tone.description }}</div>
            </div>
          </div>
        </div>

        <!-- 系统提示词 -->
        <div class="form-section">
          <h4>系统提示词</h4>

          <div class="form-group">
            <label for="systemPrompt">自定义提示词 *</label>
            <textarea
              id="systemPrompt"
              v-model="formData.systemPrompt"
              rows="8"
              placeholder="输入系统提示词，定义AI的行为和回答风格..."
              required
            ></textarea>
            <span class="form-hint">
              提示词将决定AI的回答风格和行为。建议包含：角色定位、回答格式要求、LaTeX语法说明等。
            </span>
          </div>

          <!-- 模板按钮 -->
          <div class="template-buttons">
            <button
              type="button"
              v-for="template in promptTemplates"
              :key="template.name"
              class="template-btn"
              @click="applyTemplate(template)"
            >
              {{ template.name }}
            </button>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="editor-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
            取消
          </button>
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? '保存修改' : '创建形象' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettings } from '../composables/useSettings'

const props = defineProps({
  persona: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'cancel'])

const { createCustomPersona, updateCustomPersona } = useSettings()

const isEditing = computed(() => !!props.persona)

const formData = ref({
  name: props.persona?.name || '',
  nickname: props.persona?.nickname || '',
  avatar: props.persona?.avatar || '🤖',
  color: props.persona?.color || '#4a90e2',
  tone: props.persona?.tone || 'formal',
  systemPrompt: props.persona?.systemPrompt || ''
})

const avatarOptions = ['🤖', '👨‍🏫', '👩‍🏫', '🤝', '💡', '🎓', '📚', '✨', '🌟', '🎯', '🔬', '📖']

const colorOptions = ['#4a90e2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const toneOptions = [
  { value: 'formal', label: '正式专业', icon: '👔', description: '严谨、专业的教学风格' },
  { value: 'casual', label: '轻松随和', icon: '😊', description: '友好、轻松的交流方式' },
  { value: 'encouraging', label: '鼓励支持', icon: '💪', description: '积极、鼓励的引导风格' }
]

const promptTemplates = [
  {
    name: '数学导师模板',
    prompt: '你是一个专业的数学导师。请用Markdown格式回答，数学公式使用LaTeX语法，行内公式用$...$，块级公式用$$...$$。请分步骤详细解答，确保逻辑清晰。在多轮对话中，请记住之前的上下文。采用正式、专业的教学风格，注重培养学生的数学思维。'
  },
  {
    name: '学习伙伴模板',
    prompt: '你是一个友好的学习伙伴。请用Markdown格式回答，数学公式使用LaTeX语法，行内公式用$...$，块级公式用$$...$$。用轻松、鼓励的语气解答问题，让学习变得有趣。在多轮对话中，请记住之前的上下文。可以使用一些生动的比喻和例子帮助理解。'
  }
]

const applyTemplate = (template) => {
  formData.value.systemPrompt = template.prompt
}

const handleSave = () => {
  if (isEditing.value) {
    updateCustomPersona(props.persona.id, formData.value)
  } else {
    createCustomPersona(formData.value)
  }
  emit('save', formData.value)
}
</script>

<style scoped>
.editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.editor-dialog {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.editor-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  padding: 4px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.editor-form {
  padding: 24px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4a90e2;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.avatar-picker {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.avatar-option {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-option:hover {
  border-color: #4a90e2;
  background: #f9fafb;
}

.avatar-option.selected {
  border-color: #4a90e2;
  background: #eff6ff;
}

.color-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #1f2937;
}

.tone-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.tone-option {
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.tone-option:hover {
  border-color: #4a90e2;
  background: #f9fafb;
}

.tone-option.selected {
  border-color: #4a90e2;
  background: #eff6ff;
}

.tone-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.tone-label {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.tone-desc {
  font-size: 11px;
  color: #6b7280;
}

.template-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.template-btn {
  padding: 6px 12px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.template-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #4a90e2;
  color: white;
}

.btn-primary:hover {
  background: #3b7dd6;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .editor-dialog {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .tone-selector {
    grid-template-columns: 1fr;
  }

  .avatar-picker {
    grid-template-columns: repeat(4, 1fr);
  }

  .color-picker {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
