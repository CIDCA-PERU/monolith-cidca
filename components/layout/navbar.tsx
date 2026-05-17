"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Menu,
  BookOpen,
  Users,
  BarChart3,
  Globe,
  Zap,
  Award,
  ChevronDown,
  LogIn,
} from "lucide-react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { HoverDropdownMenu } from "@/components/layout/hover-dropdown-menu"

export const Navbar = function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(8px)",
      }}
      suppressHydrationWarning
    >
      <div
        className={`w-full backdrop-blur-sm shadow-lg flex items-center justify-between transition-all duration-300 ${
          scrolled ? "bg-black/60 h-14" : "bg-white/5 h-16"
        }`}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between w-full">
          <Link href="/" className="flex items-center space-x-1">
            <Image
              src="/IMG_6640.PNG"
              alt="Aula Virtual Logo"
              width={50}
              height={50}
              priority
              className={`transition-all duration-300 ${scrolled ? "w-5 h-5" : "w-6 h-6"}`}
            />
            <span className={`transition-all duration-300 ${scrolled ? "text-lg" : "text-xl"}`}>
              <span className="font-light">CIDCA</span>
              <span className="font-bold"> AULA VIRTUAL</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-xs sm:text-sm font-medium transition-colors hover:text-primary hover:scale-105 transition-transform duration-200 ${pathname === "/" ? "text-primary" : ""} group`}
            >
              <span className="relative">
                Inicio
                <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </Link>

            {/* Menú Características */}
            <HoverDropdownMenu
              trigger="Nosotros"
              isActive={pathname === "/#caracteristicas"}
            >
              <Link
                href="/#cursos-ilimitados"
                className={`flex items-start gap-3 rounded-lg p-3 hover:bg-white/10 transition-colors ${pathname === "/#cursos-ilimitados" ? "bg-white/5" : ""}`}
              >
                <BookOpen className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="font-medium">Cursos Ilimitados</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Acceso a miles de cursos en diferentes áreas
                  </div>
                </div>
              </Link>

              <Link
                href="/#comunidad"
                className={`flex items-start gap-3 rounded-lg p-3 hover:bg-white/10 transition-colors ${pathname === "/#comunidad" ? "bg-white/5" : ""}`}
              >
                <Users className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <div className="font-medium">Comunidad Activa</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Aprende con otros estudiantes del mundo
                  </div>
                </div>
              </Link>

              <Link
                href="/#certificados"
                className={`flex items-start gap-3 rounded-lg p-3 hover:bg-white/10 transition-colors ${pathname === "/#certificados" ? "bg-white/5" : ""}`}
              >
                <Award className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <div className="font-medium">Certificados Reconocidos</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Obtén certificados validados por la industria
                  </div>
                </div>
              </Link>

              <Link
                href="/#metodologia"
                className={`flex items-start gap-3 rounded-lg p-3 hover:bg-white/10 transition-colors ${pathname === "/#metodologia" ? "bg-white/5" : ""}`}
              >
                <Zap className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <div className="font-medium">Metodología Probada</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Sistema de aprendizaje interactivo y efectivo
                  </div>
                </div>
              </Link>
            </HoverDropdownMenu>

            {/* Menú Revista */}
            <HoverDropdownMenu
              trigger="Revista"
              isActive={pathname.includes("/como-funciona")}
            >
              <Link
                href="/#registro"
                className={`flex items-start gap-3 rounded-lg p-3 hover:bg-white/10 transition-colors ${pathname === "/#registro" ? "bg-white/5" : ""}`}
              >
                <Users className="h-5 w-5 text-cyan-400 mt-0.5" />
                <div>
                  <div className="font-medium">Registro Simple</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Únete en menos de 5 minutos
                  </div>
                </div>
              </Link>

              <Link
                href="/#elige-curso"
                className={`flex items-start gap-3 rounded-lg p-3 hover:bg-white/10 transition-colors ${pathname === "/#elige-curso" ? "bg-white/5" : ""}`}
              >
                <BookOpen className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="font-medium">Elige tu Curso</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Explora y selecciona los cursos que te interesan
                  </div>
                </div>
              </Link>

              <Link
                href="/#aprende"
                className={`flex items-start gap-3 rounded-lg p-3 hover:bg-white/10 transition-colors ${pathname === "/#aprende" ? "bg-white/5" : ""}`}
              >
                <BarChart3 className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <div className="font-medium">Aprende a tu Ritmo</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Estudia cuando y donde quieras
                  </div>
                </div>
              </Link>

              <Link
                href="/#certificacion"
                className={`flex items-start gap-3 rounded-lg p-3 hover:bg-white/10 transition-colors ${pathname === "/#certificacion" ? "bg-white/5" : ""}`}
              >
                <Award className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <div className="font-medium">Obtén tu Certificado</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Completa y certifica tus aprendizajes
                  </div>
                </div>
              </Link>
            </HoverDropdownMenu>

            {/* Menú ArbitraUNT */}
            <HoverDropdownMenu trigger="ArbitraUNT" isActive={pathname === "/arbitraunt"}>
              <Link
                href="/arbitraunt"
                className={`flex items-start gap-3 rounded-lg p-3 hover:bg-white/10 transition-colors ${pathname === "/arbitraunt" ? "bg-white/5" : ""}`}
              >
                <Globe className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <div className="font-medium">ArbitraUNT</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Acceso limitado a cursos seleccionados
                  </div>
                </div>
              </Link>

              <Link
                href="/planes#premium"
                className={`flex items-start gap-3 rounded-lg p-3 hover:bg-white/10 transition-colors ${pathname === "/planes#premium" ? "bg-white/5" : ""}`}
              >
                <Zap className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="font-medium">Plan Premium</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Acceso ilimitado a todos los cursos
                  </div>
                </div>
              </Link>

              <Link
                href="/planes#empresarial"
                className={`flex items-start gap-3 rounded-lg p-3 hover:bg-white/10 transition-colors ${pathname === "/planes#empresarial" ? "bg-white/5" : ""}`}
              >
                <BarChart3 className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <div className="font-medium">Plan Empresarial</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Soluciones personalizadas para equipos
                  </div>
                </div>
              </Link>
            </HoverDropdownMenu>

            {/* Menú mootcourtUNT */}
            <HoverDropdownMenu trigger="Moot Court UNT" isActive={pathname === "/mootcourtunt"}>
              <Link
                href="/mootcourtunt"
                className={`flex items-start gap-3 rounded-lg p-3 hover:bg-white/10 transition-colors ${pathname === "/mootcourtunt" ? "bg-white/5" : ""}`}
              >
                <Globe className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <div className="font-medium">Moot Court UNT</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Información sobre el Moot Court UNT
                  </div>
                </div>
              </Link>
            </HoverDropdownMenu> 

            {/* Menú eventos */}
            <HoverDropdownMenu trigger="Eventos" isActive={pathname === "/eventos"}>
              <Link
                href="/eventos"
                className={`flex items-start gap-3 rounded-lg p-3 hover:bg-white/10 transition-colors ${pathname === "/eventos" ? "bg-white/5" : ""}`}
              >
                <Globe className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <div className="font-medium">Eventos</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Información sobre eventos
                  </div>
                </div>
              </Link>
            </HoverDropdownMenu>

            {/* Menú Alianzas */}
            <HoverDropdownMenu trigger="Alianzas" isActive={pathname === "/alianzas"}>
              <Link
                href="/alianzas"
                className={`flex items-start gap-3 rounded-lg p-3 hover:bg-white/10 transition-colors ${pathname === "/alianzas" ? "bg-white/5" : ""}`}
              >
                <Globe className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <div className="font-medium">Alianzas</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Información sobre alianzas
                  </div>
                </div>
              </Link>
            </HoverDropdownMenu> 
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:block">
            <AuthButtonsComponent scrolled={scrolled} />
          </div>

          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background/90 backdrop-blur-sm border-white/10 w-[80vw] max-w-sm">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              <div className="flex flex-col h-full py-6">
                <div className="flex items-center mb-8">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ARTTENLOGOPNG-aKFKENDEI6HRNKJYsilR99a5pAu2Sv.png"
                    alt="Aula Virtual Logo"
                    width={24}
                    height={24}
                    className="w-6 h-6 mr-3"
                  />
                  <span className="text-xl">
                    <span className="font-light">Aula</span>
                    <span className="font-bold">Virtual</span>
                  </span>
                </div>

                <nav className="flex flex-col space-y-4 flex-1">
                  <Link
                    href="/"
                    className={`text-base font-medium transition-colors hover:text-primary py-2 ${pathname === "/" ? "text-primary" : ""}`}
                  >
                    Inicio
                  </Link>

                  <div className="py-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-medium">Características</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                    <div className="pl-4 space-y-2 border-l border-white/10">
                      <Link
                        href="/#cursos-ilimitados"
                        className={`flex items-center gap-2 text-base transition-colors hover:text-primary ${pathname === "/#cursos-ilimitados" ? "text-primary" : ""}`}
                      >
                        <BookOpen className="h-4 w-4 text-blue-400" />
                        Cursos Ilimitados
                      </Link>
                      <Link
                        href="/#comunidad"
                        className={`flex items-center gap-2 text-base transition-colors hover:text-primary ${pathname === "/#comunidad" ? "text-primary" : ""}`}
                      >
                        <Users className="h-4 w-4 text-green-400" />
                        Comunidad Activa
                      </Link>
                      <Link
                        href="/#certificados"
                        className={`flex items-center gap-2 text-base transition-colors hover:text-primary ${pathname === "/#certificados" ? "text-primary" : ""}`}
                      >
                        <Award className="h-4 w-4 text-red-400" />
                        Certificados
                      </Link>
                      <Link
                        href="/#metodologia"
                        className={`flex items-center gap-2 text-base transition-colors hover:text-primary ${pathname === "/#metodologia" ? "text-primary" : ""}`}
                      >
                        <Zap className="h-4 w-4 text-purple-400" />
                        Metodología
                      </Link>
                    </div>
                  </div>

                  <div className="py-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-medium">Cómo Funciona</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                    <div className="pl-4 space-y-2 border-l border-white/10">
                      <Link
                        href="/#registro"
                        className={`flex items-center gap-2 text-base transition-colors hover:text-primary ${pathname === "/#registro" ? "text-primary" : ""}`}
                      >
                        <Users className="h-4 w-4 text-cyan-400" />
                        Registro
                      </Link>
                      <Link
                        href="/#elige-curso"
                        className={`flex items-center gap-2 text-base transition-colors hover:text-primary ${pathname === "/#elige-curso" ? "text-primary" : ""}`}
                      >
                        <BookOpen className="h-4 w-4 text-blue-400" />
                        Elige tu Curso
                      </Link>
                      <Link
                        href="/#aprende"
                        className={`flex items-center gap-2 text-base transition-colors hover:text-primary ${pathname === "/#aprende" ? "text-primary" : ""}`}
                      >
                        <BarChart3 className="h-4 w-4 text-green-400" />
                        Aprende
                      </Link>
                      <Link
                        href="/#certificacion"
                        className={`flex items-center gap-2 text-base transition-colors hover:text-primary ${pathname === "/#certificacion" ? "text-primary" : ""}`}
                      >
                        <Award className="h-4 w-4 text-yellow-400" />
                        Certificación
                      </Link>
                    </div>
                  </div>

                  <div className="py-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-medium">Planes</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                    <div className="pl-4 space-y-2 border-l border-white/10">
                      <Link
                        href="/planes#gratuito"
                        className={`flex items-center gap-2 text-base transition-colors hover:text-primary ${pathname === "/planes#gratuito" ? "text-primary" : ""}`}
                      >
                        <Globe className="h-4 w-4 text-purple-400" />
                        Plan Gratuito
                      </Link>
                      <Link
                        href="/planes#premium"
                        className={`flex items-center gap-2 text-base transition-colors hover:text-primary ${pathname === "/planes#premium" ? "text-primary" : ""}`}
                      >
                        <Zap className="h-4 w-4 text-blue-400" />
                        Plan Premium
                      </Link>
                      <Link
                        href="/planes#empresarial"
                        className={`flex items-center gap-2 text-base transition-colors hover:text-primary ${pathname === "/planes#empresarial" ? "text-primary" : ""}`}
                      >
                        <BarChart3 className="h-4 w-4 text-green-400" />
                        Plan Empresarial
                      </Link>
                    </div>
                  </div> 
                </nav>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex flex-col space-y-3">
                    <AuthButtonsComponent scrolled={scrolled} />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

// Componente para los botones de autenticación
export function AuthButtonsComponent({ scrolled }: { scrolled: boolean }) {
  return (
    <div className="flex items-center space-x-3">
      <Button
        asChild
        variant="default"
         className={`flex items-center gap-1 transition-all duration-300 bg-accent hover:bg-accent/90 text-black font-bold ${scrolled ? "h-8 text-sm" : "h-9"}`}
      >
        <Link href="/login">
          <LogIn className={`transition-all duration-300 text-black ${scrolled ? "h-3.5 w-3.5 mr-1" : "h-4 w-4 mr-1"}`} />
          Iniciar Sesión
        </Link>
      </Button>
    </div>
  )
}

export default Navbar