'use client'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { updateQuantity } from '@/lib/features/cart/cartSlice'

const Counter = ({ product_id }) => {
    const dispatch = useDispatch()
    const item = useSelector((s) => s.cart.cartItems[product_id])
    const quantity = item?.quantity || 0

    return (
        <div className="inline-flex items-center gap-3 border border-slate-200 rounded-full px-3 py-1.5">
            <button
                onClick={() => dispatch(updateQuantity({ product_id, delta: -1 }))}
                className="text-slate-600 hover:text-slate-900 active:scale-90 transition"
            >
                <MinusIcon size={14} />
            </button>
            <span className="w-5 text-center text-sm font-medium text-slate-800">{quantity}</span>
            <button
                onClick={() => dispatch(updateQuantity({ product_id, delta: 1 }))}
                className="text-slate-600 hover:text-slate-900 active:scale-90 transition"
            >
                <PlusIcon size={14} />
            </button>
        </div>
    )
}

export default Counter