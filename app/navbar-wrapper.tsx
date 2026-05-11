'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from "@/components/layout/navbar"

export function NavbarWrapper() {
  const pathname = usePathname()
  const showNavbar = pathname === '/' || pathname === '/login'

  return showNavbar ? <Navbar /> : null
}
