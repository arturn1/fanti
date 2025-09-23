
import { NextRequest, NextResponse } from 'next/server';
import api from '@/services/api';

// Buscar todos os usuários ou por ID
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (id) {
            const response = await api.get(`/Users/${id}`);
            return NextResponse.json(response.data);
        }
        const response = await api.get('/Users');
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Criar novo usuário
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await api.post('/Users', body);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Atualizar usuário
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, ...user } = body;
        const response = await api.put('/Users', { id, ...user });
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Deletar usuário
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        await api.delete(`/Users/${id}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
