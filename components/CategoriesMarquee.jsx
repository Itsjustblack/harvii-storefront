'use client'
import Link from 'next/link'
import { useStorefront } from '@/context/StorefrontContext'
import { useCategories } from '@/lib/queries'

const CategoriesMarquee = () => {
    const { slug } = useStorefront()
    const { data: categories = [] } = useCategories(slug)

    if (categories.length === 0) return null

    return (
        <div className="flex items-center gap-2.5 max-w-7xl mx-auto sm:my-16 my-8 overflow-x-auto no-scrollbar">
            <Link
                href="/shop"
                className="flex items-center justify-center h-9.5 shrink-0 rounded-full px-5 text-[13px] font-semibold text-white bg-[var(--primary)]"
            >
                All
            </Link>
            {categories.map((cat) => (
                <Link
                    key={cat}
                    href={`/shop?category=${encodeURIComponent(cat)}`}
                    className="flex items-center justify-center h-9.5 shrink-0 rounded-full px-5 text-[13px] font-medium text-slate-700 bg-slate-100 hover:bg-[var(--primary)] hover:text-white active:scale-95 transition-all duration-300 whitespace-nowrap"
                >
                    {cat}
                </Link>
            ))}
        </div>
    )
}

export default CategoriesMarquee