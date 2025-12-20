<script setup>
import MathEditor from './components/MathEditor.vue'
</script>

<template>
  <div class="app">
    <header class="header">
      <h1 class="title">MathSolver</h1>
    </header>
    <main class="main">
      <div class="input-section">
        <h2 class="section-title">题目输入</h2>
        <MathEditor />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.main {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

.input-section {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 500;
  color: #374151;
}
</style>
