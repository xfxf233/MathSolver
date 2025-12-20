import { ref } from 'vue'
import { AIService } from '../services/apiService'

export function useAISolver(config) {
  const isSolving = ref(false)
  const currentAnswer = ref('')
  const currentQuestion = ref('')
  const error = ref(null)

  /**
   * 求解数学问题
   * @param {string} question - 数学问题
   * @returns {Promise<string>} - 完整的解答
   */
  const solve = async (question) => {
    if (!question || !question.trim()) {
      error.value = '请输入题目'
      return ''
    }

    if (!config.value.apiKey) {
      error.value = '请先配置API密钥'
      return ''
    }

    isSolving.value = true
    error.value = null
    currentAnswer.value = ''
    currentQuestion.value = question

    try {
      const service = new AIService(config.value)
      const generator = service.solveMath(question)

      for await (const chunk of generator) {
        currentAnswer.value += chunk
      }

      return currentAnswer.value
    } catch (err) {
      console.error('AI求解失败:', err)
      error.value = parseError(err)
      return ''
    } finally {
      isSolving.value = false
    }
  }

  /**
   * 停止当前求解
   */
  const stop = () => {
    isSolving.value = false
  }

  /**
   * 清空当前解答
   */
  const clear = () => {
    currentAnswer.value = ''
    currentQuestion.value = ''
    error.value = null
  }

  /**
   * 解析错误信息
   * @param {Error} err - 错误对象
   * @returns {string} - 友好的错误信息
   */
  const parseError = (err) => {
    const message = err.message || String(err)

    if (message.includes('401')) {
      return 'API密钥无效，请检查配置'
    } else if (message.includes('429')) {
      return '请求过于频繁，请稍后再试'
    } else if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return 'API服务暂时不可用，请稍后再试'
    } else if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
      return '请求超时，请检查网络连接'
    } else if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      return '网络连接失败，请检查网络设置'
    } else {
      return `求解失败: ${message}`
    }
  }

  return {
    isSolving,
    currentAnswer,
    currentQuestion,
    error,
    solve,
    stop,
    clear
  }
}
