'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Minus, Plus, ShoppingCart, AlertCircle } from 'lucide-react'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { addToCart } from '@/lib/features/cart/cartSlice'
import VariantPicker, { computePriceAdjustment, getMissingRequiredGroups } from './VariantPicker'

const PLACEHOLDER = 'https://gocart-gs.vercel.app/_next/static/media/product_img4.60bc85fd.png'

export default function QuickAddSheet({ product, isOpen, onClose }) {
    const dispatch = useDispatch()
    const [qty, setQty] = useState(1)
    const [variants, setVariants] = useState({})

    useEffect(() => {
        if (isOpen) {
            setQty(1)
            setVariants({})
        }
    }, [isOpen, product?.product_id])

    useEffect(() => {
        if (!isOpen) return
        const onKey = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [isOpen, onClose])

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    if (!product) return null

    const imageUrl = product.image_url || product.images?.[0] || PLACEHOLDER
    const variantGroups = product.variant_metadata?.variant_groups
    const adjustment = computePriceAdjustment(variantGroups, variants)
    const unitPrice = Number(product.price) + adjustment
    const hasVariants = variantGroups && variantGroups.length > 0
    const missingRequired = getMissingRequiredGroups(variantGroups, variants)

    const handleAdd = () => {
        dispatch(addToCart({
            product_id: product.product_id,
            name: product.name,
            price: unitPrice,
            base_price: Number(product.price),
            currency: product.currency,
            image_url: imageUrl,
            quantity: qty,
            variants,
            variant_metadata: product.variant_metadata || null,
        }))
        toast.success(
            missingRequired.length > 0
                ? `Added to cart — choose ${missingRequired.map((g) => g.name).join(', ')} in your cart`
                : 'Added to cart'
        )
        onClose()
    }

    return (
        <>
            {/* Backdrop */}
            <div
                aria-hidden="true"
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            />

            {/* Sheet */}
            <div
                role="dialog"
                aria-modal="true"
                className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[92dvh] overflow-y-auto transition-transform duration-300 ease-out ${
                    isOpen ? 'translate-y-0' : 'translate-y-full'
                }`}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white z-10">
                    <div className="w-10 h-1 rounded-full bg-slate-200" />
                </div>

                {/* Close */}
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-3 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                >
                    <X size={16} />
                </button>

                {/* Image */}
                <div className="mx-4 mb-1 bg-[#F5F5F5] rounded-2xl flex items-center justify-center h-52 overflow-hidden">
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="max-h-48 w-auto object-contain"
                    />
                </div>

                <div className="px-5 pb-10 pt-3">
                    {product.category && (
                        <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">
                            {product.category}
                        </p>
                    )}

                    {/* Name + price */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <h2 className="text-lg font-semibold text-slate-800 leading-snug">{product.name}</h2>
                        <div className="text-right shrink-0">
                            <p className="text-xl font-bold text-[var(--primary)]">
                                ₦{unitPrice.toLocaleString()}
                            </p>
                            {adjustment !== 0 && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                    base ₦{Number(product.price).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <p className="text-sm text-slate-500 leading-relaxed mb-1 line-clamp-4">
                            {product.description}
                        </p>
                    )}

                    {/* Variants */}
                    {hasVariants && (
                        <VariantPicker
                            variantGroups={variantGroups}
                            value={variants}
                            onChange={setVariants}
                        />
                    )}

                    {missingRequired.length > 0 && (
                        <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2.5 mb-1">
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                            <span>You can choose {missingRequired.map((g) => g.name).join(', ')} from your cart.</span>
                        </div>
                    )}

                    {/* Qty + Add */}
                    <div className="flex items-center gap-3 mt-5">
                        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2.5">
                            <button
                                onClick={() => setQty(q => Math.max(1, q - 1))}
                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-200 transition text-slate-600"
                            >
                                <Minus size={13} />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold text-slate-800 select-none">
                                {qty}
                            </span>
                            <button
                                onClick={() => setQty(q => q + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-200 transition text-slate-600"
                            >
                                <Plus size={13} />
                            </button>
                        </div>

                        <button
                            onClick={handleAdd}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[var(--primary)] text-white rounded-xl font-medium text-sm hover:opacity-90 active:scale-[0.98] transition"
                        >
                            <ShoppingCart size={15} />
                            Add to Cart · ₦{(unitPrice * qty).toLocaleString()}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
