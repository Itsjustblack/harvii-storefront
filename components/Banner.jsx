'use client'
import { useState } from 'react'
import { XIcon } from 'lucide-react'
import { useStorefront } from '@/context/StorefrontContext'

export default function Banner() {
    const { config } = useStorefront()
    const [isOpen, setIsOpen] = useState(true)

    if (!isOpen || !config?.announcement_active || !config?.announcement_text) return null

    return (
        <div className="w-full px-6 py-1.5 font-medium text-sm text-white text-center bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A]">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <p className="flex-1">{config.announcement_text}</p>
                <button
                    onClick={() => setIsOpen(false)}
                    className="ml-4 text-white/80 hover:text-white transition"
                    aria-label="Dismiss announcement"
                >
                    <XIcon size={14} />
                </button>
            </div>
        </div>
    )
}