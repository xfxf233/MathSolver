export class AIService {
  constructor(config) {
    this.config = config
  }

  /**
   * 调用AI求解数学问题（流式输出）
   * @param {string} question - 数学问题
   * @returns {AsyncGenerator<string>} - 流式返回的内容片段
   */
  async *solveMath(question) {
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
            content: '你是一个数学解题助手。请用Markdown格式回答，数学公式使用LaTeX语法，行内公式用$...$，块级公式用$$...$$。请分步骤详细解答，确保逻辑清晰。'
          },
          {
            role: 'user',
            content: question
          }
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
            const content = json.choices?.[0]?.delta?.content
            if (content) {
              yield content
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
              const content = json.choices?.[0]?.delta?.content
              if (content) {
                yield content
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
