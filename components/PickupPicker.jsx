'use client'
import { Check, Clock, Store, Truck } from 'lucide-react'

// 45 -> "45 minutes", 60 -> "1 hour", 2880 -> "2 days"
export function readyText(minutes) {
    const m = Number(minutes) || 0
    if (!m) return ''
    const [n, word] = m % 1440 === 0 ? [m / 1440, 'day'] : m % 60 === 0 ? [m / 60, 'hour'] : [m, 'minute']
    return `${n} ${n === 1 ? word : `${word}s`}`
}

// Delivery or pickup, for a store that offers both.
export function MethodSwitch({ value, onChange }) {
    const items = [
        { value: 'delivery', label: 'Delivery', Icon: Truck },
        { value: 'pickup', label: 'Pickup', Icon: Store },
    ]
    return (
        <div role="radiogroup" aria-label="How do you want to get your order?" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            {items.map(({ value: v, label, Icon }) => (
                <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={value === v}
                    onClick={() => onChange(v)}
                    className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg text-sm transition ${
                        value === v ? 'bg-white font-semibold text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Icon size={16} aria-hidden="true" /> {label}
                </button>
            ))}
        </div>
    )
}

// Where to collect: one card per location, plus when the order will be ready.
export default function PickupPicker({ locations, value, onChange, readyMinutes }) {
    return (
        <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600">
                Pick up from {locations.length > 1 && <span className="text-red-400">*</span>}
            </p>
            <div className="space-y-2" role="radiogroup" aria-label="Pickup location">
                {locations.map((l) => {
                    const active = value === l.id
                    return (
                        <button
                            key={l.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => onChange(l.id)}
                            className={`relative flex w-full items-start gap-3 rounded-xl border px-4 py-3 pr-10 text-left text-sm transition ${
                                active ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]' : 'border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600" aria-hidden="true">
                                <Store size={16} />
                            </span>
                            <span className="min-w-0">
                                <span className="block font-medium text-slate-800">{l.name}</span>
                                <span className="mt-0.5 block break-words text-slate-500">{l.address}</span>
                            </span>
                            {active && <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary)]" />}
                        </button>
                    )
                })}
            </div>
            {readyMinutes ? (
                <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <Clock size={15} className="shrink-0 text-slate-400" aria-hidden="true" />
                    Ready about {readyText(readyMinutes)} after you pay.
                </p>
            ) : null}
        </div>
    )
}
