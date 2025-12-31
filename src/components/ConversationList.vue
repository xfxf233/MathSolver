<script setup>
import { computed } from 'vue'

const props = defineProps({
  conversations: {
    type: Array,
    default: () => []
  },
  activeId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['select', 'delete', 'clear', 'close'])

// 格式化时间戳
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }

  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }

  // 小于1天
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }

  // 小于7天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  }

  // 显示具体日期
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 按更新时间排序（最新的在前）
const sortedConversations = computed(() => {
  return [...props.conversations].sort((a, b) => b.updatedAt - a.updatedAt)
})

const handleSelect = (id) => {
  emit('select', id)
}

const handleDelete = (id, event) => {
  event.stopPropagation()
  emit('delete', id)
}

const handleClear = () => {
  if (confirm('确定要清空所有对话吗？')) {
    emit('clear')
  }
}
</script>

<template>
  <div class="conversation-list">
    <div class="list-header">
      <h3>对话列表</h3>
      <button class="close-button" @click="$emit('close')" title="关闭">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div v-if="conversations.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <p>暂无对话</p>
    </div>

    <div v-else class="list-content">
      <div class="list-actions">
        <button class="clear-button" @click="handleClear">
          清空所有对话
        </button>
      </div>

      <div class="conversation-items">
        <div
          v-for="conv in sortedConversations"
          :key="conv.id"
          class="conversation-item"
          :class="{ active: conv.id === activeId }"
          @click="handleSelect(conv.id)"
        >
          <div class="item-content">
            <div class="item-title">{{ conv.title }}</div>
            <div class="item-meta">
              <span class="item-time">{{ formatTime(conv.updatedAt) }}</span>
              <span class="item-count">{{ conv.messages.length }} 条消息</span>
            </div>
          </div>
          <button
            class="delete-button"
            @click="handleDelete(conv.id, $event)"
            title="删除"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.conversation-list {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 320px;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 200;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.list-header h3 {
  margin: 0;
  font-size: 18px;
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

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-actions {
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.clear-button {
  width: 100%;
  padding: 8px;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-button:hover {
  background: #fee2e2;
  border-color: #fecaca;
  color: #dc2626;
}

.conversation-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  margin-bottom: 8px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.conversation-item:hover {
  background: #f3f4f6;
}

.conversation-item.active {
  background: #eff6ff;
  border-color: #4a90e2;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.conversation-item.active .item-title {
  color: #4a90e2;
  font-weight: 600;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.item-count {
  padding: 2px 6px;
  background: #e5e7eb;
  border-radius: 3px;
  font-size: 11px;
}

.conversation-item.active .item-count {
  background: #dbeafe;
  color: #4a90e2;
}

.delete-button {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.2s;
}

.delete-button:hover {
  background: #fee2e2;
  color: #dc2626;
}

@media (max-width: 768px) {
  .conversation-list {
    width: 100%;
  }
}
</style>
