# MathSolver - AI数学解题网站

一个纯前端的AI数学解题网站，支持数学公式输入和AI智能解答。

## 功能特性

### 核心功能
- **数学题目输入**: 基于TipTap富文本编辑器，支持插入和编辑LaTeX数学公式
- **AI智能解答**: 调用AI API进行数学问题求解，支持流式输出（打字机效果）
- **Markdown+LaTeX渲染**: 完美支持Markdown文本和LaTeX数学公式混合渲染
- **历史记录**: 自动保存解答历史，支持查看、删除和清空
- **API配置**: 支持自定义API端点，兼容OpenAI格式的API

### 界面特性
- **响应式布局**:
  - 桌面端：左右分栏布局，可拖动分隔条调整宽度
  - 移动端：上下布局，自动适配
- **现代简洁设计**: 白色卡片式设计，优雅的交互效果
- **流畅动画**: 打字机效果、加载动画、过渡动画

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

### 2. 输入题目

在左侧"题目输入"区域：

1. 直接输入文字描述
2. 点击"插入公式"按钮插入数学公式
3. 双击公式可编辑，支持虚拟键盘（移动端友好）

### 3. 求解

1. 输入完题目后，点击右侧的"求解"按钮
2. AI将开始思考并逐字显示解答过程
3. 解答完成后会自动保存到历史记录

### 4. 其他功能

- **重新生成**: 对当前问题重新请求AI解答
- **复制解答**: 一键复制AI的解答内容到剪贴板
- **历史记录**: 点击时钟图标查看历史记录，可选择查看或删除

## 项目结构

```
src/
├── components/          # Vue组件
│   ├── MathEditor.vue              # 数学题目编辑器
│   ├── MathNodeView.vue            # 数学公式节点视图
│   ├── AppHeader.vue               # 顶部导航栏
│   ├── MainLayout.vue              # 响应式布局容器
│   ├── ResizeDivider.vue           # 可拖动分隔条
│   ├── AISolutionPanel.vue         # AI解答面板
│   ├── SolutionDisplay.vue         # 解答渲染区域
│   ├── ApiSettingsDialog.vue       # API设置对话框
│   └── HistoryPanel.vue            # 历史记录侧边栏
├── composables/         # 组合式函数
│   ├── useApiConfig.js             # API配置管理
│   ├── useAISolver.js              # AI求解逻辑
│   ├── useHistory.js               # 历史记录管理
│   └── useMarkdownRenderer.js      # Markdown渲染器
├── services/            # 服务层
│   └── apiService.js               # API请求服务
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

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "你是一个数学解题助手..."
    },
    {
      "role": "user",
      "content": "题目内容"
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

### 3. 历史记录丢失

- 历史记录存储在浏览器localStorage中
- 清除浏览器数据会导致历史记录丢失
- 建议定期导出重要的解答内容

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
