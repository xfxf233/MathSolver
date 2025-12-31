<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import MainLayout from './components/MainLayout.vue'
import MathEditor from './components/MathEditor.vue'
import ConversationPanel from './components/ConversationPanel.vue'
import ApiSettingsDialog from './components/ApiSettingsDialog.vue'
import { useConversations } from './composables/useConversations'
import { useAISolver } from './composables/useAISolver'
import { useApiConfig } from './composables/useApiConfig'

const showSettings = ref(false)
const editorRef = ref(null)

const { config, isConfigValid } = useApiConfig()
const { activeConversationId, createConversation } = useConversations()
const { isSolving, solve } = useAISolver(config)

// Ensure there's always an active conversation
onMounted(() => {
  if (!activeConversationId.value) {
    createConversation()
  }
})

const handleSend = async (content) => {
  if (!isConfigValid()) {
    alert('请先配置API设置')
    showSettings.value = true
    return
  }

  // Solve with conversation context
  await solve(content)

  // Clear editor after successful send
  if (editorRef.value) {
    editorRef.value.clearContent()
  }
}

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
            <h2 class="panel-title">输入消息</h2>
          </div>
          <div class="panel-content">
            <MathEditor
              ref="editorRef"
              :disabled="isSolving"
              @send="handleSend"
            />
          </div>
        </div>
      </template>

      <template #right>
        <div class="panel-wrapper">
          <div class="panel-header">
            <h2 class="panel-title">对话</h2>
          </div>
          <div class="panel-content">
            <ConversationPanel />
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
