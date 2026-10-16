'use client'
import { Search, ShoppingCart, User, LogOut, Package, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useStorefront } from '@/context/StorefrontContext'
import { clearAuth } from '@/lib/features/auth/authSlice'

const Navbar = () => {
    const router = useRouter()
    const dispatch = useDispatch()
    const { config } = useStorefront()

    const [search, setSearch] = useState('')
    const [menuOpen, setMenuOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const menuRef = useRef(null)

    const cartCount = useSelector((s) => s.cart.total)
    const { token, email } = useSelector((s) => s.auth)

    useEffect(() => setMounted(true), [])

    const handleSearch = (e) => {
        e.preventDefault()
        if (search.trim()) {
            router.push(`/shop?q=${encodeURIComponent(search.trim())}`)
            setSearchOpen(false)
        }
    }

    const handleLogout = () => {
        dispatch(clearAuth())
        setMenuOpen(false)
        router.push('/')
    }

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const storeName = config?.store_name || 'Harvii Store'
    const logoUrl = config?.logo_url

    return (
        <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

                    {/* Brand / Logo */}
                    <Link href="/" className="flex min-w-0 items-center">
                        {logoUrl ? (
                            <Image
                                src={logoUrl}
                                alt={storeName}
                                width={120}
                                height={40}
                                className="object-contain max-h-10"
                            />
                        ) : (
                            <span className="truncate text-xl font-semibold text-slate-800 font-primary sm:text-2xl">{storeName}</span>
                        )}
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6 lg:gap-8 text-slate-600 text-sm">
                        <Link href="/" className="hover:text-slate-900 transition">Home</Link>
                        <Link href="/shop" className="hover:text-slate-900 transition">Shop</Link>
                        <Link href="/track" className="hover:text-slate-900 transition">Track Order</Link>
                        {config?.contact_email || config?.contact_phone ? (
                            <Link href="/contact" className="hover:text-slate-900 transition">Contact</Link>
                        ) : null}

                        {/* Search */}
                        <form onSubmit={handleSearch} className="hidden xl:flex items-center gap-2 bg-slate-100 px-4 py-2.5 rounded-full text-sm">
                            <Search size={16} className="text-slate-500 shrink-0" />
                            <input
                                className="w-48 bg-transparent outline-none placeholder-slate-500"
                                type="text"
                                placeholder="Search products…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>

                        {/* Cart */}
                        <Link href="/cart" className="relative flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition">
                            <ShoppingCart size={18} />
                            <span>Cart</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 left-3 text-[9px] text-white bg-[var(--primary)] size-4 rounded-full flex items-center justify-center font-medium">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Auth */}
                        {mounted && token ? (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setMenuOpen((v) => !v)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full transition text-sm"
                                >
                                    <User size={15} />
                                    <span className="max-w-24 truncate">{email}</span>
                                </button>
                                {menuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                                        <Link href="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition">
                                            <Package size={15} /> My Orders
                                        </Link>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                                            <LogOut size={15} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/account/login"
                                className="px-6 py-2 bg-[var(--primary)] hover:opacity-90 transition text-white rounded-full text-sm"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile: search + cart. Search collapses to an icon so a long store
                        name or a narrow phone can never push the cart off-screen. */}
                    <div className="md:hidden flex shrink-0 items-center">
                        <button
                            type="button"
                            onClick={() => setSearchOpen((v) => !v)}
                            aria-label={searchOpen ? 'Close search' : 'Search products'}
                            aria-expanded={searchOpen}
                            className="flex size-11 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
                        >
                            {searchOpen ? <X size={20} /> : <Search size={20} />}
                        </button>
                        <Link href="/cart" aria-label="Cart" className="relative flex size-11 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100">
                            <ShoppingCart size={21} />
                            {mounted && cartCount > 0 && (
                                <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--primary)] text-[9px] font-medium text-white">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>
            {searchOpen && (
                <form onSubmit={handleSearch} className="md:hidden border-t border-gray-100 px-6 py-3">
                    <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3">
                        <Search size={16} className="shrink-0 text-slate-500" />
                        <input
                            autoFocus
                            type="search"
                            enterKeyHint="search"
                            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder-slate-500"
                            placeholder="Search products…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </form>
            )}
            <hr className="border-gray-200" />
        </nav>
    )
}

export default Navbar