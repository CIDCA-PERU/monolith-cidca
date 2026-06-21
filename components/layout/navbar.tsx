"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, LogIn, X } from "lucide-react"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const NAV_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Revista", href: "/#revista" },
  { label: "Cursos", href: "/#cursos-ilimitados" },
  { label: "ArbitraUNT", href: "/#arbitraunt" },
  { label: "Moot Court UNT", href: "/#moot-court" },
  { label: "Eventos", href: "/#eventos" },
  { label: "Alianzas", href: "/#alianzas" },
]

export const Navbar = function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500"
      style={{
        backgroundColor: scrolled
          ? "rgba(2, 6, 23, 0.92)"
          : "rgba(2, 6, 23, 0.4)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled
          ? "1px solid rgba(234, 179, 8, 0.12)"
          : "1px solid rgba(255,255,255,0.04)",
        boxShadow: scrolled
          ? "0 4px 32px rgba(0,0,0,0.4)"
          : "none",
      }}
      suppressHydrationWarning
    >
      <div
        className={`w-full transition-all duration-500 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between h-full">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <Image
                src="/IMG_6639.jpeg"
                alt="CIDCA Logo"
                width={60}
                height={60}
                priority
                className={`object-contain transition-all duration-500 ${
                  scrolled ? "w-9 h-9" : "w-12 h-12"
                }`}
              />
            </div> 
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-md group whitespace-nowrap ${
                    isActive
                      ? "text-yellow-400"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {/* Hover background pill */}
                  <span className="absolute inset-0 rounded-md bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
                  {link.label}
                  {/* Active indicator / hover underline */}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-yellow-400 rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-4 opacity-100"
                        : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-100"
                    }`}
                  />
                </Link>
              )
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:block shrink-0">
            <LoginButton scrolled={scrolled} />
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <button
                className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-yellow-500/30 text-slate-300 hover:text-white transition-all duration-200"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[80vw] max-w-[320px] border-l border-white/10 p-0"
              style={{
                backgroundColor: "rgba(2, 6, 23, 0.97)",
                backdropFilter: "blur(20px)",
              }}
            >
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>

              {/* Mobile Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
                <Link
                  href="/"
                  className="flex items-center gap-2.5"
                  onClick={() => setMobileOpen(false)}
                >
                  <Image
                    src="/IMG_6639.jpeg"
                    alt="CIDCA Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                  <span className="font-bold text-base text-white tracking-wide">
                    CIDCA
                  </span>
                </Link>
              </div>

              {/* Mobile Links */}
              <nav className="flex flex-col px-3 py-4 gap-1">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20"
                          : "text-slate-300 hover:text-white hover:bg-white/6 border border-transparent"
                      }`}
                    >
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                      )}
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile CTA */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4 border-t border-white/8">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="group relative flex items-center justify-center gap-2 w-full h-14 rounded-2xl text-yellow-400 bg-slate-950/80 backdrop-blur-md border border-yellow-500/30 font-bold text-sm transition-all duration-500 hover:text-slate-950 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-500 hover:border-yellow-400 hover:shadow-[0_0_30px_-5px_rgba(234,179,8,0.6)] active:scale-95 overflow-hidden"
                >
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                  <LogIn className="relative z-10 h-5 w-5 transition-transform duration-500 group-hover:-translate-x-1" />
                  <span className="relative z-10 text-base">Iniciar Sesión</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

// Botón de Login premium
function LoginButton({ scrolled }: { scrolled: boolean }) {
  return (
    <Link
      href="/login"
      className={`group relative inline-flex items-center justify-center gap-2 font-bold text-yellow-400 bg-slate-950/80 backdrop-blur-md border border-yellow-500/30 rounded-full overflow-hidden transition-all duration-500 hover:text-slate-950 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-500 hover:border-yellow-400 hover:shadow-[0_0_30px_-5px_rgba(234,179,8,0.6)] active:scale-95
        ${scrolled ? "h-9 px-5 text-xs" : "h-11 px-6 text-sm"}`}
    >
      <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
      <LogIn className={`relative z-10 transition-transform duration-500 group-hover:-translate-x-1 ${scrolled ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
      <span className="relative z-10">Iniciar Sesión</span>
    </Link>
  )
}

export { LoginButton as AuthButtonsComponent }
export default Navbar