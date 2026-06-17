'use client'
import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { useStorefront } from '@/context/StorefrontContext'

export default function AIChat() {
    const { config } = useStorefront()
    const [open, setOpen] = useState(false)

    if (!config?.ai_chat_enabled) return null

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-24 md:bottom-8 right-6 z-50 size-14 bg-[var(--primary)] text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition"
                aria-label="Open chat"
            >
                <MessageCircle size={24} />
            </button>

            {/* Chat panel (placeholder) */}
            {open && (
                <div className="fixed bottom-24 md:bottom-28 right-6 z-50 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-[var(--primary)] text-white">
                        <p className="font-medium text-sm">Chat with us</p>
                        <button onClick={() => setOpen(false)}><X size={16} /></button>
                    </div>
                    <div className="p-4 h-64 flex items-center justify-center text-slate-400 text-sm">
                        <p>AI chat powered by Harvii</p>
                    </div>
                    <div className="px-4 py-3 border-t border-slate-100">
                        <input
                            className="w-full bg-slate-50 rounded-lg px-3 py-2 text-sm outline-none placeholder-slate-400"
                            placeholder="Type a message…"
                        />
                    </div>
                </div>
            )}
        </>
    )
}