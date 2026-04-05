import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@lib/supabase'
import { useAuth } from '@contexts/auth'

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
}

type ConversationMeta = {
  id: string
  other_name: string
}

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const { session } = useAuth()

  const [messages, setMessages] = useState<Message[]>([])
  const [meta, setMeta] = useState<ConversationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const myId = session?.user.id

  useEffect(() => {
    if (!conversationId || !myId) return

    async function load() {
      // Carrega conversa + nomes
      const { data: conv } = await supabase
        .from('conversations')
        .select('id, student_id, trainer_id, students(name, user_id), trainers(name, user_id)')
        .eq('id', conversationId)
        .single()

      if (!conv) { navigate(-1); return }

      const student = (conv as any).students
      const trainer = (conv as any).trainers
      const otherName = student.user_id === myId ? trainer.name : student.name
      setMeta({ id: conv.id, other_name: otherName })

      // Carrega mensagens
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      setMessages((msgs as Message[]) ?? [])
      setIsLoading(false)
    }

    load()

    // Realtime: mensagens do OUTRO lado chegam instantaneamente
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const incoming = payload.new as Message
        // Ignora se já está na lista (evita duplicata do optimistic update)
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev
          return [...prev, incoming]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, myId])

  // Scroll para última mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!text.trim() || !conversationId || !myId || isSending) return
    const content = text.trim()
    setText('')
    setIsSending(true)

    // Optimistic: aparece imediatamente sem esperar o realtime
    const tempId = `temp-${Date.now()}`
    setMessages((prev) => [...prev, {
      id: tempId,
      sender_id: myId,
      content,
      created_at: new Date().toISOString(),
    }])

    const { data: inserted } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: myId, content })
      .select('id, sender_id, content, created_at')
      .single()

    // Substitui o temp pelo ID real do banco
    if (inserted) {
      setMessages((prev) => prev.map((m) => m.id === tempId ? inserted : m))
    }

    setIsSending(false)
    inputRef.current?.focus()

    // Notifica o outro lado — fire and forget
    const { data: { session: s } } = await supabase.auth.getSession()
    supabase.functions.invoke('notify-chat-message', {
      body: { conversation_id: conversationId, sender_id: myId, content, app_url: window.location.origin },
      headers: s?.access_token ? { Authorization: `Bearer ${s.access_token}` } : undefined,
    }).catch(() => {})
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!session) {
    return (
      <div className="min-h-[100dvh] bg-tz-bg flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-tz-muted text-sm">Faça login para acessar o chat.</p>
        <button onClick={() => navigate('/aluno/login')} className="text-tz-gold underline text-sm">
          Entrar
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-tz-bg max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-tz-border bg-tz-surface shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="text-tz-muted hover:text-tz-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div className="flex-1">
          {meta ? (
            <>
              <p className="font-semibold text-tz-white text-sm">{meta.other_name}</p>
              <p className="text-xs text-tz-electric">online</p>
            </>
          ) : (
            <div className="h-4 w-24 bg-tz-surface-2 rounded animate-pulse" />
          )}
        </div>
        <div className="h-8 w-8 rounded bg-tz-gold flex items-center justify-center">
          <span className="text-tz-bg font-bold text-xs">TZ</span>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="h-6 w-6 border-2 border-tz-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center">
            <span className="text-4xl">💬</span>
            <p className="text-sm text-tz-muted">Nenhuma mensagem ainda.</p>
            <p className="text-xs text-tz-muted">Comece a conversa!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === myId
            const time = new Intl.DateTimeFormat('pt-BR', {
              hour: '2-digit', minute: '2-digit',
            }).format(new Date(msg.created_at))

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe
                    ? 'bg-tz-gold text-tz-bg rounded-br-sm'
                    : 'bg-tz-surface border border-tz-border text-tz-white rounded-bl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-2xs mt-1 ${isMe ? 'text-tz-bg/60' : 'text-tz-muted'} text-right`}>
                    {time}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t border-tz-border bg-tz-surface flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma mensagem..."
          rows={1}
          className="flex-1 bg-tz-surface-2 border border-tz-border rounded-2xl px-4 py-2.5 text-sm text-tz-white placeholder-tz-muted resize-none focus:outline-none focus:border-tz-gold/50 transition-colors max-h-32"
          style={{ overflowY: text.split('\n').length > 3 ? 'auto' : 'hidden' }}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || isSending}
          className="h-10 w-10 rounded-full bg-tz-gold flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity hover:bg-tz-gold/90"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="text-tz-bg -rotate-90 translate-x-0.5">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
