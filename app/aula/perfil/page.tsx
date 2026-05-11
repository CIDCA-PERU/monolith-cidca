import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/auth.actions'
import { getEstudianteByUserId, getTiposDocumento } from '@/repository/aula.repository'
import { StudentProfileForm } from '@/components/aula/student-profile-form'

export default async function AulaPerfilPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const estudiante = await getEstudianteByUserId(user.usr_id_int)
  const tiposDocumento = await getTiposDocumento()

  // Extract document and phone data from relationships
  const numeroDocumento = (estudiante?.detalle_documento?.[0]?.dtdoc_num_vac as string) || ''
  const tipoDocumentoId = (estudiante?.detalle_documento?.[0]?.doc_id_int as number)?.toString() || ''
  const telefonoData = estudiante?.telefono?.[0]
  const telefonoCompleto = telefonoData
    ? `${telefonoData.tel_cod_pai_int || ''}${telefonoData.tel_num_int || ''}`.replace(/^undefined/, '')
    : ''

  const initialData = {
    nombre: estudiante?.estu_nomb_vac || '',
    apellidoPaterno: estudiante?.estu_apell_pat_vac || '',
    apellidoMaterno: estudiante?.estu_apell_mat_vac || '',
    email: user.usr_email_vac || '',
    genero: estudiante?.estu_gen_vac || '',
    telefono: telefonoCompleto,
    tipoDocumento: tipoDocumentoId,
    numeroDocumento: numeroDocumento,
  }

  // Transform tipos de documento for component
  const tiposDocumentoFormateados = tiposDocumento.map((tipo) => ({
    id: tipo.doc_id_int.toString(),
    nombre: tipo.doc_tipo_vac || '',
  }))

  return (
    <StudentProfileForm
      initialData={initialData}
      tiposDocumento={tiposDocumentoFormateados}
    />
  )
}
