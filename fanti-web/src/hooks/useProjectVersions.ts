'use client';
import api from '@/services/api';
import { useEffect, useState } from 'react';
import { useDataSource } from './useDataSource';

export function useProjectVersions(token?: string) {
  const { mode, excelData, ready } = useDataSource();
  const [projectVersions, setProjectVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (mode === 'excel') {
      if (!ready) return;
      setProjectVersions(excelData?.projectVersions || []);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    api.get('/Projects/with-versions')
      .then(data => {
        setProjectVersions(data.data.data || []);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setProjectVersions([]);
      })
      .finally(() => setLoading(false));
  }, [mode, excelData, ready]);

  // Refresh function to reload data
  const refreshProjectVersions = async () => {
    setLoading(true);
    try {
      const data = await api.get('/Projects/with-versions');
      setProjectVersions(data.data.data || []);
      setError(null);
    } catch (err: any) {
      setError(err);
      setProjectVersions([]);
    } finally {
      setLoading(false);
    }
  };

  // CRUD methods
  async function createProjectVersion(projectVersion: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ProjectVersion', JSON.stringify(projectVersion));
      const data = await res.data;
      // Refresh the full list to get updated projects with versions
      await refreshProjectVersions();
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateProjectVersion(id: string, updates: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/ProjectVersion`, JSON.stringify(updates));
      const data = await res.data;
      // Refresh the full list to get updated projects with versions
      await refreshProjectVersions();
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteProjectVersion(id: string) {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/ProjectVersion/${id}`);
      // Refresh the full list to get updated projects with versions
      await refreshProjectVersions();
      return true;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getProjectVersion(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/ProjectVersion/${id}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    projectVersions,
    loading,
    error,
    setProjectVersions,
    setLoading,
    createProjectVersion,
    updateProjectVersion,
    deleteProjectVersion,
    getProjectVersion,
    refreshProjectVersions
  };
}