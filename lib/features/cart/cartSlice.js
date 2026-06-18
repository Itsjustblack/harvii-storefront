import { createSlice } from '@reduxjs/toolkit'

// Different variant selections of the same product are separate cart lines.
export function buildCartKey(product_id, variants) {
    if (!variants || Object.keys(variants).length === 0) return product_id
    const sorted = Object.keys(variants).sort().reduce((acc, k) => {
        acc[k] = variants[k]
        return acc
    }, {})
    return `${product_id}::${JSON.stringify(sorted)}`
}

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},
    },
    reducers: {
        addToCart: (state, action) => {
            const {
                product_id,
                quantity = 1,
                name,
                price,
                base_price,
                currency,
                image_url,
                variants = {},
                variant_metadata = null,
            } = action.payload
            const cartKey = buildCartKey(product_id, variants)
            if (state.cartItems[cartKey]) {
                state.cartItems[cartKey].quantity += quantity
            } else {
                state.cartItems[cartKey] = {
                    product_id,
                    quantity,
                    name,
                    price,
                    base_price: base_price ?? price,
                    currency,
                    image_url,
                    variants,
                    variant_metadata,
                }
            }
            state.total += quantity
        },
        updateQuantity: (state, action) => {
            const { cartKey, delta } = action.payload
            const item = state.cartItems[cartKey]
            if (!item) return
            const newQty = item.quantity + delta
            if (newQty <= 0) {
                state.total -= item.quantity
                delete state.cartItems[cartKey]
            } else {
                state.total += delta
                item.quantity = newQty
            }
        },
        deleteItemFromCart: (state, action) => {
            const { cartKey } = action.payload
            if (state.cartItems[cartKey]) {
                state.total -= state.cartItems[cartKey].quantity
                delete state.cartItems[cartKey]
            }
        },
        // Used when a customer resolves missing required variants from the cart page.
        // Re-keys the line if the new variant selection maps to a different cart key,
        // merging into an existing line if one already matches.
        updateCartItemVariants: (state, action) => {
            const { cartKey, variants, price } = action.payload
            const item = state.cartItems[cartKey]
            if (!item) return
            const newKey = buildCartKey(item.product_id, variants)
            if (newKey === cartKey) {
                item.variants = variants
                item.price = price
                return
            }
            if (state.cartItems[newKey]) {
                state.cartItems[newKey].quantity += item.quantity
            } else {
                state.cartItems[newKey] = { ...item, variants, price }
            }
            delete state.cartItems[cartKey]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
    },
})

export const { addToCart, updateQuantity, deleteItemFromCart, updateCartItemVariants, clearCart } = cartSlice.actions

export default cartSlice.reducer
