import { ref, computed } from 'vue'

// Singleton state
let conversationsState = null

/**
 * Composable for managing conversation state
 * Singleton pattern - all components share the same state
 */
export function useConversations() {
  if (!conversationsState) {
    // Initialize state
    const conversations = ref([])
    const activeConversationId = ref(null)

    // Computed active conversation
    const activeConversation = computed(() => {
      if (!activeConversationId.value) return null
      return conversations.value.find(c => c.id === activeConversationId.value)
    })

    /**
     * Generate unique ID
     */
    const generateId = () => {
      return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    /**
     * Generate conversation title from first message
     * @param {string} content - First user message content
     * @returns {string} - Truncated title (max 50 chars)
     */
    const generateTitle = (content) => {
      // Strip LaTeX markers and truncate
      let title = content
        .replace(/\$\$[\s\S]*?\$\$/g, '[公式]') // Block math
        .replace(/\$[^$]+\$/g, '[公式]')        // Inline math
        .replace(/\s+/g, ' ')                   // Normalize whitespace
        .trim()

      if (title.length > 50) {
        title = title.substring(0, 47) + '...'
      }

      return title || '新对话'
    }

    /**
     * Load conversations from localStorage
     */
    const loadConversations = () => {
      try {
        const stored = localStorage.getItem('mathsolver_conversations')
        if (stored) {
          const parsed = JSON.parse(stored)

          // Migrate old data: add reasoning field and personaId
          conversations.value = parsed.map(conv => ({
            ...conv,
            personaId: conv.personaId || 'math-tutor',  // Default to math-tutor for old conversations
            messages: conv.messages.map(msg => ({
              ...msg,
              reasoning: msg.reasoning || ''
            }))
          }))
        }

        const storedActiveId = localStorage.getItem('mathsolver_active_conversation_id')
        if (storedActiveId && conversations.value.find(c => c.id === storedActiveId)) {
          activeConversationId.value = storedActiveId
        }
      } catch (error) {
        console.error('Failed to load conversations:', error)
        conversations.value = []
        activeConversationId.value = null
      }
    }

    /**
     * Save conversations to localStorage
     */
    const saveConversations = () => {
      try {
        // Limit to 50 conversations
        if (conversations.value.length > 50) {
          // Sort by updatedAt and keep newest 50
          conversations.value = conversations.value
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, 50)
        }

        localStorage.setItem('mathsolver_conversations', JSON.stringify(conversations.value))

        if (activeConversationId.value) {
          localStorage.setItem('mathsolver_active_conversation_id', activeConversationId.value)
        } else {
          localStorage.removeItem('mathsolver_active_conversation_id')
        }
      } catch (error) {
        console.error('Failed to save conversations:', error)

        // Handle quota exceeded error
        if (error.name === 'QuotaExceededError') {
          // Remove oldest conversations until it fits
          while (conversations.value.length > 10) {
            conversations.value = conversations.value
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .slice(0, conversations.value.length - 5)

            try {
              localStorage.setItem('mathsolver_conversations', JSON.stringify(conversations.value))
              break
            } catch (e) {
              // Continue removing
            }
          }
        }
      }
    }

    /**
     * Create new conversation
     * @returns {string} - New conversation ID
     */
    const createConversation = () => {
      const newConversation = {
        id: generateId(),
        title: '新对话',
        messages: [],
        model: '',
        personaId: '',  // Will be set when first message is sent
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      conversations.value.push(newConversation)
      activeConversationId.value = newConversation.id
      saveConversations()

      return newConversation.id
    }

    /**
     * Delete conversation
     * @param {string} id - Conversation ID to delete
     */
    const deleteConversation = (id) => {
      const index = conversations.value.findIndex(c => c.id === id)
      if (index === -1) return

      conversations.value.splice(index, 1)

      // If deleted conversation was active, switch to another or create new
      if (activeConversationId.value === id) {
        if (conversations.value.length > 0) {
          activeConversationId.value = conversations.value[0].id
        } else {
          createConversation()
        }
      }

      saveConversations()
    }

    /**
     * Clear all conversations
     */
    const clearAllConversations = () => {
      conversations.value = []
      activeConversationId.value = null
      saveConversations()

      // Create a new conversation
      createConversation()
    }

    /**
     * Set active conversation
     * @param {string} id - Conversation ID to activate
     */
    const setActiveConversation = (id) => {
      const conversation = conversations.value.find(c => c.id === id)
      if (conversation) {
        activeConversationId.value = id
        saveConversations()
      }
    }

    /**
     * Get conversation by ID
     * @param {string} id - Conversation ID
     * @returns {Object|null} - Conversation object or null
     */
    const getConversationById = (id) => {
      return conversations.value.find(c => c.id === id) || null
    }

    /**
     * Add user message to active conversation
     * @param {string} content - Message content
     * @returns {string} - Message ID
     */
    const addUserMessage = (content) => {
      if (!activeConversation.value) {
        createConversation()
      }

      const message = {
        id: generateId(),
        role: 'user',
        content,
        reasoning: '',  // User messages don't have reasoning
        timestamp: Date.now()
      }

      activeConversation.value.messages.push(message)
      activeConversation.value.updatedAt = Date.now()

      // Update title if this is the first message
      if (activeConversation.value.messages.length === 1) {
        activeConversation.value.title = generateTitle(content)
      }

      saveConversations()
      return message.id
    }

    /**
     * Add assistant message to active conversation
     * @param {string|Object} contentOrObject - Message content (string) or object with content and reasoning
     * @returns {string} - Message ID
     */
    const addAssistantMessage = (contentOrObject = '') => {
      if (!activeConversation.value) {
        createConversation()
      }

      // Backward compatibility: support both string and object
      const content = typeof contentOrObject === 'string'
        ? contentOrObject
        : (contentOrObject?.content || '')
      const reasoning = typeof contentOrObject === 'object'
        ? (contentOrObject?.reasoning || '')
        : ''

      const message = {
        id: generateId(),
        role: 'assistant',
        content,
        reasoning,
        timestamp: Date.now()
      }

      activeConversation.value.messages.push(message)
      activeConversation.value.updatedAt = Date.now()
      saveConversations()

      return message.id
    }

    /**
     * Update assistant message content (for streaming)
     * @param {string} messageId - Message ID to update
     * @param {string|Object} contentOrObject - New content (string) or object with content and reasoning
     */
    const updateAssistantMessage = (messageId, contentOrObject) => {
      if (!activeConversation.value) return

      const message = activeConversation.value.messages.find(m => m.id === messageId)
      if (message && message.role === 'assistant') {
        // Backward compatibility: support both string and object
        if (typeof contentOrObject === 'string') {
          message.content = contentOrObject
          if (!message.reasoning) {
            message.reasoning = ''
          }
        } else {
          message.content = contentOrObject?.content || ''
          message.reasoning = contentOrObject?.reasoning || ''
        }
        activeConversation.value.updatedAt = Date.now()
        // Note: We don't save on every update during streaming to avoid performance issues
        // The final save will happen when streaming completes
      }
    }

    /**
     * Save current conversation state (call after streaming completes)
     */
    const saveCurrentConversation = () => {
      saveConversations()
    }

    /**
     * Delete message from active conversation
     * @param {string} messageId - Message ID to delete
     */
    const deleteMessage = (messageId) => {
      if (!activeConversation.value) return

      const index = activeConversation.value.messages.findIndex(m => m.id === messageId)
      if (index !== -1) {
        activeConversation.value.messages.splice(index, 1)
        activeConversation.value.updatedAt = Date.now()
        saveConversations()
      }
    }

    /**
     * Update conversation model
     * @param {string} model - Model name
     */
    const updateConversationModel = (model) => {
      if (activeConversation.value && !activeConversation.value.model) {
        activeConversation.value.model = model
        saveConversations()
      }
    }

    /**
     * Update conversation persona
     * @param {string} personaId - Persona ID
     */
    const updateConversationPersona = (personaId) => {
      if (activeConversation.value && !activeConversation.value.personaId) {
        activeConversation.value.personaId = personaId
        saveConversations()
      }
    }

    /**
     * Switch conversation persona (for existing conversations)
     * @param {string} personaId - New persona ID
     */
    const switchConversationPersona = (personaId) => {
      if (activeConversation.value) {
        activeConversation.value.personaId = personaId
        activeConversation.value.updatedAt = Date.now()
        saveConversations()
      }
    }

    // Load conversations on initialization
    loadConversations()

    // Store state
    conversationsState = {
      conversations,
      activeConversationId,
      activeConversation,
      createConversation,
      deleteConversation,
      clearAllConversations,
      setActiveConversation,
      getConversationById,
      addUserMessage,
      addAssistantMessage,
      updateAssistantMessage,
      saveCurrentConversation,
      deleteMessage,
      updateConversationModel,
      updateConversationPersona,
      switchConversationPersona,
      loadConversations,
      saveConversations
    }
  }

  return conversationsState
}
