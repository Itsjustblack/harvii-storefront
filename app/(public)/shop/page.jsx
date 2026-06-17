'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { useStorefront } from '@/context/StorefrontContext'
import { getProducts, getCategories } from '@/lib/api'

const PAGE_SIZE = 12

function ShopContent() {
    const { slug } = useStorefront()
    const searchParams = useSearchParams()
    const router = useRouter()

    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)

    const q = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''

    const fetchProducts = useCallback(
        async (pageNum) => {
            setLoading(true)
            try {
                const data = await getProducts(slug, {
                    q: q || undefined,
                    category: category || undefined,
                    page: pageNum,
                    page_size: PAGE_SIZE,
                })
                if (pageNum === 1) {
                    setProducts(data.items || [])
                } else {
                    setProducts((prev) => [...prev, ...(data.items || [])])
                }
                setTotal(data.total || 0)
            } catch {}
            setLoading(false)
        },
        [slug, q, category]
    )

    useEffect(() => {
        setPage(1)
        fetchProducts(1)
    }, [fetchProducts])

    useEffect(() => {
        getCategories(slug)
            .then((data) => setCategories(data.categories || []))
            .catch(() => {})
    }, [slug])

    const loadMore = () => {
        const next = page + 1
        setPage(next)
        fetchProducts(next)
    }

    const setFilter = (key, val) => {
        const params = new URLSearchParams(searchParams)
        if (val) params.set(key, val)
        else params.delete(key)
        router.push(`/shop?${params}`)
    }

    const hasMore = products.length < total

    return (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto py-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold">
                        {category ? category : q ? `Results for "${q}"` : 'All Products'}
                    </h1>
                    {!loading && (
                        <p className="text-sm text-slate-400 mt-1">
                            {total} {total === 1 ? 'product' : 'products'}
                        </p>
                    )}
                </div>

                {/* Category filter pills */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        <button
                            onClick={() => setFilter('category', '')}
                            className={`px-4 py-1.5 rounded-full text-sm border transition ${
                                !category
                                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                                    : 'border-slate-200 text-slate-600 hover:border-slate-400'
                            }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter('category', cat)}
                                className={`px-4 py-1.5 rounded-full text-sm border transition ${
                                    category === cat
                                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-400'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                        {(q || category) && (
                            <button
                                onClick={() => router.push('/shop')}
                                className="flex items-center gap-1 px-4 py-1.5 rounded-full text-sm border border-red-200 text-red-400 hover:bg-red-50 transition"
                            >
                                <X size={12} /> Clear
                            </button>
                        )}
                    </div>
                )}

                {/* Grid */}
                {loading && products.length === 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array(PAGE_SIZE).fill(0).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="bg-slate-100 h-48 rounded-lg animate-pulse" />
                                <div className="bg-slate-100 h-4 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                        <p className="text-5xl mb-4">🔍</p>
                        <p className="text-xl font-medium text-slate-600">No products found</p>
                        <p className="text-sm mt-2">Try a different search or browse all products</p>
                        <button
                            onClick={() => router.push('/shop')}
                            className="mt-6 px-6 py-2 bg-[var(--primary)] text-white rounded-full text-sm hover:opacity-90 transition"
                        >
                            Browse all
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.product_id} product={product} />
                            ))}
                        </div>
                        {hasMore && (
                            <div className="flex justify-center mt-12">
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="px-8 py-3 border border-slate-200 rounded-full text-sm text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                                >
                                    {loading ? 'Loading…' : 'Load more'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default function Shop() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>}>
            <ShopContent />
        </Suspense>
    )
}