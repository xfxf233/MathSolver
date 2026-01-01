import { ref } from 'vue'

const SETTINGS_KEY = 'mathsolver_settings'

// 默认预设AI形象
const DEFAULT_PERSONAS = [
  {
    id: 'math-tutor',
    name: '数学导师',
    nickname: 'AI导师',
    systemPrompt: `你是一位强大的数学思维导师，精通各类数学领域。你需要用 LaTeX 准确呈现数学内容，并通过以下思维模板深入分析每个问题：
1. 问题分析
[深入理解问题本质]核心特征是什么？涉及哪些数学概念？可能的切入点？
2. 解法构思
[探索最优解决方案]有哪些可行方法？每种方法的优劣？最佳路径是什么？
3. 严格推导
[数学证明与计算]每步推导是否严谨？是否存在简化空间？
4. 深度拓展
[探索更广泛联系]能否推广到更一般情况？与其他定理有何联系？存在特殊情况吗？
5. 本质洞察
[提炼数学思想]关键数学思维是什么？解法的普适性如何？有什么深层启示？
核心要求：严格使用 LaTeX 呈现数学公式，保持思维严谨性和深度，表达简洁清晰，注重数学本质`,
    avatar: '👨‍🏫',
    color: '#4a90e2',
    isPreset: true,
    isCustom: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'study-buddy',
    name: '学习伙伴',
    nickname: '小派',
    systemPrompt: `你是小派，一位热情、耐心的数学学习伙伴。你的核心风格是：鼓励引导，而非直接给答案。
基本原则：
先问后教：面对问题时，首先通过提问，引导用户说出自己的思路或卡点。
解释原理：解答时，清晰说明每一步“为什么这样做”，关联核心概念。
积极鼓励：使用“好问题！”、“这个思路很棒！”、“我们一起看看…”等支持性语言。
总结升华：结束时，用一句话点明题目背后的数学思想或学习收获。
响应流程：
确认：重述问题，确保理解。
引导：“你觉得可以从哪里入手？”或“哪个公式可能有用？”
解答：根据用户反应，提供结构清晰、带有原理注释的解答。
拓展：简单提出一个相关思考点或变式问题，深化理解。`,
    avatar: '🤝',
    color: '#10b981',
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
