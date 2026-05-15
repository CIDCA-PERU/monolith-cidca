import { Navbar } from '@/components/layout/navbar'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/auth.actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Lista blanca: solo estos roles pueden usar el dashboard
  const DASHBOARD_ROLES = ['SISTEMAS', 'DOCENTE', 'ADMINISTRADOR']
  if (!user.rol_nam_vc || !DASHBOARD_ROLES.includes(user.rol_nam_vc.toUpperCase())) {
    // Estudiantes → aula, cualquier otro rol no reconocido → login
    if (user.rol_nam_vc?.toUpperCase() === 'ESTUDIANTE') {
      redirect('/aula/cursos')
    }
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
