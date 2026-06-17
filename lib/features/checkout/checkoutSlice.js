import { createSlice } from '@reduxjs/toolkit'

const checkoutSlice = createSlice({
    name: 'checkout',
    initialState: {
        step: 1,
        token: null,
        expiresAt: null,
        customerInfo: { name: '', email: '', phone: '' },
        addressInfo: { address: '', state: '' },
        delivery: { fee: 0, item_total: 0, total: 0, discount_amount: 0 },
        promo: null,
        payment: null,
    },
    reducers: {
        setStep: (state, action) => { state.step = action.payload },
        setToken: (state, action) => {
            state.token = action.payload.token
            state.expiresAt = action.payload.expiresAt || null
        },
        setCustomerInfo: (state, action) => { state.customerInfo = action.payload },
        setAddressInfo: (state, action) => { state.addressInfo = action.payload },
        setDelivery: (state, action) => { state.delivery = action.payload },
        setPromo: (state, action) => { state.promo = action.payload },
        clearPromo: (state) => { state.promo = null },
        setPayment: (state, action) => { state.payment = action.payload },
        resetCheckout: () => ({
            step: 1,
            token: null,
            expiresAt: null,
            customerInfo: { name: '', email: '', phone: '' },
            addressInfo: { address: '', state: '' },
            delivery: { fee: 0, item_total: 0, total: 0, discount_amount: 0 },
            promo: null,
            payment: null,
        }),
    },
})

export const {
    setStep,
    setToken,
    setCustomerInfo,
    setAddressInfo,
    setDelivery,
    setPromo,
    clearPromo,
    setPayment,
    resetCheckout,
} = checkoutSlice.actions

export default checkoutSlice.reducer
