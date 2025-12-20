import { ref } from 'vue'

const API_CONFIG_KEY = 'mathsolver_api_config'

// 单例模式：创建共享的配置对象
const config = ref({
  endpoint: 'https://api.openai.com/v1/chat/completions',
  apiKey: '',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2000
})

// 从localStorage加载配置
const loadConfig = () => {
  try {
    const saved = localStorage.getItem(API_CONFIG_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      config.value = { ...config.value, ...parsed }
    }
  } catch (error) {
    console.error('加载API配置失败:', error)
  }
}

// 保存配置到localStorage
const saveConfig = () => {
  try {
    localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config.value))
    return true
  } catch (error) {
    console.error('保存API配置失败:', error)
    return false
  }
}

// 验证配置是否完整
const isConfigValid = () => {
  return !!(config.value.endpoint && config.value.apiKey && config.value.model)
}

// 重置配置为默认值
const resetConfig = () => {
  config.value = {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2000
  }
}

// 初始化时加载配置
loadConfig()

// 导出单例
export function useApiConfig() {
  return {
    config,
    loadConfig,
    saveConfig,
    isConfigValid,
    resetConfig
  }
}
