import { useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface UseChatReturn {
  messages: ChatMessage[]
  sending: boolean
  send: (content: string, instanceId: string) => Promise<void>
  clearMessages: () => void
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sending, setSending] = useState(false)
  const conversationIdRef = useRef<string | undefined>(undefined)

  const send = useCallback(
    async (content: string, instanceId: string) => {
      if (!content.trim() || sending) return

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, userMsg])
      setSending(true)

      try {
        const result = await window.multiclaw.chat.send({
          content,
          instanceId,
          conversationId: conversationIdRef.current,
        })
        conversationIdRef.current = result.conversationId
        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: result.error ? `Error: ${result.error}` : result.response,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, assistantMsg])
      } catch (err) {
        const errMsg: ChatMessage = {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: 'Failed to send message. Is the instance running?',
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, errMsg])
      } finally {
        setSending(false)
      }
    },
    [sending],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    conversationIdRef.current = undefined
  }, [])

  return { messages, sending, send, clearMessages }
}
