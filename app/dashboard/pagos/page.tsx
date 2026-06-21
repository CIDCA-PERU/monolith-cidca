import { getPagosAdmin } from '@/actions/admin.actions'
import { PagosTable } from '@/components/dashboard/pagos/pagos-table'
import { SearchBar } from '@/components/ui/search-bar'
import { Pagination } from '@/components/ui/pagination'
import { NuevoPagoSheet } from '@/components/dashboard/pagos/nuevo-pago-sheet'

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 10
  const search = typeof params.search === 'string' ? params.search : undefined

  const res = await getPagosAdmin(page, limit, search)
  const pagos = res.data ?? []
  const total = res.meta?.total ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Pagos</h1>
          <p className="mt-1 text-sm text-black dark:text-white">
            {total} transacción{total !== 1 ? 'es' : ''} registrada{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <SearchBar placeholder="Buscar por alumno o nro..." />
          <NuevoPagoSheet
            pagosExistentes={pagos}
          />
        </div>
      </div>
      <PagosTable pagos={pagos} />
      <Pagination totalPages={res.meta?.totalPages ?? 1} />
    </div>
  )
}
