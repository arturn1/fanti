import api from '@/services/api';
import { NextRequest, NextResponse } from 'next/server';


// PUT: Update by id
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const updatedBody = { ...body, id };
        const response = await api.patch('/tasks', updatedBody);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update by id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const updatedBody = { ...body, id };
        const response = await api.put('/tasks', updatedBody);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}