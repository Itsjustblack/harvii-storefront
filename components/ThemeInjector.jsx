'use client'
import { useEffect } from 'react'

export default function ThemeInjector({ primaryColor }) {
    useEffect(() => {
        const color = primaryColor || '#000000'
        document.documentElement.style.setProperty('--primary', color)
    }, [primaryColor])
    return null
}