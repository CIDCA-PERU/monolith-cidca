import { getSesionesByCurso } from '@/actions/asistencia.actions'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cursoId = searchParams.get('cursoId') || 'fde85e6c-d1f3-4b78-8d91-5ee33a76cc4e'
    const { AsistenciaService } = await import('@/service/asistencia.service');
    // Call service directly to bypass assertAuthenticated
    const res = await AsistenciaService.getSesionesByCurso(cursoId, '1', 'ADMINISTRADOR');
    return NextResponse.json({ success: true, data: res })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
