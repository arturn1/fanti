import api from '@/services/api';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const jsonData = await req.json();

        // Fazer requisição para o backend
        const response = await api.post('/Excel/json-para-excel', jsonData, {
            responseType: 'arraybuffer',
        });

        // Retornar o arquivo Excel
        return new NextResponse(response.data, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="dados-${new Date().toISOString().slice(0, 10)}.xlsx"`,
            },
        });
    } catch (error: any) {
        console.error('Erro na conversão JSON para Excel:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
