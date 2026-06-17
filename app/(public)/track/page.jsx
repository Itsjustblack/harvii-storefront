'use client'
import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, MessageCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import OrderTracker from '@/components/OrderTracker'
import { useStorefront } from '@/context/StorefrontContext'
import { trackOrder } from '@/lib/api'

function normaliseWhatsApp(raw) {
    if (!raw) return null
    const digits = raw.replace(/\D/g, '')
    if (!digits) return null
    // Nigerian local format 08XXXXXXXXX → 2348XXXXXXXXX
    if (digits.startsWith('0') && digits.length === 11) {
        return `234${digits.slice(1)}`
    }
    // Already has country code
    return digits
}

function WhatsAppCTA({ ref: orderRef, config }) {
    const waRaw = config?.social_links?.whatsapp || config?.contact_phone
    const waNum = normaliseWhatsApp(waRaw)
    if (!waNum) return null
    const text = orderRef
        ? `Hi, I need help with my order. Reference: ${orderRef}`
        : 'Hi, I need help with my order.'
    const href = `https://wa.me/${waNum}?text=${encodeURIComponent(text)}`
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 border border-green-300 text-green-700 rounded-xl text-sm font-medium hover:bg-green-50 transition"
        >
            <MessageCircle size={16} />
            Contact support on WhatsApp
        </a>
    )
}

const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    paid: 'bg-green-100 text-green-700',
}

function OrderList({ orders, email, config }) {
    return (
        <div className="space-y-3">
            {orders.map((order) => {
                const status = order.delivery_status || order.status || 'pending'
                const colorClass = STATUS_COLORS[status] || 'bg-slate-100 text-slate-600'
                return (
                    <Link
                        key={order.reference}
                        href={`/track?ref=${order.reference}&email=${encodeURIComponent(email)}`}
                        className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:border-slate-300 hover:shadow-sm transition"
                    >
                        <div>
                            <p className="font-mono text-sm font-semibold text-slate-800">{order.reference}</p>
                            {order.created_at && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {new Date(order.created_at).toLocaleDateString('en-NG', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                    })}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${colorClass}`}>
                                {status}
                            </span>
                            {order.total != null && (
                                <span className="font-semibold text-slate-800 text-sm">
                                    ₦{Number(order.total).toLocaleString()}
                                </span>
                            )}
                            <ChevronRight size={16} className="text-slate-400" />
                        </div>
                    </Link>
                )
            })}
            <WhatsAppCTA ref={null} config={config} />
        </div>
    )
}

function TrackContent() {
    const { slug, config } = useStorefront()
    const searchParams = useSearchParams()

    const [email, setEmail] = useState(searchParams.get('email') || '')
    const [ref, setRef] = useState(searchParams.get('ref') || '')
    const [result, setResult] = useState(null) // { type: 'single'|'list', data }
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const doSearch = async (e, overrideEmail, overrideRef) => {
        if (e) e.preventDefault()
        const searchEmail = (overrideEmail ?? email).trim()
        const searchRef = (overrideRef ?? ref).trim()
        if (!searchEmail) return
        setLoading(true)
        setError(null)
        setResult(null)
        try {
            const data = await trackOrder(slug, { email: searchEmail, ref: searchRef || undefined })
            if (data.orders) {
                setResult({ type: 'list', data: data.orders })
            } else {
                setResult({ type: 'single', data })
            }
        } catch (err) {
            setError(
                err.message?.toLowerCase().includes('not found') || err.message?.includes('404')
                    ? 'No orders found for that email or reference.'
                    : 'Something went wrong. Please try again.'
            )
        }
        setLoading(false)
    }

    // Auto-submit when URL has email param
    useEffect(() => {
        const urlEmail = searchParams.get('email')
        const urlRef = searchParams.get('ref')
        if (urlEmail) {
            doSearch(null, urlEmail, urlRef)
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-[80vh] mx-6 py-12">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-semibold text-slate-800">Track Your Order</h1>
                    <p className="text-slate-500 text-sm mt-2">Enter your email to see all orders, or add a reference for details</p>
                </div>

                <form onSubmit={doSearch} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 mb-8">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--primary)] transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            Order Reference <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <input
                            value={ref}
                            onChange={(e) => setRef(e.target.value)}
                            placeholder="e.g. ORD-XXXX"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-[var(--primary)] transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Searching…' : <><Search size={15} /> Track Order</>}
                    </button>
                </form>

                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 mb-6 text-center">
                        {error}
                    </div>
                )}

                {result?.type === 'list' && (
                    <OrderList orders={result.data} email={email} config={config} />
                )}

                {result?.type === 'single' && (
                    <>
                        <OrderTracker order={result.data} />
                        <WhatsAppCTA ref={result.data?.reference} config={config} />
                    </>
                )}
            </div>
        </div>
    )
}

export default function TrackPage() {
    return (
        <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-slate-400">Loading…</div>}>
            <TrackContent />
        </Suspense>
    )
}
