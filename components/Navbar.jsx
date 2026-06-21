'use client'
import { Search, ShoppingCart, User, LogOut, Package } from 'lucide-react'
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
    const [mounted, setMounted] = useState(false)
    const menuRef = useRef(null)

    const cartCount = useSelector((s) => s.cart.total)
    const { token, email } = useSelector((s) => s.auth)

    useEffect(() => setMounted(true), [])

    const handleSearch = (e) => {
        e.preventDefault()
        if (search.trim()) router.push(`/shop?q=${encodeURIComponent(search.trim())}`)
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
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

                    {/* Brand / Logo */}
                    <Link href="/" className="flex items-center">
                        {logoUrl ? (
                            <Image
                                src={logoUrl}
                                alt={storeName}
                                width={120}
                                height={40}
                                className="object-contain max-h-10"
                            />
                        ) : (
                            <span className="text-2xl font-semibold text-slate-800 font-primary">{storeName}</span>
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

                    {/* Mobile: cart + auth icons */}
                    <div className="md:hidden flex items-center gap-3">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-full text-sm">
                            <Search size={16} className="text-slate-500 shrink-0" />
                            <input
                                className="w-28 bg-transparent outline-none placeholder-slate-500 text-xs"
                                type="text"
                                placeholder="Search…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        <Link href="/cart" className="relative text-slate-600">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 text-[9px] text-white bg-[var(--primary)] size-4 rounded-full flex items-center justify-center font-medium">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>
            <hr className="border-gray-200" />
        </nav>
    )
}

export default Navbar