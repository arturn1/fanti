'use client';
import api from '@/services/api';
import { useEffect, useState } from 'react';
import { useDataSource } from './useDataSource';

export function usePeriods(token?: string) {
  const { mode, excelData, ready } = useDataSource();
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (mode === 'excel') {
      if (!ready) return;
      setPeriods(excelData?.periods || []);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    api.get('/Period')
      .then(data => {
        setPeriods(data.data.data || []);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setPeriods([]);
      })
      .finally(() => setLoading(false));
  }, [mode, excelData, ready]);

  // CRUD methods
  async function createPeriod(period: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/Period', JSON.stringify(period));
      const data = await res.data;
      setPeriods((prev) => [...prev, data.data]);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updatePeriod(id: string, updates: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/Period`, JSON.stringify(updates));
      const data = await res.data;
      setPeriods((prev) => prev.map(p => p.id === id ? data.data : p));
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deletePeriod(id: string) {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/Period/${id}`);
      setPeriods((prev) => prev.filter(p => p.id !== id));
      return true;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getPeriod(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/Period/${id}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    periods,
    loading,
    error,
    setPeriods,
    setLoading,
    createPeriod,
    updatePeriod,
    deletePeriod,
    getPeriod
  };
}