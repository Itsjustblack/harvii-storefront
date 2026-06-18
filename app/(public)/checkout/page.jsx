'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { CheckCircle2 } from 'lucide-react'
import CheckoutProgress from '@/components/CheckoutProgress'
import PaymentInstructions from '@/components/PaymentInstructions'
import { useStorefront } from '@/context/StorefrontContext'
import { clearCart } from '@/lib/features/cart/cartSlice'
import {
    setStep,
    setToken,
    setCustomerInfo,
    setAddressInfo,
    setDelivery,
    setPromo,
    clearPromo,
    setPayment,
    resetCheckout,
} from '@/lib/features/checkout/checkoutSlice'
import {
    createCheckout,
    submitAddress,
    applyPromo,
    removePromo,
    confirmCheckout,
    getCheckoutStatus,
} from '@/lib/api'

const NIGERIAN_STATES = [
    'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
    'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
    'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
    'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
    'Yobe','Zamfara',
]

function InputField({ label, required, ...props }) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {label}{required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
                required={required}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--primary)] transition placeholder-slate-400"
                {...props}
            />
        </div>
    )
}

// ─── Step 1: Contact & Address ─────────────────────────────────────────────
function StepContact({ onNext }) {
    const dispatch = useDispatch()
    const { slug } = useStorefront()
    const { cartItems } = useSelector((s) => s.cart)
    const checkout = useSelector((s) => s.checkout)
    const [form, setForm] = useState({
        name: checkout.customerInfo.name || '',
        email: checkout.customerInfo.email || '',
        phone: checkout.customerInfo.phone || '',
        address: checkout.addressInfo.address || '',
        state: checkout.addressInfo.state || '',
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const cartArr = Object.entries(cartItems).map(([product_id, item]) => ({
                product_id,
                quantity: item.quantity,
                variants: item.variants || {},
            }))

            const { token } = await createCheckout(slug, {
                customer_name: form.name,
                email: form.email,
                phone: form.phone,
                cart_items: cartArr,
                currency: 'NGN',
            })

            const deliveryData = await submitAddress(slug, token, {
                address: form.address,
                state: form.state,
            })

            dispatch(setCustomerInfo({ name: form.name, email: form.email, phone: form.phone }))
            dispatch(setAddressInfo({ address: form.address, state: form.state }))
            dispatch(setToken({ token, expiresAt: null }))
            dispatch(setDelivery({
                fee: deliveryData.delivery_fee,
                item_total: deliveryData.item_total,
                total: deliveryData.total,
                discount_amount: deliveryData.discount_amount || 0,
            }))
            onNext()
        } catch (err) {
            toast.error(err.message || 'Something went wrong. Try again.')
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Contact & Delivery</h2>
            <InputField label="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
            <InputField label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
            <InputField label="Phone Number" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234 800 000 0000" />
            <InputField label="Street Address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main Street" />
            <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    State <span className="text-red-400">*</span>
                </label>
                <select
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--primary)] transition bg-white"
                >
                    <option value="">Select state…</option>
                    {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-medium text-sm hover:opacity-90 active:scale-95 transition disabled:opacity-60 mt-4"
            >
                {loading ? 'Processing…' : 'Continue to Review →'}
            </button>
        </form>
    )
}

// ─── Step 2: Review & Promo ────────────────────────────────────────────────
function StepReview({ onNext, onBack }) {
    const dispatch = useDispatch()
    const { slug } = useStorefront()
    const { cartItems } = useSelector((s) => s.cart)
    const { token, delivery, promo } = useSelector((s) => s.checkout)
    const [promoCode, setPromoCode] = useState(promo?.code || '')
    const [promoLoading, setPromoLoading] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const cartArr = Object.entries(cartItems).map(([product_id, item]) => ({ product_id, ...item }))
    const currentTotal = promo?.new_total ?? delivery.total

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return
        setPromoLoading(true)
        try {
            const data = await applyPromo(slug, token, promoCode.trim())
            dispatch(setPromo({ code: data.code, discount_amount: data.discount_amount, new_total: data.new_total }))
            toast.success(`Promo applied! Saved ₦${Number(data.discount_amount).toLocaleString()}`)
        } catch (err) {
            toast.error(err.message || 'Invalid promo code')
        }
        setPromoLoading(false)
    }

    const handleRemovePromo = async () => {
        setPromoLoading(true)
        try {
            await removePromo(slug, token)
            dispatch(clearPromo())
            setPromoCode('')
            toast.success('Promo removed')
        } catch {}
        setPromoLoading(false)
    }

    const handleConfirm = async () => {
        setConfirmLoading(true)
        try {
            const data = await confirmCheckout(slug, token)
            dispatch(setPayment({
                bank_account_number: data.bank_account_number,
                bank_name: data.bank_name,
                bank_account_name: data.bank_account_name,
                amount: currentTotal,
            }))
            if (data.effective_expires_at) {
                dispatch(setToken({ token, expiresAt: data.effective_expires_at }))
            }
            onNext()
        } catch (err) {
            toast.error(err.message || 'Failed to confirm order. Please try again.')
        }
        setConfirmLoading(false)
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Review Your Order</h2>

            {/* Items */}
            <div className="bg-slate-50 rounded-2xl overflow-hidden mb-6">
                {cartArr.map((item) => (
                    <div key={item.product_id} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0">
                        <div className="text-sm text-slate-800 flex-1">
                            <p className="font-medium">{item.name}</p>
                            {item.variants && Object.keys(item.variants).length > 0 && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                </p>
                            )}
                        </div>
                        <p className="text-xs text-slate-400">×{item.quantity}</p>
                        <p className="text-sm font-medium text-slate-800 shrink-0">
                            ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            {/* Promo code */}
            {!promo ? (
                <div className="flex gap-2 mb-5">
                    <input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Promo code"
                        className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] transition"
                    />
                    <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCode.trim()}
                        className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-900 transition disabled:opacity-50"
                    >
                        {promoLoading ? '…' : 'Apply'}
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
                    <p className="text-sm text-green-700">
                        Promo <strong>{promo.code}</strong> — saved ₦{Number(promo.discount_amount).toLocaleString()}
                    </p>
                    <button onClick={handleRemovePromo} disabled={promoLoading} className="text-xs text-red-400 hover:underline">Remove</button>
                </div>
            )}

            {/* Totals */}
            <div className="space-y-3 text-sm text-slate-600 bg-white border border-slate-100 rounded-2xl px-5 py-4 mb-6">
                <div className="flex justify-between">
                    <span>Items</span>
                    <span>₦{Number(delivery.item_total).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>₦{Number(delivery.fee).toLocaleString()}</span>
                </div>
                {promo && Number(promo.discount_amount) > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>−₦{Number(promo.discount_amount).toLocaleString()}</span>
                    </div>
                )}
                <hr className="border-slate-100" />
                <div className="flex justify-between font-semibold text-slate-800 text-base">
                    <span>Total</span>
                    <span>₦{Number(currentTotal).toLocaleString()}</span>
                </div>
            </div>

            <div className="flex gap-3">
                <button onClick={onBack} className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition">
                    ← Back
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={confirmLoading}
                    className="flex-1 py-4 bg-[var(--primary)] text-white rounded-xl font-medium text-sm hover:opacity-90 active:scale-95 transition disabled:opacity-60"
                >
                    {confirmLoading ? 'Confirming…' : 'Confirm Order →'}
                </button>
            </div>
        </div>
    )
}

// ─── Step 3: Payment ───────────────────────────────────────────────────────
function StepPayment() {
    const router = useRouter()
    const dispatch = useDispatch()
    const { slug } = useStorefront()
    const { token, payment, expiresAt, delivery, promo } = useSelector((s) => s.checkout)
    const total = promo?.new_total ?? delivery.total
    const [confirmed, setConfirmed] = useState(false)

    useEffect(() => {
        if (!slug || !token) return
        let cancelled = false

        const poll = async () => {
            try {
                const data = await getCheckoutStatus(slug, token)
                if (cancelled) return
                if (data.status === 'paid' || data.status === 'completed') {
                    setConfirmed(true)
                    setTimeout(() => {
                        if (!cancelled) {
                            dispatch(clearCart())
                            router.push(`/checkout/${token}`)
                        }
                    }, 2000)
                    return
                }
                if (!['failed', 'expired', 'cancelled'].includes(data.status)) {
                    setTimeout(poll, 10000)
                }
            } catch {}
        }

        const id = setTimeout(poll, 10000)
        return () => { cancelled = true; clearTimeout(id) }
    }, [slug, token, dispatch, router])

    const handleSent = () => {
        dispatch(clearCart())
        router.push(`/checkout/${token}`)
    }

    if (confirmed) {
        return (
            <div className="max-w-md mx-auto flex flex-col items-center justify-center py-20 gap-5 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Payment Confirmed!</h2>
                    <p className="text-sm text-slate-400 mt-1">Redirecting to your order…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Make Your Transfer</h2>
            <p className="text-sm text-slate-500 mb-8">Send the exact amount to the account below</p>
            <PaymentInstructions payment={payment} expiresAt={expiresAt} total={total} onConfirmed={handleSent} />
        </div>
    )
}

// ─── Checkout wizard ───────────────────────────────────────────────────────
export default function CheckoutPage() {
    const router = useRouter()
    const dispatch = useDispatch()
    const { cartItems, total: cartCount } = useSelector((s) => s.cart)
    const step = useSelector((s) => s.checkout.step)

    if (cartCount === 0 && step === 1) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400 gap-4">
                <p className="text-xl">Your cart is empty</p>
                <button onClick={() => router.push('/shop')} className="px-6 py-2 bg-[var(--primary)] text-white rounded-full text-sm hover:opacity-90 transition">
                    Go Shopping
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen mx-6 py-10">
            <div className="max-w-2xl mx-auto">
                <CheckoutProgress currentStep={step} />

                {step === 1 && <StepContact onNext={() => dispatch(setStep(2))} />}
                {step === 2 && <StepReview onNext={() => dispatch(setStep(3))} onBack={() => dispatch(setStep(1))} />}
                {step === 3 && <StepPayment />}
            </div>
        </div>
    )
}