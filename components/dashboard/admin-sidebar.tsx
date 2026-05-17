"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardList,
  CreditCard,
  ScrollText,
  ShieldCheck,
  LogOut,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { logoutUser } from "@/actions/auth.actions";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  description: string;
  roles: string[]; // qué roles ven este item
}

interface AdminSidebarProps {
  rol: string;
  nombre: string;
  email: string;
}

// ─── Items de navegación ──────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    title: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Vista general",
    roles: ["SISTEMAS", "ADMINISTRADOR", "DOCENTE"],
  },
  {
    title: "Cursos",
    href: "/dashboard/cursos",
    icon: BookOpen,
    description: "Gestión de cursos",
    roles: ["SISTEMAS", "ADMINISTRADOR", "DOCENTE"],
  },
  {
    title: "Estudiantes",
    href: "/dashboard/estudiantes",
    icon: Users,
    description: "Alumnos matriculados",
    roles: ["SISTEMAS", "ADMINISTRADOR"],
  },
  {
    title: "Asistencias",
    href: "/dashboard/asistencias",
    icon: ClipboardList,
    description: "Control de asistencia",
    roles: ["SISTEMAS", "ADMINISTRADOR", "DOCENTE"],
  },
  {
    title: "Pagos",
    href: "/dashboard/pagos",
    icon: CreditCard,
    description: "Gestión de pagos",
    roles: ["SISTEMAS", "ADMINISTRADOR"],
  },
  {
    title: "Auditoría",
    href: "/dashboard/auditoria",
    icon: ScrollText,
    description: "Historial de cambios",
    roles: ["SISTEMAS", "ADMINISTRADOR"],
  },
];

// Items solo para SISTEMAS (sección técnica)
const SISTEMAS_ITEMS: NavItem[] = [
  {
    title: "Sesiones activas",
    href: "/dashboard/sistemas/sesiones",
    icon: ShieldCheck,
    description: "Logs de acceso",
    roles: ["SISTEMAS"],
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export function AdminSidebar({ rol, nombre, email }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
      window.location.href = "/login";
    });
  };

  const rolUpper = rol?.toUpperCase() ?? "";
  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(rolUpper)
  );
  const sistemasItems = SISTEMAS_ITEMS.filter((item) =>
    item.roles.includes(rolUpper)
  );

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <Sidebar
      variant="inset"
      collapsible="offcanvas"
      className="bg-slate-950 border-r border-slate-800/60"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <SidebarHeader className="border-b border-slate-800/60 px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
            <GraduationCap size={18} className="text-slate-950" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold text-white tracking-tight">
              CIDCA
            </span>
            <span className="text-[11px] font-medium text-amber-400/80">
              Panel de Administración
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* ── Content ────────────────────────────────────────────── */}
      <SidebarContent className="px-0 py-2">
        {/* Navegación principal */}
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupLabel className="px-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Gestión
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active} className="h-auto p-0">
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group
                          ${active
                            ? "bg-amber-500/10 text-amber-300"
                            : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70"
                          }
                        `}
                      >
                        <div
                          className={`
                            flex h-8 w-8 items-center justify-center rounded-md flex-shrink-0 transition-all duration-150
                            ${active
                              ? "bg-amber-500/20"
                              : "bg-slate-800/80 group-hover:bg-slate-700/80"
                            }
                          `}
                        >
                          <Icon
                            className={`h-4 w-4 ${active ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"}`}
                          />
                        </div>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="text-sm font-semibold leading-none">
                            {item.title}
                          </span>
                          <span
                            className={`text-[11px] leading-none ${active ? "text-amber-400/60" : "text-slate-600 group-hover:text-slate-500"}`}
                          >
                            {item.description}
                          </span>
                        </div>
                        {active && (
                          <ChevronRight className="h-3.5 w-3.5 text-amber-400/50 flex-shrink-0" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sección exclusiva SISTEMAS */}
        {sistemasItems.length > 0 && (
          <SidebarGroup className="px-3 py-2 mt-2">
            <SidebarGroupLabel className="px-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-rose-500/70">
              Sistema (Técnico)
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {sistemasItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} className="h-auto p-0">
                        <Link
                          href={item.href}
                          className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group
                            ${active
                              ? "bg-rose-500/10 text-rose-300"
                              : "text-slate-500 hover:text-rose-300 hover:bg-rose-500/5"
                            }
                          `}
                        >
                          <div className={`flex h-8 w-8 items-center justify-center rounded-md flex-shrink-0 ${active ? "bg-rose-500/20" : "bg-slate-800/80"}`}>
                            <Icon className={`h-4 w-4 ${active ? "text-rose-400" : "text-slate-600 group-hover:text-rose-400"}`} />
                          </div>
                          <span className="text-sm font-semibold leading-none">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <SidebarFooter className="border-t border-slate-800/60 px-3 py-4">
        {/* Info del usuario */}
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-slate-200">
              {nombre?.charAt(0)?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-200 truncate">
              {nombre}
            </span>
            <span className="text-[11px] text-slate-500 truncate">{email}</span>
          </div>
          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 flex-shrink-0">
            {rolUpper === "ADMINISTRADOR" ? "ADMIN" : rolUpper}
          </span>
        </div>

        {/* Botón logout */}
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-150 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800/80 group-hover:bg-rose-500/10 transition-all duration-150 flex-shrink-0">
            <LogOut className="h-4 w-4 group-hover:text-rose-400 transition-colors" />
          </div>
          <span className="text-sm font-semibold">
            {isPending ? "Cerrando..." : "Cerrar sesión"}
          </span>
        </button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
