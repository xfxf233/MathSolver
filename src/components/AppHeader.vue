<script setup>
defineEmits(['openSettings'])
</script>

<template>
  <header class="header">
    <h1 class="title">MathSolver</h1>
    <button class="settings-button" @click="$emit('openSettings')" title="API设置">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2-5.2l-4.2 4.2m0 6l4.2 4.2"></path>
      </svg>
    </button>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: -0.5px;
}

.settings-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.settings-button:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.settings-button:active {
  transform: scale(0.95);
}

.settings-button svg {
  width: 20px;
  height: 20px;
}
</style>
