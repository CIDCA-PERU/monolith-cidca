import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { getCurrentUser } from '@/actions/auth.actions'
import { getEstudianteByUserId } from '@/repository/aula.repository'

export default async function AulaPerfilPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const estudiante = await getEstudianteByUserId(user.usr_id_int)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">
          Actualiza tus datos cuando sea necesario.
        </p>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Email</span>
            <div className="font-medium">{user.usr_email_vac}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Nombres</span>
            <div className="font-medium">
              {estudiante?.estu_nomb_vac || '-'}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Apellido paterno</span>
            <div className="font-medium">
              {estudiante?.estu_apell_pat_vac || '-'}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Apellido materno</span>
            <div className="font-medium">
              {estudiante?.estu_apell_mat_vac || '-'}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Genero</span>
            <div className="font-medium">
              {estudiante?.estu_gen_vac || '-'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
