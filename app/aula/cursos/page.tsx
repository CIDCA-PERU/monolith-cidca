import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/actions/auth.actions'
import {
  getCursosByEstudiante,
  getEstudianteByUserId,
} from '@/repository/aula.repository'

export default async function AulaCursosPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const estudiante = await getEstudianteByUserId(user.usr_id_int)
  const cursos = estudiante
    ? await getCursosByEstudiante(estudiante.estu_id_int)
    : []
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Mis cursos</h1>
          <p className="text-sm text-muted-foreground">
            Accede a tus cursos activos y revisa tus modulos.
          </p>
        </div>{/* 
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">En curso</Button>
        </div>*/}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cursos.map((curso) => (
          <Card key={curso.cur_id_int} className="p-4 overflow-hidden">
            {curso.cur_url_vac ? (
              <img
                src={curso.cur_url_vac}
                alt={curso.cur_nomb_vac}
                className="w-full aspect-[16/9] object-cover rounded-md"
              />
            ) : (
              <div className="aspect-[16/9] rounded-md bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Sin imagen</span>
              </div>
            )}
            <div className="mt-4 space-y-2">
              <h3 className="text-base font-semibold">{curso.cur_nomb_vac}</h3>
              <p className="text-sm text-muted-foreground">
                {curso.cur_desc_vac || ''}
              </p>
              <Link href={`/aula/cursos/${curso.cur_uuid || curso.cur_id_int}`}>
                <Button className="w-full" size="sm">Ver curso</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
