import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, MessageSquare } from 'lucide-react'
import { chatWithData } from '../api'

const SUGGESTIONS = [
  'What is the total revenue?',
  'Who is the top performer?',
  'What are the main trends?',
  'Which item has the lowest sales?',
]

export default function ChatTab({ files, language, analysisContext, samplesContext }) {
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isReady = files.length > 0 && !!analysisContext

  const send = async (override) => {
    const q = (override ?? input).trim()
    if (!q || loading || !isReady) return
    setMessages((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setLoading(true)
    try {
      const res = await chatWithData(q, analysisContext, samplesContext, language)
      setMessages((m) => [...m, { role: 'ai', text: res.data.answer }])
    } catch (e) {
      const err =
        e.code === 'ECONNABORTED'
          ? '⏱️ Request timed out. Try again.'
          : '⚠️ Cannot reach the backend. Make sure the server is running.'
      setMessages((m) => [...m, { role: 'ai', text: err }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 210px)', maxHeight: 720 }}>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">

        {/* Empty state */}
        {!messages.length && (
          <div className="flex flex-col items-center justify-center h-full gap-5 text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
              <MessageSquare size={22} className="text-slate-600" />
            </div>

            {!files.length ? (
              <p className="text-sm text-slate-600">Upload an Excel file first</p>
            ) : !analysisContext ? (
              <div className="flex items-center gap-2 text-sm text-violet-400">
                <Loader2 size={13} className="animate-spin" />
                Analyzing files…
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Ask anything about your data</p>
                  <p className="text-xs text-slate-600">Try one of the suggestions below</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs text-slate-400 hover:border-violet-500/30 hover:text-violet-300 hover:bg-violet-500/[0.05] transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2.5 fade-in ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-violet-500/20">
                <Bot size={12} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[76%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-br-sm shadow-lg shadow-violet-500/20'
                  : 'bg-white/[0.04] border border-white/[0.07] text-slate-200 rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                <User size={12} className="text-slate-400" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-2.5 fade-in">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
              <Bot size={12} className="text-white" />
            </div>
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl rounded-bl-sm px-4 py-3.5 flex items-center gap-1.5">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-violet-400 typing-dot"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder={
            !files.length      ? 'Upload a file first…'
            : !analysisContext ? 'Analyzing files…'
            : 'Ask about your data…'
          }
          disabled={!isReady || loading}
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-violet-500/40 focus:bg-violet-500/[0.03] transition-all disabled:opacity-40"
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || !isReady || loading}
          className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white disabled:opacity-30 hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
        >
          <Send size={15} />
        </button>
      </div>

    </div>
  )
}
