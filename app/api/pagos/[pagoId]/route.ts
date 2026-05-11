import { NextRequest, NextResponse } from 'next/server';
import { getOrdenById } from '@/repository/pago.repository';

export async function GET(
  request: NextRequest,
  { params }: { params: { pagoId: string } }
) {
  try {
    const pagoId = parseInt(params.pagoId);

    if (isNaN(pagoId)) {
      return NextResponse.json(
        { error: 'ID de pago inválido' },
        { status: 400 }
      );
    }

    const pago = await getOrdenById(pagoId);

    if (!pago) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(pago);
  } catch (error) {
    console.error('Error fetching pago:', error);
    return NextResponse.json(
      { error: 'Error al obtener la orden' },
      { status: 500 }
    );
  }
}
