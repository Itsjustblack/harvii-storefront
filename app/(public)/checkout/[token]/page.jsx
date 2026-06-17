'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import PaymentInstructions from '@/components/PaymentInstructions'
import { useStorefront } from '@/context/StorefrontContext'
import { getCheckoutStatus } from '@/lib/api'
import { clearCart } from '@/lib/features/cart/cartSlice'
import { resetCheckout } from '@/lib/features/checkout/checkoutSlice'

const TERMINAL_STATUSES = new Set(['paid', 'completed', 'failed', 'expired', 'cancelled'])

export default function PaymentStatusPage() {
    const { token } = useParams()
    const { slug } = useStorefront()
    const dispatch = useDispatch()
    const [status, setStatus] = useState(null)
    const [checkoutData, setCheckoutData] = useState(null)
    const [error, setError] = useState(null)

    const authToken = useSelector((s) => s.auth.token)
    const payment = useSelector((s) => s.checkout.payment)
    const expiresAt = useSelector((s) => s.checkout.expiresAt)
    const total = checkoutData?.total || 0

    useEffect(() => {

        let cancelled = false
        const poll = async () => {
            try {
                const data = await getCheckoutStatus(slug, token)
                if (cancelled) return
                setCheckoutData(data)
                setStatus(data.status)
                if (data.status === 'paid' || data.status === 'completed') {
                    // Persist to localStorage so account/track pages work without login
                    try {
                        const order = {
                            reference: data.order_reference,
                            email: data.customer_email,
                            total: data.total,
                            created_at: new Date().toISOString(),
                            status: 'paid',
                            delivery_status: 'pending',
                        }
                        const prev = JSON.parse(localStorage.getItem('harvii_orders') || '[]')
                        const deduped = prev.filter((o) => o.reference !== order.reference)
                        localStorage.setItem('harvii_orders', JSON.stringify([order, ...deduped].slice(0, 50)))
                    } catch {}
                    dispatch(clearCart())
                    dispatch(resetCheckout())
                }
                if (!TERMINAL_STATUSES.has(data.status)) {
                    setTimeout(poll, 10000)
                }
            } catch (err) {
                if (!cancelled) setError('Could not fetch order status.')
            }
        }
        poll()
        return () => { cancelled = true }
    }, [slug, token])

    if (error) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400 gap-4 mx-6">
                <p>{error}</p>
                <Link href="/" className="text-[var(--primary)] underline text-sm">Go home</Link>
            </div>
        )
    }

    if (status === 'paid' || status === 'completed') {
        const orderRef = checkoutData?.order_reference
        const email = checkoutData?.customer_email
        const trackParams = new URLSearchParams()
        if (orderRef) trackParams.set('ref', orderRef)
        if (email) trackParams.set('email', email)

        return (
            <div className="min-h-[70vh] mx-6 flex flex-col items-center justify-center text-center gap-6">
                <CheckCircle2 size={64} className="text-green-500" />
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Payment Confirmed!</h1>
                    <p className="text-slate-500 mt-2 text-sm max-w-sm">
                        Your order has been placed successfully. A confirmation has been sent to your email.
                    </p>
                </div>
                {orderRef && (
                    <div className="bg-slate-50 rounded-xl px-6 py-3 text-sm">
                        <p className="text-slate-400 text-xs mb-1">Order Reference</p>
                        <p className="font-mono font-semibold text-slate-800 text-lg">{orderRef}</p>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                    {orderRef && (
                        <Link href={`/track?${trackParams}`} className="flex-1 text-center py-3 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
                            View Order
                        </Link>
                    )}
                    {!authToken && (
                        <Link href="/account/login" className="flex-1 text-center py-3 bg-[var(--primary)] text-white rounded-xl text-sm hover:opacity-90 transition">
                            Create Account
                        </Link>
                    )}
                    <Link href="/shop" className="flex-1 text-center py-3 bg-[var(--primary)] text-white rounded-xl text-sm hover:opacity-90 transition">
                        Shop More
                    </Link>
                </div>
            </div>
        )
    }

    // Pending / processing
    return (
        <div className="min-h-[70vh] mx-6 py-12">
            <div className="max-w-md mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Loader2 size={20} className="text-[var(--primary)] animate-spin" />
                    <p className="text-slate-600 text-sm">Waiting for payment confirmation…</p>
                </div>

                {payment ? (
                    <PaymentInstructions
                        payment={payment}
                        expiresAt={expiresAt || checkoutData?.effective_expires_at}
                        total={checkoutData?.total || total}
                    />
                ) : checkoutData ? (
                    <PaymentInstructions
                        payment={{
                            bank_account_number: checkoutData.bank_account_number,
                            bank_name: checkoutData.bank_name,
                            bank_account_name: checkoutData.bank_account_name,
                        }}
                        expiresAt={checkoutData.effective_expires_at}
                        total={checkoutData.total}
                    />
                ) : (
                    <div className="flex justify-center py-12">
                        <Loader2 size={32} className="text-slate-300 animate-spin" />
                    </div>
                )}
            </div>
        </div>
    )
}