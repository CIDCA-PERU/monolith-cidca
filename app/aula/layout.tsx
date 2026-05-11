import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/auth.actions'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { StudentSidebar } from '@/components/layout/student-sidebar'

export default async function AulaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.rol_nam_vc && user.rol_nam_vc !== 'ESTUDIANTE') {
    redirect('/dashboard')
  }

  return (
    <SidebarProvider>
      <StudentSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="text-sm font-semibold">Aula virtual CIDCA</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {user.usr_email_vac}
          </div>
        </header>
        <div className="mx-auto w-full max-w-7xl px-4 py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
