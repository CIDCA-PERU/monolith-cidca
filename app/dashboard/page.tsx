import { getCurrentUser } from '@/actions/auth.actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, Users, FileText, ClipboardList } from 'lucide-react'

const DASHBOARD_ROLES = ['SISTEMAS', 'ADMINISTRADOR', 'DOCENTE']

export default async function DashboardPage() {
  const user = await getCurrentUser()

  const rol = user?.rol_nam_vc?.toUpperCase() ?? ''
  const isStaff = DASHBOARD_ROLES.includes(rol)

  const modules = [
    {
      id: 'cursos',
      title: 'Gestión de Cursos',
      description: 'Crear y administrar cursos',
      icon: BookOpen,
      href: '/dashboard/cursos',
      available: isStaff,
    },
    {
      id: 'estudiantes',
      title: 'Estudiantes',
      description: 'Ver estudiantes inscritos',
      icon: Users,
      href: '/dashboard/estudiantes',
      available: isStaff,
    },
    {
      id: 'examenes',
      title: 'Exámenes',
      description: 'Crear y administrar exámenes',
      icon: FileText,
      href: '/dashboard/examenes',
      available: isStaff,
    },
    {
      id: 'asistencia',
      title: 'Asistencia',
      description: 'Registrar asistencia',
      icon: ClipboardList,
      href: '/dashboard/asistencia',
      available: isStaff,
    },
  ]

  const descripcionRol =
    rol === 'SISTEMAS'
      ? 'Panel de administración del sistema'
      : rol === 'ADMINISTRADOR'
      ? 'Panel de administración'
      : rol === 'DOCENTE'
      ? 'Panel de gestión para docentes'
      : 'Panel de control'

  return (
    <div className="py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Bienvenido, {user?.usr_nomb_vac}
        </h1>
        <p className="text-muted-foreground">{descripcionRol}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.filter(m => m.available).map((module) => {
          const Icon = module.icon
          return (
            <Card
              key={module.id}
              className="p-6 hover:border-accent transition-colors cursor-pointer"
            >
              <Link href={module.href} className="block">
                <div className="flex items-start justify-between mb-4">
                  <Icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {module.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {module.description}
                </p>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-accent text-primary hover:bg-accent/90"
                >
                  Acceder
                </Button>
              </Link>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
