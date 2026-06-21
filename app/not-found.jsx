import { headers } from 'next/headers'
import { DEV_SLUG } from '@/lib/env'
import StoreNotFound from '@/components/StoreNotFound'

export const metadata = { title: 'Store Not Found' }

async function getSlug() {
    try {
        const h = await headers()
        return h.get('x-slug') || DEV_SLUG
    } catch {
        return DEV_SLUG
    }
}

export default async function NotFound() {
    const slug = await getSlug()
    return <StoreNotFound slug={slug} />
}
