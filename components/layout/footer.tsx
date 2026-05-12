"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Linkedin, MessageCircle, DiscIcon as Discord } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full bg-black/50 backdrop-blur-md border-t border-white/10 py-8">
      <div className="container px-4 md:px-6 mx-auto">
        {/* Sección principal del footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="IMG_6640.PNG"
                alt="CIDCA Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl">
                <span className="font-light"></span>
                <span className="font-bold">CIDCA</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Formando profesionales altamente capacitados. Educación de calidad con certificaciones de alto valor para tu futuro
            </p>

            {/* Redes sociales */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="https://www.facebook.com/cidca.unt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.instagram.com/cidca.unt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/c%C3%ADrculo-de-investigaci%C3%B3n-de-derecho-civil-y-arbitraje-cidca/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="https://wa.me/51999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-white">Oferta Académica</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/servicios/diseno-web-apps"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Todos los Cursos
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios/diseno-grafico"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Diplomados
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios/diseno-y-modelado-3d"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Especializaciones
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios/anuncios-marketing"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Verificar Certificado
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-white">Institución/Soporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/nosotros" className="text-muted-foreground hover:text-primary transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/como-usar" className="text-muted-foreground hover:text-primary transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/#contacto" className="text-muted-foreground hover:text-primary transition-colors">
                  Políticas de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/terminos-y-condiciones"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/medios-de-pago" className="text-muted-foreground hover:text-primary transition-colors">
                  Libro de Reclamaciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Acceso y Contacto */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-white">Acceso y Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
                  Aula Virtual
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-muted-foreground hover:text-primary transition-colors">
                  Crear Cuenta
                </Link>
              </li>
            </ul>

            {/* Contacto Rápido */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3 text-white">Contacto Rápido</h3>
              <Link
                href="https://wa.me/51972728663"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>+51 999 999 999</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="w-full h-px bg-white/10 my-6"></div>

        {/* Información legal y copyright */}
        <div className="text-center text-xs text-muted-foreground">
          <p className="mb-2">Círculo de Investigación de Derecho Civil y Arbitraje - RUC 20612194743</p>
          <p>&copy; {new Date().getFullYear()} CIDCA - Todos los Derechos Reservados</p>
        </div>

        {/* Enlaces de privacidad y términos */}
        <div className="flex justify-center gap-6 mt-4">
          <Link href="/privacidad" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Privacidad
          </Link>
          <Link
            href="/terminos-y-condiciones"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Términos
          </Link>
          <Link href="/medios-de-pago" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Medios de Pago
          </Link>
        </div>
      </div>
    </footer>
  )
}
