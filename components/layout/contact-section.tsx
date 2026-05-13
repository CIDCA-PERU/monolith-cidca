"use client";

import { motion } from "framer-motion";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactSpheres = [
  {
    size: "320px",
    top: "20%",
    left: "10%",
    color:
      "radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.2), transparent)", // Navy blue
    delay: 0.1,
    opacity: 1,
  },
  {
    size: "280px",
    top: "70%",
    left: "85%",
    color:
      "radial-gradient(circle at 50% 50%, rgba(234, 179, 8, 0.15), transparent)", // Gold
    delay: 0.2,
    opacity: 1,
  },
];

const BackgroundSpheres = ({ spheres }: { spheres: any[] }) => (
  <>
    {spheres.map((sphere, index) => (
      <motion.div
        key={index}
        className="absolute rounded-full pointer-events-none z-0"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 10 + index * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width: sphere.size,
          height: sphere.size,
          top: sphere.top,
          left: sphere.left,
          background: sphere.color,
          opacity: sphere.opacity,
          filter: "blur(60px)",
        }}
      />
    ))}
  </>
);

export default function ContactSection() {
  return (
    <section
      id="contacto"
      className="py-16 md:py-24 bg-slate-950 relative border-t border-slate-800"
    >
      <BackgroundSpheres spheres={contactSpheres} />

      <div className="container relative z-10 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center space-y-8"
          >
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-2 md:mb-0">
                <span className="text-sm font-semibold text-blue-400">
                  Atención al Alumno
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Comunícate con <span className="text-yellow-500">Nosotros</span>
              </h2>
              <p className="text-lg text-slate-400">
                ¿Tienes dudas sobre algún curso, proceso de certificación o
                convenios corporativos? Nuestro equipo está listo para
                asesorarte.
              </p>
            </div>

            <div className="space-y-6 bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors shrink-0">
                  <Mail className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    Correo Electrónico
                  </p>
                  <span className="text-white text-base font-medium group-hover:text-blue-400 transition-colors">
                    informes@cidca.edu.pe
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors shrink-0">
                  <MessageSquare className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    WhatsApp (Consultas Rápidas)
                  </p>
                  <span className="text-white text-base font-medium group-hover:text-green-400 transition-colors">
                    +51 999 999 999
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="p-3 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors shrink-0">
                  <MapPin className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    Sede Administrativa
                  </p>
                  <span className="text-white text-base font-medium group-hover:text-yellow-500 transition-colors">
                    Trujillo, La Libertad - Perú
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-yellow-500 to-blue-500 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-6">
                Envíanos un mensaje directo
              </h3>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-slate-300"
                    >
                      Nombre completo
                    </label>
                    <Input
                      id="name"
                      placeholder="Ej: Juan Pérez"
                      className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-yellow-500 focus:ring-yellow-500/20 transition-colors h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-slate-300"
                    >
                      Correo electrónico
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ejemplo@correo.com"
                      className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-yellow-500 focus:ring-yellow-500/20 transition-colors h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="text-sm font-medium text-slate-300"
                  >
                    Asunto o Curso de interés
                  </label>
                  <Input
                    id="subject"
                    placeholder="Ej: Información sobre Gestión Pública"
                    className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-yellow-500 focus:ring-yellow-500/20 transition-colors h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-slate-300"
                  >
                    Tu consulta
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Escribe tus dudas aquí..."
                    className="min-h-[120px] bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-yellow-500 focus:ring-yellow-500/20 transition-colors resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all duration-300 shadow-lg shadow-blue-500/20"
                >
                  Enviar Mensaje
                </Button>

                <p className="text-xs text-center text-slate-500 mt-4">
                  Al enviar este formulario, aceptas nuestras políticas de
                  privacidad.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
