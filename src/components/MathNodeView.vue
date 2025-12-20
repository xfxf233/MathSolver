<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  updateAttributes: {
    type: Function,
    required: true,
  },
  editor: {
    type: Object,
    required: true,
  },
  getPos: {
    type: Function,
    required: true,
  },
})

const isEditing = ref(false)
const mathContainer = ref(null)
const mathfieldRef = ref(null)
let mathfieldInstance = null
let blurTimeout = null
let virtualKeyboardClickHandler = null

// 渲染 KaTeX 公式
const renderKatex = () => {
  if (mathContainer.value && !isEditing.value) {
    try {
      const latex = props.node.attrs.latex || ''
      if (latex) {
        katex.render(latex, mathContainer.value, {
          throwOnError: false,
          displayMode: false,
        })
      } else {
        mathContainer.value.textContent = '\\placeholder'
        mathContainer.value.style.color = '#999'
      }
    } catch (error) {
      console.error('KaTeX rendering error:', error)
      mathContainer.value.textContent = props.node.attrs.latex
    }
  }
}

// 处理失焦事件（延迟处理以避免虚拟键盘交互时失焦）
const handleBlur = () => {
  // 清除之前的延迟
  if (blurTimeout) {
    clearTimeout(blurTimeout)
  }

  // 延迟 100ms 检查焦点是否真的离开
  blurTimeout = setTimeout(() => {
    // 检查焦点是否还在 mathfield 上
    if (mathfieldInstance && document.activeElement !== mathfieldInstance) {
      exitEditMode()
    }
  }, 100)
}

// 处理聚焦事件（取消延迟的失焦处理）
const handleFocus = () => {
  // 如果重新获得焦点，取消退出编辑模式
  if (blurTimeout) {
    clearTimeout(blurTimeout)
    blurTimeout = null
  }

  // 确保编辑器重新获得焦点和光标
  if (mathfieldInstance) {
    // 使用 nextTick 确保在下一个事件循环中执行
    nextTick(() => {
      if (mathfieldInstance) {
        mathfieldInstance.focus()
      }
    })
  }
}

// 处理键盘事件
const handleKeyDown = (event) => {
  // 按回车键退出编辑模式
  if (event.key === 'Enter') {
    event.preventDefault()
    exitEditMode()
  }
}

// 进入编辑模式
const enterEditMode = async () => {
  isEditing.value = true

  await nextTick()

  if (mathfieldRef.value) {
    // 动态导入 MathLive
    const { MathfieldElement } = await import('mathlive')

    // 创建 MathLive 实例
    mathfieldInstance = new MathfieldElement({
      defaultMode: 'math',
      mathVirtualKeyboardPolicy: 'manual', // 手动控制虚拟键盘
    })

    // 设置初始值
    mathfieldInstance.value = props.node.attrs.latex || ''

    // 添加到 DOM
    mathfieldRef.value.appendChild(mathfieldInstance)

    // 自动聚焦
    mathfieldInstance.focus()

    // 显示虚拟键盘
    if (window.mathVirtualKeyboard) {
      window.mathVirtualKeyboard.show()
    }

    // 监听失焦事件（支持桌面端和移动端）
    mathfieldInstance.addEventListener('blur', handleBlur)

    // 监听聚焦事件（取消延迟的失焦处理）
    mathfieldInstance.addEventListener('focus', handleFocus)

    // 监听键盘事件
    mathfieldInstance.addEventListener('keydown', handleKeyDown)

    // 延迟设置虚拟键盘监听器，等待虚拟键盘渲染
    setTimeout(() => {
      setupVirtualKeyboardListener()
    }, 100)
  }
}

// 设置虚拟键盘监听器
const setupVirtualKeyboardListener = () => {
  // 查找虚拟键盘容器
  const virtualKeyboard = document.querySelector('.ML__keyboard')
  if (virtualKeyboard && !virtualKeyboardClickHandler) {
    virtualKeyboardClickHandler = (e) => {
      // 检查点击的是否是键盘按钮，而不是菜单或其他控制元素
      const target = e.target
      const isKeyButton = target.closest('.MLK__keycap, .MLK__action, .MLK__shift, .MLK__tex')
      const isMenuButton = target.closest('.MLK__menu-toggle, .MLK__menu')

      // 只在点击键盘按钮时重新聚焦，避免影响菜单交互
      if (isKeyButton && !isMenuButton) {
        setTimeout(() => {
          if (mathfieldInstance && isEditing.value) {
            mathfieldInstance.focus()
          }
        }, 10)
      }
    }
    virtualKeyboard.addEventListener('click', virtualKeyboardClickHandler, true)
  }
}

// 退出编辑模式
const exitEditMode = () => {
  // 清除延迟定时器
  if (blurTimeout) {
    clearTimeout(blurTimeout)
    blurTimeout = null
  }

  // 隐藏虚拟键盘
  if (window.mathVirtualKeyboard) {
    window.mathVirtualKeyboard.hide()
  }

  // 清理虚拟键盘监听器
  if (virtualKeyboardClickHandler) {
    const virtualKeyboard = document.querySelector('.ML__keyboard')
    if (virtualKeyboard) {
      virtualKeyboard.removeEventListener('click', virtualKeyboardClickHandler, true)
    }
    virtualKeyboardClickHandler = null
  }

  if (mathfieldInstance) {
    // 获取最新的 LaTeX
    const newLatex = mathfieldInstance.value

    // 更新节点属性
    props.updateAttributes({
      latex: newLatex,
    })

    // 移除事件监听
    mathfieldInstance.removeEventListener('blur', handleBlur)
    mathfieldInstance.removeEventListener('focus', handleFocus)
    mathfieldInstance.removeEventListener('keydown', handleKeyDown)

    // 销毁实例
    if (mathfieldRef.value && mathfieldInstance.parentNode) {
      mathfieldRef.value.removeChild(mathfieldInstance)
    }
    mathfieldInstance = null
  }

  isEditing.value = false

  // 重新渲染 KaTeX
  nextTick(() => {
    renderKatex()
  })
}

// 点击浏览状态的公式进入编辑模式
const handleClick = () => {
  if (!isEditing.value) {
    enterEditMode()
  }
}

// 处理触摸事件（移动端支持）
const handleTouchStart = () => {
  if (!isEditing.value) {
    enterEditMode()
  }
}

// 监听 latex 变化
watch(() => props.node.attrs.latex, () => {
  if (!isEditing.value) {
    renderKatex()
  }
})

onMounted(() => {
  // 如果是新插入的空节点，直接进入编辑模式
  if (!props.node.attrs.latex) {
    enterEditMode()
  } else {
    renderKatex()
  }
})

onBeforeUnmount(() => {
  // 清除延迟定时器
  if (blurTimeout) {
    clearTimeout(blurTimeout)
    blurTimeout = null
  }

  // 清理虚拟键盘监听器
  if (virtualKeyboardClickHandler) {
    const virtualKeyboard = document.querySelector('.ML__keyboard')
    if (virtualKeyboard) {
      virtualKeyboard.removeEventListener('click', virtualKeyboardClickHandler, true)
    }
    virtualKeyboardClickHandler = null
  }

  if (mathfieldInstance) {
    mathfieldInstance.removeEventListener('blur', handleBlur)
    mathfieldInstance.removeEventListener('focus', handleFocus)
    mathfieldInstance.removeEventListener('keydown', handleKeyDown)
    mathfieldInstance = null
  }
})
</script>

<template>
  <NodeViewWrapper as="span" class="math-node-wrapper">
    <span
      v-if="!isEditing"
      ref="mathContainer"
      class="math-display"
      @click="handleClick"
      @touchstart.passive="handleTouchStart"
    ></span>
    <span
      v-else
      ref="mathfieldRef"
      class="math-editor"
    ></span>
  </NodeViewWrapper>
</template>

<style scoped>
.math-node-wrapper {
  display: inline-block;
  vertical-align: middle;
  margin: 0 2px;
}

.math-display {
  display: inline-block;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.math-display:hover {
  background-color: #f0f0f0;
}

.math-editor {
  display: inline-block;
  min-width: 100px;
}

/* MathLive 样式调整 */
.math-editor :deep(math-field) {
  display: inline-block;
  border: 1px solid #4a90e2;
  border-radius: 3px;
  padding: 2px 4px;
  font-size: 16px;
}
</style>
