import { Outfit } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { headers } from 'next/headers'
import StoreProvider from '@/app/StoreProvider'
import { StorefrontProvider } from '@/context/StorefrontContext'
import ThemeInjector from '@/components/ThemeInjector'
import { getStorefrontConfig } from '@/lib/api'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '600'] })

export async function generateMetadata() {
    const slug = await getSlug()
    try {
        const config = await getStorefrontConfig(slug)
        return {
            title: config.seo_title || config.store_name || 'Harvii Store',
            description: config.seo_description || config.tagline || '',
            icons: config.favicon_url ? { icon: config.favicon_url } : {},
        }
    } catch {
        return { title: 'Harvii Store' }
    }
}

async function getSlug() {
    try {
        const h = await headers()
        return h.get('x-slug') || process.env.NEXT_PUBLIC_DEV_SLUG || 'demo'
    } catch {
        return process.env.NEXT_PUBLIC_DEV_SLUG || 'demo'
    }
}

export default async function RootLayout({ children }) {
    const slug = await getSlug()

    let config = null
    try {
        config = await getStorefrontConfig(slug)
    } catch {
        // Config unavailable — allow pages to render with null config
    }

    return (
        <html lang="en">
            <body className={`${outfit.className} antialiased`}>
                <StoreProvider>
                    <StorefrontProvider config={config} slug={slug}>
                        <ThemeInjector primaryColor={config?.primary_color} />
                        <Toaster position="top-center" />
                        {children}
                    </StorefrontProvider>
                </StoreProvider>
            </body>
        </html>
    )
}