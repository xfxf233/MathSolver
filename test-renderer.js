import { useMarkdownRenderer } from './src/composables/useMarkdownRenderer.js'

const { render, renderInline } = useMarkdownRenderer()

// 测试用例
const testCases = [
  {
    name: '行内公式(dollars)',
    input: '这是用dollars包裹的行内公式: $x+y=1$'
  },
  {
    name: '行间公式(dollars)',
    input: '这是用dollars包裹的行间公式: \n$$\nx+y=1\n$$\n'
  },
  {
    name: '行内公式(brackets)',
    input: '这是用brackets包裹的行内公式: \\(x+y=1\\)',
  },
  {
    name: '行间公式(brackets)',
    input: '这是用brackets包裹的行间公式: \n\\[\nx+y=1\n\\]\n',
  }
]

console.log('=== Markdown渲染测试 ===\n')

testCases.forEach(({ name, input }) => {
  console.log(`测试:${name}`)
  console.log('输入:\n', input)
  console.log('输出:\n', render(input))
  console.log('---\n')
})
