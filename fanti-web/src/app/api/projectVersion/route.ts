import api from '@/services/api';
import { NextRequest, NextResponse } from 'next/server';

// GET: List or get by id
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
      const response = await api.get(`/ProjectVersion/${id}`);
      return NextResponse.json(response.data);
    }
    const response = await api.get('/ProjectVersion');
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await api.post('/ProjectVersion', body);
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 412 });
  }
}

// PUT: Update
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await api.put('/ProjectVersion', body);
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
    await api.delete(`/ProjectVersion/${id}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}