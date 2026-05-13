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
  Plus,
  PlayCircle,
  User,
  Edit2,
  Trash2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

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
                    cidca.com.pe/estudiante/dashboard
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
                    Aula Virtual
                  </span>
                </h1>
              </div>

              <nav className="space-y-1">
                <NavItem
                  icon={BookOpen}
                  label="Cursos"
                  description="Continúa tu aprendizaje"
                />
                {/* 
                <NavItem
                  icon={FileCheck}
                  label="Evaluaciones"
                  description="Exámenes y prácticas"
                  badge="1"
                />*/}
                <NavItem
                  icon={CreditCard}
                  label="Pagos"
                  description="Historial de vouchers"
                />
                <NavItem
                  icon={Award}
                  label="Certificados"
                  description="Tus logros obtenidos"
                />
                <NavItem
                  icon={User}
                  label="Mi Perfil"
                  description="Datos personales"
                />
              </nav>
            </div>

            <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    Bienvenido/a de nuevo,
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
                </div>
              </div>

              <div className="py-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      Mis Cursos
                    </h1>
                    <p className="text-slate-400">
                      Accede a tus cursos activos y revisa tus modulos.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <PreviewCursoCard
                    title="Backend con Spring Boot"
                    description="Aprende a crear APIs RESTful seguras y escalables con Java y Spring Boot para entornos corporativos."
                    students={124}
                    status="activo"
                    imageUrl="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80"
                  />
                  <PreviewCursoCard
                    title="Gestión Pública"
                    description="Fundamentos y marco legal para la administración eficiente en entidades del estado peruano."
                    students={89}
                    status="activo"
                    imageUrl="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80"
                  />
                  <PreviewCursoCard
                    title="Inglés Técnico"
                    description="Vocabulario especializado para ingeniería de sistemas y negocios internacionales."
                    students={256}
                    status="inactivo"
                    imageUrl="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function NavItem({
  icon: Icon,
  label,
  description,
  badge,
  active = false,
}: any) {
  return (
    <div
      className={`
        flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group cursor-pointer
        ${
          active
            ? "bg-yellow-500/10 text-yellow-500"
            : "text-slate-400 hover:bg-slate-800/50"
        }
      `}
    >
      <div
        className={`
        flex h-9 w-9 items-center justify-center rounded-md transition-all duration-200 shrink-0
        ${
          active
            ? "bg-yellow-500/20"
            : "bg-slate-800/50 group-hover:bg-slate-800"
        }
      `}
      >
        <Icon
          className={`h-4 w-4 ${active ? "text-yellow-400" : "text-slate-400"}`}
        />
      </div>

      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-semibold leading-none text-slate-200">
          {label}
        </span>
        <span
          className={`text-xs leading-none mt-1 ${
            active ? "text-yellow-500/70" : "text-slate-500"
          }`}
        >
          {description}
        </span>
      </div>

      {badge && (
        <Badge className="bg-yellow-500 text-slate-950 hover:bg-yellow-400 border-0 shadow-none shrink-0 ml-auto h-5 px-1.5 flex items-center justify-center">
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

function PreviewCursoCard({
  title,
  description,
  students,
  status,
  imageUrl,
}: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors flex flex-col shadow-lg">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-full aspect-[16/9] object-cover"
        />
      ) : (
        <div className="aspect-[16/9] bg-slate-950 flex items-center justify-center border-b border-slate-800">
          <span className="text-slate-500 text-sm">Sin imagen</span>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4 flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-2">{description}</p>
        </div>

        <div className="flex gap-2 mt-auto">
          <button className="flex-1 flex items-center justify-center gap-2 h-9 px-3 rounded-md border border-slate-700 bg-slate-950 text-white hover:bg-slate-800 transition-colors text-sm font-medium">
            Ver Curso
          </button>
        </div>
      </div>
    </div>
  );
}