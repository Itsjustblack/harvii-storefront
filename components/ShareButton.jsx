'use client'
import { Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Native share sheet where the browser has one (phones); otherwise copy the link.
export default function ShareButton({ title, text, className = '' }) {
    const handleShare = async () => {
        const url = window.location.href
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url })
            } catch {
                // dismissed the share sheet — nothing to do
            }
            return
        }
        try {
            await navigator.clipboard.writeText(url)
            toast.success('Link copied')
        } catch {
            toast.error("Couldn't copy the link")
        }
    }

    return (
        <button
            type="button"
            onClick={handleShare}
            aria-label="Share this product"
            className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50 active:scale-95 ${className}`}
        >
            <Share2 size={18} />
        </button>
    )
}
