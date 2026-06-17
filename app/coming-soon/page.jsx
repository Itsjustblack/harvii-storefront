import Image from 'next/image'
import Link from 'next/link'

export const metadata = { title: 'Coming Soon' }

export default function ComingSoon({ searchParams }) {
    const storeName = searchParams?.store || 'This store'
    const logoUrl = searchParams?.logo || ''

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
            {logoUrl ? (
                <Image
                    src={logoUrl}
                    alt={storeName}
                    width={120}
                    height={60}
                    className="object-contain mb-8"
                />
            ) : (
                <h1 className="text-4xl font-semibold text-slate-800 mb-8">{storeName}</h1>
            )}

            <div className="max-w-md">
                <p className="text-6xl font-bold text-slate-800 mb-4">Coming Soon</p>
                <p className="text-slate-500 text-lg mt-4">
                    We're working on something great. Check back soon!
                </p>
            </div>

            <div className="mt-12 w-20 h-1 rounded-full bg-slate-200" />

            <p className="mt-8 text-sm text-slate-400">
                Powered by{' '}
                <Link href="https://harvii.shop" className="underline hover:text-slate-600 transition">
                    Harvii
                </Link>
            </p>
        </div>
    )
}