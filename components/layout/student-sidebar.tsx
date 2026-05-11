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
  { title: 'Cursos', href: '/aula/cursos', icon: BookOpen },
  { title: 'Pagos', href: '/aula/pagos', icon: CreditCard },
  { title: 'Certificados', href: '/aula/certificados', icon: FileCheck },
  { title: 'Mi perfil', href: '/aula/perfil', icon: User },
]

export function StudentSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="floating" collapsible="offcanvas">
      <SidebarHeader className="px-4 py-5">
        <Link href="/aula/cursos" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-accent">
            <span className="text-primary text-sm font-bold">C</span>
          </div>
          <span className="text-sm font-semibold tracking-wide">CIDCA</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Alumno</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-2 pb-3">
        <form action={logoutUser} className="w-full">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Salir</span>
          </Button>
        </form>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
