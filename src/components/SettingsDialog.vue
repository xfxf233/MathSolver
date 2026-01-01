<script setup>
import { ref } from 'vue'
import { useSettings } from '../composables/useSettings'
import ImageCropper from './ImageCropper.vue'

const emit = defineEmits(['close'])

const { settings, saveSettings } = useSettings()

// 本地表单数据
const formData = ref({
  user: {
    nickname: settings.value.user.nickname,
    backgroundImage: settings.value.user.backgroundImage || '',
    backgroundOpacity: settings.value.user.backgroundOpacity || 0.3,
    messageOpacity: settings.value.user.messageOpacity || 0.95
  },
  api: {
    endpoint: settings.value.api.endpoint,
    apiKey: settings.value.api.apiKey,
    model: settings.value.api.model,
    temperature: settings.value.api.temperature,
    maxTokens: settings.value.api.maxTokens
  }
})

const showAdvanced = ref(false)
const saveMessage = ref('')
const fileInput = ref(null)
const showCropper = ref(false)
const tempImageUrl = ref('')

// 计算裁剪框尺寸（考虑裁剪对话框的各种元素占用空间）
const getCropperSize = () => {
  const isMobile = window.innerWidth < 768

  // 裁剪对话框的固定开销：
  // - 对话框 padding: 24px * 2 = 48px
  // - header 高度: ~60px
  // - controls 高度: ~80px
  // - footer 高度: ~60px
  // - canvas-container padding: 20px * 2 = 40px
  // - 额外边距: ~40px
  // 总计约: 288px
  const dialogOverhead = 288

  // 裁剪对话框的最大高度是 90vh
  const maxDialogHeight = window.innerHeight * 0.9
  // canvas 的最大可用高度
  const maxCanvasHeight = maxDialogHeight - dialogOverhead

  if (isMobile) {
    // 移动端：限制宽度和高度
    return {
      width: Math.min(window.innerWidth - 80, 500), // 减去更多边距，最大500px
      height: Math.min(maxCanvasHeight, 350) // 限制最大高度为350px
    }
  } else {
    // 桌面端：使用合理的固定尺寸
    return {
      width: Math.min(window.innerWidth - 200, 600), // 减去边距，最大600px
      height: Math.min(maxCanvasHeight, 400) // 限制最大高度为400px
    }
  }
}

const cropperSize = ref(getCropperSize())

// 处理图片上传
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  // 验证文件大小 (限制为5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB')
    return
  }

  // 读取文件并显示裁剪器
  const reader = new FileReader()
  reader.onload = (e) => {
    tempImageUrl.value = e.target.result
    // 更新裁剪框尺寸
    cropperSize.value = getCropperSize()
    showCropper.value = true
  }
  reader.onerror = () => {
    alert('图片读取失败，请重试')
  }
  reader.readAsDataURL(file)
}

// 确认裁剪
const handleCropConfirm = (croppedImage) => {
  formData.value.user.backgroundImage = croppedImage
  showCropper.value = false
  tempImageUrl.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 取消裁剪
const handleCropCancel = () => {
  showCropper.value = false
  tempImageUrl.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 清除背景图片
const clearBackgroundImage = () => {
  formData.value.user.backgroundImage = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleSave = () => {
  // 更新配置
  settings.value = { ...formData.value }

  // 保存到localStorage
  const success = saveSettings()

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
</script>

<template>
  <div class="dialog-overlay">
    <div class="dialog-content">
      <div class="dialog-header">
        <h2>设置</h2>
        <button class="close-button" @click="handleClose">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- 图片裁剪器 -->
      <div v-if="showCropper" class="cropper-overlay">
        <div class="cropper-dialog">
          <ImageCropper
            :imageUrl="tempImageUrl"
            :cropWidth="cropperSize.width"
            :cropHeight="cropperSize.height"
            @confirm="handleCropConfirm"
            @cancel="handleCropCancel"
          />
        </div>
      </div>

      <form @submit.prevent="handleSave" class="dialog-form">
        <!-- 用户设置分组 -->
        <div class="settings-section">
          <h3 class="section-title">用户设置</h3>

          <div class="form-group">
            <label for="nickname">昵称</label>
            <input
              id="nickname"
              v-model="formData.user.nickname"
              type="text"
              placeholder="你"
              maxlength="20"
            />
            <span class="form-hint">显示在消息气泡上的名称</span>
          </div>

          <div class="form-group">
            <label for="backgroundImage">对话背景图片</label>

            <!-- 隐藏的文件输入 -->
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              style="display: none"
            />

            <!-- 图片预览或上传按钮 -->
            <div v-if="formData.user.backgroundImage" class="image-preview-container">
              <img :src="formData.user.backgroundImage" alt="背景预览" class="image-preview" />
              <!-- 透明度遮罩层 -->
              <div class="image-preview-overlay" :style="{ opacity: 1 - formData.user.backgroundOpacity }"></div>
              <div class="image-actions">
                <button type="button" @click="triggerFileInput" class="image-action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  更换
                </button>
                <button type="button" @click="clearBackgroundImage" class="image-action-btn delete-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  删除
                </button>
              </div>
            </div>

            <button v-else type="button" @click="triggerFileInput" class="upload-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>选择图片</span>
            </button>

            <span class="form-hint">支持JPG、PNG、GIF等格式，大小不超过5MB</span>
          </div>

          <div class="form-group">
            <label for="backgroundOpacity">背景透明度: {{ (formData.user.backgroundOpacity * 100).toFixed(0) }}%</label>
            <input
              id="backgroundOpacity"
              v-model.number="formData.user.backgroundOpacity"
              type="range"
              min="0"
              max="1"
              step="0.05"
              class="range-input"
            />
            <span class="form-hint">调节背景图片的透明度</span>
          </div>

          <div class="form-group">
            <label for="messageOpacity">消息透明度: {{ (formData.user.messageOpacity * 100).toFixed(0) }}%</label>
            <input
              id="messageOpacity"
              v-model.number="formData.user.messageOpacity"
              type="range"
              min="0.5"
              max="1"
              step="0.05"
              class="range-input"
            />
            <span class="form-hint">调节消息气泡的透明度，可以透过消息看到背景</span>
          </div>
        </div>

        <!-- API 设置分组 -->
        <div class="settings-section">
          <h3 class="section-title">API 设置</h3>

          <div class="form-group">
            <label for="endpoint">API 端点 *</label>
            <input
              id="endpoint"
              v-model="formData.api.endpoint"
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
              v-model="formData.api.apiKey"
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
              v-model="formData.api.model"
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
                v-model.number="formData.api.temperature"
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
                v-model.number="formData.api.maxTokens"
                type="number"
                min="100"
                max="4000"
                step="100"
              />
              <span class="form-hint">限制输出长度，默认2000</span>
            </div>
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

.cropper-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 20px;
}

.cropper-dialog {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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

.settings-section {
  margin-bottom: 32px;
}

.settings-section:last-of-type {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
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

.range-input {
  width: 100%;
  height: 6px;
  padding: 0;
  background: #e5e7eb;
  border: none;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.range-input::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: #4a90e2;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.range-input::-webkit-slider-thumb:hover {
  background: #3b7dd6;
  transform: scale(1.1);
}

.range-input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #4a90e2;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.range-input::-moz-range-thumb:hover {
  background: #3b7dd6;
  transform: scale(1.1);
}

.select-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.select-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.upload-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 16px;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: #f3f4f6;
  border-color: #4a90e2;
  color: #4a90e2;
}

.image-preview-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.image-preview {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
  display: block;
  background: #f3f4f6;
}

.image-preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f9fafb;
  pointer-events: none;
  transition: opacity 0.2s;
}

.image-actions {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.image-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.image-action-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.image-action-btn.delete-btn:hover {
  background: #fee2e2;
  border-color: #fecaca;
  color: #dc2626;
}

.image-action-btn.delete-btn:hover svg {
  stroke: #dc2626;
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
