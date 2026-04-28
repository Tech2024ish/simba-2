import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { useLang } from '../context/LangContext.jsx'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `You are Simba AI, the friendly shopping assistant for Simba Supermarket — Rwanda's largest supermarket chain based in Kigali.

ABOUT SIMBA SUPERMARKET:
- 552+ products across 10 categories: Food Products, Alcoholic Drinks, Cosmetics & Personal Care, Baby Products, Kitchenware & Electronics, Cleaning & Sanitary, Kitchen Storage, General, Pet Care, Sports & Wellness
- 10 branches across Rwanda: City Center (Union Trade Centre, KN 4 Ave), KN 5 Road, KG 541, Remera, Kimironko, Nyamirambo, Gisozi, KK 35, Kicukiro, Gisenyi (Rubavu)
- Open daily 7:00 AM – 10:00 PM
- Payment methods: MTN MoMo, Airtel Money, Cash on Delivery, Credit/Debit Card
- Free delivery in Kigali
- Contact: info@simbasupermarket.rw | +250 700 000 000

YOUR ROLE:
- Help customers find products by describing what they need
- Answer questions about branches, hours, delivery, payments
- Suggest products based on customer needs
- Guide users through the shopping process
- Be warm, helpful, and concise (2-3 sentences max per reply)

LANGUAGE: Always respond in the SAME language the user writes in. If they write in Kinyarwanda, respond in Kinyarwanda. If French, respond in French. If English, respond in English.`

const WELCOME = {
  en: "Muraho! 👋 I'm Simba AI. How can I help you shop today?",
  fr: "Bonjour! 👋 Je suis Simba AI. Comment puis-je vous aider aujourd'hui?",
  rw: "Muraho! 👋 Ndi Simba AI. Nakugirira iki ubu?",
}

const PLACEHOLDER = {
  en: "Ask me anything...",
  fr: "Posez-moi une question...",
  rw: "Mbaza ikibazo...",
}

const TITLE = {
  en: "Simba AI Assistant",
  fr: "Assistant Simba AI",
  rw: "Umufasha wa Simba AI",
}

export default function AiAssistant() {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: WELCOME[lang] || WELCOME.en }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)

    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history.slice(-8),
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      })
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || '...'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Sorry, I couldn\'t connect. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-24 md:bottom-6 right-4 z-50 w-14 h-14 bg-simba-red text-white rounded-full shadow-lg shadow-red-900/40 flex items-center justify-center hover:bg-red-700 hover:scale-110 transition-all duration-200"
        aria-label="Open AI Assistant"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-44 md:bottom-24 right-4 z-50 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden"
          style={{ height: '460px' }}>

          {/* Header */}
          <div className="bg-simba-red px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span className="text-lg">🦁</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">{TITLE[lang] || TITLE.en}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <p className="text-white/80 text-xs">Online · Powered by Groq</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-simba-red' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  {msg.role === 'assistant'
                    ? <Bot className="w-4 h-4 text-white" />
                    : <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  }
                </div>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                    : 'bg-simba-red text-white rounded-tr-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-simba-red flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-3 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={PLACEHOLDER[lang] || PLACEHOLDER.en}
              disabled={loading}
              className="flex-1 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-simba-red/30 disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full bg-simba-red text-white flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-40 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
