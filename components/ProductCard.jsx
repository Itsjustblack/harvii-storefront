'use client'
import Image from 'next/image'
import Link from 'next/link'

const PLACEHOLDER = 'https://gocart-gs.vercel.app/_next/static/media/product_img4.60bc85fd.png'

const ProductCard = ({ product }) => {
    const imageUrl = product.image_url || product.images?.[0] || PLACEHOLDER
    const isOutOfStock = product.in_stock === false

    return (
        <Link
            href={`/product/${product.product_id}`}
            className={`group max-xl:mx-auto ${isOutOfStock ? 'pointer-events-none opacity-70' : ''}`}
        >
            <div className="relative bg-[#F5F5F5] h-40 sm:w-60 sm:h-68 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                    width={500}
                    height={500}
                    className="max-h-30 sm:max-h-40 w-auto group-hover:scale-105 transition duration-300 object-contain"
                    src={imageUrl}
                    alt={product.name}
                />
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="bg-slate-700 text-white text-xs font-medium px-3 py-1 rounded-full">
                            Out of Stock
                        </span>
                    </div>
                )}
                {product.storefront_featured && !isOutOfStock && (
                    <span className="absolute top-2 left-2 bg-[var(--primary)] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                        Featured
                    </span>
                )}
            </div>
            <div className="flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60">
                <p className="truncate max-w-40 font-medium">{product.name}</p>
                <p className="shrink-0 font-medium">₦{Number(product.price).toLocaleString()}</p>
            </div>
            {product.category && (
                <p className="text-xs text-slate-400 mt-0.5">{product.category}</p>
            )}
        </Link>
    )
}

export default ProductCard