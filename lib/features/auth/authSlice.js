import { createSlice } from '@reduxjs/toolkit'

function getInitialAuth() {
    if (typeof window === 'undefined') return { token: null, email: null, account_id: null }
    try {
        const stored = localStorage.getItem('harvii_auth')
        return stored ? JSON.parse(stored) : { token: null, email: null, account_id: null }
    } catch {
        return { token: null, email: null, account_id: null }
    }
}

const authSlice = createSlice({
    name: 'auth',
    initialState: getInitialAuth(),
    reducers: {
        setAuth: (state, action) => {
            const { token, email, account_id } = action.payload
            state.token = token
            state.email = email
            state.account_id = account_id
            if (typeof window !== 'undefined') {
                localStorage.setItem('harvii_auth', JSON.stringify({ token, email, account_id }))
            }
        },
        clearAuth: (state) => {
            state.token = null
            state.email = null
            state.account_id = null
            if (typeof window !== 'undefined') {
                localStorage.removeItem('harvii_auth')
            }
        },
    },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer
