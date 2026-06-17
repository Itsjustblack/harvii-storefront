'use client'
import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import { useStorefront } from '@/context/StorefrontContext'
import { getRecommended, getProducts } from '@/lib/api'

export default function OthersAlsoBought({ productId, context = 'product' }) {
    const { slug } = useStorefront()
    const [products, setProducts] = useState([])

    useEffect(() => {
        if (context === 'homepage' || !productId) {
            // General popular picks for homepage
            getProducts(slug, { featured: true, page_size: 4 })
                .then((data) => setProducts(data.items || []))
                .catch(() => {})
            return
        }
        getRecommended(slug, productId)
            .then((data) => {
                if (data.source === 'none' || !data.items?.length) return
                setProducts(data.items.slice(0, 4))
            })
            .catch(() => {})
    }, [slug, productId, context])

    if (products.length === 0) return null

    const title = context === 'homepage' ? 'Popular Picks' : 'Others Also Bought'

    return (
        <div className="px-6 my-16 max-w-6xl mx-auto">
            <h2 className="text-xl font-semibold text-slate-800 mb-8">{title}</h2>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {products.map((product) => (
                    <div key={product.product_id} className="shrink-0">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </div>
    )
}