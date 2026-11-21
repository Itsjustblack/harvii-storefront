'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Mail, KeyRound, Loader2, ArrowLeft } from 'lucide-react'
import { setAuth } from '@/lib/features/auth/authSlice'
import { useStorefront } from '@/context/StorefrontContext'
import { exchangeGoogleCode, googleEnabled, googleStartUrl, requestOtp, verifyOtp } from '@/lib/api'

const isDev = process.env.NODE_ENV === 'development'

// Google refuses to sign people in inside apps' built-in browsers (Instagram, WhatsApp, Facebook, TikTok...).
const inAppBrowser = () => typeof navigator !== 'undefined'
    && (/Instagram|FBAN|FBAV|FB_IAB|FBIOS|WhatsApp|Line\/|Snapchat|TikTok|Twitter|LinkedInApp|Telegram/i.test(navigator.userAgent)
        || (/Android/i.test(navigator.userAgent) && /; wv\)/.test(navigator.userAgent)))

function GoogleMark() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
        </svg>
    )
}

export default function LoginPage() {
    const router = useRouter()
    const dispatch = useDispatch()
    const { slug } = useStorefront()

    const [step, setStep] = useState('email') // 'email' | 'otp'
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [google, setGoogle] = useState(false)
    const [inApp, setInApp] = useState(false)
    const [googleBusy, setGoogleBusy] = useState(false)
    const handled = useRef(false)

    // Show Google only when it's switched on, and finish the sign-in when Google sends the shopper back here.
    useEffect(() => {
        setInApp(inAppBrowser())
        googleEnabled().then(setGoogle)
        if (handled.current) return
        handled.current = true
        const params = new URLSearchParams(window.location.search)
        const googleCode = params.get('google_code')
        const googleError = params.get('google_error')
        if (googleCode || googleError) window.history.replaceState(null, '', window.location.pathname)
        if (googleError) toast.error(googleError)
        if (googleCode && slug) {
            setGoogleBusy(true)
            exchangeGoogleCode(slug, googleCode)
                .then((data) => {
                    dispatch(setAuth({ token: data.access_token, email: data.email, account_id: data.account_id }))
                    toast.success('Welcome!')
                    router.replace('/account')
                })
                .catch((err) => { toast.error(err.message || 'Google sign-in didn\u2019t complete. Please try again.'); setGoogleBusy(false) })
        }
    }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

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
                    {step === 'email' && google && (
                        inApp ? (
                            <p className="text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl p-3 mb-4">
                                To continue with Google, open this page in Chrome or Safari. Google doesn&apos;t allow sign-in inside this app.
                            </p>
                        ) : (
                            <a
                                href={googleStartUrl(slug)}
                                onClick={() => setGoogleBusy(true)}
                                className="w-full mb-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2.5"
                            >
                                {googleBusy ? <Loader2 size={16} className="animate-spin" /> : <GoogleMark />}
                                {googleBusy ? 'Signing you in…' : 'Continue with Google'}
                            </a>
                        )
                    )}
                    {step === 'email' && google && (
                        <div className="flex items-center gap-3 mb-4 text-[11px] uppercase tracking-wider text-slate-400">
                            <span className="flex-1 h-px bg-slate-200" />or<span className="flex-1 h-px bg-slate-200" />
                        </div>
                    )}
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
