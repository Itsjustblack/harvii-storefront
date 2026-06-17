'use client'
import { createContext, useContext } from 'react'

const StorefrontContext = createContext({ config: null, slug: 'demo' })

export function StorefrontProvider({ config, slug, children }) {
    return (
        <StorefrontContext.Provider value={{ config, slug }}>
            {children}
        </StorefrontContext.Provider>
    )
}

export function useStorefront() {
    return useContext(StorefrontContext)
}
