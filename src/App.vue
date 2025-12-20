<script setup>
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import MainLayout from './components/MainLayout.vue'
import MathEditor from './components/MathEditor.vue'
import AISolutionPanel from './components/AISolutionPanel.vue'
import ApiSettingsDialog from './components/ApiSettingsDialog.vue'

const showSettings = ref(false)
const editorRef = ref(null)

const openSettings = () => {
  showSettings.value = true
}

const closeSettings = () => {
  showSettings.value = false
}
</script>

<template>
  <div class="app">
    <AppHeader @openSettings="openSettings" />

    <MainLayout>
      <template #left>
        <div class="panel-wrapper">
          <div class="panel-header">
            <h2 class="panel-title">题目输入</h2>
          </div>
          <div class="panel-content">
            <MathEditor ref="editorRef" />
          </div>
        </div>
      </template>

      <template #right>
        <div class="panel-wrapper">
          <div class="panel-header">
            <h2 class="panel-title">AI解答</h2>
          </div>
          <div class="panel-content">
            <AISolutionPanel :editorRef="editorRef" />
          </div>
        </div>
      </template>
    </MainLayout>

    <ApiSettingsDialog
      v-if="showSettings"
      @close="closeSettings"
    />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.panel-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

.panel-header {
  margin-bottom: 12px;
}

.panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.panel-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

@media (max-width: 768px) {
  .panel-wrapper {
    padding: 12px;
  }

  .panel-title {
    font-size: 14px;
  }
}
</style>
