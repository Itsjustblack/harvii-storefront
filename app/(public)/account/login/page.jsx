'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Mail, KeyRound, Loader2, ArrowLeft } from 'lucide-react'
import { setAuth } from '@/lib/features/auth/authSlice'
import { useStorefront } from '@/context/StorefrontContext'
import { requestOtp, verifyOtp } from '@/lib/api'

const isDev = process.env.NODE_ENV === 'development'

export default function LoginPage() {
    const router = useRouter()
    const dispatch = useDispatch()
    const { slug } = useStorefront()

    const [step, setStep] = useState('email') // 'email' | 'otp'
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)

    const sendCode = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await requestOtp(slug, email.trim())
            toast.success('Code sent — check your inbox')
            setStep('otp')
        } catch (err) {
            toast.error(err.message || 'Failed to send code. Try again.')
        }
        setLoading(false)
    }

    const verify = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const data = await verifyOtp(slug, email.trim(), code.trim())
            dispatch(setAuth({ token: data.access_token, email: data.email, account_id: data.account_id }))
            toast.success('Welcome!')
            router.push('/account')
        } catch (err) {
            toast.error(err.message || 'Invalid or expired code.')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-[80vh] mx-6 py-12">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-slate-800">Sign in</h1>
                    <p className="text-slate-400 text-sm mt-2">
                        {step === 'email'
                            ? 'Enter your email to receive a one-time code'
                            : `We sent a code to ${email}`}
                    </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    {step === 'email' ? (
                        <form onSubmit={sendCode} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                    Email Address <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        autoFocus
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[var(--primary)] transition"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                                {loading ? 'Sending…' : 'Send Code'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={verify} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                    One-Time Code <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        required
                                        autoFocus
                                        maxLength={8}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                        placeholder="00000"
                                        className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-mono tracking-widest outline-none focus:border-[var(--primary)] transition"
                                    />
                                </div>
                                {isDev && (
                                    <p className="text-xs text-slate-400 mt-1">Dev mode: enter 00000</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                                {loading ? 'Verifying…' : 'Continue'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition"
                            >
                                <ArrowLeft size={13} /> Use a different email
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={sendCode}
                                className="w-full text-sm text-[var(--primary)] hover:underline transition"
                            >
                                Resend code
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-sm text-slate-400 mt-6">
                    <Link href="/track" className="text-[var(--primary)] hover:underline">Track an order</Link> without signing in
                </p>
            </div>
        </div>
    )
}
