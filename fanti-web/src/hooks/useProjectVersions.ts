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

  return {
    projectVersions,
    loading,
    error,
    setProjectVersions,
    setLoading
  };
}