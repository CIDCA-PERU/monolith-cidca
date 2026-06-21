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
  Award,
  User,
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

// --- Tipos --------------------------------------------------------------------

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

// --- Items de navegación ------------------------------------------------------

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
    title: "Certificados",
    href: "/dashboard/certificados",
    icon: Award,
    description: "Emitir certificados",
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

// --- Componente ---------------------------------------------------------------

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
      className="border-r border-sky-200 dark:border-sky-900"
    >
      {/* -- Header ----------------------------------------------- */}
      <SidebarHeader className="border-b border-sky-200 dark:border-sky-900 px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
            <GraduationCap size={18} className="text-black" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold text-black dark:text-white tracking-tight">
              CIDCA
            </span>
            <span className="text-[11px] font-bold text-black dark:text-white">
              Panel de Administración
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* -- Content ---------------------------------------------- */}
      <SidebarContent className="px-0 py-2">
        {/* Navegación principal */}
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupLabel className="px-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
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
                          flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group font-bold
                          ${active
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-950 dark:text-blue-50 shadow-sm"
                            : "text-blue-950/80 dark:text-blue-100/80 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:text-blue-950 dark:hover:text-blue-50"
                          }
                        `}
                      >
                        <div
                          className={`
                            flex h-8 w-8 items-center justify-center rounded-md flex-shrink-0 transition-all duration-150
                            ${active
                              ? "bg-blue-600 dark:bg-blue-500 shadow-md shadow-blue-500/20"
                              : "bg-blue-100/50 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800"
                            }
                          `}
                        >
                          <Icon
                            className={`h-4 w-4 transition-colors ${active ? "text-white" : "text-blue-700 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-blue-200"}`}
                          />
                        </div>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="text-sm font-bold leading-none">
                            {item.title}
                          </span>
                          <span
                            className={`text-[11px] font-bold leading-none ${active ? "text-blue-700 dark:text-blue-300" : "text-blue-950/60 dark:text-blue-100/60 group-hover:text-blue-950/80 dark:group-hover:text-blue-100/80"}`}
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
            <SidebarGroupLabel className="px-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
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
                            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group font-bold
                            ${active
                              ? "bg-rose-50 dark:bg-rose-900/30 text-rose-950 dark:text-rose-50 shadow-sm"
                              : "text-blue-950/80 dark:text-blue-100/80 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 hover:text-rose-950 dark:hover:text-rose-50"
                            }
                          `}
                        >
                          <div className={`flex h-8 w-8 items-center justify-center rounded-md flex-shrink-0 transition-all ${active ? "bg-rose-600 dark:bg-rose-500 shadow-md shadow-rose-500/20" : "bg-blue-100/50 dark:bg-blue-900/40 group-hover:bg-rose-200 dark:group-hover:bg-rose-800"}`}>
                            <Icon className={`h-4 w-4 transition-colors ${active ? "text-white" : "text-blue-700 dark:text-blue-300 group-hover:text-rose-800 dark:group-hover:text-rose-200"}`} />
                          </div>
                          <span className="text-sm font-bold leading-none">{item.title}</span>
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

      {/* -- Footer ----------------------------------------------- */}
      <SidebarFooter className="border-t border-sky-200 dark:border-sky-900 px-3 py-4">
        {/* Info del usuario → link al perfil */}
        <Link
          href="/dashboard/perfil"
          className={`
            flex items-center gap-3 px-2 py-2 mb-1 rounded-lg transition-all duration-150 group
            ${isActive('/dashboard/perfil')
              ? 'bg-blue-50 dark:bg-blue-900/30 shadow-sm'
              : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
            }
          `}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/20">
            <span className="text-xs font-bold text-black">
              {nombre?.charAt(0)?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className={`text-xs font-bold truncate ${isActive('/dashboard/perfil') ? "text-blue-950 dark:text-blue-50" : "text-blue-950/80 dark:text-blue-100/80"}`}>
              {nombre}
            </span>
            <span className={`text-[11px] font-bold truncate ${isActive('/dashboard/perfil') ? "text-blue-700 dark:text-blue-300" : "text-blue-950/60 dark:text-blue-100/60"}`}>{email}</span>
          </div>
          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${isActive('/dashboard/perfil') ? "bg-amber-500 text-blue-950" : "bg-blue-100/50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"}`}>
            {rolUpper === "ADMINISTRADOR" ? "ADMIN" : rolUpper}
          </span>
        </Link>

        {/* Botón logout */}
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-950/80 dark:text-blue-100/80 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-950 dark:hover:text-rose-50 transition-all duration-150 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100/50 dark:bg-blue-900/40 group-hover:bg-rose-200 dark:group-hover:bg-rose-800 transition-all duration-150 flex-shrink-0">
            <LogOut className="h-4 w-4 text-blue-700 dark:text-blue-300 group-hover:text-rose-800 dark:group-hover:text-rose-200 transition-colors" />
          </div>
          <span className="text-sm font-bold">
            {isPending ? "Cerrando..." : "Cerrar sesión"}
          </span>
        </button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
