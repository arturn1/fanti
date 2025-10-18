'use client';
import api from '@/services/api';
import { useEffect, useState } from 'react';
import { useDataSource } from './useDataSource';

export function useTasks(token?: string) {
  const { mode, excelData, ready } = useDataSource();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (mode === 'excel') {
      if (!ready) return;
      setTasks(excelData?.tasks || []);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    api.get('/Tasks')
      .then(data => {
        setTasks(data.data.data || []);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setTasks([]);
      })
      .finally(() => setLoading(false));
  }, [mode, excelData, ready]);

  // CRUD methods
  async function createTask(task: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/Tasks', JSON.stringify(task));
      const data = await res.data;
      setTasks((prev) => [...prev, data.data]);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateTask(id: string, updates: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/Tasks/${id}`, JSON.stringify(updates));
      const data = await res.data;
      setTasks((prev) => prev.map(t => t.id === id ? data.data : t));
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteTask(id: string) {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/Tasks/${id}`);
      setTasks((prev) => prev.filter(t => t.id !== id));
      return true;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getTask(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/Tasks/${id}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Additional task methods
  async function getTasksByProject(projectId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/Tasks/project/${projectId}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getTasksBySprint(sprintId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/Tasks/sprint/${sprintId}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getSubtasks(parentTaskId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/Tasks/subtasks/${parentTaskId}`);
      return res.data.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    tasks,
    loading,
    error,
    setTasks,
    setLoading,
    createTask,
    updateTask,
    deleteTask,
    getTask,
    getTasksByProject,
    getTasksBySprint,
    getSubtasks
  };
}