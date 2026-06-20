'use client'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'

const PLACEHOLDER = 'https://gocart-gs.vercel.app/_next/static/media/product_img4.60bc85fd.png'

function ComponentRow({ component }) {
    const {
        component_name,
        component_image_url,
        quantity_required,
        is_customer_selectable,
        fixed_variant_display,
    } = component

    return (
        <div className="flex items-center gap-3 py-3">
            <div className="relative shrink-0 size-14 sm:size-16 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                <Image
                    src={component_image_url || PLACEHOLDER}
                    alt={component_name}
                    fill
                    sizes="64px"
                    className="object-contain p-1.5"
                />
                {quantity_required > 1 && (
                    <span className="absolute bottom-0.5 right-0.5 bg-slate-800 text-white text-[10px] font-semibold leading-none rounded-full size-5 flex items-center justify-center">
                        {quantity_required}
                    </span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{component_name}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {is_customer_selectable ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[var(--primary)]/8 text-[var(--primary)] text-[11px] font-medium">
                            You choose
                        </span>
                    ) : fixed_variant_display && fixed_variant_display.length > 0 ? (
                        fixed_variant_display.map((v, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium"
                            >
                                {v.name}: {v.display}
                            </span>
                        ))
                    ) : null}
                </div>
            </div>
        </div>
    )
}

export default function BundleContents({ components, bundlePrice, currency = 'NGN' }) {
    if (!components || components.length === 0) return null

    const componentsTotal = components.reduce(
        (sum, c) => sum + Number(c.component_price || 0) * (c.quantity_required || 1),
        0
    )
    const savings = componentsTotal - Number(bundlePrice || 0)
    const savingsPct = componentsTotal > 0 ? Math.round((savings / componentsTotal) * 100) : 0

    return (
        <div className="mt-8 border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                <p className="text-sm font-semibold text-slate-800">
                    What&apos;s included
                    <span className="ml-1.5 text-slate-400 font-normal">({components.length} items)</span>
                </p>
            </div>

            <div className="px-5 divide-y divide-slate-100">
                {components.map((c) => (
                    <ComponentRow key={c.component_product_id} component={c} />
                ))}
            </div>

            {savings > 0 && (
                <div className="px-5 py-3.5 bg-green-50 border-t border-green-100 flex items-center gap-2">
                    <Sparkles size={15} className="text-green-600 shrink-0" />
                    <p className="text-sm text-green-700">
                        <span className="font-semibold">You save ₦{savings.toLocaleString()}</span>
                        {savingsPct > 0 && <span className="text-green-600"> ({savingsPct}% off buying separately)</span>}
                    </p>
                </div>
            )}
        </div>
    )
}
