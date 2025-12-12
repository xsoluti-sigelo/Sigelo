'use client'

import { useState } from 'react'
import { Button, RichTextEditor } from '@/shared/ui'
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  TrashIcon,
  BookmarkIcon as BookmarkOutline,
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid'
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
  onTogglePin?: (commentId: string, isPinned: boolean) => Promise<void>
}

export function OperationComments({
  comments,
  userId,
  isAdmin,
  isSavingComment,
  onAddComment,
  onRemoveComment,
  onTogglePin,
}: OperationCommentsProps) {
  const [newComment, setNewComment] = useState('')
  const [removingCommentId, setRemovingCommentId] = useState<string | null>(null)
  const [pinningCommentId, setPinningCommentId] = useState<string | null>(null)

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

  const handleTogglePin = async (commentId: string, currentPinned: boolean) => {
    if (!onTogglePin) return
    setPinningCommentId(commentId)
    try {
      await onTogglePin(commentId, !currentPinned)
    } finally {
      setPinningCommentId(null)
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
              const isPinned = comment.is_pinned
              return (
                <div
                  key={comment.id}
                  className={`p-4 rounded-lg border ${
                    isPinned
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'
                      : 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800'
                  }`}
                >
                  {isPinned && (
                    <div className="flex items-center gap-1.5 mb-2 text-amber-600 dark:text-amber-400">
                      <BookmarkSolid className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Comentário fixado</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                      isPinned
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}>
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
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {formatRelativeTime(comment.created_at)}
                          </span>
                          {isAdmin && onTogglePin && (
                            <button
                              onClick={() => handleTogglePin(comment.id, isPinned)}
                              disabled={pinningCommentId === comment.id}
                              className={`p-1.5 rounded-md transition-colors disabled:opacity-50 ${
                                isPinned
                                  ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                                  : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                              }`}
                              title={isPinned ? 'Desafixar comentário' : 'Fixar comentário'}
                            >
                              {isPinned ? (
                                <BookmarkSolid className="w-4 h-4" />
                              ) : (
                                <BookmarkOutline className="w-4 h-4" />
                              )}
                            </button>
                          )}
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
