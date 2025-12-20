/**
 * 从TipTap编辑器提取内容
 * 将编辑器的JSON格式转换为纯文本 + LaTeX格式
 * @param {Editor} editor - TipTap编辑器实例
 * @returns {string} - 提取的文本内容
 */
export function extractQuestionFromEditor(editor) {
  if (!editor) return ''

  try {
    // 获取编辑器的JSON内容
    const json = editor.getJSON()

    // 遍历节点，提取文本和数学公式
    let result = ''

    function traverse(node, isFirstParagraph = false) {
      if (node.type === 'text') {
        result += node.text
      } else if (node.type === 'mathNode') {
        // 数学公式节点，使用LaTeX语法
        const latex = node.attrs?.latex || ''
        result += `$${latex}$`
      } else if (node.type === 'hardBreak') {
        result += '\n'
      } else if (node.content) {
        // 递归处理子节点
        node.content.forEach((child, index) => {
          traverse(child, isFirstParagraph && index === 0)
        })
      }

      // 段落之间添加换行
      if (node.type === 'paragraph' && !isFirstParagraph) {
        result += '\n\n'
      }
    }

    // 从根节点开始遍历
    if (json.content) {
      json.content.forEach((node, index) => {
        traverse(node, index === 0)
      })
    }

    return result.trim()
  } catch (error) {
    console.error('提取编辑器内容失败:', error)
    return ''
  }
}

/**
 * 从编辑器提取纯文本（不包含LaTeX）
 * @param {Editor} editor - TipTap编辑器实例
 * @returns {string} - 纯文本内容
 */
export function extractPlainText(editor) {
  if (!editor) return ''

  try {
    const json = editor.getJSON()
    let result = ''

    function traverse(node) {
      if (node.type === 'text') {
        result += node.text
      } else if (node.type === 'mathNode') {
        result += '[数学公式]'
      } else if (node.type === 'hardBreak') {
        result += ' '
      } else if (node.content) {
        node.content.forEach(traverse)
      }

      if (node.type === 'paragraph') {
        result += ' '
      }
    }

    if (json.content) {
      json.content.forEach(traverse)
    }

    return result.trim().replace(/\s+/g, ' ')
  } catch (error) {
    console.error('提取纯文本失败:', error)
    return ''
  }
}

/**
 * 检查编辑器内容是否为空
 * @param {Editor} editor - TipTap编辑器实例
 * @returns {boolean} - 是否为空
 */
export function isEditorEmpty(editor) {
  if (!editor) return true

  try {
    const text = extractPlainText(editor)
    return !text || text.length === 0
  } catch (error) {
    return true
  }
}
