'use client'
import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import ProductDetails from '@/components/ProductDetails'
import ProductDescription from '@/components/ProductDescription'
import OthersAlsoBought from '@/components/OthersAlsoBought'
import { useStorefront } from '@/context/StorefrontContext'
import { getProduct } from '@/lib/api'

export default function ProductPage() {
    const { productId } = useParams()
    const { slug } = useStorefront()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFoundState, setNotFoundState] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
        setLoading(true)
        getProduct(slug, productId)
            .then(setProduct)
            .catch(() => setNotFoundState(true))
            .finally(() => setLoading(false))
    }, [slug, productId])

    if (loading) {
        return (
            <div className="mx-6 max-w-7xl mx-auto py-12">
                <div className="flex max-lg:flex-col gap-12 animate-pulse">
                    <div className="bg-slate-100 rounded-xl w-full max-w-md h-96" />
                    <div className="flex-1 space-y-4">
                        <div className="bg-slate-100 h-8 rounded w-3/4" />
                        <div className="bg-slate-100 h-6 rounded w-1/3" />
                        <div className="bg-slate-100 h-10 rounded w-1/4" />
                        <div className="bg-slate-100 h-12 rounded-lg w-40 mt-8" />
                    </div>
                </div>
            </div>
        )
    }

    if (notFoundState || !product) {
        return (
            <div className="mx-6 max-w-7xl mx-auto py-24 text-center text-slate-400">
                <p className="text-4xl mb-4">😕</p>
                <p className="text-xl font-medium text-slate-600">Product not found</p>
                <Link href="/shop" className="mt-6 inline-block px-6 py-2 bg-[var(--primary)] text-white rounded-full text-sm hover:opacity-90 transition">
                    Back to shop
                </Link>
            </div>
        )
    }

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <div className="text-slate-400 text-xs mt-8 mb-6 flex items-center gap-2">
                    <Link href="/" className="hover:text-slate-600 transition">Home</Link>
                    <span>/</span>
                    <Link href="/shop" className="hover:text-slate-600 transition">Products</Link>
                    {product.category && (
                        <>
                            <span>/</span>
                            <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-slate-600 transition">
                                {product.category}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-slate-600 truncate max-w-32">{product.name}</span>
                </div>

                <ProductDetails product={product} />
                <ProductDescription product={product} />
            </div>

            <OthersAlsoBought productId={product.product_id} context="product" />
        </div>
    )
}