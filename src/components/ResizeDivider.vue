<script setup>
import { ref } from 'vue'

const emit = defineEmits(['resize'])

const isDragging = ref(false)

const handleMouseDown = (e) => {
  isDragging.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (e) => {
  if (!isDragging.value) return

  const windowWidth = window.innerWidth
  const newLeftWidth = (e.clientX / windowWidth) * 100

  // 限制在20%-80%之间
  const clampedWidth = Math.max(20, Math.min(80, newLeftWidth))
  emit('resize', clampedWidth)
}

const handleMouseUp = () => {
  isDragging.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''

  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}
</script>

<template>
  <div
    class="resize-divider"
    :class="{ dragging: isDragging }"
    @mousedown="handleMouseDown"
  >
    <div class="resize-handle"></div>
  </div>
</template>

<style scoped>
.resize-divider {
  position: relative;
  width: 8px;
  background: #e5e7eb;
  cursor: col-resize;
  flex-shrink: 0;
  transition: background 0.2s;
  user-select: none;
}

.resize-divider:hover {
  background: #d1d5db;
}

.resize-divider.dragging {
  background: #4a90e2;
}

.resize-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3px;
  height: 40px;
  background: white;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.resize-divider:hover .resize-handle,
.resize-divider.dragging .resize-handle {
  opacity: 1;
}
</style>
