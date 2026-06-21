'use client'
import { useEffect } from 'react'

function getContrastColor(hex) {
    const clean = hex.replace('#', '')
    const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
    const r = parseInt(full.substring(0, 2), 16)
    const g = parseInt(full.substring(2, 4), 16)
    const b = parseInt(full.substring(4, 6), 16)
    if ([r, g, b].some(Number.isNaN)) return '#ffffff'
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#ffffff'
}

export default function ThemeInjector({ primaryColor }) {
    useEffect(() => {
        const color = primaryColor || '#000000'
        document.documentElement.style.setProperty('--primary', color)
        document.documentElement.style.setProperty('--primary-foreground', getContrastColor(color))
    }, [primaryColor])
    return null
}