
import { NextRequest, NextResponse } from 'next/server';
import api from '@/services/api';

// Buscar todas as dependências, por tarefa ou por ID
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const taskId = searchParams.get('taskId');
        if (id) {
            const response = await api.get(`/TaskDependencies/${id}`);
            return NextResponse.json(response.data);
        }
        if (taskId) {
            const response = await api.get(`/TaskDependencies/task/${taskId}`);
            return NextResponse.json(response.data);
        }
        const response = await api.get('/TaskDependencies');
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Criar nova dependência
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await api.post('/TaskDependencies/simple', body);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Atualizar dependência
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await api.put('/TaskDependencies', body);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Deletar dependência
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            await api.delete(`TaskDependencies/remove`, {
                data: {
                    predecessorTaskId: searchParams.get('predecessorTaskId'),
                    successorTaskId: searchParams.get('successorTaskId')
                }
            });
        } else {
            await api.delete(`/TaskDependencies/${id}`);
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
