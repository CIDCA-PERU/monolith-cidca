"use client";

import { motion } from "framer-motion";

export default function MetricsSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-slate-950 flex justify-center">
      <div className="absolute top-1/2 left-1/4 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-yellow-500/10 blur-[100px] pointer-events-none" />

      <div className="container relative z-10 px-4 sm:px-6">
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl relative"
        >
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />

          <div className="p-8 md:p-12 lg:p-16">
            <div className="grid md:grid-cols-2 gap-12 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-800">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center space-y-4 pt-4 md:pt-0"
              >
                <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight relative group">
                  <span className="bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 bg-clip-text text-transparent inline-block">
                    5,000+
                  </span>
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-300">
                  Estudiantes capacitados en{" "}
                  <span className="text-yellow-500">todo el Perú</span>
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-center space-y-4 pt-12 md:pt-0"
              >
                <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight relative group">
                  <span className="bg-gradient-to-br from-blue-300 via-blue-500 to-blue-700 bg-clip-text text-transparent inline-block">
                    40+
                  </span>
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-300">
                  Programas y cursos{" "}
                  <span className="text-blue-400">especializados</span>
                </p>
              </motion.div>
            </div>

            <div className="w-full max-w-4xl mx-auto my-10 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center text-slate-400 max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed"
            >
              Nuestra plana docente de expertos ha ayudado a miles de
              profesionales a elevar su perfil, brindando educación virtual de
              alta calidad y certificaciones con gran respaldo laboral.
            </motion.p>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
