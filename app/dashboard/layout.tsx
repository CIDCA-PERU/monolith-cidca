import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/auth.actions'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/dashboard/admin-sidebar'

const DASHBOARD_ROLES = ['SISTEMAS', 'ADMINISTRADOR', 'DOCENTE']

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) redirect('/login')

  const rol = user.rol_nam_vc?.toUpperCase() ?? ''

  if (!DASHBOARD_ROLES.includes(rol)) {
    if (rol === 'ESTUDIANTE') redirect('/aula/cursos')
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <AdminSidebar
        rol={user.rol_nam_vc ?? ''}
        nombre={user.usr_nomb_vac ?? ''}
        email={user.usr_email_vac ?? ''}
      />
      <SidebarInset className="bg-white dark:bg-sky-950 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-white dark:bg-sky-950 border-b border-sky-200 dark:border-sky-900 px-5 shadow-sm">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-8 w-8 text-black dark:text-white hover:bg-sky-50 dark:hover:bg-sky-900/40 rounded-md transition-colors" />
            <div className="h-4 w-px bg-sky-100 dark:bg-sky-900" />
            <span className="text-sm text-black dark:text-white font-bold">
              Panel de Administración
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-black dark:text-white font-bold border border-amber-200 dark:border-amber-500/20">
              {user.rol_nam_vc?.toUpperCase() === 'ADMINISTRADOR' ? 'Admin' : user.rol_nam_vc}
            </span>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="mx-auto w-full max-w-7xl px-6 py-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
