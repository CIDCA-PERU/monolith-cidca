"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  ShieldCheck,
  ClockCheck,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";
import ScrollIndicator from "@/components/layout/scroll-indicator";
import ServicesCarousel from "@/components/layout/services-carousel";
import LastGenerationSection from "@/components/layout/last-generation";
import DashboardPreviewSection from "@/components/layout/dashboard-preview";
import MetricsSection from "@/components/layout/metrics-section";
import ConveniosSection from "@/components/layout/convenios-section";
import ReachSection from "@/components/layout/reach-section";
import ContactSection from "@/components/layout/contact-section";

const backgroundSpheres = [
  {
    size: "600px",
    top: "-10%",
    left: "-10%",
    color:
      "radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.15), transparent)", // Navy blue
    delay: 0,
  },
  {
    size: "500px",
    top: "40%",
    left: "60%",
    color:
      "radial-gradient(circle at 50% 50%, rgba(234, 179, 8, 0.08), transparent)", // Gold/Yellow
    delay: 0.5,
  },
];

const BackgroundSpheres = () => (
  <>
    {backgroundSpheres.map((sphere, index) => (
      <motion.div
        key={index}
        className="absolute rounded-full pointer-events-none z-0"
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          delay: sphere.delay,
          ease: "easeInOut",
        }}
        style={{
          width: sphere.size,
          height: sphere.size,
          top: sphere.top,
          left: sphere.left,
          background: sphere.color,
          filter: "blur(60px)",
        }}
      />
    ))}
  </>
);

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 relative overflow-hidden font-sans">
      <BackgroundSpheres />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none z-0" />
      <main className="flex-1 relative z-10">
        <section className="container mx-auto px-4 sm:px-6 min-h-[85vh] flex items-center justify-center relative">
          <div className="flex flex-col items-center text-center w-full max-w-4xl mx-auto space-y-8 mt-10 md:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                Plataforma Educativa
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="text-white block pb-2">Bienvenido a</span>
              <span
                className="bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 bg-clip-text text-transparent block pb-2"
                style={{ textShadow: "0px 4px 20px rgba(234, 179, 8, 0.2)" }}
              >
                CIDCA
              </span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-slate-400 max-w-[700px] font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Sistema de Gestión de Aprendizaje Profesional. Eleva tu carrera
              con tecnología educativa de vanguardia.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/login">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-base font-bold bg-yellow-500 hover:bg-yellow-400 text-slate-950 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(234,179,8,0.4)]"
                >
                  Ingresar al Aula <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
          <ScrollIndicator />
        </section>

        <section id="servicios" className="py-16 md:py-24">
          <ServicesCarousel />
        </section>

        <LastGenerationSection />

        <DashboardPreviewSection />

        <MetricsSection />

        <ConveniosSection />

        <ReachSection />

        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
