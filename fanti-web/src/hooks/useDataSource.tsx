'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { importAllDataFromExcel } from '@/services/exportExcel';
import { set } from 'date-fns';

export type DataSourceMode = 'excel' | 'api';

export interface DataSource {
    projects: any[];
    sprints: any[];
    tasks: any[];
    periods: any[];
    tasksPeriod: any[];
    staffs: any[];
    periodStaffs: any[];
    projectVersions: any[];
    taskDependencies: any[];
}

interface DataSourceContextProps {
    mode: DataSourceMode;
    setMode: (mode: DataSourceMode) => void;
    excelData: DataSource | null;
    importExcel: (file: File) => Promise<void>;
    loading: boolean;
    ready: boolean;
}

const DataSourceContext = createContext<DataSourceContextProps | undefined>(undefined);

export const DataSourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setModeState] = useState<DataSourceMode>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('dataSourceMode') as DataSourceMode) || 'api';
        }
        return 'api';
    });
    const [excelData, setExcelData] = useState<DataSource | null>(null);
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);

    const setMode = useCallback((newMode: DataSourceMode) => {
        setModeState(newMode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('dataSourceMode', newMode);
        }
    }, []);

    const importExcel = useCallback(async (file: File) => {
        setLoading(true);
        try {
            const imported = await importAllDataFromExcel(file);
            setExcelData(imported);
            setMode('excel');
        } finally {
            setLoading(false);
        }
    }, [setMode]);

    // Carrega do localStorage se já tiver sido importado
    useEffect(() => {
        if (mode === 'excel' && typeof window !== 'undefined') {
            const saved = localStorage.getItem('excelData');
            if (saved) {
                setExcelData(JSON.parse(saved));
            }
            setReady(true);
        }else {
            setReady(false);
        }
    }, [mode]);

    // Salva no localStorage ao importar
    useEffect(() => {
        if (mode === 'excel' && excelData && typeof window !== 'undefined') {
            localStorage.setItem('excelData', JSON.stringify(excelData));
        }
    }, [mode, excelData]);

    return (
        <DataSourceContext.Provider value={{ mode, setMode, excelData, importExcel, loading, ready }}>
            {children}
        </DataSourceContext.Provider>
    );
};

export function useDataSource() {
    const ctx = useContext(DataSourceContext);
    if (!ctx) throw new Error('useDataSource must be used within DataSourceProvider');
    return ctx;
}

// Hook geral para obter dados de qualquer entidade
export function useEntity(entity: keyof DataSource): any[] {
    const { mode, excelData } = useDataSource();
    if (mode === 'excel') {
        return excelData?.[entity] || [];
    }
    // Se não for excel, retorna array vazio (ou poderia lançar)
    return [];
}
