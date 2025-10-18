'use client';
import api from '@/services/api';
import { useEffect, useState } from 'react';
import { useDataSource } from './useDataSource';

export function useUsers(token?: string) {
  const { mode, excelData, ready } = useDataSource();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // if (mode === 'excel') {
    //   if (!ready) return;
    //   setUsers(excelData?.users || []);
    //   setLoading(false);
    //   setError(null);
    //   return;
    // }
    setLoading(true);
    api.get('/Users')
      .then(data => {
        setUsers(data.data.data || []);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, [mode, excelData, ready]);

  // CRUD methods
  async function createUser(user: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/Users', JSON.stringify(user));
      const data = await res.data;
      setUsers((prev) => [...prev, data.data]);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(id: string, updates: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/Users/${id}`, JSON.stringify(updates));
      const data = await res.data;
      setUsers((prev) => prev.map(u => u.id === id ? data.data : u));
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id: string) {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/Users/${id}`);
      setUsers((prev) => prev.filter(u => u.id !== id));
      return true;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getUser(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/Users/${id}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    users,
    loading,
    error,
    setUsers,
    setLoading,
    createUser,
    updateUser,
    deleteUser,
    getUser
  };
}