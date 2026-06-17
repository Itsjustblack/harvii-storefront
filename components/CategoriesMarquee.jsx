'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useStorefront } from '@/context/StorefrontContext'
import { getCategories } from '@/lib/api'

const CategoriesMarquee = () => {
    const { slug } = useStorefront()
    const [categories, setCategories] = useState([])

    useEffect(() => {
        getCategories(slug)
            .then((data) => setCategories(data.categories || []))
            .catch(() => {})
    }, [slug])

    if (categories.length === 0) return null

    const repeated = [...categories, ...categories, ...categories, ...categories]

    return (
        <div className="overflow-hidden w-full relative max-w-7xl mx-auto select-none group sm:my-16 my-8">
            <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
            <div className="flex min-w-[200%] animate-[marqueeScroll_30s_linear_infinite] group-hover:[animation-play-state:paused] gap-3">
                {repeated.map((cat, index) => (
                    <Link
                        key={index}
                        href={`/shop?category=${encodeURIComponent(cat)}`}
                        className="px-5 py-2 bg-slate-100 rounded-lg text-slate-500 text-xs sm:text-sm hover:bg-[var(--primary)] hover:text-white active:scale-95 transition-all duration-300 whitespace-nowrap"
                    >
                        {cat}
                    </Link>
                ))}
            </div>
            <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
        </div>
    )
}

export default CategoriesMarquee