'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Check, AlertCircle } from 'lucide-react'
import Counter from './Counter'
import VariantPicker, { computePriceAdjustment, getMinPriceAdjustment, getMissingRequiredGroups } from './VariantPicker'
import BundleContents from './BundleContents'
import { addToCart, buildCartKey } from '@/lib/features/cart/cartSlice'

const PLACEHOLDER = 'https://gocart-gs.vercel.app/_next/static/media/product_img4.60bc85fd.png'

const ProductDetails = ({ product }) => {
    const dispatch = useDispatch()
    const router = useRouter()

    const allImages = [
        ...(product.image_url ? [product.image_url] : []),
        ...(product.images || []),
    ].filter((v, i, arr) => arr.indexOf(v) === i)

    const [mainImage, setMainImage] = useState(allImages[0] || PLACEHOLDER)
    const [variants, setVariants] = useState({})
    const [added, setAdded] = useState(false)

    const variantGroups = product.variant_metadata?.variant_groups
    const basePrice = Number(product.price)
    const priceAdjustment = computePriceAdjustment(variantGroups, variants)
    const displayPrice = basePrice + priceAdjustment
    const minAdjustment = getMinPriceAdjustment(variantGroups)
    const missingRequired = getMissingRequiredGroups(variantGroups, variants)

    const cartKey = buildCartKey(product.product_id, variants)
    const inCart = useSelector((s) => !!s.cart.cartItems[cartKey])
    const isOutOfStock = product.in_stock === false

    const handleAddToCart = () => {
        if (inCart) {
            router.push('/cart')
            return
        }
        dispatch(addToCart({
            product_id: product.product_id,
            quantity: 1,
            name: product.name,
            price: displayPrice,
            base_price: basePrice,
            currency: product.currency || 'NGN',
            image_url: product.image_url || product.images?.[0] || '',
            variants,
            variant_metadata: product.variant_metadata || null,
        }))
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    return (
        <div className="flex max-lg:flex-col gap-12">
            {/* Image gallery */}
            <div className="flex max-sm:flex-col-reverse gap-3">
                {allImages.length > 1 && (
                    <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[450px]">
                        {allImages.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setMainImage(img)}
                                className={`bg-slate-100 flex items-center justify-center size-20 sm:size-24 rounded-lg shrink-0 border-2 transition ${
                                    mainImage === img ? 'border-[var(--primary)]' : 'border-transparent'
                                }`}
                            >
                                <Image src={img} alt="" width={70} height={70} className="object-contain w-full h-full rounded-md" />
                            </button>
                        ))}
                    </div>
                )}
                <div className="flex justify-center items-center h-80 sm:w-96 sm:h-96 bg-slate-100 rounded-xl">
                    {mainImage ? (
                        <Image src={mainImage} alt={product.name} width={350} height={350} className="object-contain w-full h-full rounded-xl" />
                    ) : (
                        <div className="text-slate-400 text-sm">No image</div>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="flex-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{product.category}</p>
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">{product.name}</h1>

                {isOutOfStock ? (
                    <span className="inline-block mt-3 px-3 py-1 bg-slate-100 text-slate-500 text-xs rounded-full font-medium">
                        Out of Stock
                    </span>
                ) : (
                    <span className="inline-block mt-3 px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                        In Stock
                    </span>
                )}

                {missingRequired.length > 0 ? (
                    <p className="text-3xl font-semibold text-slate-800 mt-4">
                        <span className="text-slate-400 font-normal text-lg mr-1.5">From</span>
                        ₦{(basePrice + minAdjustment).toLocaleString()}
                    </p>
                ) : (
                    <p className="text-3xl font-semibold text-slate-800 mt-4">
                        ₦{displayPrice.toLocaleString()}
                        {priceAdjustment !== 0 && (
                            <span className="ml-2 text-sm font-normal text-slate-400">
                                (base ₦{basePrice.toLocaleString()})
                            </span>
                        )}
                    </p>
                )}

                {/* Variant picker */}
                {variantGroups && variantGroups.length > 0 && (
                    <VariantPicker
                        variantGroups={variantGroups}
                        value={variants}
                        onChange={setVariants}
                    />
                )}

                {missingRequired.length > 0 && (
                    <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2.5 mt-1 mb-2 max-w-md">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span>
                            You can add this to your cart now and choose your{' '}
                            {missingRequired.map((g) => g.name).join(', ')} from the cart page.
                        </span>
                    </div>
                )}

                {product.product_type === 'composite' && (
                    <BundleContents
                        components={product.composite_components}
                        bundlePrice={basePrice}
                        currency={product.currency}
                    />
                )}

                {/* Quantity + Add to Cart */}
                <div className="flex flex-wrap items-end gap-4 mt-8">
                    {inCart && (
                        <div className="flex flex-col gap-1">
                            <p className="text-xs text-slate-500">Quantity</p>
                            <Counter cartKey={cartKey} />
                        </div>
                    )}
                    <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`flex items-center gap-2 px-8 py-3 text-sm font-medium rounded-lg transition active:scale-95 ${
                            isOutOfStock
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-[var(--primary)] hover:opacity-90 text-white'
                        }`}
                    >
                        {added ? (
                            <><Check size={16} /> Added!</>
                        ) : inCart ? (
                            <><ShoppingCart size={16} /> View Cart</>
                        ) : (
                            <><ShoppingCart size={16} /> Add to Cart</>
                        )}
                    </button>
                </div>

                {product.description && (
                    <p className="mt-8 text-sm text-slate-600 leading-relaxed max-w-lg">{product.description}</p>
                )}
            </div>
        </div>
    )
}

export default ProductDetails