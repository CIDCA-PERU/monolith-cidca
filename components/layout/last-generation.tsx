"use client"

import { motion } from "framer-motion"
import { ArrowRight, BookOpen, MonitorPlay, Award, PlayCircle, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LastGenerationSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden flex justify-center bg-slate-950 border-t border-slate-800">
      {/* Background gradients (Estilo CIDCA) */}
      <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-blue-900/20 blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-yellow-500/10 blur-[120px]" />

      <div className="container relative z-10 px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          
          {/* COLUMNA IZQUIERDA - Textos y Pasos */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Tu camino hacia el éxito en <span className="text-yellow-500">3 simples pasos</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-400">
                En CIDCA hacemos que tu proceso de aprendizaje sea ágil, 100% virtual y con respaldo oficial para impulsar tu carrera.
              </p>
            </div>

            <div className="space-y-6 pt-2">
              {/* Paso 1 */}
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl mt-1 shrink-0">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white mb-1">1. Elige tu especialidad</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Explora nuestro catálogo y matricúlate en el curso que impulsará tu perfil profesional.
                  </p>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="flex items-start gap-4">
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl mt-1 shrink-0">
                  <MonitorPlay className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white mb-1">2. Aprende a tu ritmo</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Accede a tu Aula Virtual 24/7, revisa el material, mira las clases y rinde tus evaluaciones sin presión.
                  </p>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="flex items-start gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl mt-1 shrink-0">
                  <Award className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white mb-1">3. Obtén tu certificado</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Al aprobar, descarga instantáneamente tu certificado digital validado con código QR.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button asChild size="lg" className="group bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold h-12 px-8">
                <Link href="#servicios">
                  Ver catálogo de cursos
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* COLUMNA DERECHA - Mockup del Aula Virtual (Video Player) */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-full max-w-xl mx-auto lg:mx-0"
          >
            <div className="rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl bg-slate-900">
              
              {/* Barra superior del navegador (Browser chrome) */}
              <div className="bg-slate-950 p-3 flex items-center gap-3 border-b border-slate-800">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-400 flex items-center justify-center w-full max-w-sm truncate">
                    aula.cidca.edu.pe/curso/gestion-publica
                  </div>
                </div>
              </div>

              {/* Contenido del navegador (El reproductor de video) */}
              <div className="p-4 sm:p-6 flex flex-col gap-4">
                
                {/* Migas de pan (Breadcrumb) */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <span className="text-blue-400">Mis Cursos</span>
                  <span>/</span>
                  <span>Gestión Pública</span>
                </div>

                {/* Área de Video */}
                <div className="relative aspect-video bg-slate-950 rounded-lg border border-slate-800 overflow-hidden group cursor-pointer">
                  {/* Imagen/Fondo del video simulado */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-900 opacity-50"></div>
                  
                  {/* Botón de Play Central */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-yellow-500/90 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform">
                      <PlayCircle className="h-8 w-8 text-slate-950 ml-1" />
                    </div>
                  </div>

                  {/* Controles inferiores del video */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-3">
                      {/* Barra de progreso */}
                      <div className="h-1.5 flex-1 bg-slate-700/50 rounded-full overflow-hidden">
                        <div className="h-full w-[45%] bg-yellow-500 rounded-full relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full shadow"></div>
                        </div>
                      </div>
                      <span className="text-[10px] text-white font-mono">12:45 / 45:00</span>
                    </div>
                  </div>
                </div>

                {/* Detalles de la clase */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div>
                    <h4 className="text-white font-semibold">Módulo 1: Fundamentos del Estado</h4>
                    <p className="text-sm text-slate-400 mt-0.5">Clase 3: Contrataciones Públicas</p>
                  </div>
                  
                  <Button size="sm" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shrink-0">
                    Siguiente clase <SkipForward className="ml-2 h-4 w-4" />
                  </Button>
                </div>

              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  )
}