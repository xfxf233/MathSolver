<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  imageUrl: {
    type: String,
    required: true
  },
  cropWidth: {
    type: Number,
    default: 600
  },
  cropHeight: {
    type: Number,
    default: 400
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const canvas = ref(null)
const container = ref(null)
let ctx = null
let img = null

// 图片状态
const imageState = ref({
  x: 0,
  y: 0,
  scale: 1,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0
})

// 裁剪框尺寸（使用props传入的尺寸）
const cropBox = {
  width: props.cropWidth,
  height: props.cropHeight
}

// 加载图片
onMounted(() => {
  if (!canvas.value) return

  ctx = canvas.value.getContext('2d')
  canvas.value.width = cropBox.width
  canvas.value.height = cropBox.height

  img = new Image()
  img.onload = () => {
    // 初始化图片位置和缩放，使其适应裁剪框
    const scaleX = cropBox.width / img.width
    const scaleY = cropBox.height / img.height
    imageState.value.scale = Math.max(scaleX, scaleY)

    // 居中显示
    imageState.value.x = (cropBox.width - img.width * imageState.value.scale) / 2
    imageState.value.y = (cropBox.height - img.height * imageState.value.scale) / 2

    draw()
  }
  img.src = props.imageUrl
})

// 绘制图片
const draw = () => {
  if (!ctx || !img) return

  // 清空画布
  ctx.clearRect(0, 0, cropBox.width, cropBox.height)

  // 绘制图片
  ctx.drawImage(
    img,
    imageState.value.x,
    imageState.value.y,
    img.width * imageState.value.scale,
    img.height * imageState.value.scale
  )
}

// 鼠标按下
const handleMouseDown = (e) => {
  imageState.value.isDragging = true
  imageState.value.dragStartX = e.clientX - imageState.value.x
  imageState.value.dragStartY = e.clientY - imageState.value.y
}

// 鼠标移动
const handleMouseMove = (e) => {
  if (!imageState.value.isDragging) return

  imageState.value.x = e.clientX - imageState.value.dragStartX
  imageState.value.y = e.clientY - imageState.value.dragStartY

  draw()
}

// 鼠标松开
const handleMouseUp = () => {
  imageState.value.isDragging = false
}

// 鼠标滚轮缩放
const handleWheel = (e) => {
  e.preventDefault()

  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newScale = Math.max(0.1, Math.min(5, imageState.value.scale + delta))

  // 以鼠标位置为中心缩放
  const rect = canvas.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  const scaleRatio = newScale / imageState.value.scale
  imageState.value.x = mouseX - (mouseX - imageState.value.x) * scaleRatio
  imageState.value.y = mouseY - (mouseY - imageState.value.y) * scaleRatio
  imageState.value.scale = newScale

  draw()
}

// 缩放滑块
const handleScaleChange = (e) => {
  const newScale = parseFloat(e.target.value)

  // 以中心点缩放
  const centerX = cropBox.width / 2
  const centerY = cropBox.height / 2

  const scaleRatio = newScale / imageState.value.scale
  imageState.value.x = centerX - (centerX - imageState.value.x) * scaleRatio
  imageState.value.y = centerY - (centerY - imageState.value.y) * scaleRatio
  imageState.value.scale = newScale

  draw()
}

// 重置
const handleReset = () => {
  if (!img) return

  const scaleX = cropBox.width / img.width
  const scaleY = cropBox.height / img.height
  imageState.value.scale = Math.max(scaleX, scaleY)
  imageState.value.x = (cropBox.width - img.width * imageState.value.scale) / 2
  imageState.value.y = (cropBox.height - img.height * imageState.value.scale) / 2

  draw()
}

// 确认裁剪
const handleConfirm = () => {
  if (!canvas.value) return

  // 导出裁剪后的图片为base64
  const croppedImage = canvas.value.toDataURL('image/jpeg', 0.9)
  emit('confirm', croppedImage)
}

// 取消
const handleCancel = () => {
  emit('cancel')
}

// 添加全局事件监听
onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div class="image-cropper">
    <div class="cropper-header">
      <h3>调整背景图片</h3>
      <p class="hint">拖拽图片调整位置，滚动鼠标滚轮或使用滑块缩放</p>
    </div>

    <div class="cropper-body">
      <div class="canvas-container" ref="container">
        <canvas
          ref="canvas"
          @mousedown="handleMouseDown"
          @wheel="handleWheel"
          class="cropper-canvas"
        ></canvas>
      </div>

      <div class="controls">
        <div class="control-group">
          <label>缩放: {{ (imageState.scale * 100).toFixed(0) }}%</label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            :value="imageState.scale"
            @input="handleScaleChange"
            class="scale-slider"
          />
        </div>

        <button @click="handleReset" class="reset-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          重置
        </button>
      </div>
    </div>

    <div class="cropper-footer">
      <button @click="handleCancel" class="btn btn-secondary">取消</button>
      <button @click="handleConfirm" class="btn btn-primary">确认</button>
    </div>
  </div>
</template>

<style scoped>
.image-cropper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cropper-header {
  text-align: center;
}

.cropper-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.cropper-header .hint {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.cropper-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 20px;
  overflow: hidden;
}

.cropper-canvas {
  border: 2px solid #4a90e2;
  border-radius: 4px;
  cursor: move;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: white;
}

.controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.control-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.scale-slider {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border: none;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.scale-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: #4a90e2;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.scale-slider::-webkit-slider-thumb:hover {
  background: #3b7dd6;
  transform: scale(1.1);
}

.scale-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #4a90e2;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.scale-slider::-moz-range-thumb:hover {
  background: #3b7dd6;
  transform: scale(1.1);
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.reset-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.cropper-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
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

.btn:active {
  transform: scale(0.98);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .canvas-container {
    padding: 12px;
  }

  .cropper-canvas {
    max-width: 100%;
    height: auto;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .reset-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
