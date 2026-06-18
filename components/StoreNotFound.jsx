'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const HARVII_MARKETING_URL = process.env.NEXT_PUBLIC_HARVII_MARKETING_URL || 'https://harvii.co'

const JOKES = [
    {
        emoji: '🕵️‍♂️',
        headline: 'This store doesn’t exist.',
        subtext: (slug) => `We searched high and low for "${slug}". Mostly low.`,
    },
    {
        emoji: '🧐',
        headline: '404: Shop Not Found',
        subtext: () => 'We looked everywhere except the one place it actually wasn’t. Wait, that’s everywhere.',
    },
    {
        emoji: '🏚️',
        headline: 'This storefront is squatting on a 404.',
        subtext: (slug) => `Someone forgot to pay the rent on "${slug}".`,
    },
    {
        emoji: '📦',
        headline: 'This store shipped itself into the void.',
        subtext: () => 'No tracking number. No forwarding address. Just vibes.',
    },
    {
        emoji: '🚪',
        headline: 'Wrong door.',
        subtext: () => 'This one leads to absolutely nothing. We’d offer a tour, but there’s nothing to show.',
    },
    {
        emoji: '🧾',
        headline: 'Receipt for a store that never rang up.',
        subtext: () => 'We’d refund you, but there’s nothing to refund.',
    },
    {
        emoji: '🔍',
        headline: 'Nothing to see here. Literally.',
        subtext: (slug) => `"${slug}" isn’t a store. It’s barely even a URL.`,
    },
    {
        emoji: '🪦',
        headline: 'RIP, this store.',
        subtext: () => 'Cause of death: never existed in the first place.',
    },
    {
        emoji: '👻',
        headline: 'This store is a ghost.',
        subtext: (slug) => `"${slug}" haunts this URL, but it never actually lived here.`,
    },
    {
        emoji: '🧱',
        headline: 'You’ve hit a brick wall. An imaginary one.',
        subtext: () => 'At least a real wall would have the decency to exist.',
    },
]

export default function StoreNotFound({ slug = 'this-store' }) {
    const [index, setIndex] = useState(0)

    // Pick a random joke after mount to avoid SSR/client hydration mismatch
    useEffect(() => {
        setIndex(Math.floor(Math.random() * JOKES.length))
    }, [])

    const joke = JOKES[index]

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
            <div className="max-w-md">
                <p className="text-7xl sm:text-8xl mb-6 leading-none" role="img" aria-hidden="true">
                    {joke.emoji}
                </p>
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 leading-snug">
                    {joke.headline}
                </h1>
                <p className="text-slate-500 text-base sm:text-lg mt-4">
                    {joke.subtext(slug)}
                </p>
            </div>

            <div className="mt-12 w-20 h-1 rounded-full bg-slate-200" />

            <p className="mt-8 text-sm text-slate-400">
                Powered by{' '}
                <Link href={HARVII_MARKETING_URL} className="underline hover:text-slate-600 transition">
                    Harvii
                </Link>
            </p>
        </div>
    )
}
