import { ref } from 'vue'

const SETTINGS_KEY = 'mathsolver_settings'

// 默认预设AI形象
const DEFAULT_PERSONAS = [
  {
    id: 'math-tutor',
    name: '数学导师',
    nickname: 'AI导师',
    systemPrompt: '你是一个专业的数学导师。请用Markdown格式回答，数学公式使用LaTeX语法，行内公式用$...$，块级公式用$$...$$。请分步骤详细解答，确保逻辑清晰。在多轮对话中，请记住之前的上下文。采用正式、专业的教学风格，注重培养学生的数学思维。',
    avatar: '👨‍🏫',
    color: '#4a90e2',
    tone: 'formal',
    isPreset: true,
    isCustom: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'study-buddy',
    name: '学习伙伴',
    nickname: '小伙伴',
    systemPrompt: '你是一个友好的学习伙伴。请用Markdown格式回答，数学公式使用LaTeX语法，行内公式用$...$，块级公式用$$...$$。用轻松、鼓励的语气解答问题，让学习变得有趣。在多轮对话中，请记住之前的上下文。可以使用一些生动的比喻和例子帮助理解。',
    avatar: '🤝',
    color: '#10b981',
    tone: 'casual',
    isPreset: true,
    isCustom: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

// 单例模式：创建共享的配置对象
const settings = ref({
  // 用户设置
  user: {
    nickname: '你',
    backgroundImage: '',
    backgroundOpacity: 0.3,
    messageOpacity: 0.95
  },
  // API 设置
  api: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2000
  },
  // AI形象设置
  personas: {
    activePersonaId: 'math-tutor',
    presets: [],
    custom: []
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
        api: { ...settings.value.api, ...parsed.api },
        personas: {
          activePersonaId: parsed.personas?.activePersonaId || 'math-tutor',
          presets: parsed.personas?.presets || [],
          custom: parsed.personas?.custom || []
        }
      }
    }

    // 初始化默认形象
    initializeDefaultPersonas()
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
      backgroundOpacity: 0.3,
      messageOpacity: 0.95
    },
    api: {
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: '',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 2000
    },
    personas: {
      activePersonaId: 'math-tutor',
      presets: [],
      custom: []
    }
  }
  initializeDefaultPersonas()
}

// 生成唯一ID
const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 初始化默认预设形象
const initializeDefaultPersonas = () => {
  if (settings.value.personas.presets.length === 0) {
    settings.value.personas.presets = DEFAULT_PERSONAS.map(p => ({ ...p }))
  }
}

// 获取当前激活的形象
const getActivePersona = () => {
  const activeId = settings.value.personas.activePersonaId
  const allPersonas = [...settings.value.personas.presets, ...settings.value.personas.custom]
  return allPersonas.find(p => p.id === activeId) || settings.value.personas.presets[0]
}

// 设置激活形象
const setActivePersona = (personaId) => {
  const allPersonas = [...settings.value.personas.presets, ...settings.value.personas.custom]
  if (allPersonas.find(p => p.id === personaId)) {
    settings.value.personas.activePersonaId = personaId
    saveSettings()
    return true
  }
  return false
}

// 获取所有形象
const getAllPersonas = () => {
  return [...settings.value.personas.presets, ...settings.value.personas.custom]
}

// 创建自定义形象
const createCustomPersona = (personaData) => {
  const newPersona = {
    id: generateId(),
    name: personaData.name,
    nickname: personaData.nickname,
    systemPrompt: personaData.systemPrompt,
    avatar: personaData.avatar || '🤖',
    color: personaData.color || '#4a90e2',
    tone: personaData.tone || 'formal',
    isPreset: false,
    isCustom: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  settings.value.personas.custom.push(newPersona)
  saveSettings()
  return newPersona.id
}

// 更新自定义形象
const updateCustomPersona = (personaId, updates) => {
  const persona = settings.value.personas.custom.find(p => p.id === personaId)
  if (persona) {
    Object.assign(persona, updates, { updatedAt: Date.now() })
    saveSettings()
    return true
  }
  return false
}

// 删除自定义形象
const deleteCustomPersona = (personaId) => {
  const index = settings.value.personas.custom.findIndex(p => p.id === personaId)
  if (index !== -1) {
    settings.value.personas.custom.splice(index, 1)
    // 如果删除的是当前激活的形象，切换到默认形象
    if (settings.value.personas.activePersonaId === personaId) {
      settings.value.personas.activePersonaId = 'math-tutor'
    }
    saveSettings()
    return true
  }
  return false
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
    resetSettings,
    getActivePersona,
    setActivePersona,
    getAllPersonas,
    createCustomPersona,
    updateCustomPersona,
    deleteCustomPersona
  }
}
