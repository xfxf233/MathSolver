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
- `ConversationPanel.vue` - Main chat interface managing conversation display, new conversation creation, conversation list, smart scrolling with quick navigation buttons, and AI persona switching confirmation
- `MessageBubble.vue` - Individual message display component with copy/delete actions, renders both user and AI messages with Markdown + KaTeX support, includes collapsible reasoning section for AI thinking process, displays custom user nickname and AI persona nickname with color-coded borders, supports adjustable opacity for transparency effect
- `ConversationList.vue` - Sidebar for viewing and switching between conversations, includes semi-transparent overlay that closes the sidebar when clicked outside
- `SettingsDialog.vue` - Configuration dialog for user settings (nickname, background image, background opacity, message opacity), AI persona settings (select/create/edit/delete personas), and API settings, organized in sections, can only be closed via close button or cancel/save buttons (not by clicking outside)
- `PersonaEditor.vue` - Dialog for creating and editing AI personas with customizable name, nickname, avatar, color, tone (formal/casual/encouraging), and system prompt, includes preset templates for quick setup
- `PersonaSwitcher.vue` - Confirmation dialog shown when switching AI personas with an active conversation, offers options to apply to current conversation or only new conversations
- `ImageCropper.vue` - Interactive image cropper for adjusting background images with drag, zoom, and reset functionality
- `ResizeDivider.vue` - Draggable divider supporting both horizontal (desktop) and vertical (mobile) directions, with mouse and touch event support for adjusting panel sizes

### Composables (Shared Logic)

**`useSettings.js`** - Singleton pattern for application settings
- Manages user settings (nickname, background image, background opacity, message opacity), AI persona settings, and API settings (endpoint, key, model, temperature, maxTokens)
- Persists settings to localStorage under key `mathsolver_settings`
- Settings structure:
  - `user`: { nickname: '你', backgroundImage: '', backgroundOpacity: 0.3, messageOpacity: 0.95 }
  - `personas`: { activePersonaId: 'math-tutor', presets: [...], custom: [...] }
  - `api`: { endpoint, apiKey, model, temperature, maxTokens }
- Default API endpoint: `https://api.openai.com/v1/chat/completions`
- Default model: `gpt-4o-mini`
- Persona management functions:
  - `initializeDefaultPersonas()` - Initializes two default personas (数学导师, 学习伙伴)
  - `getActivePersona()` - Returns currently active persona object
  - `setActivePersona(id)` - Sets active persona by ID
  - `getAllPersonas()` - Returns all personas (presets + custom)
  - `createCustomPersona(persona)` - Creates new custom persona
  - `updateCustomPersona(id, updates)` - Updates existing custom persona
  - `deleteCustomPersona(id)` - Deletes custom persona
- Includes data migration logic for backward compatibility

**`useConversations.js`** - Conversation state management (singleton)
- Manages all conversation threads and active conversation state
- Stores up to 50 conversations in localStorage under key `mathsolver_conversations`
- Each conversation contains: id, title, messages array, personaId, model, createdAt, updatedAt
- Each message contains: id, role (user/assistant), content, reasoning (optional), timestamp
- The `reasoning` field stores AI model's thinking process (for models like o1/o3)
- The `personaId` field links conversation to the AI persona used
- Provides CRUD operations: createConversation, deleteConversation, setActiveConversation
- Message operations: addUserMessage, addAssistantMessage, updateAssistantMessage, deleteMessage
- Persona operations: updateConversationPersona (first time only), switchConversationPersona (allows multiple switches)
- Auto-generates conversation titles from first user message
- Clears old `mathsolver_history` data on first load
- Includes data migration logic to add `reasoning` field and `personaId` field to old messages/conversations

**`useAISolver.js`** - AI problem solving logic with conversation integration (singleton)
- Singleton pattern: shared state across all components
- Integrates with `useConversations` for multi-turn conversation support
- Integrates with `useSettings` to access API configuration and active AI persona
- Manages solving state (isSolving, error)
- Provides `solve()` and `stop()` methods
- Sends full conversation history to API for context-aware responses
- Uses active persona's system prompt for AI behavior customization
- Automatically updates conversation's personaId when solving
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
- `solveMath(messages, systemPrompt)` - Async generator accepting full message history array and custom system prompt, yielding structured objects with `content` and `reasoning` fields
- System prompt is now parameterized to support different AI personas
- Supports both `reasoning_content` (OpenAI o1/o3) and `reasoning` (other providers) fields
- `testConnection()` - Validates API configuration
- Parses SSE (Server-Sent Events) format responses

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
- Application settings (user + API) are shared across all components via `useSettings()` (singleton pattern)
- Conversation state is shared via `useConversations()` (singleton pattern)
- AI solving state is managed via `useAISolver()` (singleton pattern) which integrates with settings and conversations
- All settings and conversation data persist automatically to localStorage

### Data Persistence

All data is stored in browser localStorage:
- `mathsolver_settings` - User settings (nickname, backgroundImage, backgroundOpacity, messageOpacity), AI persona settings (activePersonaId, presets, custom), and API settings (endpoint, apiKey, model, temperature, maxTokens)
- `mathsolver_conversations` - All conversation threads with personaId linking (max 50 conversations)
- `mathsolver_active_conversation_id` - Currently active conversation ID
- `mathsolver_layout_width` - Desktop panel width percentage (20%-80%)
- `mathsolver_mobile_height` - Mobile top panel height percentage (20%-80%)

### Responsive Design

**Desktop Layout (≥769px):**
- Side-by-side panels with horizontal draggable divider
- Left panel: Math editor for input
- Right panel: Conversation display
- Divider can be dragged left/right to adjust panel widths (20%-80% range)
- Width preference persists via localStorage (`mathsolver_layout_width`)

**Mobile Layout (<768px):**
- Stacked vertical layout with vertical draggable divider
- Top panel: Conversation display (default 60% height)
- Bottom panel: Math editor for input (default 40% height)
- Divider can be dragged up/down to adjust panel heights (20%-80% range)
- Height preference persists via localStorage (`mathsolver_mobile_height`)
- Touch-optimized: larger touch area (12px) and visible handle for better discoverability

## Important Implementation Details

### Resizable Panel System

**ResizeDivider Component:**
- Supports two directions via `direction` prop: `horizontal` (left/right) and `vertical` (up/down)
- Handles both mouse events (desktop) and touch events (mobile)
- Emits `resize` event with percentage value (0-100)
- Enforces 20%-80% range to ensure both panels remain usable
- Visual feedback: changes color on hover and during drag
- Cursor automatically changes based on direction (col-resize / row-resize)

**Desktop Implementation:**
- Horizontal divider between left and right panels
- Mouse drag to adjust panel widths
- Default: 50% left, 50% right
- Persists to `mathsolver_layout_width`

**Mobile Implementation:**
- Vertical divider between top and bottom panels
- Touch drag to adjust panel heights
- Default: 60% top, 40% bottom
- Persists to `mathsolver_mobile_height`
- Enhanced touch experience:
  - Larger touch target (12px vs 8px)
  - Visible handle by default (60% opacity)
  - Prevents page scrolling during drag

### Multi-Turn Conversation Flow
1. User types message in TipTap editor with optional math formulas
2. User clicks "发送" button (send button in editor toolbar)
3. Content extracted to plain text with LaTeX markers (`$...$` for inline, `$$...$$` for block)
4. `useAISolver.solve()` retrieves active persona and adds user message to active conversation
5. User message displayed in MessageBubble with LaTeX rendered via markdown-it + KaTeX
6. Creates empty assistant message for streaming
7. Full conversation history sent to API with active persona's system prompt for context-aware response
8. Conversation's personaId updated to match active persona
9. AI response streams in real-time, updating assistant message
10. AI message rendered in MessageBubble component with Markdown + KaTeX, displaying persona nickname and color
11. Editor automatically clears after successful send
12. Conversation auto-saves to localStorage

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

### Background Image Customization
- **Image Upload**: Users can upload custom background images for the conversation panel
  - Supports JPG, PNG, GIF formats with 5MB size limit
  - File validation for type and size before processing
- **Interactive Cropper**: `ImageCropper.vue` component provides image adjustment tools
  - Canvas-based cropper with drag-to-reposition functionality
  - Mouse wheel and slider controls for zoom (10%-500%)
  - Reset button to restore initial fit
  - Adaptive canvas size: automatically calculates optimal dimensions based on viewport
  - Desktop: max 600x400px canvas, accounting for dialog overhead (~288px)
  - Mobile: max 500x350px canvas with responsive adjustments
  - Exports cropped image as base64 JPEG (90% quality)
- **Live Preview**: Real-time preview in settings dialog shows exact final appearance
  - Displays complete cropped image with correct aspect ratio (`object-fit: contain`)
  - Transparent overlay layer dynamically reflects opacity slider changes
  - Smooth 0.2s transition animation for opacity adjustments
  - Preview matches actual conversation panel rendering
- **Opacity Control**: Adjustable transparency slider (0-100%) for background images
- **Image Management**: Replace or delete background images from settings
- **Responsive Adaptation**: Background images adapt to panel resizing via ResizeDivider
- **Storage**: Cropped images stored as base64 in localStorage (`mathsolver_settings`)

### Message Transparency
- **Message Opacity Control**: Users can adjust the transparency of message bubbles to see through to the background
  - Adjustable via slider in settings dialog (50%-100% range)
  - Default opacity: 95% (slightly transparent)
  - Minimum 50% to ensure messages remain readable
  - Applies to both user messages (blue bubbles) and AI messages (white bubbles)
- **Implementation**: MessageBubble component reads `messageOpacity` from settings and applies it via inline style
  - Uses computed property `bubbleStyle` to dynamically bind opacity
  - CSS animation modified to not override opacity setting (removed `opacity: 1` from animation end state)
- **Use Case**: Allows users to enjoy custom background images while reading conversations
- **Persistence**: Setting saved to localStorage and persists across sessions

### UI Interaction Behavior

**Conversation List Sidebar:**
- **Opening**: Click the "对话列表" button in the toolbar to open the sidebar
- **Overlay**: Semi-transparent dark overlay (30% opacity) appears behind the sidebar
- **Closing Methods**:
  - Click anywhere on the overlay (outside the sidebar)
  - Click the close button (X icon) in the sidebar header
  - Select a conversation (automatically closes after selection)
- **Animation**: Sidebar slides in from the right with fade-in effect (0.3s)
- **Structure**: Uses wrapper with overlay layer and absolute-positioned sidebar panel
- **Z-index**: Set to 200 to appear above other content

**Settings Dialog:**
- **Opening**: Click the settings button in the application
- **Closing Methods**:
  - Click the close button (X icon) in the dialog header
  - Click the "取消" (Cancel) button
  - Click the "保存" (Save) button (automatically closes after saving)
- **Important**: Cannot be closed by clicking outside the dialog
- **Rationale**: Prevents accidental closure and loss of unsaved settings
- **Modal Behavior**: Full-screen overlay with centered dialog box

### AI Persona System

The application includes a comprehensive AI persona system that allows users to customize the AI's behavior, appearance, and communication style.

**Persona Structure:**
Each persona contains:
- `id` - Unique identifier (e.g., 'math-tutor', 'study-buddy')
- `name` - Display name (e.g., '数学导师')
- `nickname` - Short name shown in message bubbles (e.g., 'AI助手')
- `avatar` - Emoji or character representing the persona (e.g., '🎓')
- `color` - Theme color for message bubble borders (e.g., '#4a90e2')
- `tone` - Communication style: 'formal' (正式专业), 'casual' (轻松随和), or 'encouraging' (鼓励支持)
- `systemPrompt` - Custom system prompt that defines AI behavior
- `isCustom` - Boolean indicating if it's a user-created persona

**Default Personas:**
1. **数学导师 (Math Tutor)** - Formal, professional teaching style with structured explanations
2. **学习伙伴 (Study Buddy)** - Casual, friendly style with encouraging tone

**Persona Management:**
- Users can select from preset personas or create custom ones
- Custom personas can be edited and deleted
- Each conversation is linked to a specific persona via `personaId`
- When switching personas, users are prompted to choose:
  - Apply to current conversation (changes AI behavior immediately)
  - Only use for new conversations (keeps current conversation unchanged)

**PersonaEditor Component:**
- Full-featured dialog for creating/editing personas
- Form fields: name, nickname, avatar (emoji picker), color (color picker), tone selector
- System prompt editor with preset templates for quick setup
- Responsive design for mobile and desktop
- Validation to ensure all required fields are filled

**PersonaSwitcher Component:**
- Confirmation dialog shown when switching personas with an active conversation
- Displays old and new persona information for comparison
- Three action buttons:
  - Cancel - Keep current persona
  - Only for new conversations - Don't change current conversation
  - Apply to current conversation - Switch immediately

**Visual Integration:**
- AI message bubbles display persona nickname instead of generic "AI"
- Message bubble borders use persona's theme color
- Persona avatar and color shown in settings dialog
- Active persona highlighted in settings

**Data Persistence:**
- All personas stored in `mathsolver_settings` under `personas` key
- Preset personas cannot be deleted or modified
- Custom personas persist across sessions
- Backward compatibility: old conversations default to 'math-tutor' persona

### Error Handling
- API errors parsed into user-friendly messages
- Network errors, timeouts, and rate limits handled gracefully
- Markdown rendering errors caught and displayed
- Failed messages removed from conversation to maintain clean state

## Node Version Requirement

This project requires Node.js version `^20.19.0 || >=22.12.0` as specified in package.json engines field.
