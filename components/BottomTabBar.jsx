'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, ShoppingBag, ShoppingCart, User } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useState, useEffect } from 'react'

const tabs = [
    { href: '/', label: 'Home', Icon: LayoutGrid },
    { href: '/shop', label: 'Shop', Icon: ShoppingBag },
    { href: '/cart', label: 'Cart', Icon: ShoppingCart },
    { href: '/account', label: 'Account', Icon: User },
]

export default function BottomTabBar() {
    const pathname = usePathname()
    const cartCount = useSelector((s) => s.cart.total)
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    return (
        <nav aria-label="Main" className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
            <div className="flex h-16 items-center justify-around">
                {tabs.map(({ href, label, Icon }) => {
                    const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                                isActive ? 'text-[var(--primary)]' : 'text-slate-400'
                            }`}
                        >
                            <div className="relative">
                                <Icon size={22} />
                                {href === '/cart' && mounted && cartCount > 0 && (
                                    <span className="absolute -top-1 -right-2 bg-[var(--primary)] text-white text-[9px] size-4 rounded-full flex items-center justify-center font-medium">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}