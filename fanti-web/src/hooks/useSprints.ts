'use client';
import api from '@/services/api';
import { useEffect, useState } from 'react';
import { useDataSource } from './useDataSource';

export function useSprints(token?: string) {
  const { mode, excelData, ready } = useDataSource();
  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (mode === 'excel') {
      if (!ready) return;
      setSprints(excelData?.sprints || []);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    api.get('/Sprints')
      .then(data => {
        setSprints(data.data.data || []);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setSprints([]);
      })
      .finally(() => setLoading(false));
  }, [mode, excelData, ready]);

  // CRUD methods
  async function createSprint(sprint: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/Sprints', JSON.stringify(sprint));
      const data = await res.data;
      setSprints((prev) => [...prev, data.data]);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateSprint(id: string, updates: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/Sprints/${id}`, JSON.stringify(updates));
      const data = await res.data;
      setSprints((prev) => prev.map(s => s.id === id ? data.data : s));
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteSprint(id: string) {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/Sprints/${id}`);
      setSprints((prev) => prev.filter(s => s.id !== id));
      return true;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getSprint(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/Sprints/${id}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    sprints,
    loading,
    error,
    setSprints,
    setLoading,
    createSprint,
    updateSprint,
    deleteSprint,
    getSprint
  };
}