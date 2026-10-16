import { CURRENCY_SYMBOLS } from '@/lib/constants'

// One place prices are formatted. Currency is NGN everywhere today; when
// multi-currency lands this is the function to change.
export function formatPrice(amount, currency = 'NGN') {
    if (amount === null || amount === undefined || amount === '') return ''
    const value = Number(amount)
    if (!Number.isFinite(value)) return ''
    const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `
    return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}
