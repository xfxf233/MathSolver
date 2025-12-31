import { ref } from 'vue'
import { AIService } from '../services/apiService'
import { useConversations } from './useConversations'

export function useAISolver(config) {
  const isSolving = ref(false)
  const error = ref(null)
  const currentStreamingMessageId = ref(null)

  const {
    activeConversation,
    addUserMessage,
    addAssistantMessage,
    updateAssistantMessage,
    deleteMessage,
    saveCurrentConversation,
    updateConversationModel
  } = useConversations()

  /**
   * 求解数学问题（支持多轮对话）
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

    if (!activeConversation.value) {
      error.value = '没有活动对话'
      return ''
    }

    isSolving.value = true
    error.value = null

    try {
      // Add user message to conversation
      addUserMessage(question)

      // Create empty assistant message for streaming
      const assistantMessageId = addAssistantMessage('')
      currentStreamingMessageId.value = assistantMessageId

      // Build messages array for API (exclude the empty assistant message)
      const messages = activeConversation.value.messages
        .filter(m => m.id !== assistantMessageId)
        .map(m => ({
          role: m.role,
          content: m.content
        }))

      // Update conversation model if not set
      updateConversationModel(config.value.model)

      // Stream response
      const service = new AIService(config.value)
      const generator = service.solveMath(messages)

      let fullAnswer = ''
      for await (const chunk of generator) {
        fullAnswer += chunk
        updateAssistantMessage(assistantMessageId, fullAnswer)
      }

      // Save conversation after streaming completes
      saveCurrentConversation()

      return fullAnswer
    } catch (err) {
      console.error('AI求解失败:', err)
      error.value = parseError(err)

      // Delete the incomplete assistant message on error
      if (currentStreamingMessageId.value) {
        deleteMessage(currentStreamingMessageId.value)
      }

      return ''
    } finally {
      isSolving.value = false
      currentStreamingMessageId.value = null
    }
  }

  /**
   * 停止当前求解
   */
  const stop = () => {
    isSolving.value = false
    // Keep partial message - don't delete it
    if (currentStreamingMessageId.value) {
      saveCurrentConversation()
    }
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
    error,
    solve,
    stop
  }
}
