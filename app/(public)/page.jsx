'use client'
import Hero from '@/components/Hero'
import LatestProducts from '@/components/LatestProducts'
import FeaturedProducts from '@/components/FeaturedProducts'
import OthersAlsoBought from '@/components/OthersAlsoBought'

export default function Home() {
    return (
        <div>
            <Hero />
            <LatestProducts />
            <FeaturedProducts />
            <OthersAlsoBought context="homepage" />
        </div>
    )
}