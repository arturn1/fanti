
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import api from '@/services/api';

// Buscar status de autenticação
export async function GET(req: NextRequest) {
    try {
        // Verifica o token do cookie
        const cookie = req.cookies.get('access_token');
        const token = cookie?.value;
        let isAuthenticated = false;
        let user = null;

        if (token) {
            // Opcional: validar token no backend
            try {
                isAuthenticated = true;
                user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
            } catch {
                isAuthenticated = false;
            }
        }

        return NextResponse.json({ isAuthenticated, user });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Login
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await api.post('/Auth/login', body);

        // Setar cookie httpOnly para autenticação centralizada
        const res = NextResponse.json(response.data);
        return res;
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}

// Refresh token
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await api.post('/Auth/refresh', body);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}

// Logout
export async function DELETE(req: NextRequest) {
    try {
        await api.post('/Auth/logout');
        // Remover cookie de autenticação
        const res = NextResponse.json({ success: true });
        res.cookies.set('access_token', '', {
            httpOnly: true,
            path: '/',
            expires: new Date(0),
            sameSite: 'lax',
        });
        return res;
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
