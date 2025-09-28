

import { NextRequest, NextResponse } from 'next/server';
import api from '@/services/api';

// GET: Buscar tarefas (todas, por projeto, por sprint, por ID, subtarefas, filtros)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const projectId = searchParams.get('projectId');
        const sprintId = searchParams.get('sprintId');
        const parentTaskId = searchParams.get('parentTaskId');
        if (id) {
            const response = await api.get(`/Tasks/${id}`);
            return NextResponse.json(response.data);
        }
        if (projectId) {
            const response = await api.get('/Tasks', { params: { projectId } });
            return NextResponse.json(response.data);
        }
        if (sprintId) {
            const response = await api.get('/Tasks', { params: { sprintId } });
            return NextResponse.json(response.data);
        }
        if (parentTaskId) {
            const response = await api.get(`/Tasks/subtasks/${parentTaskId}`);
            return NextResponse.json(response.data);
        }
        // Filtros genéricos
        const filters: any = {};
        for (const [key, value] of searchParams.entries()) {
            if (!['id', 'projectId', 'sprintId', 'parentTaskId'].includes(key)) filters[key] = value;
        }
        const response = await api.get('/Tasks', { params: filters });
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Criar tarefa ou subtarefa
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Se vier parentTaskId, criar subtarefa
        if (body.parentTaskId) {
            const response = await api.post('/Tasks/subtask', body);
            return NextResponse.json(response.data);
        }
        // Tarefa normal
        const response = await api.post('/Tasks', body);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}



// DELETE: Deletar tarefa
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        await api.delete(`/Tasks/${id}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
