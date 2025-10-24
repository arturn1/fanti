'use client';
import api from '@/services/api';
import { useEffect, useState } from 'react';
import { useDataSource } from './useDataSource';

export function useTaskDependencies(token?: string) {
  const { mode, excelData, ready } = useDataSource();
  const [taskDependencies, setTaskDependencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (mode === 'excel') {
      if (!ready) return;
      setTaskDependencies(excelData?.taskDependencies || []);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    api.get('/TaskDependencies')
      .then(data => {
        setTaskDependencies(data.data.data || []);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setTaskDependencies([]);
      })
      .finally(() => setLoading(false));
  }, [mode, excelData, ready]);

  // CRUD methods
  async function createTaskDependency(dependency: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/TaskDependencies', JSON.stringify(dependency));
      const data = await res.data;
      setTaskDependencies((prev) => [...prev, data.data]);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateTaskDependency(id: string, updates: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/TaskDependencies/${id}`, JSON.stringify(updates));
      const data = await res.data;
      setTaskDependencies((prev) => prev.map(td => td.id === id ? data.data : td));
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteTaskDependency(predecessorTaskId: string, successorTaskId: string) {
    setLoading(true);
    setError(null);
    try {
      // Find dependency by task IDs
      const dependency = taskDependencies.find(
        td => td.predecessorTaskId === predecessorTaskId && td.successorTaskId === successorTaskId
      );
      if (!dependency) {
        throw new Error('Dependency not found');
      }
      await api.delete(`/TaskDependencies`, { data: { predecessorTaskId, successorTaskId } });
      setTaskDependencies((prev) => prev.filter(td => td.id !== dependency.id));
      return true;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getTaskDependency(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/TaskDependencies/${id}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Additional methods for task dependencies
  async function getDependenciesByTask(taskId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/TaskDependencies/GetDependenciesByTaskId/${taskId}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    taskDependencies,
    loading,
    error,
    setTaskDependencies,
    setLoading,
    createTaskDependency,
    updateTaskDependency,
    deleteTaskDependency,
    getTaskDependency,
    getDependenciesByTask
  };
}