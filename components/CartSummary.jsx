'use client'
import Link from 'next/link'

export default function CartSummary({ subtotal, itemCount }) {
    return (
        <div className="w-full lg:w-80 shrink-0 bg-slate-50 rounded-2xl p-6 h-fit">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    <span className="font-medium text-slate-800">₦{Number(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Delivery fee</span>
                    <span className="text-slate-400">Calculated at checkout</span>
                </div>
            </div>

            <hr className="my-5 border-slate-200" />

            <div className="flex justify-between font-semibold text-slate-800 text-base">
                <span>Total</span>
                <span>₦{Number(subtotal).toLocaleString()}</span>
            </div>

            <Link
                href="/checkout"
                className="w-full mt-6 block text-center bg-[var(--primary)] text-white py-3.5 rounded-xl text-sm font-medium hover:opacity-90 active:scale-95 transition"
            >
                Proceed to Checkout →
            </Link>

            <Link
                href="/shop"
                className="w-full mt-3 block text-center text-slate-500 text-sm py-2 hover:underline transition"
            >
                Continue Shopping
            </Link>
        </div>
    )
}