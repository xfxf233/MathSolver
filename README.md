# MathSolver - AI数学解题网站

一个纯前端的AI数学解题网站，支持数学公式输入和多轮对话式AI智能解答。

## 功能特性

### 核心功能
- **数学题目输入**: 基于TipTap富文本编辑器，支持插入和编辑LaTeX数学公式
- **多轮对话**: 支持连续对话，AI能记住上下文，可以追问和深入讨论
- **对话管理**: 创建多个对话线程，随时切换，每个对话独立保存
- **AI智能解答**: 调用AI API进行数学问题求解，支持流式输出（打字机效果）
- **AI形象系统**: 自定义AI助手的形象、昵称、颜色和系统提示词，支持创建多个AI形象
- **思考过程展示**: 支持显示AI模型的思考过程（适用于o1/o3等推理模型），可折叠查看
- **Markdown+LaTeX渲染**: 完美支持Markdown文本和LaTeX数学公式混合渲染
- **消息操作**: 复制单条AI回答，删除不需要的消息
- **对话历史**: 自动保存所有对话，支持查看、切换和删除
- **API配置**: 支持自定义API端点，兼容OpenAI格式的API

### 界面特性
- **聊天式界面**: 类似聊天应用的对话界面，用户消息和AI回答清晰区分
- **响应式布局**:
  - 桌面端：左右分栏布局，可拖动分隔条调整宽度
  - 移动端：上下布局，可拖动分隔条调整高度
- **界面自定义**:
  - 自定义用户昵称
  - 上传和裁剪背景图片
  - 调整背景透明度
  - 调整消息气泡透明度
- **智能滚动**: 自动滚动到最新消息，支持快速跳转到顶部/底部
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

1. 点击右上角的齿轮图标打开设置
2. 在"API设置"部分填写以下信息：
   - **API端点**: 例如 `https://api.openai.com/v1/chat/completions`
   - **API密钥**: 你的API密钥（如 `sk-...`）
   - **模型名称**: 例如 `gpt-4o-mini`、`gpt-4`、`claude-3-5-sonnet` 等
3. （可选）展开高级选项，调整温度和最大Token数
4. 点击"保存"

**注意**: API密钥存储在浏览器本地，不会上传到服务器。

### 2. 自定义AI形象（可选）

在设置对话框的"AI形象"部分：

1. **选择预设形象**: 应用提供两个预设形象（数学导师、学习伙伴）
2. **创建自定义形象**: 点击"创建新形象"按钮
   - 设置形象名称和昵称
   - 选择头像表情和主题颜色
   - 编写自定义系统提示词（定义AI的行为和风格）
   - 可使用预设模板快速开始
3. **切换形象**: 选择不同的AI形象会影响AI的回答风格
   - 如果当前有活动对话，会提示是否应用到当前对话
4. **编辑/删除**: 自定义形象可以随时编辑或删除

### 3. 自定义界面（可选）

在设置对话框的"用户设置"部分：

1. **用户昵称**: 设置你在对话中显示的昵称
2. **背景图片**:
   - 上传图片作为对话面板背景
   - 使用裁剪工具调整图片位置和缩放
   - 支持JPG、PNG、GIF格式，最大5MB
3. **背景透明度**: 调整背景图片的透明度（0-100%）
4. **消息透明度**: 调整消息气泡的透明度（50-100%），让背景图片若隐若现

### 4. 输入消息

在左侧"输入消息"区域：

1. 直接输入文字描述
2. 点击"插入公式"按钮插入数学公式
3. 双击公式可编辑，支持虚拟键盘（移动端友好）
4. 点击"发送"按钮发送消息

### 5. 对话交互

1. 发送消息后，AI将开始思考并逐字显示解答过程
2. **思考过程展示**（仅支持推理模型如o1/o3）：
   - AI思考时会实时显示思考过程，默认展开
   - 点击"思考过程"标题可以折叠/展开该区域
   - 思考完成后会显示最终回答
3. 解答完成后会自动保存到当前对话
4. 继续输入问题可以进行多轮对话，AI会记住之前的内容
5. 每条AI回答都可以单独复制或删除

### 6. 对话管理

- **新对话**: 点击右侧面板的"新对话"按钮创建新的对话线程
- **对话列表**: 点击"对话列表"按钮查看所有对话，可以切换或删除
- **对话标题**: 自动从第一条消息生成，最多显示50个字符
- **消息计数**: 每个对话显示包含的消息数量

### 7. 数据管理

在设置对话框的"数据管理"部分：

- **清除所有数据**: 删除所有对话记录、设置和自定义形象
- **注意**: 此操作不可撤销，请谨慎使用

## 项目结构

```
src/
├── components/          # Vue组件
│   ├── AppHeader.vue               # 顶部导航栏
│   ├── MainLayout.vue              # 响应式布局容器
│   ├── ResizeDivider.vue           # 可拖动分隔条
│   ├── MathEditor.vue              # 数学题目编辑器（含发送按钮）
│   ├── MathNodeView.vue            # 数学公式节点视图
│   ├── ConversationPanel.vue       # 对话面板（聊天界面）
│   ├── MessageBubble.vue           # 消息气泡组件
│   ├── ConversationList.vue        # 对话列表侧边栏
│   ├── SettingsDialog.vue          # 设置对话框
│   ├── PersonaEditor.vue           # AI形象编辑器
│   ├── PersonaSwitcher.vue         # AI形象切换确认对话框
│   └── ImageCropper.vue            # 图片裁剪器
├── composables/         # 组合式函数
│   ├── useSettings.js              # 设置管理（用户、API、AI形象）
│   ├── useConversations.js         # 对话状态管理
│   ├── useAISolver.js              # AI求解逻辑
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

支持多轮对话，完整的对话历史会被发送到API。系统提示词由当前选择的AI形象提供：

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "[当前AI形象的系统提示词]"
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

**推理模型支持**（如OpenAI o1/o3）：
- 支持 `reasoning_content` 或 `reasoning` 字段
- 思考过程会在界面上单独显示，可折叠查看
- 不支持该字段的模型不受影响，正常显示回答内容

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

### 修改默认配置

- **API配置**: 编辑 `src/composables/useSettings.js` 中的默认值
- **AI形象**: 编辑 `src/composables/useSettings.js` 中的 `DEFAULT_PERSONAS`
- **Markdown渲染**: 修改 `src/composables/useMarkdownRenderer.js` 中的 `MarkdownIt` 配置

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！
