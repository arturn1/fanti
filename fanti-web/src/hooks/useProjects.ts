import { use, useEffect, useState } from 'react';
import { useDataSource } from './useDataSource';
import { set } from 'date-fns';

export function useProjects() {
    const { mode, excelData, ready } = useDataSource();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        console.log('useProjects - mode:', mode);
        if (mode === 'excel') {
            if (!ready) return;
            setProjects(excelData?.projects || []);
            console.log('useProjects - excelData:', excelData?.projects);
            console.log('useProjects - projects:', projects);
            setLoading(false);
            setError(null);
            return;
        }
        setLoading(true);
        fetch('api/projects')
            .then(res => res.json())
            .then(data => {
                setProjects(data?.data || []);
                setError(null);
            })
            .catch(err => {
                setError(err);
                setProjects([]);
            })
            .finally(() => setLoading(false));
    }, [mode, excelData, ready]);

    return { projects, loading, error, setProjects, setLoading };
}
