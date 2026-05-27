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
          <div className="space-y-4 text-white">
            <div className="flex items-center gap-2">
              <Image
                src="IMG_6639.jpeg"
                alt="CIDCA Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl"> 
                <span className="font-bold">CIDCA</span>
              </span>
            </div>
            <p className="text-sm">
              Formando profesionales altamente capacitados. Educación de calidad con certificaciones de alto valor para tu futuro
            </p>

            {/* Redes sociales */}
            <div className="text-white flex flex-wrap gap-4 pt-2">
              <Link
                href="https://www.facebook.com/cidca.unt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.instagram.com/cidca.unt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/c%C3%ADrculo-de-investigaci%C3%B3n-de-derecho-civil-y-arbitraje-cidca/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="https://wa.me/51999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Servicios */}
          <div className="text-white">
            <h3 className="text-sm font-bold mb-3">Oferta Académica</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/servicios/diseno-web-apps"
                  className="hover:text-blue-500 transition-colors"
                >
                  Todos los Cursos
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios/diseno-grafico"
                  className="hover:text-blue-500 transition-colors"
                >
                  Diplomados
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios/diseno-y-modelado-3d"
                  className="hover:text-blue-500 transition-colors"
                >
                  Especializaciones
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios/anuncios-marketing"
                  className="hover:text-blue-500 transition-colors"
                >
                  Verificar Certificado
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-sm font-bold mb-3 text-white">Institución/Soporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/nosotros" className="text-white hover:text-blue-500 transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/como-usar" className="text-white hover:text-blue-500 transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/#contacto" className="text-white hover:text-blue-500 transition-colors">
                  Políticas de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/terminos-y-condiciones"
                  className="text-white hover:text-blue-500 transition-colors"
                >
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/medios-de-pago" className="text-white hover:text-blue-500 transition-colors">
                  Libro de Reclamaciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Acceso y Contacto */}
          <div>
            <h3 className="text-sm font-bold mb-3 text-white">Acceso y Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-white hover:text-blue-500 transition-colors">
                  Aula Virtual
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-white hover:text-blue-500 transition-colors">
                  Crear Cuenta
                </Link>
              </li>
            </ul>

            {/* Contacto Rápido */}
            <div className="mt-6">
              <h3 className="text-sm font-bold mb-3 text-white">Contacto Rápido</h3>
              <Link
                href="https://wa.me/51972728663"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white hover:text-blue-500 transition-colors"
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
        <div className="text-center text-xs text-white">
          <p className="mb-2">Círculo de Investigación de Derecho Civil y Arbitraje - RUC 20000000000</p>
          <p>&copy; {new Date().getFullYear()} CIDCA - Todos los Derechos Reservados</p>
        </div>

        {/* Enlaces de privacidad y términos */}
        <div className="flex justify-center gap-6 mt-4">
          <Link href="/privacidad" className="text-xs text-white hover:text-blue-500 transition-colors">
            Privacidad
          </Link>
          <Link
            href="/terminos-y-condiciones"
            className="text-xs text-white hover:text-blue-500 transition-colors"
          >
            Términos
          </Link>
        </div>
      </div>
    </footer>
  )
}
