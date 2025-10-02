'use client';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Card, Typography } from 'antd';
import { exportAllDataToExcel, importAllDataFromExcel } from '@/services/exportExcel';
import { message, Upload } from 'antd';


import { useDataSource } from '@/hooks/useDataSource';
import { Radio } from 'antd';

export default function SettingsPage() {
    const { mode, setMode, importExcel, loading, excelData } = useDataSource();

    // Função de exportação usando dados do contexto
    const handleExport = async () => {
        if (!excelData) {
            message.error('Nenhum dado disponível para exportar. Importe um Excel ou use o modo API.');
            return;
        }
        try {
            exportAllDataToExcel(
                excelData.projects,
                excelData.sprints,
                excelData.tasks,
                excelData.periods,
                excelData.tasksPeriod,
                excelData.staffs,
                excelData.periodStaffs,
                excelData.projectVersions,
                excelData.taskDependencies
            );
        } catch (error) {
            message.error('Erro ao exportar dados.');
            console.error(error);
        }
    };

    const handleImport = async (file: File) => {
        try {
            await importExcel(file);
            message.success('Excel importado! Agora você pode alternar o modo de dados.');
        } catch (err) {
            message.error('Erro ao importar dados.');
            console.error(err);
        }
    };

    return (
        <Card title={<span><SettingOutlined /> Configurações</span>} style={{ maxWidth: 600, margin: '40px auto' }}>
            <Typography.Title level={4}>Exportação de Dados</Typography.Title>
            <Typography.Paragraph>
                Exporte todos os dados do sistema em um arquivo Excel (.xlsx) relacionando projetos, milestones, tarefas, períodos e alocações.
            </Typography.Paragraph>
            <Button type="primary" loading={loading} onClick={handleExport} style={{ marginBottom: 24 }}>
                Exportar Excel Completo
            </Button>
            <Typography.Title level={4} style={{ marginTop: 32 }}>Importação de Dados</Typography.Title>
            <Typography.Paragraph>
                Importe um arquivo Excel exportado para usar os dados localmente, sem acessar o backend.
            </Typography.Paragraph>
            <Upload
                accept=".xlsx"
                showUploadList={false}
                beforeUpload={file => {
                    handleImport(file);
                    return false;
                }}
                disabled={loading}
            >
                <Button loading={loading}>Importar Excel Completo</Button>
            </Upload>
            <div style={{ marginTop: 24 }}>
                <Typography.Text strong>Modo de Dados:</Typography.Text>
                <Radio.Group
                    value={mode}
                    onChange={e => setMode(e.target.value)}
                    disabled={!excelData}
                    style={{ marginLeft: 16 }}
                >
                    <Radio.Button value="api">API (Backend)</Radio.Button>
                    <Radio.Button value="excel">Excel (Local)</Radio.Button>
                </Radio.Group>
            </div>
        </Card>
    );
}
