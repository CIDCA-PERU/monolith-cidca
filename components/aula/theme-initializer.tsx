'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

interface ThemeInitializerProps {
  modoOscuro: boolean
}

export function ThemeInitializer({ modoOscuro }: ThemeInitializerProps) {
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme(modoOscuro ? 'dark' : 'light')
  }, [])

  return null
}
