# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MathSolver is a Vue 3 application that provides an AI-powered math problem solver with a rich text editor for inputting mathematical expressions. The app features a split-panel interface where users can input math problems on the left and receive AI-generated solutions on the right.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173 by default)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Core Technologies
- **Vue 3** with Composition API
- **Vite** for build tooling
- **TipTap** (ProseMirror-based) for rich text editing
- **MathLive** for interactive math input
- **KaTeX** for math rendering
- **markdown-it** with texmath plugin for markdown and LaTeX rendering
- **highlight.js** for code syntax highlighting

### Application Structure

The app follows a component-based architecture with composables for shared logic:

**Main Layout Flow:**
- `App.vue` → Root component managing settings dialog and layout
- `MainLayout.vue` → Responsive split-panel layout (desktop: side-by-side, mobile: stacked)
- `MathEditor.vue` → Left panel with TipTap editor for problem input
- `AISolutionPanel.vue` → Right panel displaying AI solutions and history

**Key Components:**
- `MathEditor.vue` - TipTap editor with custom MathNode extension for inline LaTeX
- `MathNodeView.vue` - Vue component rendering MathLive widgets within the editor
- `AISolutionPanel.vue` - Manages AI solving, displays solutions, and shows history
- `SolutionDisplay.vue` - Renders markdown solutions with LaTeX math
- `HistoryPanel.vue` - Displays and manages solution history
- `ApiSettingsDialog.vue` - Configuration dialog for API settings
- `ResizeDivider.vue` - Draggable divider for adjusting panel widths

### Composables (Shared Logic)

**`useApiConfig.js`** - Singleton pattern for API configuration
- Manages OpenAI-compatible API settings (endpoint, key, model, temperature, maxTokens)
- Persists config to localStorage under key `mathsolver_api_config`
- Default endpoint: `https://api.openai.com/v1/chat/completions`
- Default model: `gpt-4o-mini`

**`useAISolver.js`** - AI problem solving logic
- Wraps `AIService` class for streaming responses
- Manages solving state (isSolving, currentAnswer, currentQuestion, error)
- Provides `solve()`, `stop()`, and `clear()` methods
- Includes error parsing for common API errors (401, 429, 500, timeout, network)

**`useHistory.js`** - Solution history management
- Stores up to 50 history items in localStorage under key `mathsolver_history`
- Each item contains: id, question, answer, model, timestamp
- Provides CRUD operations: addHistory, deleteHistory, clearHistory, getHistoryById

**`useMarkdownRenderer.js`** - Markdown and LaTeX rendering
- Configures markdown-it with texmath plugin for KaTeX rendering
- Uses `$...$` for inline math and `$$...$$` for block math
- Includes syntax highlighting for JavaScript, Python, Java, C++
- Provides `render()` and `renderInline()` methods

### Services

**`apiService.js`** - AIService class
- Handles streaming API requests to OpenAI-compatible endpoints
- `solveMath(question)` - Async generator yielding content chunks
- `testConnection()` - Validates API configuration
- Parses SSE (Server-Sent Events) format responses
- System prompt instructs AI to use Markdown with LaTeX math syntax

### Custom TipTap Extension

**`extensions/MathNode.js`** - Custom inline node for math input
- Inline, atomic node type for embedding MathLive editors
- Stores LaTeX in `data-latex` attribute
- Renders using `MathNodeView.vue` component via VueNodeViewRenderer
- Provides `insertMathNode` command for toolbar button

### Content Extraction

**`utils/contentExtractor.js`** - Extracts plain text and LaTeX from TipTap editor
- Traverses ProseMirror document structure
- Converts MathNode elements to LaTeX syntax
- Used to prepare questions for AI API

### State Management

The app uses Vue 3's Composition API with singleton composables for shared state:
- API configuration is shared across all components via `useApiConfig()`
- History is shared via `useHistory()`
- Each component instance of `useAISolver()` gets its own solving state

### Data Persistence

All data is stored in browser localStorage:
- `mathsolver_api_config` - API settings
- `mathsolver_history` - Solution history (max 50 items)
- `mathsolver_layout_width` - User's preferred panel width percentage

### Responsive Design

- Desktop (≥769px): Side-by-side panels with draggable divider
- Mobile (<768px): Stacked layout with AI solution on top, input on bottom
- Layout preference persists via localStorage

## Important Implementation Details

### Math Rendering Pipeline
1. User inputs math via MathLive widget (triggered by "插入公式" button)
2. LaTeX stored in MathNode's `data-latex` attribute
3. Content extracted to plain text with LaTeX markers for API
4. AI response (Markdown + LaTeX) rendered via markdown-it + KaTeX
5. Rendered HTML displayed in SolutionDisplay component

### Streaming Response Handling
- API responses use SSE format (`data: {...}\n\n`)
- Content chunks accumulated in `currentAnswer` ref
- UI updates reactively as chunks arrive
- Handles `[DONE]` signal and incomplete buffer data

### Error Handling
- API errors parsed into user-friendly messages
- Network errors, timeouts, and rate limits handled gracefully
- Markdown rendering errors caught and displayed

## Node Version Requirement

This project requires Node.js version `^20.19.0 || >=22.12.0` as specified in package.json engines field.
