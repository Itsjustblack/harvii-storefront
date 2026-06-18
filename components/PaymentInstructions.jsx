'use client'
import { useState, useEffect } from 'react'
import { Copy, CheckCheck, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

function useCountdown(expiresAt) {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        if (!expiresAt) return
        const tick = () => {
            const diff = new Date(expiresAt) - new Date()
            if (diff <= 0) { setTimeLeft('Expired'); return }
            const h = Math.floor(diff / 3600000)
            const m = Math.floor((diff % 3600000) / 60000)
            const s = Math.floor((diff % 60000) / 1000)
            const ss = s.toString().padStart(2, '0')
            setTimeLeft(h > 0 ? `${h}h ${m}m ${ss}s` : `${m}m ${ss}s`)
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [expiresAt])

    return timeLeft
}

export default function PaymentInstructions({ payment, expiresAt, total, onConfirmed }) {
    const [copied, setCopied] = useState(false)
    const timeLeft = useCountdown(expiresAt)

    const copyAccount = () => {
        navigator.clipboard.writeText(payment?.bank_account_number || '')
        setCopied(true)
        toast.success('Account number copied!')
        setTimeout(() => setCopied(false), 3000)
    }

    if (!payment) return null

    return (
        <div className="space-y-6">
            <div className="bg-slate-50 rounded-2xl p-6 text-center">
                <p className="text-sm text-slate-500 mb-1">Transfer exactly</p>
                <p className="text-4xl font-bold text-slate-800">
                    ₦{Number(total).toLocaleString()}
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Bank</span>
                    <span className="font-semibold text-slate-800">{payment.bank_name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Account Name</span>
                    <span className="font-semibold text-slate-800">{payment.bank_account_name}</span>
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-400 mb-0.5">Account Number</p>
                        <p className="text-2xl font-bold text-slate-800 tracking-widest">
                            {payment.bank_account_number}
                        </p>
                    </div>
                    <button
                        onClick={copyAccount}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition ${
                            copied
                                ? 'bg-green-100 text-green-600'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>

            {expiresAt && timeLeft && timeLeft !== 'Expired' && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-3">
                    <Clock size={16} />
                    <span>Account expires in <strong>{timeLeft}</strong></span>
                </div>
            )}

            {timeLeft === 'Expired' && (
                <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 text-center">
                    This virtual account has expired. Please start a new checkout.
                </div>
            )}

            <div className="text-xs text-slate-400 text-center px-4">
                After transferring, click below. We'll confirm your payment automatically.
            </div>

            {onConfirmed && (
                <button
                    onClick={onConfirmed}
                    className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-medium text-sm hover:opacity-90 active:scale-95 transition"
                >
                    I've sent the payment →
                </button>
            )}
        </div>
    )
}