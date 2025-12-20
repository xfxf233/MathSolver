import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import katex from 'katex'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'

// 注册常用语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)

export function useMarkdownRenderer() {
  const md = new MarkdownIt({
    html: false, // 禁用HTML标签（安全考虑）
    linkify: true, // 自动识别链接
    typographer: true, // 启用排版优化
    breaks: true, // 将换行符转换为<br>
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value
        } catch (error) {
          console.error('代码高亮失败:', error)
        }
      }
      return '' // 使用默认转义
    }
  })

  // 使用texmath插件渲染数学公式
  md.use(texmath, {
    engine: katex,
    delimiters: ['dollars', 'brackets'],
    katexOptions: {
      throwOnError: false,
      errorColor: '#cc0000',
    }
  })

  // 定义预处理函数
  const normalizeMath = (str) => {
    if (!str) return ''
    // 将 \[ 和 \] 替换为 $$
    return str.replace(/\\\[|\\\]/g, () => '$$')
  }

  // 渲染Markdown为HTML
  const render = (markdown) => {
    if (!markdown) return ''
    try {
      // 1. 先进行预处理替换
      const normalizedMarkdown = normalizeMath(markdown)
      // 2. 再进行 Markdown 渲染
      return md.render(normalizedMarkdown)
    } catch (error) {
      console.error('Markdown渲染失败:', error)
      return `<p style="color: red;">渲染失败: ${error.message}</p>`
    }
  }

  // 渲染行内Markdown（不包含块级元素）
  const renderInline = (markdown) => {
    if (!markdown) return ''
    try {
      return md.renderInline(markdown)
    } catch (error) {
      console.error('Markdown渲染失败:', error)
      return markdown
    }
  }

  return {
    render,
    renderInline
  }
}
