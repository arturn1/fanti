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
    api.get('/ProjectVersion')
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

  // CRUD methods
  async function createProjectVersion(version: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ProjectVersion', JSON.stringify(version));
      const data = await res.data;
      setProjectVersions((prev) => [...prev, data.data]);
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
      const res = await api.put(`/ProjectVersion/${id}`, JSON.stringify(updates));
      const data = await res.data;
      setProjectVersions((prev) => prev.map(pv => pv.id === id ? data.data : pv));
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
      setProjectVersions((prev) => prev.filter(pv => pv.id !== id));
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

  // Additional methods for project versions
  async function getVersionsByProject(projectId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/ProjectVersion/project/${projectId}`);
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
    getVersionsByProject
  };
}