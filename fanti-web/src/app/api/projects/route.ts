
import { NextRequest, NextResponse } from 'next/server';
import api from '@/services/api';

// Buscar todos os projetos ou por ID/filtros
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (id) {
            const response = await api.get(`/Projects/${id}`);
            return NextResponse.json(response.data);
        }
        // Filtros
        const filters: any = {};
        for (const [key, value] of searchParams.entries()) {
            if (key !== 'id') filters[key] = value;
        }
        const response = await api.get('/Projects', { params: filters });
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Criar novo projeto
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await api.post('/Projects', body);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Atualizar projeto
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await api.put('/Projects', body);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Deletar projeto
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        await api.delete(`/Projects/${id}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
