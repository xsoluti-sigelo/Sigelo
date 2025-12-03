'use client'

import { useState } from 'react'
import { Button, RichTextEditor } from '@/shared/ui'
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import type { OperationComment } from '@/features/operations/model/types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface OperationCommentsProps {
  comments: OperationComment[]
  userId: string | null
  isAdmin: boolean
  isSavingComment: boolean
  onAddComment: (comment: string) => void
  onRemoveComment: (commentId: string) => Promise<void>
}

export function OperationComments({
  comments,
  userId,
  isAdmin,
  isSavingComment,
  onAddComment,
  onRemoveComment,
}: OperationCommentsProps) {
  const [newComment, setNewComment] = useState('')
  const [removingCommentId, setRemovingCommentId] = useState<string | null>(null)

  const formatRelativeTime = (value: string) =>
    formatDistanceToNow(new Date(value), { addSuffix: true, locale: ptBR })

  const getInitial = (name?: string | null) => name?.trim()?.charAt(0)?.toUpperCase() || 'S'

  const hasTextContent = (html: string) => {
    const textContent = html.replace(/<[^>]*>/g, '').trim()
    return textContent.length > 0
  }

  const handleAddComment = () => {
    if (hasTextContent(newComment)) {
      onAddComment(newComment)
      setNewComment('')
    }
  }

  const handleRemoveComment = async (commentId: string) => {
    setRemovingCommentId(commentId)
    try {
      await onRemoveComment(commentId)
    } finally {
      setRemovingCommentId(null)
    }
  }

  return (
    <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Observações e Comentários
          </h3>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
          <RichTextEditor
            content={newComment}
            onChange={setNewComment}
            placeholder="Adicione uma observação sobre esta operação..."
            maxLength={2000}
            hideCharacterCount={true}
          />
          <div className="p-4 flex items-center justify-between gap-3">
            <span className="text-xs text-gray-400">
              {newComment.replace(/<[^>]*>/g, '').length}/2000
            </span>
            <Button
              onClick={handleAddComment}
              isLoading={isSavingComment}
              size="sm"
              disabled={!hasTextContent(newComment)}
              className="flex items-center gap-2"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              Enviar
            </Button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {comments.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-950">
              Nenhum comentário ainda. Seja o primeiro a registrar uma observação.
            </div>
          ) : (
            comments.map((comment) => {
              const author = comment.users?.full_name || 'Usuário'
              const canRemove = isAdmin || comment.user_id === userId
              return (
                <div
                  key={comment.id}
                  className="p-4 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
                      {getInitial(comment.users?.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {author}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {comment.users?.email || 'Sem e-mail'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {formatRelativeTime(comment.created_at)}
                          </span>
                          {canRemove && (
                            <button
                              onClick={() => handleRemoveComment(comment.id)}
                              disabled={removingCommentId === comment.id}
                              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                              title="Remover comentário"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div
                        className="mt-2 prose prose-sm dark:prose-invert max-w-none [&_*]:text-gray-900 dark:[&_*]:text-gray-100 [&_strong]:!font-bold [&_a]:!text-teal-600 dark:[&_a]:!text-teal-400 [&_code]:!bg-gray-100 dark:[&_code]:!bg-gray-800"
                        dangerouslySetInnerHTML={{ __html: comment.comment_text }}
                      />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
