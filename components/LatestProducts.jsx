'use client'
import { useEffect, useState } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useStorefront } from '@/context/StorefrontContext'
import { getProducts } from '@/lib/api'

const LatestProducts = () => {
    const { slug } = useStorefront()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getProducts(slug, { page_size: 8 })
            .then((data) => setProducts(data.items || []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [slug])

    if (loading) {
        return (
            <div className="px-6 my-16 max-w-6xl mx-auto">
                <div className="h-8 bg-slate-100 rounded w-48 mb-12 animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {Array(8).fill(0).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="bg-slate-100 h-40 rounded-lg animate-pulse" />
                            <div className="bg-slate-100 h-4 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (products.length === 0) return null

    return (
        <div className="px-6 my-16 max-w-6xl mx-auto">
            <Title title="Latest Products" description={`Showing ${Math.min(products.length, 8)} products`} href="/shop" />
            <div className="mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between">
                {products.slice(0, 8).map((product) => (
                    <ProductCard key={product.product_id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default LatestProducts