'use client';
import { use, useEffect, useState } from 'react';
import { useDataSource } from './useDataSource';

export function useProjects(token?: string) {
    const { mode, excelData, ready } = useDataSource();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        console.log('useProjects - mode:', mode);
        if (mode === 'excel') {
            if (!ready) return;
            setProjects(excelData?.projects || []);
            setLoading(false);
            setError(null);
            return;
        }
        setLoading(true);
        apiFetch('api/projects')
            .then(res => res.json())
            .then(data => {
                setProjects(data?.data || []);
                setError(null);
            })
            .catch(err => {
                setError(err);
                setProjects([]);
            })
            .finally(() => setLoading(false));
    }, [mode, excelData, ready]);

    return { projects, loading, error, setProjects, setLoading };
}

export async function apiFetch(url: string, options: RequestInit = {}) {
    const token = typeof window === "undefined"
        ? undefined
        : localStorage.getItem("access_token");

    const headers = {
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
    };

    const response = await fetch(url, { ...options, headers });

    // Middleware de erro global
    if (response.status === 401) {
        console.warn("Sessão expirada — redirecionando para login");
        if (typeof window !== "undefined") window.location.href = "/login";
    }

    return response;
}

