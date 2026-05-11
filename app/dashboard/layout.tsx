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

  if (user.rol_nam_vc && user.rol_nam_vc.toUpperCase() === 'ESTUDIANTE') {
    redirect('/aula/cursos')
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
