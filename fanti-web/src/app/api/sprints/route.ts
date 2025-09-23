
import { NextRequest, NextResponse } from 'next/server';
import api from '@/services/api';

// Buscar todos os sprints, por projeto ou por ID
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const projectId = searchParams.get('projectId');
        if (id) {
            const response = await api.get(`/Sprints/${id}`);
            return NextResponse.json(response.data);
        }
        if (projectId) {
            const response = await api.get('/Sprints', { params: { projectId } });
            return NextResponse.json(response.data);
        }
        const response = await api.get('/Sprints');
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Criar novo sprint
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await api.post('/Sprints', body);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Atualizar sprint
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await api.put('/Sprints', body);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Deletar sprint
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        await api.delete(`/Sprints/${id}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
