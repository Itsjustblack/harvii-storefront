import { headers } from 'next/headers'
import StoreNotFound from '@/components/StoreNotFound'

export const metadata = { title: 'Store Not Found' }

async function getSlug() {
    try {
        const h = await headers()
        return h.get('x-slug') || process.env.NEXT_PUBLIC_DEV_SLUG || 'demo'
    } catch {
        return process.env.NEXT_PUBLIC_DEV_SLUG || 'demo'
    }
}

export default async function NotFound() {
    const slug = await getSlug()
    return <StoreNotFound slug={slug} />
}
