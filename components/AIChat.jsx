'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Loader2, AlertCircle } from 'lucide-react'
import { useStorefront } from '@/context/StorefrontContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hapi.xoroai.cloud'
const WS_URL = API_URL.replace(/^http/, 'ws')
const VISITOR_ID_KEY = 'harvii_visitor_id'
const PING_INTERVAL_MS = 30_000
const RECONNECT_BACKOFF_MS = [1000, 2000, 5000, 10000]

function ChatBubble({ message }) {
    const isCustomer = message.sender === 'customer'
    return (
        <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                    isCustomer
                        ? 'bg-[var(--primary)] text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-700 rounded-bl-sm'
                }`}
            >
                {message.text}
            </div>
        </div>
    )
}

export default function AIChat() {
    const { config } = useStorefront()
    const [open, setOpen] = useState(false)
    const [status, setStatus] = useState('idle') // idle | connecting | ready | unavailable | error
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)

    const wsRef = useRef(null)
    const tokenRef = useRef(null)
    const visitorIdRef = useRef(null)
    const refreshTimerRef = useRef(null)
    const pingIntervalRef = useRef(null)
    const reconnectAttemptRef = useRef(0)
    const messagesEndRef = useRef(null)
    const initializedRef = useRef(false)

    const merchantId = config?.merchant_id
    const storeName = config?.store_name || 'us'

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, scrollToBottom])

    const cleanup = useCallback(() => {
        clearTimeout(refreshTimerRef.current)
        clearInterval(pingIntervalRef.current)
        wsRef.current?.close()
        wsRef.current = null
    }, [])

    useEffect(() => () => cleanup(), [cleanup])

    const fetchToken = useCallback(async () => {
        const res = await fetch(`${API_URL}/channels/web/${merchantId}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitor_id: visitorIdRef.current }),
        })
        if (!res.ok) {
            if (res.status === 404) throw new Error('UNAVAILABLE')
            throw new Error(`Token error: ${res.status}`)
        }
        const data = await res.json()
        tokenRef.current = data.token
        visitorIdRef.current = data.visitor_id
        localStorage.setItem(VISITOR_ID_KEY, data.visitor_id)

        const refreshIn = Math.max((data.expires_in - 120) * 1000, 0)
        clearTimeout(refreshTimerRef.current)
        refreshTimerRef.current = setTimeout(refreshToken, refreshIn)
    }, [merchantId])

    const refreshToken = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/channels/web/${merchantId}/token/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: tokenRef.current }),
            })
            if (!res.ok) return
            const data = await res.json()
            tokenRef.current = data.token
            const refreshIn = Math.max((data.expires_in - 120) * 1000, 0)
            clearTimeout(refreshTimerRef.current)
            refreshTimerRef.current = setTimeout(refreshToken, refreshIn)
        } catch {
            // next reconnect will fetch a fresh token anyway
        }
    }, [merchantId])

    const connect = useCallback(() => {
        const ws = new WebSocket(`${WS_URL}/ws/web/${merchantId}`)
        wsRef.current = ws

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'auth', token: tokenRef.current }))
        }

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data)

            if (msg.type === 'auth_ok') {
                ws.send(JSON.stringify({ type: 'init' }))
                return
            }
            if (msg.type === 'init_ok') {
                reconnectAttemptRef.current = 0
                setStatus('ready')
                pingIntervalRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }))
                    }
                }, PING_INTERVAL_MS)
                if (msg.initial_response) {
                    setMessages((prev) => [...prev, { sender: 'store', text: msg.initial_response.text }])
                }
                return
            }
            if (msg.type === 'message') {
                setSending(false)
                setMessages((prev) => [...prev, { sender: 'store', text: msg.text }])
                return
            }
            if (msg.type === 'pong') return
            if (msg.type === 'error') {
                setSending(false)
                console.warn('[HarviiWidget]', msg.message)
            }
        }

        ws.onclose = (event) => {
            clearInterval(pingIntervalRef.current)
            if (event.code === 1008 && reconnectAttemptRef.current < RECONNECT_BACKOFF_MS.length) {
                const delay = RECONNECT_BACKOFF_MS[reconnectAttemptRef.current]
                reconnectAttemptRef.current += 1
                setTimeout(async () => {
                    try {
                        await fetchToken()
                        connect()
                    } catch {
                        setStatus('error')
                    }
                }, delay)
            } else if (event.code !== 1000) {
                setStatus((prev) => (prev === 'ready' ? 'error' : prev))
            }
        }
    }, [merchantId, fetchToken])

    const startSession = useCallback(async () => {
        if (initializedRef.current || !merchantId) return
        initializedRef.current = true
        visitorIdRef.current = localStorage.getItem(VISITOR_ID_KEY) || null
        setStatus('connecting')
        try {
            await fetchToken()
            connect()
        } catch (err) {
            setStatus(err.message === 'UNAVAILABLE' ? 'unavailable' : 'error')
            initializedRef.current = false
        }
    }, [merchantId, fetchToken, connect])

    useEffect(() => {
        if (open) startSession()
    }, [open, startSession])

    const handleSend = (e) => {
        e.preventDefault()
        const text = input.trim()
        if (!text || status !== 'ready' || wsRef.current?.readyState !== WebSocket.OPEN) return
        wsRef.current.send(JSON.stringify({ type: 'message', text }))
        setMessages((prev) => [...prev, { sender: 'customer', text }])
        setInput('')
        setSending(true)
    }

    if (!config?.ai_chat_enabled) return null

    return (
        <>
            <button
                onClick={() => setOpen((v) => !v)}
                className="fixed bottom-24 md:bottom-8 right-6 z-50 size-14 bg-[var(--primary)] text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition"
                aria-label={open ? 'Close chat' : 'Open chat'}
            >
                {open ? <X size={22} /> : <MessageCircle size={24} />}
            </button>

            {open && (
                <div className="fixed bottom-24 md:bottom-28 right-6 left-6 sm:left-auto z-50 sm:w-80 h-[28rem] max-h-[70vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 bg-[var(--primary)] text-white shrink-0">
                        <div>
                            <p className="font-medium text-sm">Chat with {storeName}</p>
                            {status === 'ready' && <p className="text-[11px] text-white/70">Usually replies in a few minutes</p>}
                        </div>
                        <button onClick={() => setOpen(false)} aria-label="Close chat">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {status === 'connecting' && (
                            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                                <Loader2 size={20} className="animate-spin" />
                                <p className="text-xs">Connecting…</p>
                            </div>
                        )}
                        {status === 'unavailable' && (
                            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400 text-center px-2">
                                <AlertCircle size={20} />
                                <p className="text-xs">Chat isn&apos;t set up for this store yet.</p>
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400 text-center px-2">
                                <AlertCircle size={20} />
                                <p className="text-xs">Couldn&apos;t connect. Please try again shortly.</p>
                            </div>
                        )}
                        {(status === 'ready' || messages.length > 0) && (
                            <>
                                {messages.length === 0 && (
                                    <p className="text-center text-xs text-slate-400 mt-2">
                                        Send a message and we&apos;ll get back to you.
                                    </p>
                                )}
                                {messages.map((m, i) => (
                                    <ChatBubble key={i} message={m} />
                                ))}
                                {sending && (
                                    <div className="flex justify-start">
                                        <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex gap-1">
                                            <span className="size-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <span className="size-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <span className="size-1.5 bg-slate-400 rounded-full animate-bounce" />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="px-3 py-3 border-t border-slate-100 flex items-center gap-2 shrink-0">
                        <input
                            className="flex-1 bg-slate-50 rounded-lg px-3 py-2 text-sm outline-none placeholder-slate-400 disabled:opacity-50"
                            placeholder="Type a message…"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={status !== 'ready'}
                        />
                        <button
                            type="submit"
                            disabled={status !== 'ready' || !input.trim()}
                            className="size-9 shrink-0 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 active:scale-95 transition"
                            aria-label="Send"
                        >
                            <Send size={15} />
                        </button>
                    </form>
                </div>
            )}
        </>
    )
}
