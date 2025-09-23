"use client";
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, App, Typography, Card, Row, Col, Select, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

interface Staff {
    id: string;
    name: string;
    email: string;
}

interface Period {
    id: string;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    staffIds?: string[];
    staffs?: Staff[];
}

export default function PeriodsPage() {
    const { message } = App.useApp();
    const [periods, setPeriods] = useState<Period[]>([]);
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
    const [form] = Form.useForm();
    const { RangePicker } = DatePicker;
    const [searchText, setSearchText] = useState('');

    // Fetch periods
    const fetchPeriods = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/periods');
            const data = await res.json();
            // Join staffs by staffIds
            const periodsWithStaffs = (data?.data || []).map((period: Period) => {
                const staffsList = (period.staffIds || []).map(id => staffs.find(s => s.id === id)).filter(Boolean);
                return { ...period, staffs: staffsList };
            });
            setPeriods(periodsWithStaffs);
        } catch {
            message.error('Erro ao carregar períodos');
        } finally {
            setLoading(false);
        }
    };

    // Fetch staffs for select
    const fetchStaffs = async () => {
        try {
            const res = await fetch('/api/staff');
            const data = await res.json();
            setStaffs(data?.data || []);
        } catch {
            message.error('Erro ao carregar colaboradores');
        }
    };

    useEffect(() => {
        fetchStaffs();
    }, []);

    useEffect(() => {
        if (staffs.length > 0) fetchPeriods();
    }, [staffs]);

    const handleCreate = () => {
        setEditingPeriod(null);
        form.resetFields();
        setModalOpen(true);
    };

    const handleEdit = (period: Period) => {
        setEditingPeriod(period);
        form.setFieldsValue({ ...period, staffIds: period.staffs?.map(s => s.id) || period.staffIds });
        setModalOpen(true);
    };

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
            const payload = { ...values };
            if (editingPeriod) {
                await fetch(`/api/periods`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...editingPeriod, ...payload })
                });
                message.success('Período atualizado!');
            } else {
                await fetch(`/api/periods`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                message.success('Período criado!');
            }
            setModalOpen(false);
            fetchPeriods();
            form.resetFields();
        } catch {
            message.error('Erro ao salvar período');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setModalOpen(false);
    };

    const filteredPeriods = periods.filter(period => {
        const matchesSearch = !searchText || period.name.toLowerCase().includes(searchText.toLowerCase());
        return matchesSearch;
    });

    const columns = [
        { title: 'Nome', dataIndex: 'name', key: 'name', render: (text: string) => <span><CalendarOutlined /> {text}</span> },
        { title: 'Descrição', dataIndex: 'description', key: 'description' },
        { title: 'Início', dataIndex: 'startDate', key: 'startDate' },
        { title: 'Fim', dataIndex: 'endDate', key: 'endDate' },
        {
            title: 'Colaboradores',
            dataIndex: 'staffs',
            key: 'staffs',
            render: (staffs: Staff[]) => staffs && staffs.length > 0 ? staffs.map(s => <span key={s.id}><UserOutlined /> {s.name}<br /></span>) : '-',
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_: any, period: Period) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(period)} />
                    <Popconfirm title="Remover período?" onConfirm={() => handleDelete(period.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
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
            <Card>
                <Table columns={columns} dataSource={filteredPeriods} rowKey="id" loading={loading} />
            </Card>
            <Modal
                title={editingPeriod ? 'Editar Período' : 'Novo Período'}
                open={modalOpen}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
                    <Text style={{ fontSize: 12, color: '#52c41a' }}>
                        💡 <strong>Dica:</strong> Você pode selecionar vários colaboradores e definir o período usando o calendário.
                    </Text>
                </div>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                    initialValues={editingPeriod ? {
                        ...editingPeriod,
                        staffIds: editingPeriod.staffs?.map(s => s.id) || editingPeriod.staffIds,
                        dateRange: editingPeriod.startDate && editingPeriod.endDate ? [editingPeriod.startDate, editingPeriod.endDate] : undefined
                    } : {}}
                >
                    <Form.Item
                        name="name"
                        label="Nome do Período"
                        rules={[{ required: true, message: 'Por favor, insira o nome do período' }]}
                    >
                        <Input placeholder="Ex: Sprint 1" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Descrição"
                        rules={[{ max: 200, message: 'Descrição deve ter no máximo 200 caracteres' }]}
                    >
                        <Input placeholder="Descrição do período (opcional)" />
                    </Form.Item>
                    <Form.Item
                        name="dateRange"
                        label="Período"
                        rules={[{ required: true, message: 'Selecione o período' }]}
                    >
                        <RangePicker
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
                            {editingPeriod ? 'Salvar' : 'Criar Período'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
