import { getPagosAdmin } from '@/actions/admin.actions'
import { PagosTable } from '@/components/dashboard/pagos/pagos-table'

export default async function PagosPage() {
  const res = await getPagosAdmin()
  const pagos = res.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pagos</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {pagos.length} transacción{pagos.length !== 1 ? 'es' : ''} registrada{pagos.length !== 1 ? 's' : ''}
        </p>
      </div>
      <PagosTable pagos={pagos} />
    </div>
  )
}
