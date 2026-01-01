<template>
  <div class="switcher-overlay" @click.self="$emit('cancel')">
    <div class="switcher-dialog">
      <div class="switcher-header">
        <h3>切换AI形象</h3>
      </div>

      <div class="switcher-content">
        <p class="switcher-message">
          切换AI形象将改变对话风格，是否应用到当前对话？
        </p>

        <div class="persona-comparison">
          <div class="persona-item">
            <div class="persona-label">当前形象</div>
            <div class="persona-card">
              <div class="persona-avatar" :style="{ backgroundColor: oldPersona?.color }">
                {{ oldPersona?.avatar }}
              </div>
              <div class="persona-info">
                <div class="persona-name">{{ oldPersona?.name }}</div>
                <div class="persona-nickname">{{ oldPersona?.nickname }}</div>
              </div>
            </div>
          </div>

          <div class="arrow-icon">→</div>

          <div class="persona-item">
            <div class="persona-label">新形象</div>
            <div class="persona-card">
              <div class="persona-avatar" :style="{ backgroundColor: newPersona?.color }">
                {{ newPersona?.avatar }}
              </div>
              <div class="persona-info">
                <div class="persona-name">{{ newPersona?.name }}</div>
                <div class="persona-nickname">{{ newPersona?.nickname }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="switcher-actions">
        <button class="btn btn-secondary" @click="$emit('cancel')">
          取消
        </button>
        <button class="btn btn-tertiary" @click="$emit('confirm', 'new')">
          仅新对话使用
        </button>
        <button class="btn btn-primary" @click="$emit('confirm', 'current')">
          应用到当前对话
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSettings } from '../composables/useSettings'

const props = defineProps({
  newPersonaId: {
    type: String,
    required: true
  },
  oldPersonaId: {
    type: String,
    required: true
  }
})

defineEmits(['confirm', 'cancel'])

const { getAllPersonas } = useSettings()

const newPersona = computed(() => {
  const allPersonas = getAllPersonas()
  return allPersonas.find(p => p.id === props.newPersonaId)
})

const oldPersona = computed(() => {
  const allPersonas = getAllPersonas()
  return allPersonas.find(p => p.id === props.oldPersonaId)
})
</script>

<style scoped>
.switcher-overlay {
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

.switcher-dialog {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.switcher-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.switcher-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.switcher-content {
  padding: 24px;
}

.switcher-message {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}

.persona-comparison {
  display: flex;
  align-items: center;
  gap: 16px;
}

.persona-item {
  flex: 1;
}

.persona-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
}

.persona-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.persona-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.persona-info {
  flex: 1;
  min-width: 0;
}

.persona-name {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.persona-nickname {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow-icon {
  font-size: 24px;
  color: #9ca3af;
  flex-shrink: 0;
}

.switcher-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-tertiary {
  background: white;
  color: #4a90e2;
  border: 1px solid #4a90e2;
}

.btn-tertiary:hover {
  background: #eff6ff;
}

.btn-primary {
  background: #4a90e2;
  color: white;
}

.btn-primary:hover {
  background: #3b7dd6;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .switcher-dialog {
    max-width: 100%;
  }

  .persona-comparison {
    flex-direction: column;
    gap: 12px;
  }

  .arrow-icon {
    transform: rotate(90deg);
  }

  .switcher-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
