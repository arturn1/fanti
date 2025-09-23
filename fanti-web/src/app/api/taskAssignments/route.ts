
import { NextRequest, NextResponse } from 'next/server';
import api from '@/services/api';

// Buscar todas as atribuições, por tarefa, por usuário ou por ID
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const taskId = searchParams.get('taskId');
        const userId = searchParams.get('userId');
        if (id) {
            const response = await api.get(`/TaskAssignments/${id}`);
            return NextResponse.json(response.data);
        }
        if (taskId) {
            const response = await api.get(`/TaskAssignments/task/${taskId}`);
            return NextResponse.json(response.data);
        }
        if (userId) {
            const response = await api.get(`/TaskAssignments/user/${userId}`);
            return NextResponse.json(response.data);
        }
        const response = await api.get('/TaskAssignments');
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Criar nova atribuição
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await api.post('/TaskAssignments', body);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Atualizar atribuição
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await api.put('/TaskAssignments', body);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Deletar atribuição
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        await api.delete(`/TaskAssignments/${id}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
