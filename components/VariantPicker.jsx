'use client'

/**
 * Computes total price adjustment from current selections.
 * Supports variant_metadata format: { key: { options: [...], price_modifiers: { optionValue: delta } } }
 */
export function computePriceAdjustment(variantMetadata, selections) {
    if (!variantMetadata || !selections) return 0
    let delta = 0
    for (const [key, spec] of Object.entries(variantMetadata)) {
        const selected = selections[key]
        if (selected == null) continue
        const modifiers = spec?.price_modifiers
        if (modifiers && modifiers[selected] != null) {
            delta += Number(modifiers[selected])
        }
    }
    return delta
}

export default function VariantPicker({ variantMetadata, value = {}, onChange }) {
    if (!variantMetadata || Object.keys(variantMetadata).length === 0) return null

    const handleChange = (key, val) => {
        onChange({ ...value, [key]: val })
    }

    return (
        <div className="flex flex-col gap-5 my-5">
            {Object.entries(variantMetadata).map(([key, spec]) => {
                const label = key.charAt(0).toUpperCase() + key.slice(1)

                if (Array.isArray(spec?.options) || Array.isArray(spec)) {
                    const options = spec?.options || spec
                    const modifiers = spec?.price_modifiers || {}
                    return (
                        <div key={key}>
                            <p className="text-sm font-medium text-slate-700 mb-2">
                                {label}
                                {spec?.required && <span className="text-red-400 ml-1">*</span>}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {options.map((opt) => {
                                    const delta = modifiers[opt]
                                    return (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => handleChange(key, opt)}
                                            className={`px-4 py-1.5 text-sm rounded-full border transition ${
                                                value[key] === opt
                                                    ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                                                    : 'border-slate-200 text-slate-600 hover:border-slate-400'
                                            }`}
                                        >
                                            {opt}
                                            {delta != null && delta !== 0 && (
                                                <span className="ml-1 text-xs opacity-75">
                                                    {delta > 0 ? `+₦${Number(delta).toLocaleString()}` : `-₦${Math.abs(delta).toLocaleString()}`}
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )
                }

                if (spec?.type === 'boolean') {
                    return (
                        <label key={key} className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!value[key]}
                                onChange={(e) => handleChange(key, e.target.checked)}
                                className="w-4 h-4 accent-[var(--primary)]"
                            />
                            <span className="text-sm text-slate-700">{label}</span>
                        </label>
                    )
                }

                if (spec?.min !== undefined || spec?.max !== undefined) {
                    return (
                        <div key={key}>
                            <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>
                            <input
                                type="number"
                                min={spec.min}
                                max={spec.max}
                                value={value[key] || ''}
                                onChange={(e) => handleChange(key, e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-[var(--primary)] transition"
                                placeholder={`${spec.min ?? ''} – ${spec.max ?? ''}`}
                            />
                        </div>
                    )
                }

                return (
                    <div key={key}>
                        <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>
                        <input
                            type="text"
                            value={value[key] || ''}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-[var(--primary)] transition"
                            placeholder={`Enter ${label.toLowerCase()}`}
                        />
                    </div>
                )
            })}
        </div>
    )
}
