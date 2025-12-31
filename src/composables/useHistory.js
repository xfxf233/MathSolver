/**
 * @deprecated This file is deprecated and replaced by useConversations.js
 * The new conversation system supports multi-turn conversations instead of single Q&A pairs.
 * This file is kept for reference only and should not be imported.
 */

import { ref } from 'vue'

const HISTORY_KEY = 'mathsolver_history'
const MAX_HISTORY_ITEMS = 50

export function useHistory() {
  const history = ref([])

  // 从localStorage加载历史记录
  const loadHistory = () => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      if (saved) {
        history.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载历史记录失败:', error)
      history.value = []
    }
  }

  // 保存历史记录到localStorage
  const saveHistory = () => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
    } catch (error) {
      console.error('保存历史记录失败:', error)
    }
  }

  // 添加新的历史记录
  const addHistory = (question, answer, model) => {
    const newItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      question,
      answer,
      model,
      timestamp: Date.now()
    }

    // 添加到数组开头
    history.value.unshift(newItem)

    // 限制历史记录数量
    if (history.value.length > MAX_HISTORY_ITEMS) {
      history.value = history.value.slice(0, MAX_HISTORY_ITEMS)
    }

    saveHistory()
    return newItem
  }

  // 删除单条历史记录
  const deleteHistory = (id) => {
    history.value = history.value.filter(item => item.id !== id)
    saveHistory()
  }

  // 清空所有历史记录
  const clearHistory = () => {
    history.value = []
    saveHistory()
  }

  // 根据ID获取历史记录
  const getHistoryById = (id) => {
    return history.value.find(item => item.id === id)
  }

  // 初始化时加载历史记录
  loadHistory()

  return {
    history,
    addHistory,
    deleteHistory,
    clearHistory,
    getHistoryById,
    loadHistory
  }
}
