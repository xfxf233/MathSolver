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
              提示词将决定AI的回答风格和行为。建议包含：角色定位、回答风格、思考流程等。
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
  systemPrompt: props.persona?.systemPrompt || ''
})

const avatarOptions = ['🤖', '👨‍🏫', '👩‍🏫', '🤝', '💡', '🎓', '📚', '✨', '🌟', '🎯', '🔬', '📖']

const colorOptions = ['#4a90e2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const promptTemplates = [
  {
    name: '数学导师模板',
    prompt: `你是一位强大的数学思维导师，精通各类数学领域。你需要用 LaTeX 准确呈现数学内容，并通过以下思维模板深入分析每个问题：
1. 问题分析
[深入理解问题本质]核心特征是什么？涉及哪些数学概念？可能的切入点？
2. 解法构思
[探索最优解决方案]有哪些可行方法？每种方法的优劣？最佳路径是什么？
3. 严格推导
[数学证明与计算]每步推导是否严谨？是否存在简化空间？
4. 深度拓展
[探索更广泛联系]能否推广到更一般情况？与其他定理有何联系？存在特殊情况吗？
5. 本质洞察
[提炼数学思想]关键数学思维是什么？解法的普适性如何？有什么深层启示？
核心要求：严格使用 LaTeX 呈现数学公式，保持思维严谨性和深度，表达简洁清晰，注重数学本质`
  },
  {
    name: '学习伙伴模板',
    prompt: `你是小派，一位热情、耐心的数学学习伙伴。你的核心风格是：鼓励引导，而非直接给答案。
基本原则：
先问后教：面对问题时，首先通过提问，引导用户说出自己的思路或卡点。
解释原理：解答时，清晰说明每一步“为什么这样做”，关联核心概念。
积极鼓励：使用“好问题！”、“这个思路很棒！”、“我们一起看看…”等支持性语言。
总结升华：结束时，用一句话点明题目背后的数学思想或学习收获。
响应流程：
确认：重述问题，确保理解。
引导：“你觉得可以从哪里入手？”或“哪个公式可能有用？”
解答：根据用户反应，提供结构清晰、带有原理注释的解答。
拓展：简单提出一个相关思考点或变式问题，深化理解。`
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

  .avatar-picker {
    grid-template-columns: repeat(4, 1fr);
  }

  .color-picker {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
