import { ref } from 'vue'

const SETTINGS_KEY = 'mathsolver_settings'

// 单例模式：创建共享的配置对象
const settings = ref({
  // 用户设置
  user: {
    nickname: '你',
    backgroundImage: '',
    backgroundOpacity: 0.3
  },
  // API 设置
  api: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2000
  }
})

// 从localStorage加载配置
const loadSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // 合并配置，保留默认值
      settings.value = {
        user: { ...settings.value.user, ...parsed.user },
        api: { ...settings.value.api, ...parsed.api }
      }
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 保存配置到localStorage
const saveSettings = () => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value))
    return true
  } catch (error) {
    console.error('保存设置失败:', error)
    return false
  }
}

// 验证API配置是否完整
const isApiConfigValid = () => {
  const { endpoint, apiKey, model } = settings.value.api
  return !!(endpoint && apiKey && model)
}

// 重置配置为默认值
const resetSettings = () => {
  settings.value = {
    user: {
      nickname: '你',
      backgroundImage: '',
      backgroundOpacity: 0.3
    },
    api: {
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: '',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 2000
    }
  }
}

// 初始化时加载配置
loadSettings()

// 导出单例
export function useSettings() {
  return {
    settings,
    loadSettings,
    saveSettings,
    isApiConfigValid,
    resetSettings
  }
}
