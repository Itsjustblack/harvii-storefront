'use client'

/**
 * Reads the real variant schema saved by the merchant dashboard:
 * variant_metadata.variant_groups = [{ name, key, type, required, options?, price_adjustment?, ... }]
 */

export function computePriceAdjustment(variantGroups, selections = {}) {
    if (!variantGroups) return 0
    let delta = 0
    for (const group of variantGroups) {
        const val = selections[group.key]
        if (val == null || val === '') continue
        if (group.type === 'select') {
            const opt = (group.options || []).find((o) => o.value === val)
            if (opt?.price_adjustment) delta += Number(opt.price_adjustment)
        } else if (group.type === 'boolean') {
            if (val === true && group.price_adjustment) delta += Number(group.price_adjustment)
        } else if (group.type === 'range') {
            const num = Number(val)
            if (!Number.isNaN(num) && group.price_per_unit) delta += num * Number(group.price_per_unit)
        }
    }
    return delta
}

// Cheapest guaranteed price across required select groups — used for "From ₦X" display.
export function getMinPriceAdjustment(variantGroups) {
    if (!variantGroups) return 0
    let total = 0
    for (const group of variantGroups) {
        if (group.type === 'select' && group.required && Array.isArray(group.options) && group.options.length > 0) {
            const pool = group.options.filter((o) => o.available !== false)
            const candidates = pool.length > 0 ? pool : group.options
            total += Math.min(...candidates.map((o) => Number(o.price_adjustment) || 0))
        }
    }
    return total
}

// Human-readable list of current selections, e.g. [{ name: 'Size', display: 'Large' }]
export function formatVariantSelections(variantGroups, selections = {}) {
    if (!variantGroups) return []
    const result = []
    for (const group of variantGroups) {
        const val = selections[group.key]
        if (val == null || val === '' || val === false) continue
        if (group.type === 'select') {
            const opt = (group.options || []).find((o) => o.value === val)
            result.push({ name: group.name, display: opt?.label || val })
        } else if (group.type === 'boolean') {
            if (val === true) result.push({ name: group.name, display: 'Yes' })
        } else if (group.type === 'range') {
            result.push({ name: group.name, display: `${val}${group.unit ? ' ' + group.unit : ''}` })
        } else if (group.type === 'text') {
            result.push({ name: group.name, display: val })
        }
    }
    return result
}

export function getMissingRequiredGroups(variantGroups, selections = {}) {
    if (!variantGroups) return []
    return variantGroups.filter((g) => {
        if (!g.required) return false
        const val = selections[g.key]
        if (g.type === 'select') return val == null || val === ''
        if (g.type === 'text') return !val || (g.min_length && val.length < g.min_length)
        if (g.type === 'range') return val == null || val === ''
        return false
    })
}

function SelectGroup({ group, value, onChange, hasError }) {
    return (
        <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
                {group.name}
                {group.required && <span className="text-red-400 ml-1">*</span>}
            </p>
            <div className="flex flex-wrap gap-2">
                {(group.options || []).map((opt) => {
                    const isSelected = value[group.key] === opt.value
                    const unavailable = opt.available === false
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            disabled={unavailable}
                            onClick={() => !unavailable && onChange(group.key, opt.value)}
                            className={`px-4 py-1.5 text-sm rounded-full border transition ${
                                unavailable
                                    ? 'border-slate-100 text-slate-300 line-through cursor-not-allowed bg-slate-50'
                                    : isSelected
                                        ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-400'
                            }`}
                        >
                            {opt.label}
                            {opt.price_adjustment ? (
                                <span className={`ml-1 text-xs ${isSelected ? 'opacity-80' : 'opacity-60'}`}>
                                    +₦{Number(opt.price_adjustment).toLocaleString()}
                                </span>
                            ) : null}
                            {unavailable && <span className="ml-1 text-[10px]">Out of stock</span>}
                        </button>
                    )
                })}
            </div>
            {hasError && (
                <p className="text-xs text-red-500 mt-1.5">Please select {group.name.toLowerCase()}.</p>
            )}
        </div>
    )
}

function BooleanGroup({ group, value, onChange }) {
    const checked = !!value[group.key]
    return (
        <div className="flex items-center justify-between gap-3">
            <div>
                <p className="text-sm font-medium text-slate-700">{group.name}</p>
                {group.price_adjustment > 0 && (
                    <p className="text-xs text-slate-400 mt-0.5">+₦{Number(group.price_adjustment).toLocaleString()}</p>
                )}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(group.key, !checked)}
                className={`w-11 h-6 rounded-full shrink-0 transition relative ${checked ? 'bg-[var(--primary)]' : 'bg-slate-200'}`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        checked ? 'translate-x-5' : ''
                    }`}
                />
            </button>
        </div>
    )
}

function TextGroup({ group, value, onChange, hasError }) {
    const current = value[group.key] || ''
    return (
        <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
                {group.name}
                {group.required && <span className="text-red-400 ml-1">*</span>}
            </p>
            <input
                type="text"
                value={current}
                maxLength={group.max_length || undefined}
                onChange={(e) => onChange(group.key, e.target.value)}
                placeholder={group.placeholder || `Enter ${group.name.toLowerCase()}`}
                className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-[var(--primary)] transition"
            />
            {group.max_length ? (
                <p className="text-xs text-slate-300 mt-1 text-right">{current.length}/{group.max_length}</p>
            ) : null}
            {hasError && <p className="text-xs text-red-500 mt-1">This field is required.</p>}
        </div>
    )
}

function RangeGroup({ group, value, onChange, hasError }) {
    const current = value[group.key]
    return (
        <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
                {group.name}
                {group.required && <span className="text-red-400 ml-1">*</span>}
            </p>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    min={group.min}
                    max={group.max}
                    value={current ?? ''}
                    onChange={(e) => onChange(group.key, e.target.value)}
                    className="w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] transition"
                    placeholder={`${group.min ?? ''}–${group.max ?? ''}`}
                />
                {group.unit && <span className="text-sm text-slate-400">{group.unit}</span>}
                {group.price_per_unit > 0 && current !== undefined && current !== '' && (
                    <span className="text-xs text-slate-400">
                        = +₦{(Number(current) * Number(group.price_per_unit)).toLocaleString()}
                    </span>
                )}
            </div>
            {hasError && <p className="text-xs text-red-500 mt-1">This field is required.</p>}
        </div>
    )
}

export default function VariantPicker({ variantGroups, value = {}, onChange, errors = [] }) {
    if (!variantGroups || variantGroups.length === 0) return null

    const handleChange = (key, val) => onChange({ ...value, [key]: val })

    return (
        <div className="flex flex-col gap-5 my-5">
            {variantGroups.map((group) => {
                const hasError = errors.includes(group.key)
                if (group.type === 'select') {
                    return <SelectGroup key={group.key} group={group} value={value} onChange={handleChange} hasError={hasError} />
                }
                if (group.type === 'boolean') {
                    return <BooleanGroup key={group.key} group={group} value={value} onChange={handleChange} />
                }
                if (group.type === 'text') {
                    return <TextGroup key={group.key} group={group} value={value} onChange={handleChange} hasError={hasError} />
                }
                if (group.type === 'range') {
                    return <RangeGroup key={group.key} group={group} value={value} onChange={handleChange} hasError={hasError} />
                }
                return null
            })}
        </div>
    )
}
