'use client'
import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import { useStorefront } from '@/context/StorefrontContext'
import { getRecommended, getProducts } from '@/lib/api'

// Homepage: popular picks. Product page: what other customers bought with this
// item, or — when there's no purchase history yet — more from the same category.
export default function OthersAlsoBought({ productId, context = 'product' }) {
    const { slug } = useStorefront()
    const [products, setProducts] = useState([])
    const [source, setSource] = useState(null)

    useEffect(() => {
        let cancelled = false
        const done = (items, src) => {
            if (!cancelled) {
                setProducts(items)
                setSource(src)
            }
        }
        const featured = () =>
            getProducts(slug, { featured: true, page_size: 5 })
                .then((data) => (data.items || []).filter((p) => p.product_id !== productId).slice(0, 4))
                .catch(() => [])

        if (context === 'homepage' || !productId) {
            featured().then((items) => done(items, 'featured'))
            return () => { cancelled = true }
        }
        getRecommended(slug, productId)
            .then(async (data) => {
                const items = (data.items || []).filter((p) => p.product_id !== productId).slice(0, 4)
                if (data.source === 'none' || items.length === 0) {
                    done(await featured(), 'featured')
                } else {
                    done(items, data.source)
                }
            })
            .catch(async () => done(await featured(), 'featured'))
        return () => { cancelled = true }
    }, [slug, productId, context])

    if (products.length === 0) return null

    const title =
        context === 'homepage' ? 'Popular Picks'
        : source === 'co_purchase' ? 'Customers also bought'
        : source === 'featured' ? 'Popular picks'
        : 'You may also like'

    return (
        <section className={`mt-14 mb-8 max-w-7xl mx-auto ${context === 'product' ? '' : 'px-6'}`} aria-label={title}>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-6">{title}</h2>
            <div className="-mx-6 flex snap-x gap-4 overflow-x-auto scroll-px-6 px-6 pb-4 scrollbar-hide sm:mx-0 sm:scroll-px-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:px-0 lg:grid-cols-4">
                {products.map((product) => (
                    <div key={product.product_id} className="w-[44vw] max-w-56 shrink-0 snap-start sm:w-auto sm:max-w-none">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </section>
    )
}
