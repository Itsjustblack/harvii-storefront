'use client'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, LogOut, ChevronRight, User } from 'lucide-react'
import { clearAuth } from '@/lib/features/auth/authSlice'
import { useStorefront } from '@/context/StorefrontContext'
import { getAccountOrders } from '@/lib/api'

const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    paid: 'bg-green-100 text-green-700',
}

function OrderList({ orders, email }) {
    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
                <Package size={48} className="text-slate-200" />
                <p className="text-lg font-medium text-slate-500">No orders yet</p>
                <Link href="/shop" className="px-6 py-2 bg-[var(--primary)] text-white rounded-full text-sm hover:opacity-90 transition">
                    Start Shopping
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {orders.map((order) => {
                const status = order.delivery_status || order.status || 'pending'
                const colorClass = STATUS_COLORS[status] || 'bg-slate-100 text-slate-600'
                const trackUrl = `/track?ref=${order.reference}${email ? `&email=${encodeURIComponent(email)}` : ''}`
                return (
                    <Link
                        key={order.reference}
                        href={trackUrl}
                        className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:border-slate-300 hover:shadow-sm transition"
                    >
                        <div>
                            <p className="font-mono text-sm font-semibold text-slate-800">{order.reference}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {order.created_at
                                    ? new Date(order.created_at).toLocaleDateString('en-NG', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                    })
                                    : '—'}
                            </p>
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
        </div>
    )
}

export default function AccountPage() {
    const router = useRouter()
    const dispatch = useDispatch()
    const { slug } = useStorefront()
    const { token, email } = useSelector((s) => s.auth)

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let localOrders = []
        try {
            localOrders = JSON.parse(localStorage.getItem('harvii_orders') || '[]')
        } catch {}

        if (token) {
            getAccountOrders(slug, token)
                .then((data) => {
                    const apiOrders = data.orders || []
                    const apiRefs = new Set(apiOrders.map((o) => o.reference))
                    const extra = localOrders.filter((o) => o.reference && !apiRefs.has(o.reference))
                    setOrders([...apiOrders, ...extra])
                })
                .catch(() => setOrders(localOrders))
                .finally(() => setLoading(false))
        } else {
            setOrders(localOrders)
            setLoading(false)
        }
    }, [token, slug])

    const handleLogout = () => {
        dispatch(clearAuth())
        router.push('/')
    }

    return (
        <div className="min-h-[80vh] mx-6 py-10">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">My Orders</h1>
                        {email && <p className="text-sm text-slate-400 mt-1">{email}</p>}
                    </div>
                    {token ? (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 transition"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    ) : (
                        <Link
                            href="/account/login"
                            className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
                        >
                            <User size={16} /> Sign in
                        </Link>
                    )}
                </div>

                {!token && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-4">
                        <p className="text-sm text-slate-500">Sign in to sync your orders across devices.</p>
                        <Link href="/account/login" className="shrink-0 text-sm text-[var(--primary)] font-medium hover:underline">
                            Sign in
                        </Link>
                    </div>
                )}

                {loading ? (
                    <div className="space-y-3">
                        {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="bg-slate-100 h-20 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <OrderList orders={orders} email={email} />
                )}
            </div>
        </div>
    )
}
