'use client'

const ProductDescription = ({ product }) => {
    if (!product.description) return null

    return (
        <div className="my-12 text-sm text-slate-600">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Description</h3>
            <p className="max-w-2xl leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
    )
}

export default ProductDescription