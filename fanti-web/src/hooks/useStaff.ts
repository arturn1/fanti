'use client';
import api from '@/services/api';
import { useEffect, useState } from 'react';
import { useDataSource } from './useDataSource';

export function useStaff(token?: string) {
  const { mode, excelData, ready } = useDataSource();
  const [staffs, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (mode === 'excel') {
      if (!ready) return;
      setStaff(excelData?.staffs || []);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    api.get('/Staff')
      .then(data => {
        setStaff(data.data.data || []);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setStaff([]);
      })
      .finally(() => setLoading(false));
  }, [mode, excelData, ready]);

  // CRUD methods
  async function createStaff(staffMember: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/Staff', JSON.stringify(staffMember));
      const data = await res.data;
      setStaff((prev) => [...prev, data.data]);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateStaff(id: string, updates: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/Staff`, { ...updates, id });
      const data = await res.data;
      setStaff((prev) => prev.map(s => s.id === id ? data.data : s));
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteStaff(id: string) {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/Staff/${id}`);
      setStaff((prev) => prev.filter(s => s.id !== id));
      return true;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getStaff(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/Staff/${id}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    staffs,
    loading,
    error,
    setStaff,
    setLoading,
    createStaff,
    updateStaff,
    deleteStaff,
    getStaff
  };
}