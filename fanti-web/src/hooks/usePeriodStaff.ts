'use client';
import api from '@/services/api';
import { useEffect, useState } from 'react';
import { useDataSource } from './useDataSource';

export function usePeriodStaff(token?: string) {
  const { mode, excelData, ready } = useDataSource();
  const [periodStaff, setPeriodStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (mode === 'excel') {
      if (!ready) return;
      setPeriodStaff(excelData?.periodStaffs || []);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    api.get('/PeriodStaff')
      .then(data => {
        setPeriodStaff(data.data.data || []);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setPeriodStaff([]);
      })
      .finally(() => setLoading(false));
  }, [mode, excelData, ready]);

  // CRUD methods
  async function createPeriodStaff(periodStaffMember: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/PeriodStaff', JSON.stringify(periodStaffMember));
      const data = await res.data;
      setPeriodStaff((prev) => [...prev, data.data]);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updatePeriodStaff(id: string, updates: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/PeriodStaff/${id}`, JSON.stringify(updates));
      const data = await res.data;
      setPeriodStaff((prev) => prev.map(ps => ps.id === id ? data.data : ps));
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deletePeriodStaff(id: string) {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/PeriodStaff/${id}`);
      setPeriodStaff((prev) => prev.filter(ps => ps.id !== id));
      return true;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getPeriodStaff(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/PeriodStaff/${id}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Additional methods
  async function getStaffByPeriod(periodId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/PeriodStaff/period/${periodId}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getPeriodsByStaff(staffId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/PeriodStaff/staff/${staffId}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    periodStaff,
    loading,
    error,
    setPeriodStaff,
    setLoading,
    createPeriodStaff,
    updatePeriodStaff,
    deletePeriodStaff,
    getPeriodStaff,
    getStaffByPeriod,
    getPeriodsByStaff
  };
}