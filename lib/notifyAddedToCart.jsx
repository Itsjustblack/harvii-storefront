import Image from 'next/image'
import toast from 'react-hot-toast'
import { Check } from 'lucide-react'

const TOAST_ID = 'added-to-cart' // fixed, so adding several items replaces one toast instead of stacking

// One clean "added" notification for every add-to-cart path.
// `note` is for the case where required options still need choosing in the cart.
export function notifyAddedToCart({ name, imageUrl, quantity = 1, note, onViewCart }) {
    toast.custom(
        (t) => (
            <div
                role="status"
                className={`${t.visible ? 'animate-[toast-in_.2s_ease-out]' : 'opacity-0'} flex w-[calc(100vw-32px)] max-w-sm items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg`}
            >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {imageUrl ? (
                        <Image src={imageUrl} alt="" fill sizes="48px" className="object-cover" />
                    ) : (
                        <Check size={20} className="absolute inset-0 m-auto text-slate-400" />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <Check size={13} /> Added to cart
                    </p>
                    <p className="truncate text-sm font-medium text-slate-900">
                        {name}{quantity > 1 ? ` × ${quantity}` : ''}
                    </p>
                    {note && <p className="truncate text-xs text-slate-500">{note}</p>}
                </div>
                <button
                    type="button"
                    onClick={() => { toast.dismiss(TOAST_ID); onViewCart?.() }}
                    className="min-h-11 shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-95"
                >
                    View cart
                </button>
            </div>
        ),
        { id: TOAST_ID, duration: 3500, position: 'top-center' },
    )
}
