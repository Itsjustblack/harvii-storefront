'use client'
import { useSelector, useDispatch } from 'react-redux'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2Icon } from 'lucide-react'
import Counter from '@/components/Counter'
import CartSummary from '@/components/CartSummary'
import OthersAlsoBought from '@/components/OthersAlsoBought'
import { deleteItemFromCart } from '@/lib/features/cart/cartSlice'

export default function Cart() {
    const dispatch = useDispatch()
    const { cartItems, total } = useSelector((s) => s.cart)

    const cartArray = Object.entries(cartItems).map(([product_id, item]) => ({
        product_id,
        ...item,
    }))

    const subtotal = cartArray.reduce((sum, item) => sum + item.price * item.quantity, 0)

    if (cartArray.length === 0) {
        return (
            <div className="min-h-[80vh] mx-6 flex flex-col items-center justify-center text-slate-400 gap-4">
                <p className="text-5xl">🛒</p>
                <h1 className="text-2xl font-semibold text-slate-500">Your cart is empty</h1>
                <Link href="/shop" className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-full text-sm hover:opacity-90 transition">
                    Start Shopping
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto py-8">
                <h1 className="text-2xl font-semibold mb-8">
                    My Cart <span className="text-slate-400 font-normal text-lg">({total})</span>
                </h1>

                <div className="flex items-start justify-between gap-8 max-lg:flex-col">
                    {/* Cart items table */}
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-slate-600 text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left pb-4 font-medium text-slate-500">Product</th>
                                    <th className="pb-4 font-medium text-slate-500">Quantity</th>
                                    <th className="pb-4 font-medium text-slate-500">Total</th>
                                    <th className="pb-4 max-md:hidden" />
                                </tr>
                            </thead>
                            <tbody>
                                {cartArray.map((item) => (
                                    <tr key={item.product_id} className="border-b border-slate-50">
                                        <td className="py-5">
                                            <div className="flex gap-4 items-center">
                                                <div className="bg-slate-100 rounded-xl flex items-center justify-center size-16 shrink-0">
                                                    {item.image_url ? (
                                                        <Image
                                                            src={item.image_url}
                                                            alt={item.name}
                                                            width={56}
                                                            height={56}
                                                            className="object-contain w-full h-full rounded-xl"
                                                        />
                                                    ) : (
                                                        <div className="text-slate-300 text-xs">img</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <Link href={`/product/${item.product_id}`} className="font-medium text-slate-800 hover:underline line-clamp-2 max-w-48">
                                                        {item.name}
                                                    </Link>
                                                    <p className="text-slate-400 text-xs mt-0.5">₦{Number(item.price).toLocaleString()} each</p>
                                                    {item.variants && Object.keys(item.variants).length > 0 && (
                                                        <p className="text-slate-400 text-xs mt-0.5">
                                                            {Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 text-center">
                                            <div className="flex justify-center">
                                                <Counter product_id={item.product_id} />
                                            </div>
                                        </td>
                                        <td className="py-5 text-center font-medium text-slate-800">
                                            ₦{(item.price * item.quantity).toLocaleString()}
                                        </td>
                                        <td className="py-5 text-center max-md:hidden">
                                            <button
                                                onClick={() => dispatch(deleteItemFromCart({ product_id: item.product_id }))}
                                                className="text-red-400 hover:bg-red-50 p-2 rounded-full active:scale-95 transition"
                                            >
                                                <Trash2Icon size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <CartSummary subtotal={subtotal} itemCount={total} />
                </div>
            </div>

            <OthersAlsoBought context="cart" />
        </div>
    )
}