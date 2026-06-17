'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'
import { useStorefront } from '@/context/StorefrontContext'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {
    const { config } = useStorefront()

    const heroImageUrl = config?.hero_image_url
    const tagline = config?.tagline || config?.store_name || 'Shop the best'

    return (
        <div className="mx-6">
            <div className="flex max-xl:flex-col gap-5 max-w-7xl mx-auto my-10">

                {/* Main hero panel */}
                <div className="relative flex-1 flex flex-col rounded-3xl xl:min-h-100 overflow-hidden group bg-slate-900">
                    {heroImageUrl && (
                        <Image
                            src={heroImageUrl}
                            alt="Hero"
                            fill
                            className="object-cover opacity-60"
                            priority
                        />
                    )}
                    <div className="relative z-10 p-6 sm:p-14 flex flex-col justify-end h-full min-h-72 sm:min-h-96">
                        <p className="text-white/70 text-sm mb-2 uppercase tracking-widest">New Collection</p>
                        <h2 className="text-3xl sm:text-5xl leading-[1.2] font-semibold text-white max-w-md">
                            {tagline}
                        </h2>
                        <Link
                            href="/shop"
                            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-white bg-[var(--primary)] py-3 px-8 rounded-md hover:opacity-90 active:scale-95 transition w-fit"
                        >
                            Shop Now <ArrowRightIcon size={16} />
                        </Link>
                    </div>
                </div>

                {/* CTA cards */}
                <div className="flex flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600">
                    <Link
                        href="/shop"
                        className="flex-1 flex items-center justify-between w-full rounded-3xl p-6 px-8 group bg-orange-100 min-h-32"
                    >
                        <div>
                            <p className="text-xl font-medium text-slate-800 leading-snug">Browse Products</p>
                            <p className="mt-2 text-slate-500 text-xs max-w-28">Explore our full catalogue</p>
                            <p className="flex items-center gap-1 mt-4 text-slate-500 text-xs group-hover:gap-2 transition-all">
                                Shop now <ArrowRightIcon size={14} />
                            </p>
                        </div>
                    </Link>
                    <Link
                        href="/shop?featured=true"
                        className="flex-1 flex items-center justify-between w-full rounded-3xl p-6 px-8 group bg-blue-100 min-h-32"
                    >
                        <div>
                            <p className="text-xl font-medium text-slate-800 leading-snug">Most Popular</p>
                            <p className="mt-2 text-slate-500 text-xs max-w-28">Our best-selling items</p>
                            <p className="flex items-center gap-1 mt-4 text-slate-500 text-xs group-hover:gap-2 transition-all">
                                View all <ArrowRightIcon size={14} />
                            </p>
                        </div>
                    </Link>
                </div>
            </div>

            <CategoriesMarquee />
        </div>
    )
}

export default Hero