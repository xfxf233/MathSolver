export class AIService {
  constructor(config) {
    this.config = config
  }

  /**
   * 调用AI求解数学问题（流式输出）
   * @param {Array<{role: string, content: string}>} messages - 对话消息数组
   * @param {string} systemPrompt - 自定义系统提示词
   * @returns {AsyncGenerator<{content: string, reasoning: string}>} - 流式返回的内容和思考过程片段
   */
  async *solveMath(messages, systemPrompt) {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...messages
        ],
        stream: true,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API请求失败 (${response.status}): ${errorText}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')

        // 保留最后一行（可能不完整）
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue

          const data = trimmed.slice(6) // 移除 "data: " 前缀
          if (data === '[DONE]') return

          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta
            const content = delta?.content || ''
            const reasoning = delta?.reasoning_content || delta?.reasoning || ''

            if (content || reasoning) {
              yield { content, reasoning }
            }
          } catch (error) {
            console.error('解析SSE数据失败:', error, '原始数据:', data)
          }
        }
      }

      // 处理缓冲区中剩余的数据
      if (buffer.trim()) {
        const trimmed = buffer.trim()
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6)
          if (data !== '[DONE]') {
            try {
              const json = JSON.parse(data)
              const delta = json.choices?.[0]?.delta
              const content = delta?.content || ''
              const reasoning = delta?.reasoning_content || delta?.reasoning || ''

              if (content || reasoning) {
                yield { content, reasoning }
              }
            } catch (error) {
              console.error('解析最后的SSE数据失败:', error)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * 测试API配置是否有效
   * @returns {Promise<boolean>} - 配置是否有效
   */
  async testConnection() {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5
        })
      })

      return response.ok
    } catch (error) {
      console.error('API连接测试失败:', error)
      return false
    }
  }
}
