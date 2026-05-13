"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  BookOpen,
  Briefcase,
  MonitorPlay,
  Calculator,
  ShieldCheck,
  LineChart,
  FileSpreadsheet,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Award,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Course {
  icon: React.ReactNode;
  name: string;
  description: string;
  color: string;
  link?: string;
}

// Catálogo de cursos adaptado a una institución educativa
const courses: Course[] = [
  {
    icon: <Briefcase className="h-6 w-6" />,
    name: "Gestión Pública",
    description:
      "Especialización en administración y contrataciones del Estado.",
    color: "from-blue-600 to-indigo-800",
    link: "/cursos/gestion-publica",
  },
  {
    icon: <FileSpreadsheet className="h-6 w-6" />,
    name: "Ofimática Profesional",
    description: "Dominio avanzado de Excel, Word y PowerPoint para empresas.",
    color: "from-yellow-500 to-amber-600",
    link: "/cursos/ofimatica",
  },
  {
    icon: <MonitorPlay className="h-6 w-6" />,
    name: "Desarrollo de Software",
    description: "Programación desde cero hasta nivel Full-Stack.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    name: "SST",
    description:
      "Seguridad y Salud en el Trabajo según normativa legal vigente.",
    color: "from-emerald-500 to-green-700",
  },
  {
    icon: <Calculator className="h-6 w-6" />,
    name: "Contabilidad para No Contadores",
    description:
      "Finanzas y tributación explicadas de forma sencilla y práctica.",
    color: "from-blue-700 to-slate-800",
  },
  {
    icon: <LineChart className="h-6 w-6" />,
    name: "Marketing Digital",
    description: "Estrategias de ventas, redes sociales y publicidad online.",
    color: "from-amber-400 to-orange-600",
  },
  {
    icon: <Users className="h-6 w-6" />,
    name: "Recursos Humanos",
    description: "Gestión del talento, planillas y clima laboral.",
    color: "from-indigo-500 to-purple-700",
  },
];

export default function CoursesCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(4);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determinar cuántos cards mostrar según la pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else if (window.innerWidth < 1280) setVisibleCount(3);
      else setVisibleCount(4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll del carrusel
  useEffect(() => {
    if (isHovering || !autoScrollEnabled) return;
    const interval = setInterval(() => {
      setActiveIndex(
        (current) => (current + 1) % (courses.length - visibleCount + 1),
      );
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovering, visibleCount, autoScrollEnabled]);

  // Desplazar el scroll físico cuando cambia el index
  useEffect(() => {
    if (scrollRef.current) {
      const scrollAmount =
        activeIndex * (scrollRef.current.scrollWidth / courses.length);
      scrollRef.current.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  const handlePrev = () => {
    setAutoScrollEnabled(false);
    setActiveIndex((current) => Math.max(current - 1, 0));
  };

  const handleNext = () => {
    setAutoScrollEnabled(false);
    setActiveIndex((current) =>
      Math.min(current + 1, courses.length - visibleCount),
    );
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  // === ANIMACIONES RESTAURADAS ===
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <section className="w-full py-20 overflow-hidden bg-slate-950 relative border-t border-slate-800">
      <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-blue-900/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-yellow-500/10 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20"
          >
            <span className="text-sm font-semibold text-blue-400">
              Oferta Académica
            </span>
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Nuestros <span className="text-yellow-500">Programas</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Capacítate con nuestros cursos especializados y obtén
            certificaciones con alto valor para el mercado laboral actual.
          </p>
        </motion.div>

        <div className="relative">
          <motion.div
            className="absolute top-1/2 left-0 -translate-y-1/2 z-20 hidden sm:block"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:bg-yellow-500/20 hover:text-yellow-500 transition-all shadow-xl h-12 w-12"
              onClick={handlePrev}
              disabled={activeIndex === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </motion.div>

          <motion.div
            className="absolute top-1/2 right-0 -translate-y-1/2 z-20 hidden sm:block"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:bg-yellow-500/20 hover:text-yellow-500 transition-all shadow-xl h-12 w-12"
              onClick={handleNext}
              disabled={activeIndex >= courses.length - visibleCount}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </motion.div>

          <div
            className="overflow-hidden px-4 sm:px-12"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <motion.div
              ref={scrollRef}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex gap-6 overflow-x-hidden py-8"
            >
              {courses.map((course, index) => (
                <motion.div
                  key={`course-${index}`}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ y: -10 }}
                  className="flex-shrink-0 w-[280px] h-[240px] relative group cursor-pointer"
                  onClick={() => handleCourseClick(course)}
                >
                  <div className="h-full flex flex-col bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-6 transition-all duration-300 hover:bg-slate-800/80 hover:border-slate-600 relative overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${course.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                    />
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${course.color} text-white shadow-lg`}
                      >
                        {course.icon}
                      </div>
                    </div>

                    <h3 className="font-bold text-xl text-white mb-2 group-hover:text-yellow-400 transition-colors">
                      {course.name}
                    </h3>

                    <p className="text-sm text-slate-400 line-clamp-3">
                      {course.description}
                    </p>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-800/50">
                      <span className="text-xs font-medium text-slate-500 group-hover:text-slate-300">
                        Ver temario
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-yellow-500 transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Explorar todo el catálogo <BookOpen className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && selectedCourse && (
          <>
            <motion.div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 z-50 shadow-2xl"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-start gap-4 mb-6">
                <div
                  className={`p-4 rounded-xl bg-gradient-to-br ${selectedCourse.color} text-white shrink-0`}
                >
                  {selectedCourse.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white leading-tight">
                    {selectedCourse.name}
                  </h3>
                  <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md mt-2 inline-block">
                    Modalidad 100% Virtual
                  </span>
                </div>
              </div>

              <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                {selectedCourse.description}
              </p>

              <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <h4 className="font-semibold text-white text-sm">
                  Beneficios del programa:
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <Award className="h-5 w-5 text-yellow-500 shrink-0" />
                    <span>
                      Certificación válida para concursos públicos y privados.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <Clock className="h-5 w-5 text-blue-400 shrink-0" />
                    <span>Acceso al aula virtual 24/7 sin restricciones.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span>Material descargable y foros de consulta.</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                <Button
                  variant="ghost"
                  className="text-slate-400 hover:text-white hover:bg-slate-800"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold"
                  asChild
                >
                  <Link href={selectedCourse.link || "/registro"}>
                    Inscribirme ahora
                  </Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
