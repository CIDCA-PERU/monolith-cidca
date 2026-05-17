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
      <SidebarInset className="bg-slate-50 dark:bg-slate-900 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-5 shadow-sm">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors" />
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Panel de Administración
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold border border-amber-200 dark:border-amber-500/20">
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
