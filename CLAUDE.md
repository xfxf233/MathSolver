# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MathSolver is a Vue 3 application that provides an AI-powered math problem solver with multi-turn conversation support. The app features a split-panel interface with a rich text editor on the left for inputting mathematical expressions and a chat-style conversation panel on the right for interacting with AI. Users can have continuous conversations with context awareness, switch between multiple conversation threads, and manage their conversation history.

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
- `App.vue` → Root component managing settings dialog, conversation initialization, and send handling
- `MainLayout.vue` → Responsive split-panel layout (desktop: side-by-side, mobile: stacked)
- `MathEditor.vue` → Left panel with TipTap editor and send button for message input
- `ConversationPanel.vue` → Right panel displaying chat-style conversation interface

**Key Components:**
- `MathEditor.vue` - TipTap editor with custom MathNode extension for inline LaTeX, includes send button
- `MathNodeView.vue` - Vue component rendering MathLive widgets within the editor
- `ConversationPanel.vue` - Main chat interface managing conversation display, new conversation creation, conversation list, and smart scrolling with quick navigation buttons
- `MessageBubble.vue` - Individual message display component with copy/delete actions, renders both user and AI messages with Markdown + KaTeX support, includes collapsible reasoning section for AI thinking process
- `ConversationList.vue` - Sidebar for viewing and switching between conversations
- `ApiSettingsDialog.vue` - Configuration dialog for API settings
- `ResizeDivider.vue` - Draggable divider for adjusting panel widths

### Composables (Shared Logic)

**`useApiConfig.js`** - Singleton pattern for API configuration
- Manages OpenAI-compatible API settings (endpoint, key, model, temperature, maxTokens)
- Persists config to localStorage under key `mathsolver_api_config`
- Default endpoint: `https://api.openai.com/v1/chat/completions`
- Default model: `gpt-4o-mini`

**`useConversations.js`** - Conversation state management (singleton)
- Manages all conversation threads and active conversation state
- Stores up to 50 conversations in localStorage under key `mathsolver_conversations`
- Each conversation contains: id, title, messages array, model, createdAt, updatedAt
- Each message contains: id, role (user/assistant), content, reasoning (optional), timestamp
- The `reasoning` field stores AI model's thinking process (for models like o1/o3)
- Provides CRUD operations: createConversation, deleteConversation, setActiveConversation
- Message operations: addUserMessage, addAssistantMessage, updateAssistantMessage, deleteMessage
- Auto-generates conversation titles from first user message
- Clears old `mathsolver_history` data on first load
- Includes data migration logic to add `reasoning` field to old messages

**`useAISolver.js`** - AI problem solving logic with conversation integration
- Integrates with `useConversations` for multi-turn conversation support
- Manages solving state (isSolving, error)
- Provides `solve()` and `stop()` methods
- Sends full conversation history to API for context-aware responses
- Handles streaming responses by updating assistant messages in real-time
- Includes error parsing for common API errors (401, 429, 500, timeout, network)
- Automatically saves conversation state after streaming completes

**`useMarkdownRenderer.js`** - Markdown and LaTeX rendering
- Configures markdown-it with texmath plugin for KaTeX rendering
- Supports multiple LaTeX delimiters: `$...$` (inline), `$$...$$` (block), `\(...\)` (inline), `\[...\]` (block)
- Includes preprocessing step that normalizes `\[...\]` to `$$...$$` for consistent rendering
- This normalization ensures AI responses work regardless of which LaTeX syntax they use
- Includes syntax highlighting for JavaScript, Python, Java, C++
- Provides `render()` and `renderInline()` methods

### Services

**`apiService.js`** - AIService class
- Handles streaming API requests to OpenAI-compatible endpoints
- `solveMath(messages)` - Async generator accepting full message history array, yielding structured objects with `content` and `reasoning` fields
- Supports both `reasoning_content` (OpenAI o1/o3) and `reasoning` (other providers) fields
- `testConnection()` - Validates API configuration
- Parses SSE (Server-Sent Events) format responses
- System prompt instructs AI to use Markdown with LaTeX math syntax and remember conversation context

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
- Conversation state is shared via `useConversations()` (singleton pattern)
- AI solving state is managed via `useAISolver()` which integrates with conversations
- All conversation data persists automatically to localStorage

### Data Persistence

All data is stored in browser localStorage:
- `mathsolver_api_config` - API settings
- `mathsolver_conversations` - All conversation threads (max 50 conversations)
- `mathsolver_active_conversation_id` - Currently active conversation ID
- `mathsolver_layout_width` - User's preferred panel width percentage (deprecated but kept for compatibility)

### Responsive Design

- Desktop (≥769px): Side-by-side panels with draggable divider
- Mobile (<768px): Stacked layout with AI solution on top, input on bottom
- Layout preference persists via localStorage

## Important Implementation Details

### Multi-Turn Conversation Flow
1. User types message in TipTap editor with optional math formulas
2. User clicks "发送" button (send button in editor toolbar)
3. Content extracted to plain text with LaTeX markers (`$...$` for inline, `$$...$$` for block)
4. `useAISolver.solve()` adds user message to active conversation
5. User message displayed in MessageBubble with LaTeX rendered via markdown-it + KaTeX
6. Creates empty assistant message for streaming
7. Full conversation history sent to API for context-aware response
8. AI response streams in real-time, updating assistant message
9. AI message rendered in MessageBubble component with Markdown + KaTeX
10. Editor automatically clears after successful send
11. Conversation auto-saves to localStorage

### Math Rendering Pipeline
1. User inputs math via MathLive widget (triggered by "插入公式" button)
2. LaTeX stored in MathNode's `data-latex` attribute
3. Content extracted to plain text with LaTeX markers (`$...$` for inline, `$$...$$` for block)
4. User message sent to API and displayed in MessageBubble with LaTeX rendered via markdown-it + KaTeX
5. AI response (Markdown + LaTeX) also rendered via markdown-it + KaTeX
6. Both user and AI messages displayed in MessageBubble component with proper styling
7. User messages have white text on blue background with adjusted KaTeX styling for readability
8. Special CSS rule hides extra `<br>` tags after `<section>` to prevent spacing issues with block math

### Conversation Management
- Each conversation has unique ID, auto-generated title, and message array
- Conversations sorted by last update time (newest first)
- Active conversation tracked globally via singleton state
- Users can switch between conversations without losing context
- Maximum 50 conversations stored, oldest removed when limit exceeded
- Individual messages can be copied or deleted
- Entire conversations can be deleted from conversation list

### Streaming Response Handling
- API responses use SSE format (`data: {...}\n\n`)
- Each chunk contains `content` and `reasoning` fields (both optional)
- Content and reasoning chunks accumulated separately in assistant message via `updateAssistantMessage()`
- UI updates reactively as chunks arrive via Vue's reactivity system
- ConversationPanel implements intelligent auto-scrolling with user scroll detection
- Handles `[DONE]` signal and incomplete buffer data
- On error, incomplete assistant message is deleted
- On success, conversation auto-saves to localStorage

### Smart Scrolling and Navigation
- **Intelligent Auto-Scroll**: Automatically scrolls to bottom during AI streaming responses
- **User Scroll Detection**: Detects when user manually scrolls up to read previous content
  - Uses 50px tolerance to determine if user is at bottom
  - Pauses auto-scrolling when user scrolls away from bottom
  - Resumes auto-scrolling when user scrolls back to bottom
- **Quick Navigation Buttons**: Fixed-position floating buttons for easy navigation
  - "Scroll to Top" button: Appears when scrolled down more than 200px
  - "Scroll to Bottom" button: Appears when not at bottom of conversation
  - Buttons fixed to panel (not scroll container) for consistent visibility
  - Smooth scroll animation on click
  - Clicking "Scroll to Bottom" re-enables auto-scrolling
  - Buttons automatically adjust position when error banner is visible
  - Responsive design: smaller buttons on mobile devices

### Reasoning Display (AI Thinking Process)
- Supported for models that provide `reasoning_content` or `reasoning` field (e.g., OpenAI o1/o3)
- MessageBubble component displays reasoning in a collapsible section above the answer
- Reasoning section is expanded by default, can be toggled by clicking the header
- Reasoning content rendered with Markdown + KaTeX, styled differently from answer content
- Real-time streaming: reasoning updates trigger auto-scroll to keep latest content visible
- Backward compatible: models without reasoning field display normally
- Data migration: old messages automatically get empty `reasoning` field on load

### Error Handling
- API errors parsed into user-friendly messages
- Network errors, timeouts, and rate limits handled gracefully
- Markdown rendering errors caught and displayed
- Failed messages removed from conversation to maintain clean state

## Node Version Requirement

This project requires Node.js version `^20.19.0 || >=22.12.0` as specified in package.json engines field.
