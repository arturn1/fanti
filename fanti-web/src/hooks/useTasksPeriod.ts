'use client';
import api from '@/services/api';
import { useEffect, useState } from 'react';
import { useDataSource } from './useDataSource';

export function useTasksPeriod(token?: string) {
  const { mode, excelData, ready } = useDataSource();
  const [tasksPeriod, setTasksPeriod] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (mode === 'excel') {
      if (!ready) return;
      setTasksPeriod(excelData?.tasksPeriod || []);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    api.get('/TasksPeriod')
      .then(data => {
        setTasksPeriod(data.data.data || []);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setTasksPeriod([]);
      })
      .finally(() => setLoading(false));
  }, [mode, excelData, ready]);

  // CRUD methods
  async function createTaskPeriod(taskPeriod: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/TasksPeriod', JSON.stringify(taskPeriod));
      const data = await res.data;
      setTasksPeriod((prev) => [...prev, data.data]);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateTaskPeriod(id: string, updates: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/TasksPeriod/${id}`, JSON.stringify(updates));
      const data = await res.data;
      setTasksPeriod((prev) => prev.map(tp => tp.id === id ? data.data : tp));
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteTaskPeriod(id: string) {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/TasksPeriod/${id}`);
      setTasksPeriod((prev) => prev.filter(tp => tp.id !== id));
      return true;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getTaskPeriod(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/TasksPeriod/${id}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Additional methods
  async function getTasksByPeriod(periodId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/TasksPeriod/period/${periodId}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getPeriodsByTask(taskId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/TasksPeriod/task/${taskId}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    tasksPeriod,
    loading,
    error,
    setTasksPeriod,
    setLoading,
    createTaskPeriod,
    updateTaskPeriod,
    deleteTaskPeriod,
    getTaskPeriod,
    getTasksByPeriod,
    getPeriodsByTask
  };
}