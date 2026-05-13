"use function";
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronRight, MapPin, Laptop, Building2, Globe2 } from "lucide-react";

const studentReach = [
  {
    region: "La Libertad",
    city: "Trujillo",
    icon: Building2,
    role: "Sede Principal / Presencial",
    lat: -8.11599,
    lng: -79.02998,
  },
  {
    region: "Lima",
    city: "Lima Metropolitana",
    icon: Laptop,
    role: "Campus Virtual",
    lat: -12.046374,
    lng: -77.042793,
  },
  {
    region: "Arequipa",
    city: "Arequipa",
    icon: Laptop,
    role: "Campus Virtual",
    lat: -16.409047,
    lng: -71.537451,
  },
  {
    region: "Piura",
    city: "Piura",
    icon: Laptop,
    role: "Campus Virtual",
    lat: -5.19449,
    lng: -80.63282,
  },
  {
    region: "Internacional",
    city: "Latinoamérica",
    icon: Globe2,
    role: "Estudiantes Internacionales",
    lat: 4.710989, // Ubicación referencial (Colombia)
    lng: -74.072092,
  },
];

export default function ReachSection() {
  const [selectedLocation, setSelectedLocation] = useState(studentReach[0]);

  return (
    <section
      id="alcance"
      className="py-16 md:py-24 relative bg-slate-950 border-t border-slate-800 flex justify-center overflow-hidden"
    >
      <div className="container space-y-12 px-4 sm:px-6 relative z-10">
        <motion.div
          className="space-y-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block mb-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <span className="text-sm font-semibold text-blue-400">
              Educación Sin Fronteras
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
            Nuestra <span className="text-yellow-500">Comunidad</span>
          </h2>
          <p className="mx-auto max-w-[700px] text-slate-400 md:text-lg">
            Nacimos en Trujillo, pero nuestra tecnología educativa nos permite
            capacitar a profesionales en todo el Perú y Latinoamérica.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden h-[350px] md:h-[450px] relative shadow-2xl">
            <div className="absolute inset-0">
              <div className="relative w-full h-full bg-slate-950">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20pantalla%202025-03-09%20a%20la%28s%29%2011.17.33%E2%80%AFa.%C2%A0m.-OgLkQH2hS0ANfUgFrKBJ5O6Yo1i6cz.png"
                  alt="Mapa mostrando el alcance de estudiantes de CIDCA"
                  width={1200}
                  height={800}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-slate-950/80"></div>
              </div>
            </div>

            {studentReach.map((location, index) => {
              const isSelected = selectedLocation.region === location.region;
              return (
                <motion.button
                  key={index}
                  className={`absolute w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center cursor-pointer shadow-lg
                    ${isSelected ? "bg-yellow-500 z-20" : "bg-blue-600/50 hover:bg-blue-500/80 z-10 backdrop-blur-md border border-white/10"}`}
                  style={{
                    left: `${((location.lng + 180) / 360) * 100}%`,
                    top: `${((90 - location.lat) / 180) * 100}%`,
                  }}
                  onClick={() => setSelectedLocation(location)}
                  whileHover={{ scale: 1.2 }}
                  animate={{
                    scale: isSelected ? [1, 1.15, 1] : 1,
                    transition: {
                      repeat: isSelected ? Number.POSITIVE_INFINITY : 0,
                      duration: 2,
                    },
                  }}
                >
                  <MapPin
                    className={`w-3 h-3 md:w-4 md:h-4 ${isSelected ? "text-slate-950" : "text-white"}`}
                  />

                  {isSelected && (
                    <motion.div
                      className="absolute w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-yellow-500"
                      animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 0] }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 2,
                      }}
                    />
                  )}
                </motion.button>
              );
            })}

            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:w-80 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-500 shrink-0">
                  <selectedLocation.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {selectedLocation.city}
                  </h3>
                  <p className="text-sm font-medium text-blue-400 mb-1">
                    {selectedLocation.region}
                  </p>
                  <p className="text-xs text-slate-400">
                    {selectedLocation.role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-blue-500" />
              Red <span className="text-yellow-500">Estudiantil</span>
            </h3>

            <ul className="space-y-3 flex-1">
              {studentReach.map((location, index) => {
                const isSelected = selectedLocation.region === location.region;
                return (
                  <motion.li
                    key={index}
                    className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300
                      ${
                        isSelected
                          ? "bg-blue-500/10 border border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
                          : "border border-transparent hover:bg-slate-800/50"
                      }`}
                    onClick={() => setSelectedLocation(location)}
                    whileHover={{ x: 5 }}
                  >
                    <div
                      className={`p-2 rounded-lg transition-colors ${isSelected ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400"}`}
                    >
                      <location.icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1">
                      <div
                        className={`font-semibold text-sm ${isSelected ? "text-white" : "text-slate-300"}`}
                      >
                        {location.region}
                      </div>
                      <div className="text-xs text-slate-500">
                        {location.role}
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${isSelected ? "text-yellow-500 translate-x-1" : "text-slate-600"}`}
                    />
                  </motion.li>
                );
              })}
            </ul>

            <div className="mt-6 pt-6 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-500">
                Plataforma 100% optimizada para conexiones de baja latencia en
                toda la región.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
