import { NextRequest, NextResponse } from 'next/server';
import api from '@/services/api';

// GET: List or get by id
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (id) {
            const response = await api.get(`/PeriodStaff/${id}`);
            return NextResponse.json(response.data);
        }
        const response = await api.get('/PeriodStaff');
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Only send Staff and Period as GUIDs
        if (body.Staff && typeof body.Staff === 'object' && body.Staff.id) {
            body.Staff = body.Staff.id;
        }
        if (body.Period && typeof body.Period === 'object' && body.Period.id) {
            body.Period = body.Period.id;
        }
        const response = await api.post('/PeriodStaff', body);
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
        await api.delete(`/PeriodStaff/${id}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
