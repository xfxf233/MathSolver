# MathSolver - AI数学解题网站

一个纯前端的AI数学解题网站，支持数学公式输入和多轮对话式AI智能解答。

## 功能特性

### 核心功能
- **数学题目输入**: 基于TipTap富文本编辑器，支持插入和编辑LaTeX数学公式
- **多轮对话**: 支持连续对话，AI能记住上下文，可以追问和深入讨论
- **对话管理**: 创建多个对话线程，随时切换，每个对话独立保存
- **AI智能解答**: 调用AI API进行数学问题求解，支持流式输出（打字机效果）
- **Markdown+LaTeX渲染**: 完美支持Markdown文本和LaTeX数学公式混合渲染
- **消息操作**: 复制单条AI回答，删除不需要的消息
- **对话历史**: 自动保存所有对话，支持查看、切换和删除
- **API配置**: 支持自定义API端点，兼容OpenAI格式的API

### 界面特性
- **聊天式界面**: 类似聊天应用的对话界面，用户消息和AI回答清晰区分
- **响应式布局**:
  - 桌面端：左右分栏布局，可拖动分隔条调整宽度
  - 移动端：上下布局，自动适配
- **现代简洁设计**: 白色卡片式设计，优雅的交互效果
- **流畅动画**: 打字机效果、消息滑入动画、加载动画

## 技术栈

- **框架**: Vue 3 + Vite
- **富文本编辑**: TipTap + StarterKit
- **数学公式**:
  - 编辑：MathLive
  - 渲染：KaTeX
- **Markdown渲染**: markdown-it + markdown-it-texmath
- **代码高亮**: highlight.js
- **状态管理**: Composition API + Composables
- **数据存储**: localStorage

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

## 使用指南

### 1. 配置API

首次使用需要配置AI API：

1. 点击右上角的齿轮图标
2. 填写以下信息：
   - **API端点**: 例如 `https://api.openai.com/v1/chat/completions`
   - **API密钥**: 你的API密钥（如 `sk-...`）
   - **模型名称**: 例如 `gpt-4o-mini`、`gpt-4`、`claude-3-5-sonnet` 等
3. （可选）展开高级选项，调整温度和最大Token数
4. 点击"保存"

**注意**: API密钥存储在浏览器本地，不会上传到服务器。

### 2. 输入消息

在左侧"输入消息"区域：

1. 直接输入文字描述
2. 点击"插入公式"按钮插入数学公式
3. 双击公式可编辑，支持虚拟键盘（移动端友好）
4. 点击"发送"按钮发送消息

### 3. 对话交互

1. 发送消息后，AI将开始思考并逐字显示解答过程
2. 解答完成后会自动保存到当前对话
3. 继续输入问题可以进行多轮对话，AI会记住之前的内容
4. 每条AI回答都可以单独复制或删除

### 4. 对话管理

- **新对话**: 点击右侧面板的"新对话"按钮创建新的对话线程
- **对话列表**: 点击"对话列表"按钮查看所有对话，可以切换或删除
- **对话标题**: 自动从第一条消息生成，最多显示50个字符
- **消息计数**: 每个对话显示包含的消息数量

### 5. 其他功能

- **复制消息**: 点击消息下方的复制按钮，将AI回答复制到剪贴板
- **删除消息**: 点击消息下方的删除按钮，从对话中移除该消息
- **清空对话**: 在对话列表中点击"清空所有对话"按钮

## 项目结构

```
src/
├── components/          # Vue组件
│   ├── MathEditor.vue              # 数学题目编辑器（含发送按钮）
│   ├── MathNodeView.vue            # 数学公式节点视图
│   ├── AppHeader.vue               # 顶部导航栏
│   ├── MainLayout.vue              # 响应式布局容器
│   ├── ResizeDivider.vue           # 可拖动分隔条
│   ├── ConversationPanel.vue       # 对话面板（聊天界面）
│   ├── MessageBubble.vue           # 消息气泡组件
│   ├── ConversationList.vue        # 对话列表侧边栏
│   ├── ApiSettingsDialog.vue       # API设置对话框
│   ├── AISolutionPanel.vue         # [已弃用] 旧版解答面板
│   ├── SolutionDisplay.vue         # [已弃用] 旧版解答渲染
│   └── HistoryPanel.vue            # [已弃用] 旧版历史记录
├── composables/         # 组合式函数
│   ├── useApiConfig.js             # API配置管理
│   ├── useConversations.js         # 对话状态管理（新）
│   ├── useAISolver.js              # AI求解逻辑（已重构）
│   ├── useHistory.js               # [已弃用] 旧版历史记录
│   └── useMarkdownRenderer.js      # Markdown渲染器
├── services/            # 服务层
│   └── apiService.js               # API请求服务（支持多轮对话）
├── utils/               # 工具函数
│   └── contentExtractor.js         # 内容提取工具
├── extensions/          # TipTap扩展
│   └── MathNode.js                 # 数学节点扩展
├── App.vue              # 主应用组件
├── main.js              # 应用入口
└── style.css            # 全局样式
```

## API格式说明

本应用支持任何兼容OpenAI格式的API端点，包括：

- OpenAI官方API
- Claude API（通过兼容层）
- 本地部署的模型（如Ollama、LM Studio等）
- 第三方API服务

### 请求格式

支持多轮对话，完整的对话历史会被发送到API：

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "你是一个数学解题助手。请用Markdown格式回答，数学公式使用LaTeX语法，行内公式用$...$，块级公式用$$...$$。请分步骤详细解答，确保逻辑清晰。在多轮对话中，请记住之前的上下文。"
    },
    {
      "role": "user",
      "content": "求解方程 $x^2 + 2x - 3 = 0$"
    },
    {
      "role": "assistant",
      "content": "这是一个一元二次方程..."
    },
    {
      "role": "user",
      "content": "能用配方法再解一遍吗？"
    }
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 2000
}
```

### 响应格式

AI应返回Markdown格式的文本，数学公式使用LaTeX语法：
- 行内公式：`$x^2 + y^2 = r^2$`
- 块级公式：`$$\int_0^1 x^2 dx$$`

## 常见问题

### 1. API请求失败

- 检查API端点是否正确
- 检查API密钥是否有效
- 检查网络连接
- 查看浏览器控制台的错误信息

### 2. 公式渲染异常

- 确保LaTeX语法正确
- 检查是否使用了不支持的LaTeX命令
- 尝试刷新页面

### 3. 对话历史丢失

- 对话历史存储在浏览器localStorage中
- 清除浏览器数据会导致对话历史丢失
- 建议定期导出重要的对话内容
- 最多保存50个对话，超出后会自动删除最旧的对话

## 开发说明

### 添加新的代码高亮语言

编辑 `src/composables/useMarkdownRenderer.js`：

```javascript
import newLanguage from 'highlight.js/lib/languages/newLanguage'
hljs.registerLanguage('newLanguage', newLanguage)
```

### 自定义Markdown渲染

修改 `src/composables/useMarkdownRenderer.js` 中的 `MarkdownIt` 配置。

### 修改默认API配置

编辑 `src/composables/useApiConfig.js` 中的 `defaultConfig`。

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！
