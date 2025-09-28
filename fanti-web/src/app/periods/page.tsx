"use client";
import { CalendarOutlined, DeleteOutlined, EditOutlined, EyeOutlined, LineChartOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, DatePicker, Descriptions, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useModals } from '../../hooks/useModals';
import { useOrganization } from '../../hooks/useOrganization';
import { Period, PeriodStaff, Project, Staff, TasksPeriod } from '../../types';

const { Text } = Typography;
const { Option } = Select;

export default function PeriodsPage() {
    const { message } = App.useApp();

    // Data states
    const [periods, setPeriods] = useState<Period[]>([]);
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [periodStaffs, setPeriodStaffs] = useState<PeriodStaff[]>([]);
    const [tasksPeriod, setTasksPeriod] = useState<TasksPeriod[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    // Fetch projects
    const fetchProjects = useCallback(async () => {
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            setProjects(data?.data || []);
        } catch {
            message.error('Erro ao carregar projetos');
        }
    }, []);
    const [loading, setLoading] = useState(false);
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);

    // Form and search
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');

    // View state for transitions
    const [organizingPeriod, setOrganizingPeriod] = useState<Period | null>(null);

    // Custom hooks
    const modalsHook = useModals();
    const organizationHook = useOrganization(
        periodStaffs,
        tasksPeriod,
        message,
        modalsHook.modalData.organizingPeriod || undefined,
        () => {
            // Refresh data after organization changes
            fetchPeriodStaffs();
            fetchTasksPeriod();
        }
    );

    // Utility functions
    const getTaskColor = useCallback((hours: number) => {
        if (hours < 8) return 'blue';
        if (hours <= 40) return 'orange';
        return 'red';
    }, []);

    // Calculate current week
    const currentWeek = useMemo(() => {
        const now = new Date();
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }, []);
    // Calculate period metrics for viewing modal
    const periodMetrics = useMemo(() => {
        if (!modalsHook.modalData.viewingPeriod) return null;

        const periodId = modalsHook.modalData.viewingPeriod.id;

        // Horas totais no período (soma de totalHours de todos os PeriodStaff do período)
        const totalPeriodHours = periodStaffs
            .filter(ps => ps.periodId === periodId)
            .reduce((sum, ps) => sum + ps.totalHours, 0);

        // Horas atribuídas (soma de taskHours de todas as TasksPeriod do período)
        const assignedHours = tasksPeriod
            .filter(tp => {
                // Encontrar o PeriodStaff relacionado e verificar se pertence ao período
                const relatedPeriodStaff = periodStaffs.find(ps => ps.id === tp.periodStaffId);
                return relatedPeriodStaff?.periodId === periodId;
            })
            .reduce((sum, tp) => sum + tp.taskHours, 0);

        // Horas restantes (total - atribuídas)
        const remainingHours = totalPeriodHours - assignedHours;

        // Percentual de utilização
        const utilizationPercentage = totalPeriodHours > 0 ? (assignedHours / totalPeriodHours) * 100 : 0;

        // Horas totais por projeto (apenas projetos com horas > 0)
        const projectHoursMap: Record<string, number> = {};
        tasksPeriod
            .filter(tp => {
                const relatedPeriodStaff = periodStaffs.find(ps => ps.id === tp.periodStaffId);
                return relatedPeriodStaff?.periodId === periodId && tp.projectId !== undefined && tp.projectId !== null;
            })
            .forEach(tp => {
                const projectId = String(tp.projectId);
                if (!projectHoursMap[projectId]) projectHoursMap[projectId] = 0;
                projectHoursMap[projectId] += tp.taskHours;
            });
        // Array de projetos com horas > 0
        const projectHours = Object.entries(projectHoursMap)
            .filter(([_, hours]) => typeof hours === 'number' && hours > 0)
            .map(([projectId, hours]) => {
                const project = projects.find(p => String(p.id) === projectId);
                return { projectId, projectName: project?.name || 'Projeto não encontrado', hours };
            });

        return {
            totalPeriodHours,
            assignedHours,
            remainingHours,
            utilizationPercentage,
            projectHours
        };
    }, [modalsHook.modalData.viewingPeriod, periodStaffs, tasksPeriod, projects]);

    // Fetch functions
    const fetchStaffs = useCallback(async () => {
        try {
            const res = await fetch('/api/staff');
            const data = await res.json();
            setStaffs(data?.data || []);
        } catch {
            message.error('Erro ao carregar colaboradores');
        }
    }, []);

    const fetchPeriodStaffs = useCallback(async () => {
        try {
            const res = await fetch('/api/periodStaff');
            const data = await res.json();
            setPeriodStaffs(data?.data || []);
        } catch {
            message.error('Erro ao carregar relacionamentos de período');
        }
    }, []);

    const fetchTasksPeriod = useCallback(async () => {
        try {
            const res = await fetch('/api/tasksPeriod');
            const data = await res.json();
            setTasksPeriod(data?.data || []);
        } catch {
            message.error('Erro ao carregar tarefas do período');
        }
    }, []);

    // Centralized data refresh function
    const refreshAllData = useCallback(async () => {
        await fetchStaffs();
        await fetchPeriodStaffs();
        await fetchTasksPeriod();
        await fetchProjects();
        await fetchPeriods(); // Ensure periods are loaded last with all dependencies
    }, []); // Remove dependencies to avoid circular reference

    const fetchPeriods = useCallback(async () => {
        if (staffs.length === 0) return;

        setLoading(true);
        try {
            const res = await fetch('/api/periods');
            const data = await res.json();

            // Join staffs by PeriodStaff relationship
            const periodsWithStaffs = (data?.data || []).map((period: Period) => {
                const relatedStaffIds = periodStaffs.filter(ps => ps.periodId === period.id).map(ps => ps.staffId);
                const staffsList = relatedStaffIds.map(id => staffs.find(s => s.id === id)).filter(Boolean);
                return { ...period, staffs: staffsList };
            });
            setPeriods(periodsWithStaffs);
        } catch (error) {
            console.error('Error fetching periods:', error);
            message.error('Erro ao carregar períodos');
        } finally {
            setLoading(false);
        }
    }, [staffs, periodStaffs, message]); // Need to include dependencies for the join logic

    // Effects
    useEffect(() => {
        const loadInitialData = async () => {
            await Promise.all([
                fetchStaffs(),
                fetchPeriodStaffs(),
                fetchTasksPeriod(),
                fetchProjects()
            ]);
            setInitialDataLoaded(true);
        };
        loadInitialData();
    }, []); // Execute only once on mount

    useEffect(() => {
        // Only fetch periods after initial data is loaded and we have staffs
        if (initialDataLoaded && staffs.length > 0 && periods.length === 0) {
            fetchPeriods();
        }
    }, [initialDataLoaded, staffs.length, periods.length]); // Include periods.length to prevent re-execution

    const handleCreate = useCallback(() => {
        modalsHook.openCreateModal();
        form.resetFields();
    }, [modalsHook, form]);

    const handleEdit = useCallback((period: Period) => {
        const staffIds = periodStaffs.filter(ps => ps.periodId === period.id).map(ps => ps.staffId);
        modalsHook.openEditModal(period);
        form.setFieldsValue({
            name: period.name,
            staffIds: staffIds,
            dateRange: period.startDate && period.endDate ? [dayjs(period.startDate), dayjs(period.endDate)] : undefined
        });
    }, [periodStaffs, form, modalsHook]);

    const handleView = useCallback(async (period: Period) => {
        // Refresh all data to ensure most up-to-date information
        await refreshAllData();

        // Get the fresh period data from the updated periods list
        const freshPeriods = await fetch('/api/periods').then(res => res.json()).then(data => data?.data || []);
        const updatedPeriod = freshPeriods.find((p: Period) => p.id === period.id);

        if (updatedPeriod) {
            // Join with staffs data
            const relatedStaffIds = periodStaffs.filter(ps => ps.periodId === updatedPeriod.id).map(ps => ps.staffId);
            const staffsList = relatedStaffIds.map(id => staffs.find(s => s.id === id)).filter(Boolean);
            const periodWithStaffs = { ...updatedPeriod, staffs: staffsList };

            modalsHook.openViewModal(periodWithStaffs);
        } else {
            // Fallback to original period if not found
            modalsHook.openViewModal(period);
        }
    }, [refreshAllData, modalsHook, periodStaffs, staffs]);

    const handleOrg = useCallback(async (period: Period) => {
        // Refresh all data before opening organization modal
        await refreshAllData();

        // Get the fresh period data from the updated periods list
        const freshPeriods = await fetch('/api/periods').then(res => res.json()).then(data => data?.data || []);
        const updatedPeriod = freshPeriods.find((p: Period) => p.id === period.id);

        if (updatedPeriod) {
            // Join with staffs data
            const relatedStaffIds = periodStaffs.filter(ps => ps.periodId === updatedPeriod.id).map(ps => ps.staffId);
            const staffsList = relatedStaffIds.map(id => staffs.find(s => s.id === id)).filter(Boolean);
            const periodWithStaffs = { ...updatedPeriod, staffs: staffsList };

            setOrganizingPeriod(periodWithStaffs);
            organizationHook.initializeOrgData(periodWithStaffs);
            modalsHook.openOrganizationModal(periodWithStaffs);
        } else {
            // Fallback to original period if not found
            setOrganizingPeriod(period);
            organizationHook.initializeOrgData(period);
            modalsHook.openOrganizationModal(period);
        }
    }, [refreshAllData, modalsHook, organizationHook, periodStaffs, staffs]);

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/periods?id=${id}`, { method: 'DELETE' });
            message.success('Período removido!');
            fetchPeriods();
        } catch {
            message.error('Erro ao remover período');
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            const startDate = values.dateRange ? dayjs(values.dateRange[0]) : dayjs();
            const endDate = values.dateRange ? dayjs(values.dateRange[1]) : dayjs().add(1, 'day');
            const duration = endDate.diff(startDate, 'day');
            const basePayload = {
                Name: values.name,
                Staffs: values.staffIds || [],
                StartDate: startDate.toISOString(),
                EndDate: endDate.toISOString(),
            };
            const payload = modalsHook.modalData.editingPeriod ? basePayload : { ...basePayload, Duration: duration };
            if (modalsHook.modalData.editingPeriod) {
                const response = await fetch(`/api/periods`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, Id: modalsHook.modalData.editingPeriod.id })
                });
                const updated = await response.json();
                message.success('Período atualizado!');
                setPeriods(prev =>
                    prev.map(p =>
                        modalsHook.modalData.editingPeriod && p.id === modalsHook.modalData.editingPeriod.id
                            ? { ...p, ...updated.data }
                            : p
                    )
                );
            } else {
                const response = await fetch(`/api/periods`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const newPeriod = await response.json();
                message.success('Período criado!');

                // Add the new period directly to the state
                console.log('New period created:', newPeriod);
                setPeriods(prev => [...prev, newPeriod.data || newPeriod]);
            }
            modalsHook.closeModal('createEdit');

            form.resetFields();
        } catch {
            message.error('Erro ao salvar período');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = useCallback(() => {
        form.resetFields();
        modalsHook.closeModal('createEdit');
    }, [form, modalsHook]);

    const updateTotalHours = (staffId: string, value: number) => organizationHook.updateTotalHours(staffId, value, organizingPeriod!);
    const addTask = (staffId: string) => organizationHook.addTask(staffId, organizingPeriod!);
    const removeTask = organizationHook.removeTask;

    // Filtered periods
    const filteredPeriods = useMemo(() => {
        return periods.filter(period => {
            const matchesSearch = !searchText || period.name.toLowerCase().includes(searchText.toLowerCase());
            return matchesSearch;
        });
    }, [periods, searchText]);

    const columns = [
        { title: 'Nome', dataIndex: 'name', key: 'name', render: (text: string) => <span><CalendarOutlined /> {text}</span> },
        { title: 'Início', dataIndex: 'startDate', key: 'startDate', render: (text: string) => text ? dayjs(text).format('DD/MM/YYYY') : '-' },
        { title: 'Fim', dataIndex: 'endDate', key: 'endDate', render: (text: string) => text ? dayjs(text).format('DD/MM/YYYY') : '-' },
        {
            title: 'Ações',
            key: 'actions',
            render: (_: any, period: Period) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => handleView(period)} />
                    <Button icon={<LineChartOutlined />} onClick={() => handleOrg(period)} />
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(period)} />
                    <Popconfirm title="Remover período?" onConfirm={() => handleDelete(period.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            {/* Header com filtros */}
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={16} align="middle">
                    <Col xs={24} sm={12} md={8} lg={8}>
                        <Input
                            placeholder="Buscar períodos..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            style={{ borderColor: '#d9d9d9' }}
                        />
                    </Col>
                    <Col xs={24} sm={24} md={16} lg={16}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <Button
                                type="default"
                                icon={<PlusOutlined />}
                                onClick={handleCreate}
                                style={{ borderColor: '#d9d9d9' }}
                            >
                                Novo Período
                            </Button>
                            <Button
                                onClick={() => setSearchText('')}
                                style={{ borderColor: '#d9d9d9' }}
                            >
                                Limpar
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Tabela de períodos */}
            <Card>
                <Table columns={columns} dataSource={filteredPeriods} rowKey="id" loading={loading} />
            </Card>
            <Modal
                title={modalsHook.modalData.editingPeriod ? 'Editar Período' : 'Novo Período'}
                open={modalsHook.modals.createEdit}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
                    <Text style={{ fontSize: 12, color: '#52c41a' }}>
                        💡 <strong>Dica:</strong> Você pode selecionar vários colaboradores e definir o período usando o calendário.
                    </Text>
                </div>
                <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 6 }}>
                    <Text style={{ fontSize: 14, color: '#1890ff' }}>
                        📅 <strong>Estamos na semana: {currentWeek}</strong>
                    </Text>
                </div>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Form.Item
                        name="name"
                        label="Nome do Período"
                        rules={[{ required: true, message: 'Por favor, insira o nome do período' }]}
                    >
                        <Input placeholder="Ex: Sprint 1" />
                    </Form.Item>
                    <Form.Item
                        name="dateRange"
                        label="Período"
                        rules={[{ required: true, message: 'Selecione o período' }]}
                    >
                        <DatePicker.RangePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            placeholder={['Data de início', 'Data de fim']}
                        />
                    </Form.Item>
                    <Form.Item
                        name="staffIds"
                        label="Colaboradores"
                        rules={[{ required: true, message: 'Selecione pelo menos um colaborador' }]}
                    >
                        <Select mode="multiple" placeholder="Selecione colaboradores">
                            {staffs.map(staff => (
                                <Option key={staff.id} value={staff.id}>{staff.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                            Cancelar
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>
                            {modalsHook.modalData.editingPeriod ? 'Salvar' : 'Criar Período'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Detalhes do Período"
                open={modalsHook.modals.view}
                onCancel={() => modalsHook.closeModal('view')}
                footer={null}
                width={600}
            >
                {modalsHook.modalData.viewingPeriod && (
                    <div>
                        <Descriptions title="Informações do Período" bordered column={1}>
                            <Descriptions.Item label="Nome">{modalsHook.modalData.viewingPeriod.name}</Descriptions.Item>
                            <Descriptions.Item label="Data de Início">{modalsHook.modalData.viewingPeriod.startDate ? dayjs(modalsHook.modalData.viewingPeriod.startDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
                            <Descriptions.Item label="Data de Fim">{modalsHook.modalData.viewingPeriod.endDate ? dayjs(modalsHook.modalData.viewingPeriod.endDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
                            <Descriptions.Item label="Colaboradores">
                                {modalsHook.modalData.viewingPeriod.staffs && modalsHook.modalData.viewingPeriod.staffs.length > 0 ? modalsHook.modalData.viewingPeriod.staffs.map((s: Staff) => s.name).join(', ') : '-'}
                            </Descriptions.Item>
                        </Descriptions>

                        {periodMetrics && (
                            <>
                                <Descriptions title="Métricas de Horas" bordered column={2} style={{ marginTop: 24 }}>
                                    <Descriptions.Item label="Horas Totais no Período">
                                        <Text strong style={{ fontSize: '16px' }}>{periodMetrics.totalPeriodHours}h</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Horas Atribuídas">
                                        <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>{periodMetrics.assignedHours}h</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Horas Restantes">
                                        <Text strong style={{ fontSize: '16px', color: periodMetrics.remainingHours >= 0 ? '#52c41a' : '#ff4d4f' }}>
                                            {periodMetrics.remainingHours}h
                                        </Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Taxa de Utilização">
                                        <Text strong style={{ fontSize: '16px', color: periodMetrics.utilizationPercentage > 100 ? '#ff4d4f' : periodMetrics.utilizationPercentage > 80 ? '#faad14' : '#52c41a' }}>
                                            {periodMetrics.utilizationPercentage.toFixed(1)}%
                                        </Text>
                                    </Descriptions.Item>
                                </Descriptions>
                                {/* Novo campo: Horas totais por Projeto */}
                                <Descriptions title="Horas por Projeto" bordered column={1} style={{ marginTop: 24 }}>
                                    {periodMetrics.projectHours.length > 0 ? (
                                        periodMetrics.projectHours.map(ph => (
                                            <Descriptions.Item key={ph.projectId} label={ph.projectName}>
                                                <Text strong style={{ fontSize: '15px' }}>{Number(ph.hours)}h</Text>
                                            </Descriptions.Item>
                                        ))
                                    ) : (
                                        <Descriptions.Item label="Nenhum projeto com horas">-</Descriptions.Item>
                                    )}
                                </Descriptions>
                            </>
                        )}
                    </div>
                )}
            </Modal>
            <Modal
                title={`Organização do Período: ${modalsHook.modalData.organizingPeriod?.name}`}
                open={modalsHook.modals.organization}
                onCancel={() => modalsHook.closeModal('organization')}
                width={1200}
                footer={null}
            >
                {modalsHook.modalData.organizingPeriod && (
                    <div>
                        {modalsHook.modalData.organizingPeriod.staffs?.map(staff => {
                            const data = organizationHook.orgData[staff.id];
                            if (!data) return null;
                            return (
                                <Card key={staff.id} style={{ marginBottom: 16 }}>
                                    <Typography.Title level={4}>{staff.name}</Typography.Title>
                                    {/* Total de Horas e Horas Restantes */}
                                    <Form layout="inline" style={{ marginBottom: 16 }}>
                                        <Form.Item label="Total de Horas">
                                            <InputNumber value={data.totalHours} onChange={(v) => updateTotalHours(staff.id, v || 0)} />
                                        </Form.Item>
                                        <Form.Item label="Horas Restantes">
                                            <Input value={data.remaining} disabled />
                                        </Form.Item>
                                    </Form>
                                    {/* Lista de Tasks */}
                                    <div style={{ marginBottom: 16 }}>
                                        <Typography.Text strong style={{ marginBottom: 8, display: 'block' }}>Tasks Atribuídas:</Typography.Text>
                                        {data.tasks.map((task, index) => {
                                            const projectName = projects.find(p => p.id === task.projectId)?.name || 'Projeto não encontrado';
                                            return (
                                                <Tag key={task.id || index} closable onClose={() => removeTask(staff.id, index)} color={getTaskColor(task.hours)} style={{ marginBottom: 4, marginRight: 8 }}>
                                                    Task {task.number} ({projectName}): {task.hours}h
                                                </Tag>
                                            );
                                        })}
                                    </div>
                                    {/* Form para adicionar nova Task */}
                                    <Form layout="inline">
                                        <Form.Item label="Projeto">
                                            <Select
                                                style={{ minWidth: 180 }}
                                                placeholder="Selecione o projeto"
                                                value={organizationHook.newTaskInputs[staff.id]?.projectId || undefined}
                                                onChange={projectId => organizationHook.setNewTaskInputs(prev => ({
                                                    ...prev,
                                                    [staff.id]: { ...prev[staff.id], projectId }
                                                }))}
                                            >
                                                {projects.map(project => (
                                                    <Option key={project.id} value={project.id}>{project.name}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item label="Número da Task">
                                            <Input
                                                style={{ width: 120 }}
                                                value={organizationHook.newTaskInputs[staff.id]?.number || ''}
                                                onChange={(e) => organizationHook.setNewTaskInputs(prev => ({
                                                    ...prev,
                                                    [staff.id]: { ...prev[staff.id], number: e.target.value }
                                                }))}
                                            />
                                        </Form.Item>
                                        <Form.Item label="Horas">
                                            <InputNumber
                                                style={{ width: 100 }}
                                                value={organizationHook.newTaskInputs[staff.id]?.hours || 0}
                                                onChange={(v) => organizationHook.setNewTaskInputs(prev => ({
                                                    ...prev,
                                                    [staff.id]: { ...prev[staff.id], hours: v || 0 }
                                                }))}
                                            />
                                        </Form.Item>
                                        <Form.Item>
                                            <Button
                                                type="primary"
                                                onClick={() => addTask(staff.id)}
                                                disabled={
                                                    !organizationHook.newTaskInputs[staff.id]?.number ||
                                                    !organizationHook.newTaskInputs[staff.id]?.hours ||
                                                    !organizationHook.newTaskInputs[staff.id]?.projectId ||
                                                    data.remaining < (organizationHook.newTaskInputs[staff.id]?.hours || 0)
                                                }
                                            >
                                                Adicionar Task
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </Modal>
        </div>
    );
}
