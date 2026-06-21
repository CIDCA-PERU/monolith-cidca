import { NextResponse } from 'next/server'
import { getSesionesConAsistencia } from '@/actions/asistencia.actions'

export async function GET(request: Request) {
  try {
    const res = await getSesionesConAsistencia('fde85e6c-d1f3-4b78-8d91-5ee33a76cc4e')
    return NextResponse.json(res)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
