<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ResizeDivider from './ResizeDivider.vue'

const isMobile = ref(false)
const leftWidth = ref(50) // 默认左侧占50%（桌面端）
const topHeight = ref(60) // 默认顶部占60%（移动端）

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const handleResize = (newWidth) => {
  leftWidth.value = newWidth
  // 保存到localStorage
  try {
    localStorage.setItem('mathsolver_layout_width', newWidth.toString())
  } catch (error) {
    console.error('保存布局宽度失败:', error)
  }
}

const handleMobileResize = (newHeight) => {
  topHeight.value = newHeight
  // 保存到localStorage
  try {
    localStorage.setItem('mathsolver_mobile_height', newHeight.toString())
  } catch (error) {
    console.error('保存移动端布局高度失败:', error)
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // 从localStorage加载保存的宽度
  try {
    const saved = localStorage.getItem('mathsolver_layout_width')
    if (saved) {
      leftWidth.value = parseFloat(saved)
    }
  } catch (error) {
    console.error('加载布局宽度失败:', error)
  }

  // 从localStorage加载保存的移动端高度
  try {
    const savedHeight = localStorage.getItem('mathsolver_mobile_height')
    if (savedHeight) {
      topHeight.value = parseFloat(savedHeight)
    }
  } catch (error) {
    console.error('加载移动端布局高度失败:', error)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <div class="main-layout" :class="{ 'is-mobile': isMobile }">
    <!-- 桌面端布局 -->
    <div v-if="!isMobile" class="desktop-layout">
      <div class="left-panel" :style="{ width: leftWidth + '%' }">
        <slot name="left"></slot>
      </div>

      <ResizeDivider direction="horizontal" @resize="handleResize" />

      <div class="right-panel" :style="{ width: (100 - leftWidth) + '%' }">
        <slot name="right"></slot>
      </div>
    </div>

    <!-- 移动端布局 -->
    <div v-else class="mobile-layout">
      <div class="top-panel" :style="{ height: topHeight + '%' }">
        <slot name="right"></slot>
      </div>

      <ResizeDivider direction="vertical" @resize="handleMobileResize" />

      <div class="bottom-panel" :style="{ height: (100 - topHeight) + '%' }">
        <slot name="left"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  flex: 1;
  overflow: hidden;
}

/* 桌面端布局 */
.desktop-layout {
  display: flex;
  height: 100%;
  gap: 0;
}

.left-panel,
.right-panel {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.left-panel {
  min-width: 20%;
  max-width: 80%;
}

.right-panel {
  min-width: 20%;
  max-width: 80%;
}

/* 移动端布局 */
.mobile-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.top-panel {
  min-height: 20%;
  max-height: 80%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.bottom-panel {
  min-height: 20%;
  max-height: 80%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .desktop-layout {
    display: none;
  }
}

@media (min-width: 769px) {
  .mobile-layout {
    display: none;
  }
}
</style>
