import { NextRequest, NextResponse } from 'next/server';
import api from '@/services/api';

// GET: List or get by id
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (id) {
            const response = await api.get(`/Period/${id}`);
            return NextResponse.json(response.data);
        }
        const response = await api.get('/Period');
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Only send Staffs as array of GUIDs
        if (body.Staffs && Array.isArray(body.Staffs)) {
            body.Staffs = body.Staffs.map((s: any) => typeof s === 'object' && s.id ? s.id : s);
        }
        const response = await api.post('/Period', body);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        if (body.Staffs && Array.isArray(body.Staffs)) {
            body.Staffs = body.Staffs.map((s: any) => typeof s === 'object' && s.id ? s.id : s);
        }
        const response = await api.put('/Period', body);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Delete
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        await api.delete(`/Period/${id}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
