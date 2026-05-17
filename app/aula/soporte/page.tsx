import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/auth.actions'
import { getSoportesByUsuario } from '@/repository/soporte.repository'
import { supabase } from '@/lib/supabase'
import { SoporteForm } from '@/components/aula/soporte/soporte-form'
import { SoporteList } from '@/components/aula/soporte/soporte-list'
import { LifeBuoy, HelpCircle } from 'lucide-react'

export default async function AulaSoportePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const tickets = await getSoportesByUsuario(user.usr_id_int)

  // Generar URLs firmadas (1 hora) para cada adjunto, igual que pagos
  const ticketsConUrl = await Promise.all(
    tickets.map(async (ticket) => {
      if (!ticket.sop_url_vac) return { ...ticket, sop_signed_url: null }

      const { data } = await supabase.storage
        .from('student-private')
        .createSignedUrl(ticket.sop_url_vac, 3600)

      return { ...ticket, sop_signed_url: data?.signedUrl ?? null }
    })
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <LifeBuoy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Centro de Soporte
            </h1>
            <p className="text-sm text-white dark:text-white mt-0.5">
              Reporta problemas o consultas y te contactaremos.
            </p>
          </div>
        </div>

        {tickets.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-white">
            <HelpCircle className="h-3.5 w-3.5" />
            {tickets.length} solicitud{tickets.length !== 1 ? 'es' : ''} registrada{tickets.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Layout de dos columnas */}
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] xl:grid-cols-[1fr_1.3fr]">
        {/* Formulario */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-white uppercase tracking-wider">
            Nueva solicitud
          </h2>
          <SoporteForm />
        </div>

        {/* Historial */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-white uppercase tracking-wider">
            Mis solicitudes
          </h2>
          <SoporteList tickets={ticketsConUrl} />
        </div>
      </div>
    </div>
  )
}
