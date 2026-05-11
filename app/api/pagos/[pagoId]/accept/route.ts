import { NextRequest, NextResponse } from 'next/server';
import { acceptPago } from '@/actions/pago.actions';

/**
 * POST /api/pagos/[pagoId]/accept
 * Acepta un pago y crea la relación estudiante_curso
 */
export async function POST(
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

    const result = await acceptPago(pagoId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in accept pago endpoint:', error);
    return NextResponse.json(
      { error: 'Error al aceptar el pago' },
      { status: 500 }
    );
  }
}
