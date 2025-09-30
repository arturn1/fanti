"use client";
import { CalendarOutlined, DeleteOutlined, EditOutlined, EyeOutlined, LineChartOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PeriodDetails from './components/PeriodDetails';
import PeriodOrganization from './components/PeriodOrganization';
// Controla abertura pendente do modal e o tipo (view/org)
import { useModals } from '../../hooks/useModals';
import { useOrganization } from '../../hooks/useOrganization';
import { Period, PeriodStaff, Project, Staff, TasksPeriod } from '../../types';

const { Text } = Typography;
const { Option } = Select;

export default function PeriodsPage() {
    const { message } = App.useApp();

    // Data states
    const [pendingModal, setPendingModal] = useState<{ type: 'view' | 'org', period: Period | null } | null>(null);
    const [refreshing, setRefreshing] = useState(false);
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
        setRefreshing(true);
        await fetchStaffs();
        await fetchPeriodStaffs();
        await fetchTasksPeriod();
        await fetchProjects();
        await fetchPeriods(); // Ensure periods are loaded last with all dependencies
        setRefreshing(false);
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
        setPendingModal({ type: 'view', period });
        await refreshAllData();
    }, [refreshAllData]);

    const handleOrg = useCallback(async (period: Period) => {
        setPendingModal({ type: 'org', period });
        await refreshAllData();
    }, [refreshAllData]);
    // Efeito para abrir o modal só após refreshAllData e atualização dos estados
    useEffect(() => {
        if (!pendingModal || refreshing) return;
        const { type, period } = pendingModal;
        if (!period) return;
        const updatedPeriod = periods.find((p: Period) => p.id === period.id);
        if (updatedPeriod) {
            const relatedStaffIds = periodStaffs.filter(ps => ps.periodId === updatedPeriod.id).map(ps => ps.staffId);
            const staffsList = relatedStaffIds
                .map(id => staffs.find(s => s.id === id))
                .filter((s): s is Staff => Boolean(s));
            const periodWithStaffs = { ...updatedPeriod, staffs: staffsList };
            if (type === 'view') {
                modalsHook.openViewModal(periodWithStaffs);
            } else {
                setOrganizingPeriod(periodWithStaffs);
                organizationHook.initializeOrgData(periodWithStaffs);
                modalsHook.openOrganizationModal(periodWithStaffs);
            }
        } else {
            if (type === 'view') {
                modalsHook.openViewModal(period);
            } else {
                setOrganizingPeriod(period);
                organizationHook.initializeOrgData(period);
                modalsHook.openOrganizationModal(period);
            }
        }
        setPendingModal(null);
    }, [pendingModal, periods, staffs, periodStaffs, modalsHook, organizationHook]);

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
                closeIcon={false}
                open={modalsHook.modals.view}
                footer={null}
                width={900}
                onCancel={() => modalsHook.closeModal('view')}
            >
                {modalsHook.modalData.viewingPeriod && (
                    <PeriodDetails
                        period={modalsHook.modalData.viewingPeriod}
                        periodStaffs={periodStaffs}
                        tasksPeriod={tasksPeriod}
                        projects={projects}
                    />
                )}
            </Modal>
            <Modal
                open={modalsHook.modals.organization}
                onCancel={() => modalsHook.closeModal('organization')}
                width={1000}
                footer={null}
                closeIcon={false}
            >
                {modalsHook.modalData.organizingPeriod && (
                    <PeriodOrganization
                        organizingPeriod={modalsHook.modalData.organizingPeriod}
                        projects={projects}
                        organizationHook={organizationHook}
                        updateTotalHours={updateTotalHours}
                        addTask={addTask}
                        removeTask={removeTask}
                        getTaskColor={getTaskColor}
                        onBack={() => modalsHook.closeModal('organization')}
                    />
                )}
            </Modal>
        </div>
    );
}
