'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Check } from 'lucide-react'
import Counter from './Counter'
import VariantPicker from './VariantPicker'
import { addToCart } from '@/lib/features/cart/cartSlice'

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

    const inCart = useSelector((s) => !!s.cart.cartItems[product.product_id])
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
            price: Number(product.price),
            currency: product.currency || 'NGN',
            image_url: product.image_url || product.images?.[0] || '',
            variants,
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

                <p className="text-3xl font-semibold text-slate-800 mt-4">
                    ₦{Number(product.price).toLocaleString()}
                </p>

                {/* Variant picker */}
                {product.variant_metadata && Object.keys(product.variant_metadata).length > 0 && (
                    <VariantPicker
                        variantMetadata={product.variant_metadata}
                        value={variants}
                        onChange={setVariants}
                    />
                )}

                {/* Quantity + Add to Cart */}
                <div className="flex items-end gap-4 mt-8">
                    {inCart && (
                        <div className="flex flex-col gap-1">
                            <p className="text-xs text-slate-500">Quantity</p>
                            <Counter product_id={product.product_id} />
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