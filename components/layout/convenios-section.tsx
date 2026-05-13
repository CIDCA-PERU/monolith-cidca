"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Award,
  Landmark,
  Building2,
  Handshake,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

const convenios = [
  {
    name: "Cámara de Comercio",
    logo: "https://via.placeholder.com/200x80/0f172a/eab308?text=Camara+de+Comercio",
    description:
      "Alianza estratégica para la validación de competencias empresariales y programas de ofimática profesional.",
    website: "#",
    color: "from-blue-600/20 to-blue-400/10",
    icon: Building2,
    partnership: "Respaldo Corporativo",
    year: "Convenio Activo",
    testimonial:
      "Los egresados de CIDCA demuestran un alto nivel de preparación, adaptándose rápidamente a las exigencias del sector empresarial actual.",
  },
  {
    name: "Colegio de Ingenieros",
    logo: "https://via.placeholder.com/200x80/0f172a/eab308?text=Colegio+de+Ingenieros",
    description:
      "Aval académico para nuestros programas de tecnología, desarrollo de software y gestión pública.",
    website: "#",
    color: "from-yellow-600/20 to-yellow-400/10",
    icon: Landmark,
    partnership: "Aval Institucional",
    year: "Convenio Activo",
    testimonial:
      "Validamos la currícula de los cursos tecnológicos, asegurando que cumplen con los estándares de ingeniería moderna.",
  },
  {
    name: "Municipalidad Provincial",
    logo: "https://via.placeholder.com/200x80/0f172a/eab308?text=Municipalidad",
    description:
      "Convenio de cooperación interinstitucional para capacitar a funcionarios en gestión pública y contrataciones del Estado.",
    website: "#",
    color: "from-emerald-600/20 to-emerald-400/10",
    icon: Handshake,
    partnership: "Socio Estratégico",
    year: "Convenio Activo",
    testimonial:
      "Gracias a las capacitaciones de CIDCA, hemos optimizado los procesos administrativos de nuestra entidad.",
  },
];

const TestimonialCarousel = ({ testimonials }: { testimonials: string[] }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="relative h-28 sm:h-24 overflow-hidden rounded-xl bg-slate-900/50 backdrop-blur-sm p-4 border border-slate-800">
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: current === index ? 1 : 0,
            y: current === index ? 0 : 20,
            pointerEvents: current === index ? "auto" : "none",
          }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center p-4 text-center"
        >
          <p className="text-sm md:text-base italic text-slate-300">
            "{testimonial}"
          </p>
        </motion.div>
      ))}

      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${current === index ? "bg-yellow-500" : "bg-slate-700"}`}
            onClick={() => setCurrent(index)}
            aria-label={`Ver testimonio ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default function ConveniosSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const testimonials = convenios.map((c) => c.testimonial);

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 relative overflow-hidden bg-slate-950 border-t border-slate-800 flex justify-center"
      id="convenios"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/10 to-slate-950">
        <div className="absolute top-0 left-1/4 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-50 blur-2xl"></div>
        <div className="absolute bottom-0 right-1/4 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent opacity-50 blur-2xl"></div>
      </div>

      <div className="container relative z-10 px-4 sm:px-6">
        <motion.div
          className="space-y-4 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block mb-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <span className="text-sm font-semibold text-yellow-500">
              Garantía Educativa
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
            Respaldos y <span className="text-blue-500">Convenios</span>
          </h2>
          <p className="mx-auto max-w-[700px] text-slate-400 md:text-lg">
            Nuestros certificados cuentan con el aval de prestigiosas
            instituciones, garantizando su peso y validez en el mercado laboral.
          </p>
        </motion.div>

        <motion.div
          className="mb-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TestimonialCarousel testimonials={testimonials} />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {convenios.map((convenio, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <motion.div
                className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${convenio.color} opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500`}
              ></motion.div>

              <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden h-full flex flex-col">
                <div className="absolute top-3 right-3 z-10">
                  <div className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md rounded-full text-[10px] sm:text-xs font-medium border border-slate-700 flex items-center gap-1.5 text-slate-300">
                    <convenio.icon className="h-3 w-3 text-yellow-500" />
                    <span>{convenio.partnership}</span>
                  </div>
                </div>

                <div className="relative h-40 flex items-center justify-center p-6 bg-slate-950/50 border-b border-slate-800/50">
                  <div className="relative h-full w-full flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500 opacity-70 group-hover:opacity-100">
                    <Image
                      src={convenio.logo}
                      alt={`Logo de ${convenio.name}`}
                      width={200}
                      height={80}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                      {convenio.name}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {convenio.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="inline-block p-0.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400">
            <Button
              asChild
              className="bg-slate-950 hover:bg-slate-900 text-white border-0 h-12 px-8 font-semibold rounded-md"
            >
              <Link href="/contacto">
                <GraduationCap className="mr-2 h-5 w-5 text-yellow-500" />
                <span>Capacita a tu personal corporativo</span>
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Desarrollamos planes de estudio a medida para empresas e
            instituciones públicas.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
