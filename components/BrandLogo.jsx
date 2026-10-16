// The merchant's logo at the right size: processed 2x/3x derivatives when the
// dashboard produced them, else the raw logo_url. Fixed height + auto width +
// object-contain, so it never distorts, and the aspect ratio reserves its box
// before load so the header doesn't jump.
export default function BrandLogo({ config, alt, className = '' }) {
    const urls = config?.brand_assets?.logo?.urls
    const src = urls?.x2 || config?.logo_url
    if (!src) return null
    const srcSet = urls?.x2 && urls?.x3 ? `${urls.x2} 2x, ${urls.x3} 3x` : undefined
    return (
        <img
            src={src}
            srcSet={srcSet}
            alt={alt}
            decoding="async"
            // x2 is 80px tall = 40px at 2x density; show it at 32px (phones) / 40px (desktop)
            className={`h-8 w-auto max-w-[56vw] object-contain object-left sm:h-10 sm:max-w-[240px] ${className}`}
            style={urls?.aspect ? { aspectRatio: String(urls.aspect) } : undefined}
        />
    )
}
