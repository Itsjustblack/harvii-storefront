import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './features/cart/cartSlice'
import checkoutReducer from './features/checkout/checkoutSlice'
import authReducer from './features/auth/authSlice'

const localStorageCartMiddleware = (store) => (next) => (action) => {
    const result = next(action)
    if (typeof window !== 'undefined' && action.type?.startsWith('cart/')) {
        try {
            localStorage.setItem('harvii_cart', JSON.stringify(store.getState().cart))
        } catch {}
    }
    return result
}

function getPreloadedState() {
    if (typeof window === 'undefined') return {}
    try {
        const cart = localStorage.getItem('harvii_cart')
        return cart ? { cart: JSON.parse(cart) } : {}
    } catch {
        return {}
    }
}

export const makeStore = () => {
    return configureStore({
        reducer: {
            cart: cartReducer,
            checkout: checkoutReducer,
            auth: authReducer,
        },
        preloadedState: getPreloadedState(),
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(localStorageCartMiddleware),
    })
}
