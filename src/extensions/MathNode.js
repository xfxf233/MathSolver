import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import MathNodeView from '../components/MathNodeView.vue'

export const MathNode = Node.create({
  name: 'mathNode',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: element => element.getAttribute('data-latex'),
        renderHTML: attributes => {
          return {
            'data-latex': attributes.latex,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math-node"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'math-node' }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(MathNodeView)
  },

  addCommands() {
    return {
      insertMathNode: () => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            latex: '',
          },
        })
      },
    }
  },
})
