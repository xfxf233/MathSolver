<script setup>
import { ref, watch } from 'vue'
import { useApiConfig } from '../composables/useApiConfig'

const emit = defineEmits(['close'])

const { config, saveConfig, isConfigValid } = useApiConfig()

// 本地表单数据
const formData = ref({
  endpoint: config.value.endpoint,
  apiKey: config.value.apiKey,
  model: config.value.model,
  temperature: config.value.temperature,
  maxTokens: config.value.maxTokens
})

const showAdvanced = ref(false)
const saveMessage = ref('')

const handleSave = () => {
  // 更新配置
  config.value = { ...formData.value }

  // 保存到localStorage
  const success = saveConfig()

  if (success) {
    saveMessage.value = '保存成功'
    setTimeout(() => {
      emit('close')
    }, 500)
  } else {
    saveMessage.value = '保存失败，请重试'
  }
}

const handleClose = () => {
  emit('close')
}

// 点击遮罩层关闭
const handleOverlayClick = (e) => {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}
</script>

<template>
  <div class="dialog-overlay" @click="handleOverlayClick">
    <div class="dialog-content">
      <div class="dialog-header">
        <h2>API 设置</h2>
        <button class="close-button" @click="handleClose">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSave" class="dialog-form">
        <div class="form-group">
          <label for="endpoint">API 端点 *</label>
          <input
            id="endpoint"
            v-model="formData.endpoint"
            type="url"
            placeholder="https://api.openai.com/v1/chat/completions"
            required
          />
          <span class="form-hint">支持OpenAI格式的API端点</span>
        </div>

        <div class="form-group">
          <label for="apiKey">API 密钥 *</label>
          <input
            id="apiKey"
            v-model="formData.apiKey"
            type="password"
            placeholder="sk-..."
            required
          />
          <span class="form-hint">您的API密钥将安全存储在本地</span>
        </div>

        <div class="form-group">
          <label for="model">模型名称 *</label>
          <input
            id="model"
            v-model="formData.model"
            type="text"
            placeholder="gpt-4o-mini"
            required
          />
          <span class="form-hint">例如: gpt-4o-mini, gpt-4, claude-3-5-sonnet等</span>
        </div>

        <button
          type="button"
          class="advanced-toggle"
          @click="showAdvanced = !showAdvanced"
        >
          {{ showAdvanced ? '隐藏' : '显示' }}高级选项
        </button>

        <div v-if="showAdvanced" class="advanced-options">
          <div class="form-group">
            <label for="temperature">温度 (Temperature)</label>
            <input
              id="temperature"
              v-model.number="formData.temperature"
              type="number"
              min="0"
              max="2"
              step="0.1"
            />
            <span class="form-hint">控制输出的随机性，范围0-2，默认0.7</span>
          </div>

          <div class="form-group">
            <label for="maxTokens">最大Token数</label>
            <input
              id="maxTokens"
              v-model.number="formData.maxTokens"
              type="number"
              min="100"
              max="4000"
              step="100"
            />
            <span class="form-hint">限制输出长度，默认2000</span>
          </div>
        </div>

        <div v-if="saveMessage" class="save-message" :class="{ success: saveMessage.includes('成功') }">
          {{ saveMessage }}
        </div>

        <div class="dialog-actions">
          <button type="button" class="button button-secondary" @click="handleClose">
            取消
          </button>
          <button type="submit" class="button button-primary">
            保存
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
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

.dialog-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.dialog-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
}

.advanced-toggle {
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
  background: transparent;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.advanced-toggle:hover {
  border-color: #9ca3af;
  color: #374151;
}

.advanced-options {
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.save-message {
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  background: #fee2e2;
  color: #991b1b;
}

.save-message.success {
  background: #d1fae5;
  color: #065f46;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.button-secondary {
  background: #f3f4f6;
  color: #374151;
}

.button-secondary:hover {
  background: #e5e7eb;
}

.button-primary {
  background: #4a90e2;
  color: white;
}

.button-primary:hover {
  background: #3b7dd6;
}

.button:active {
  transform: scale(0.98);
}

@media (max-width: 640px) {
  .dialog-content {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
  }
}
</style>
