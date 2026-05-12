"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Home,
  BookOpen,
  FileCheck,
  CreditCard,
  Award,
  Settings,
  Clock,
  Calendar,
  GraduationCap,
  PlayCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export default function DashboardPreviewSection() {
  const [activeTab, setActiveTab] = useState("actividad");

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-slate-950 flex justify-center">
      <div className="absolute -top-20 -right-20 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[100px]" />
      <div className="absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-yellow-500/10 blur-[100px]" />
      <div className="container relative z-10 px-4 sm:px-6">
        <div className="space-y-4 text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20"
          >
            <span className="text-sm font-semibold text-blue-400">
              Plataforma Estudiantil
            </span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white">
            Aula Virtual <span className="text-yellow-500">Intuitiva</span>
          </h2>
          <p className="mx-auto max-w-[700px] text-slate-400 md:text-lg">
            Una interfaz moderna, oscura y sin distracciones diseñada para que
            te enfoques al 100% en tu aprendizaje y desarrollo profesional.
          </p>
        </div>

        <motion.div
          initial={{ y: 80, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-slate-800"
        >
          <div className="bg-slate-950 p-3 border-b border-slate-800 flex items-center gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="flex items-center gap-2 ml-3 shrink-0">
              <button className="text-slate-500 hover:text-slate-300 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="text-slate-500 hover:text-slate-300 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex-1 mx-2 flex justify-center">
              <div className="bg-slate-900 border border-slate-800 rounded-md flex items-center px-3 py-1.5 w-full max-w-md">
                <div className="flex items-center gap-2 w-full">
                  <Search size={14} className="text-slate-500" />
                  <span className="text-slate-400 text-xs sm:text-sm truncate">
                    aula.cidca.edu.pe/estudiante/dashboard
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex bg-slate-900 min-h-[500px]">
            <div className="hidden md:block w-64 bg-slate-950 border-r border-slate-800 p-4">
              <div className="mb-8 flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                  <BookOpen size={18} className="text-slate-950" />
                </div>
                <h1 className="text-xl font-bold text-white">
                  CIDCA{" "}
                  <span className="text-yellow-500 text-sm font-medium">
                    Virtual
                  </span>
                </h1>
              </div>

              <nav className="space-y-1">
                <NavItem icon={<Home size={18} />} label="Inicio" active />
                <NavItem icon={<BookOpen size={18} />} label="Mis Cursos" />
                <NavItem
                  icon={<FileCheck size={18} />}
                  label="Evaluaciones"
                  badge="1"
                />
                <NavItem icon={<CreditCard size={18} />} label="Mis Pagos" />
                <NavItem icon={<Award size={18} />} label="Certificados" />
                <NavItem icon={<Settings size={18} />} label="Configuración" />
              </nav>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <GraduationCap size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white">
                        Rendimiento
                      </h3>
                      <p className="text-xs text-slate-400">Ciclo Actual</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Promedio General</span>
                      <span className="text-blue-400 font-bold">17.5</span>
                    </div>
                    <Progress
                      value={85}
                      className="h-1.5 bg-slate-800"
                      indicatorColor="bg-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    Bienvenido de nuevo, Jaime
                  </h1>
                  <p className="text-sm text-slate-400 hidden sm:block">
                    Martes, 12 de Mayo 2026
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-slate-400 hover:text-white transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full text-[10px] font-bold text-slate-950 flex items-center justify-center">
                      2
                    </span>
                  </button>
                  <Avatar className="h-10 w-10 border-2 border-slate-700">
                    <AvatarFallback className="bg-slate-800 text-slate-300">
                      JM
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="flex border-b border-slate-800 mb-6 overflow-x-auto scrollbar-hide">
                <TabButton
                  active={activeTab === "actividad"}
                  onClick={() => setActiveTab("actividad")}
                  label="Actividad Reciente"
                />
                <TabButton
                  active={activeTab === "cursos"}
                  onClick={() => setActiveTab("cursos")}
                  label="Cursos Activos"
                />
              </div>

              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "actividad" && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <ActivityItem
                        color="bg-blue-500"
                        title="Nuevo módulo desbloqueado"
                        time="Hace 2 horas"
                        description="El Módulo 3 de Desarrollo Backend con Spring Boot ya está disponible."
                      />
                      <ActivityItem
                        color="bg-green-500"
                        title="Calificación Publicada"
                        time="Hace 5 horas"
                        description="Has obtenido 18/20 en la Práctica Calificada de Integración de APIs."
                      />
                      <ActivityItem
                        color="bg-yellow-500"
                        title="Certificado Emitido"
                        time="Ayer"
                        description="Tu certificado de Inglés Técnico para Ingeniería ya está listo para descargar."
                      />
                      <ActivityItem
                        color="bg-red-500"
                        title="Recordatorio de Pago"
                        time="Hace 2 días"
                        description="Tu orden de pago #45092 vence en 3 días. Recuerda adjuntar tu voucher."
                      />
                    </div>
                  </div>
                )}

                {activeTab === "cursos" && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <CourseCard
                      title="Desarrollo Backend con Spring Boot"
                      module="Módulo 3: Seguridad y JWT"
                      progress={45}
                      lastAccess="Ayer"
                      status="En curso"
                      statusColor="bg-blue-500"
                    />
                    <CourseCard
                      title="Gestión Pública"
                      module="Módulo 1: Introducción"
                      progress={15}
                      lastAccess="Hace 3 días"
                      status="En curso"
                      statusColor="bg-blue-500"
                    />
                    <CourseCard
                      title="Inglés Técnico Avanzado"
                      module="Evaluación Final"
                      progress={100}
                      lastAccess="Hace 1 semana"
                      status="Completado"
                      statusColor="bg-emerald-500"
                    />
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function NavItem({ icon, label, badge, active = false }: any) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
        active
          ? "bg-slate-800 text-white"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? "text-yellow-500" : ""}>{icon}</span>
        <span className="font-medium text-sm">{label}</span>
      </div>
      {badge && (
        <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20">
          {badge}
        </Badge>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        active
          ? "border-yellow-500 text-yellow-500"
          : "border-transparent text-slate-500 hover:text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

function ActivityItem({ color, title, time, description }: any) {
  return (
    <div className="flex gap-4 p-4 bg-slate-950/50 border border-slate-800/50 rounded-xl hover:bg-slate-800/50 transition-colors">
      <div
        className={`w-2.5 h-2.5 rounded-full ${color} mt-1.5 shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
        style={{ boxShadow: `0 0 10px var(--tw-shadow-color)` }}
      ></div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
          <h3 className="text-sm font-semibold text-slate-200 truncate">
            {title}
          </h3>
          <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
            <Clock size={12} />
            {time}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">{description}</p>
      </div>
    </div>
  );
}

function CourseCard({
  title,
  module,
  progress,
  lastAccess,
  status,
  statusColor,
}: any) {
  return (
    <div className="p-4 bg-slate-950/50 border border-slate-800/50 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group">
      <div className="flex justify-between items-start mb-3 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 group-hover:text-yellow-400 transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{module}</p>
        </div>
        <Badge
          className={`${statusColor}/10 text-${statusColor.replace("bg-", "")} border border-${statusColor.replace("bg-", "")}/20 shrink-0`}
        >
          {status}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Progreso del curso</span>
          <span className="text-slate-300 font-medium">{progress}%</span>
        </div>
        <Progress
          value={progress}
          className="h-1.5 bg-slate-800"
          indicatorColor={statusColor}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-800/50">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>Último acceso: {lastAccess}</span>
        </div>
        <PlayCircle
          size={16}
          className="text-slate-400 group-hover:text-white transition-colors"
        />
      </div>
    </div>
  );
}
