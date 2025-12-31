<script setup>
import { ref, watch, nextTick } from 'vue'
import { useConversations } from '../composables/useConversations'
import { useAISolver } from '../composables/useAISolver'
import { useApiConfig } from '../composables/useApiConfig'
import MessageBubble from './MessageBubble.vue'
import ConversationList from './ConversationList.vue'

const { config } = useApiConfig()
const {
  conversations,
  activeConversationId,
  activeConversation,
  createConversation,
  deleteConversation,
  clearAllConversations,
  setActiveConversation,
  deleteMessage
} = useConversations()

const { isSolving, error } = useAISolver(config, activeConversationId)

const showConversationList = ref(false)
const messagesContainer = ref(null)

// Auto-scroll to bottom when new messages arrive
watch(() => activeConversation.value?.messages.length, async () => {
  await nextTick()
  scrollToBottom()
}, { flush: 'post' })

// Also watch for content changes (streaming updates)
watch(() => activeConversation.value?.messages[activeConversation.value?.messages.length - 1]?.content, async () => {
  await nextTick()
  scrollToBottom()
}, { flush: 'post' })

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const handleNewConversation = () => {
  const newId = createConversation()
  setActiveConversation(newId)
  showConversationList.value = false
}

const toggleConversationList = () => {
  showConversationList.value = !showConversationList.value
}

const handleSelectConversation = (id) => {
  setActiveConversation(id)
  showConversationList.value = false
}

const handleDeleteConversation = (id) => {
  if (confirm('确定删除此对话？')) {
    deleteConversation(id)
  }
}

const handleClearConversations = () => {
  clearAllConversations()
}

const handleCopyMessage = async (message) => {
  try {
    await navigator.clipboard.writeText(message.content)
    // Simple feedback - could be improved with a toast notification
    alert('已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败')
  }
}

const handleDeleteMessage = (messageId) => {
  if (confirm('确定删除此消息？')) {
    deleteMessage(messageId)
  }
}

const dismissError = () => {
  error.value = null
}
</script>

<template>
  <div class="conversation-panel">
    <!-- Toolbar -->
    <div class="toolbar">
      <button @click="handleNewConversation" class="toolbar-btn new-conversation-btn" title="新对话">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>新对话</span>
      </button>

      <button @click="toggleConversationList" class="toolbar-btn conversations-btn" title="对话列表">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        <span>对话列表</span>
        <span v-if="conversations.length > 0" class="count-badge">{{ conversations.length }}</span>
      </button>
    </div>

    <!-- Messages Area -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="!activeConversation || activeConversation.messages.length === 0"
           class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <p class="empty-title">开始新对话</p>
        <p class="empty-subtitle">输入数学问题并点击发送</p>
      </div>

      <div v-else class="messages-list">
        <MessageBubble
          v-for="message in activeConversation.messages"
          :key="message.id"
          :message="message"
          @copy="handleCopyMessage"
          @delete="handleDeleteMessage"
        />

        <!-- Loading indicator during streaming -->
        <div v-if="isSolving" class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-banner">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span class="error-text">{{ error }}</span>
      <button @click="dismissError" class="error-close">×</button>
    </div>

    <!-- Conversation List Sidebar -->
    <ConversationList
      v-if="showConversationList"
      :conversations="conversations"
      :activeId="activeConversationId"
      @select="handleSelectConversation"
      @delete="handleDeleteConversation"
      @clear="handleClearConversations"
      @close="toggleConversationList"
    />
  </div>
</template>

<style scoped>
.conversation-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.toolbar-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.new-conversation-btn {
  font-weight: 500;
}

.new-conversation-btn:hover {
  background: #4a90e2;
  border-color: #4a90e2;
  color: white;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #4a90e2;
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f9fafb;
  scroll-behavior: smooth;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #6b7280;
}

.empty-subtitle {
  margin: 0;
  font-size: 14px;
  color: #9ca3af;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.typing-indicator {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fee2e2;
  color: #dc2626;
  border-top: 1px solid #fecaca;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.error-banner svg {
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  font-size: 14px;
}

.error-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  font-size: 20px;
  color: #dc2626;
  cursor: pointer;
  transition: background-color 0.2s;
}

.error-close:hover {
  background: #fecaca;
}

/* Scrollbar styling */
.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f9fafb;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .toolbar {
    padding: 10px;
  }

  .toolbar-btn span {
    display: none;
  }

  .toolbar-btn {
    padding: 8px;
  }

  .count-badge {
    position: absolute;
    top: -4px;
    right: -4px;
  }

  .messages-container {
    padding: 12px;
  }
}
</style>
