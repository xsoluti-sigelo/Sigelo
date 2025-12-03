'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  LinkIcon,
  CodeIcon,
  QuoteIcon,
} from 'lucide-react'
import { useCallback } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  maxLength?: number
  className?: string
  hideCharacterCount?: boolean
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Escreva seu comentário...',
  maxLength = 2000,
  className = '',
  hideCharacterCount = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
        dropcursor: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-teal-600 dark:text-teal-400 hover:underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const text = editor.getText()
      if (text.length <= maxLength) {
        onChange(html)
      }
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[60px] px-3 py-2 [&_*]:text-gray-900 dark:[&_*]:text-gray-100 [&_strong]:!font-bold [&_a]:!text-teal-600 dark:[&_a]:!text-teal-400',
      },
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL do link:', previousUrl)

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  const textLength = editor.getText().length
  const isOverLimit = textLength > maxLength

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 ${
            editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          title="Negrito"
          type="button"
        >
          <BoldIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 ${
            editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          title="Itálico"
          type="button"
        >
          <ItalicIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 ${
            editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          title="Código"
          type="button"
        >
          <CodeIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
            editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          title="Lista"
          type="button"
        >
          <ListIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
            editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          title="Lista Numerada"
          type="button"
        >
          <ListOrderedIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
            editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          title="Citação"
          type="button"
        >
          <QuoteIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        <button
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
            editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          title="Link"
          type="button"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Character Count */}
      {!hideCharacterCount && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 dark:border-gray-700">
          <span className={`text-xs ${isOverLimit ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
            {textLength}/{maxLength}
          </span>
        </div>
      )}
    </div>
  )
}
