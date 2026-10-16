'use client'
import { useState } from 'react'
import { Check, MapPin, Search } from 'lucide-react'
import { formatPrice } from '@/lib/money'

const CARD_LIMIT = 8 // up to this many options show as tappable cards; more get a search box

const isSame = (a, b) => a && b && a.zone_id === b.zone_id && a.label === b.label

// "Where should we deliver?" — the customer only ever sees places this store
// delivers to, each with its fee, before anything is submitted.
export default function DeliveryPicker({ options, value, onChange, onResolve, storeName }) {
    const [filter, setFilter] = useState('')
    const [lookupOpen, setLookupOpen] = useState(false)
    const [lookup, setLookup] = useState('')
    const [checking, setChecking] = useState(false)
    const [result, setResult] = useState(null)

    const useCards = options.length <= CARD_LIMIT
    const q = filter.trim().toLowerCase()
    const visible = useCards ? options : q ? options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 8) : []

    const pick = (option) => {
        onChange(option)
        setFilter('')
        setResult(null)
    }

    const check = async (e) => {
        e.preventDefault()
        if (lookup.trim().length < 2) return
        setChecking(true)
        setResult(null)
        try {
            const res = await onResolve(lookup.trim())
            if (res?.status === 'found') {
                pick(res.option)
                setLookupOpen(false)
                setLookup('')
            } else {
                setResult(res || { status: 'not_covered' })
            }
        } catch {
            setResult({ status: 'error' })
        }
        setChecking(false)
    }

    const Option = ({ option }) => {
        const active = isSame(option, value)
        return (
            <button
                type="button"
                onClick={() => pick(option)}
                aria-pressed={active}
                className={`relative flex w-full items-center justify-between gap-3 min-h-[52px] rounded-xl border px-4 py-3 text-left text-sm transition ${
                    active ? 'border-[var(--primary)] ring-1 ring-[var(--primary)] pr-10' : 'border-slate-200 hover:bg-slate-50'
                }`}
            >
                <span className="min-w-0 break-words font-medium text-slate-800">{option.label}</span>
                <span className="shrink-0 tabular-nums text-slate-600">{formatPrice(option.fee)}</span>
                {active && <Check size={16} className="absolute right-3 text-[var(--primary)]" />}
            </button>
        )
    }

    if (options.length === 0) {
        return (
            <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                {storeName || 'This store'} hasn't set up delivery yet. Please contact them to complete your order.
            </p>
        )
    }

    return (
        <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600">
                Where should we deliver? <span className="text-red-400">*</span>
            </p>

            {!useCards && (
                <div className="relative">
                    <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Search your area"
                        aria-label="Search delivery areas"
                        className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition placeholder-slate-400 focus:border-[var(--primary)]"
                    />
                </div>
            )}

            {visible.length > 0 && (
                <div className="space-y-2" role="list">
                    {visible.map((o) => <Option key={`${o.zone_id}-${o.label}`} option={o} />)}
                </div>
            )}
            {!useCards && q && visible.length === 0 && <p className="text-sm text-slate-500">No listed area matches “{filter}”.</p>}

            {value && !useCards && (
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                    <MapPin size={15} /> Delivery to <strong>{value.label}</strong> — {formatPrice(value.fee)}
                </div>
            )}

            {lookupOpen ? (
                <form onSubmit={check} className="flex gap-2">
                    <input
                        value={lookup}
                        onChange={(e) => setLookup(e.target.value)}
                        placeholder="Type your area or landmark"
                        maxLength={120}
                        autoFocus
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder-slate-400 focus:border-[var(--primary)]"
                    />
                    <button
                        type="submit"
                        disabled={checking || lookup.trim().length < 2}
                        className="rounded-xl border border-slate-200 px-4 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        {checking ? 'Checking…' : 'Check'}
                    </button>
                </form>
            ) : (
                <button type="button" onClick={() => setLookupOpen(true)} className="min-h-11 text-sm text-[var(--primary)] hover:underline">
                    Can't find your area?
                </button>
            )}

            {result?.status === 'choose' && (
                <div className="space-y-2">
                    <p className="text-sm text-slate-600">Which part of {result.area || 'that area'} are you in?</p>
                    {result.options?.length > 0 ? (
                        <div className="space-y-2">
                            {result.options.map((o) => <Option key={`${o.zone_id}-${o.label}`} option={o} />)}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">Try typing your exact area or a nearby landmark.</p>
                    )}
                </div>
            )}
            {result?.status === 'not_covered' && (
                <p className="text-sm text-amber-600">
                    {result.store_name || storeName || 'This store'} doesn't deliver to “{lookup}” yet. Contact them to ask about delivery there.
                </p>
            )}
            {result?.status === 'error' && <p className="text-sm text-amber-600">Couldn't check that right now. Please try again.</p>}
        </div>
    )
}
