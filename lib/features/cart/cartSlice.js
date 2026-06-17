import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},
    },
    reducers: {
        addToCart: (state, action) => {
            const { product_id, quantity = 1, name, price, currency, image_url, variants = {} } = action.payload
            if (state.cartItems[product_id]) {
                state.cartItems[product_id].quantity += quantity
            } else {
                state.cartItems[product_id] = { quantity, name, price, currency, image_url, variants }
            }
            state.total += quantity
        },
        updateQuantity: (state, action) => {
            const { product_id, delta } = action.payload
            const item = state.cartItems[product_id]
            if (!item) return
            const newQty = item.quantity + delta
            if (newQty <= 0) {
                state.total -= item.quantity
                delete state.cartItems[product_id]
            } else {
                state.total += delta
                item.quantity = newQty
            }
        },
        deleteItemFromCart: (state, action) => {
            const { product_id } = action.payload
            if (state.cartItems[product_id]) {
                state.total -= state.cartItems[product_id].quantity
                delete state.cartItems[product_id]
            }
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
    },
})

export const { addToCart, updateQuantity, deleteItemFromCart, clearCart } = cartSlice.actions

export default cartSlice.reducer
