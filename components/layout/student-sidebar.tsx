'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  CreditCard,
  FileCheck,
  User,
  LogOut,
} from 'lucide-react'

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
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { logoutUser } from '@/actions/auth.actions'

const navItems = [
  { 
    title: 'Cursos', 
    href: '/aula/cursos', 
    icon: BookOpen,
    description: 'Mis cursos activos'
  },
  { 
    title: 'Pagos', 
    href: '/aula/pagos', 
    icon: CreditCard,
    description: 'Órdenes de pago'
  },
  { 
    title: 'Certificados', 
    href: '/aula/certificados', 
    icon: FileCheck,
    description: 'Mis certificados'
  },
  { 
    title: 'Mi perfil', 
    href: '/aula/perfil', 
    icon: User,
    description: 'Datos personales'
  },
]

export function StudentSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="floating" collapsible="offcanvas" className="bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
      <SidebarHeader className="border-b border-slate-200 dark:border-slate-800 px-4 py-5">
        <Link href="/aula/cursos" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-sm group-hover:shadow-md transition-shadow">
            <BookOpen className="h-5 w-5 text-slate-900" />
          </div>
          <div className="flex flex-col gap-0">
            <span className="text-sm font-bold text-slate-900 dark:text-white">CIDCA</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Aula Virtual</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-0">
        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className="px-2 text-xs font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-500 mb-3">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className="h-auto p-0"
                    >
                      <Link 
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group
                          ${isActive 
                            ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-900 dark:text-yellow-400' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                          }
                        `}
                      >
                        <div className={`
                          flex h-9 w-9 items-center justify-center rounded-md transition-all duration-200
                          ${isActive 
                            ? 'bg-yellow-200 dark:bg-yellow-500/20' 
                            : 'bg-slate-200/50 dark:bg-slate-800/50 group-hover:bg-slate-200 dark:group-hover:bg-slate-800'
                          }
                        `}>
                          <Icon className={`h-4 w-4 ${isActive ? 'text-yellow-700 dark:text-yellow-400' : 'text-slate-600 dark:text-slate-400'}`} />
                        </div>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="text-sm font-semibold leading-none">{item.title}</span>
                          <span className={`text-xs leading-none ${isActive ? 'text-yellow-700/70 dark:text-yellow-400/70' : 'text-slate-600 dark:text-slate-500'}`}>
                            {item.description}
                          </span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-200 dark:border-slate-800 px-2 py-4">
        <Button
          onClick={() => logoutUser()}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">Salir</span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
