import { cache } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hapi.xoroai.cloud'

async function apiFetch(path, options = {}) {
    const url = `${API_URL}${path}`
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        const error = new Error(err.detail || `Request failed: ${res.status}`)
        error.status = res.status
        throw error
    }
    return res.json()
}

// Storefront config — React.cache deduplicates per render cycle (server components)
export const getStorefrontConfig = cache(async (slug) => {
    return apiFetch(`/s/${slug}`, { next: { revalidate: 60 } })
})

export async function getProducts(slug, { category, q, featured, tags, minPrice, maxPrice, page = 1, page_size = 12 } = {}) {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (q) params.set('q', q)
    if (featured) params.set('featured', 'true')
    if (tags && tags.length > 0) tags.forEach((t) => params.append('tags', t))
    if (minPrice != null && minPrice !== '') params.set('min_price', String(minPrice))
    if (maxPrice != null && maxPrice !== '') params.set('max_price', String(maxPrice))
    params.set('page', String(page))
    params.set('page_size', String(page_size))
    return apiFetch(`/s/${slug}/products?${params}`, { next: { revalidate: 30 } })
}

export async function getTags(slug) {
    return apiFetch(`/s/${slug}/tags`, { next: { revalidate: 120 } })
}

export async function getProduct(slug, productId) {
    return apiFetch(`/s/${slug}/products/${productId}`, { next: { revalidate: 30 } })
}

export async function getCategories(slug) {
    return apiFetch(`/s/${slug}/categories`, { next: { revalidate: 120 } })
}

export async function getRecommended(slug, productId) {
    return apiFetch(`/s/${slug}/products/${productId}/recommended`, {
        next: { revalidate: 60 },
    })
}

// Checkout
export async function createCheckout(slug, payload) {
    return apiFetch(`/s/${slug}/checkout`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

export async function submitAddress(slug, token, payload) {
    return apiFetch(`/s/${slug}/checkout/${token}/address`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

export async function applyPromo(slug, token, code) {
    return apiFetch(`/s/${slug}/checkout/${token}/apply-promo`, {
        method: 'POST',
        body: JSON.stringify({ code }),
    })
}

export async function removePromo(slug, token) {
    return apiFetch(`/s/${slug}/checkout/${token}/promo`, { method: 'DELETE' })
}

export async function confirmCheckout(slug, token) {
    return apiFetch(`/s/${slug}/checkout/${token}/confirm`, { method: 'POST' })
}

export async function getCheckoutStatus(slug, token) {
    return apiFetch(`/s/${slug}/checkout/${token}`)
}

// Order tracking
export async function trackOrder(slug, { email, ref }) {
    const params = new URLSearchParams({ email })
    if (ref) params.set('ref', ref)
    return apiFetch(`/s/${slug}/orders/track?${params}`)
}

// Auth
export async function registerAccount(slug, payload) {
    return apiFetch(`/s/${slug}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

export async function loginAccount(slug, payload) {
    return apiFetch(`/s/${slug}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

export async function requestOtp(slug, email) {
    return apiFetch(`/s/${slug}/auth/request-otp`, {
        method: 'POST',
        body: JSON.stringify({ email }),
    })
}

export async function verifyOtp(slug, email, code) {
    return apiFetch(`/s/${slug}/auth/verify-otp`, {
        method: 'POST',
        body: JSON.stringify({ email, code }),
    })
}

export async function getAccountOrders(slug, token) {
    return apiFetch(`/s/${slug}/account/orders`, {
        headers: { Authorization: `Bearer ${token}` },
    })
}