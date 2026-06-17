'use client'
import { useEffect, useState } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useStorefront } from '@/context/StorefrontContext'
import { getProducts } from '@/lib/api'

const FeaturedProducts = () => {
    const { slug } = useStorefront()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getProducts(slug, { featured: true, page_size: 8 })
            .then((data) => setProducts(data.items || []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [slug])

    if (loading || products.length === 0) return null

    return (
        <div className="px-6 my-16 max-w-6xl mx-auto">
            <Title title="Featured Products" description={`${products.length} handpicked items`} href="/shop" />
            <div className="mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12">
                {products.slice(0, 8).map((product) => (
                    <ProductCard key={product.product_id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default FeaturedProducts