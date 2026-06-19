'use client'
import { useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function QueryProvider({ children }) {
    const clientRef = useRef(undefined)
    if (!clientRef.current) {
        clientRef.current = new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 60_000,
                    refetchOnWindowFocus: false,
                },
            },
        })
    }

    return <QueryClientProvider client={clientRef.current}>{children}</QueryClientProvider>
}
