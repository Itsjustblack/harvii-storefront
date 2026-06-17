'use client'

const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
}

const PAYMENT_COLORS = {
    pending: 'bg-slate-100 text-slate-600',
    paid: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-orange-100 text-orange-700',
}

function Badge({ label, colorClass }) {
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${colorClass}`}>
            {label}
        </span>
    )
}

export default function OrderTracker({ order }) {
    if (!order) return null

    const deliveryColor = STATUS_COLORS[order.delivery_status] || 'bg-slate-100 text-slate-600'
    const paymentColor = PAYMENT_COLORS[order.payment_status] || 'bg-slate-100 text-slate-600'

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Order Reference</p>
                        <p className="font-mono font-semibold text-slate-800 text-lg">{order.reference}</p>
                    </div>
                    <div className="flex gap-2">
                        <Badge label={order.delivery_status} colorClass={deliveryColor} />
                        <Badge label={`Payment: ${order.payment_status}`} colorClass={paymentColor} />
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="px-6 py-5 space-y-4 text-sm">
                {order.created_at && (
                    <div className="flex justify-between text-slate-500">
                        <span>Order placed</span>
                        <span>{new Date(order.created_at).toLocaleDateString('en-NG', {
                            day: 'numeric', month: 'short', year: 'numeric'
                        })}</span>
                    </div>
                )}
                {order.paid_at && (
                    <div className="flex justify-between text-slate-500">
                        <span>Paid on</span>
                        <span>{new Date(order.paid_at).toLocaleDateString('en-NG', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}</span>
                    </div>
                )}

                <hr className="border-slate-100" />

                {order.item_total != null && (
                    <div className="flex justify-between text-slate-600">
                        <span>Items total</span>
                        <span>₦{Number(order.item_total || 0).toLocaleString()}</span>
                    </div>
                )}
                {Number(order.delivery_fee) > 0 && (
                    <div className="flex justify-between text-slate-600">
                        <span>Delivery fee</span>
                        <span>₦{Number(order.delivery_fee).toLocaleString()}</span>
                    </div>
                )}
                {order.promo_code && Number(order.discount_amount) > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Promo ({order.promo_code})</span>
                        <span>−₦{Number(order.discount_amount).toLocaleString()}</span>
                    </div>
                )}

                <hr className="border-slate-100" />

                <div className="flex justify-between font-semibold text-slate-800 text-base">
                    <span>Total</span>
                    <span>₦{Number(order.total || 0).toLocaleString()}</span>
                </div>
            </div>
        </div>
    )
}