import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getStorefrontConfig } from '@/lib/api'
import Banner from '@/components/Banner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BottomTabBar from '@/components/BottomTabBar'
import AIChat from '@/components/AIChat'

async function getSlug() {
    try {
        const h = await headers()
        return h.get('x-slug') || process.env.NEXT_PUBLIC_DEV_SLUG || 'demo'
    } catch {
        return process.env.NEXT_PUBLIC_DEV_SLUG || 'demo'
    }
}

export default async function StorefrontLayout({ children }) {
    const slug = await getSlug()

    let config = null
    try {
        config = await getStorefrontConfig(slug)
    } catch {
        // proceed with null config
    }

    if (config && !config.is_published) {
        const params = new URLSearchParams()
        params.set('store', config.store_name || '')
        if (config.logo_url) params.set('logo', config.logo_url)
        redirect(`/coming-soon?${params}`)
    }

    return (
        <>
            <Banner />
            <Navbar />
            <BottomTabBar />
            <main>
                {children}
            </main>
            <Footer />
            <AIChat />
        </>
    )
}