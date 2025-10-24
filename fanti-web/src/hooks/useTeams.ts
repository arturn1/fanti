'use client';
import api from '@/services/api';
import { useEffect, useState } from 'react';
// import { useDataSource } from './useDataSource';

export function useTeams(token?: string) {
  // const { mode, excelData, ready } = useDataSource();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // if (mode === 'excel') {
    //   if (!ready) return;
    //   setTeams(excelData?.teams || []);
    //   setLoading(false);
    //   setError(null);
    //   return;
    // }
    setLoading(true);
    api.get('/Team')
      .then(data => {
        setTeams(data.data.data || []);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setTeams([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // CRUD methods
  async function createTeam(team: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/Team', JSON.stringify(team));
      const data = await res.data;
      setTeams((prev) => [...prev, data.data]);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateTeam(id: string, updates: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/Team`, JSON.stringify({ ...updates, id }));
      const data = await res.data;
      setTeams((prev) => prev.map(t => t.id === id ? data.data : t));
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteTeam(id: string) {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/Team/${id}`);
      setTeams((prev) => prev.filter(t => t.id !== id));
      return true;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getTeam(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/Team/${id}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    teams,
    loading,
    error,
    setTeams,
    setLoading,
    createTeam,
    updateTeam,
    deleteTeam,
    getTeam
  };
}