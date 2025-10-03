'use client';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Card, Typography, Input, message, Upload, Radio, Divider } from 'antd';
import { exportAllDataToExcel, importAllDataFromExcel } from '@/services/exportExcel';
import { useState } from 'react';
import { useDataSource } from '@/hooks/useDataSource';

export default function SettingsPage() {
    const { mode, setMode, importExcel, loading, excelData } = useDataSource();
    const [jsonInput, setJsonInput] = useState('');
    const [jsonLoading, setJsonLoading] = useState(false);

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

    // Função para converter JSON para Excel
    const handleJsonToExcel = async () => {
        if (!jsonInput.trim()) {
            message.error('Por favor, insira um JSON válido.');
            return;
        }

        try {
            setJsonLoading(true);

            // Validar se é um JSON válido
            JSON.parse(jsonInput);

            // Fazer requisição para a API
            const response = await fetch('/api/excel/json-para-excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: jsonInput,
            });

            if (!response.ok) {
                throw new Error('Erro na conversão');
            }

            // Fazer download do arquivo
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dados-json-${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            message.success('Excel gerado com sucesso!');
            setJsonInput(''); // Limpar o campo após sucesso
        } catch (error) {
            if (error instanceof SyntaxError) {
                message.error('JSON inválido. Verifique a sintaxe.');
            } else {
                message.error('Erro ao converter JSON para Excel.');
            }
            console.error(error);
        } finally {
            setJsonLoading(false);
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

            <Divider />

            <Typography.Title level={4}>Conversor JSON para Excel</Typography.Title>
            <Typography.Paragraph>
                Insira um JSON válido para converter diretamente em arquivo Excel com coluna personalizada.
            </Typography.Paragraph>

            <Input.TextArea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='Exemplo: [{"Nome": "João", "Idade": 30}, {"Nome": "Maria", "Idade": 25}]'
                rows={6}
                style={{ marginBottom: 16 }}
            />

            <Button
                type="primary"
                onClick={handleJsonToExcel}
                loading={jsonLoading}
                disabled={!jsonInput.trim()}
            >
                Converter JSON para Excel
            </Button>
        </Card>
    );
}
