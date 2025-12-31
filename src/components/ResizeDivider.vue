<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  direction: {
    type: String,
    default: 'horizontal', // 'horizontal' 或 'vertical'
    validator: (value) => ['horizontal', 'vertical'].includes(value)
  }
})

const emit = defineEmits(['resize'])

const isDragging = ref(false)

const isHorizontal = computed(() => props.direction === 'horizontal')
const cursorStyle = computed(() => isHorizontal.value ? 'col-resize' : 'row-resize')

const handleMouseDown = (e) => {
  isDragging.value = true
  document.body.style.cursor = cursorStyle.value
  document.body.style.userSelect = 'none'

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (e) => {
  if (!isDragging.value) return

  if (isHorizontal.value) {
    const windowWidth = window.innerWidth
    const newLeftWidth = (e.clientX / windowWidth) * 100
    // 限制在20%-80%之间
    const clampedWidth = Math.max(20, Math.min(80, newLeftWidth))
    emit('resize', clampedWidth)
  } else {
    const windowHeight = window.innerHeight
    const newTopHeight = (e.clientY / windowHeight) * 100
    // 限制在20%-80%之间
    const clampedHeight = Math.max(20, Math.min(80, newTopHeight))
    emit('resize', clampedHeight)
  }
}

const handleMouseUp = () => {
  isDragging.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''

  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// 触摸事件处理
const handleTouchStart = (e) => {
  isDragging.value = true
  document.body.style.userSelect = 'none'

  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
}

const handleTouchMove = (e) => {
  if (!isDragging.value) return

  e.preventDefault() // 防止页面滚动

  const touch = e.touches[0]

  if (isHorizontal.value) {
    const windowWidth = window.innerWidth
    const newLeftWidth = (touch.clientX / windowWidth) * 100
    const clampedWidth = Math.max(20, Math.min(80, newLeftWidth))
    emit('resize', clampedWidth)
  } else {
    const windowHeight = window.innerHeight
    const newTopHeight = (touch.clientY / windowHeight) * 100
    const clampedHeight = Math.max(20, Math.min(80, newTopHeight))
    emit('resize', clampedHeight)
  }
}

const handleTouchEnd = () => {
  isDragging.value = false
  document.body.style.userSelect = ''

  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
}
</script>

<template>
  <div
    class="resize-divider"
    :class="[
      { dragging: isDragging },
      direction
    ]"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
  >
    <div class="resize-handle"></div>
  </div>
</template>

<style scoped>
.resize-divider {
  position: relative;
  background: #e5e7eb;
  flex-shrink: 0;
  transition: background 0.2s;
  user-select: none;
  touch-action: none; /* 防止触摸时的默认行为 */
}

/* 水平方向（左右分隔） */
.resize-divider.horizontal {
  width: 8px;
  cursor: col-resize;
}

/* 垂直方向（上下分隔） */
.resize-divider.vertical {
  height: 8px;
  cursor: row-resize;
}

.resize-divider:hover {
  background: #d1d5db;
}

.resize-divider.dragging {
  background: #4a90e2;
}

.resize-handle {
  position: absolute;
  background: white;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

/* 水平方向的手柄 */
.resize-divider.horizontal .resize-handle {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3px;
  height: 40px;
}

/* 垂直方向的手柄 */
.resize-divider.vertical .resize-handle {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 3px;
}

.resize-divider:hover .resize-handle,
.resize-divider.dragging .resize-handle {
  opacity: 1;
}

/* 移动端触摸优化 */
@media (max-width: 768px) {
  .resize-divider.vertical {
    height: 12px; /* 移动端增加触摸区域 */
  }

  .resize-divider.vertical .resize-handle {
    width: 60px; /* 移动端增大手柄尺寸 */
    height: 4px;
    opacity: 0.6; /* 移动端默认显示手柄 */
  }

  .resize-divider.vertical:active .resize-handle {
    opacity: 1;
  }
}
</style>
