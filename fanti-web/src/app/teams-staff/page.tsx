"use client";
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, App, Typography, Card, Row, Col, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

interface Team {
    id: string;
    name: string;
    description?: string;
}

interface Staff {
    id: string;
    name: string;
    email: string;
    teamId?: string;
    team?: Team;
}

export default function TeamsAndStaffPage() {
    const { message } = App.useApp();
    const [teams, setTeams] = useState<Team[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(false);
    // Team modal
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [teamForm] = Form.useForm();
    // Staff modal
    const [staffModalOpen, setStaffModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [staffForm] = Form.useForm();
    // Filters
    const [staffSearch, setStaffSearch] = useState('');
    const [teamFilter, setTeamFilter] = useState<string>('all');

    // Fetch teams
    const fetchTeams = async () => {
        try {
            const res = await fetch('/api/teams');
            const data = await res.json();
            setTeams(data?.data || []);
        } catch {
            message.error('Erro ao carregar equipes');
        }
    };

    // Fetch staff
    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/staff');
            const data = await res.json();
            const staffWithTeam = (data?.data || []).map((member: Staff) => {
                const team = teams.find(t => t.id === member.teamId);
                return { ...member, team };
            });
            setStaff(staffWithTeam);
        } catch {
            message.error('Erro ao carregar colaboradores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    useEffect(() => {
        if (teams.length > 0) fetchStaff();
    }, [teams]);

    // Team CRUD
    const handleTeamCreate = () => {
        setEditingTeam(null);
        teamForm.resetFields();
        setTeamModalOpen(true);
    };
    const handleTeamEdit = (team: Team) => {
        setEditingTeam(team);
        teamForm.setFieldsValue(team);
        setTeamModalOpen(true);
    };
    const handleTeamDelete = async (id: string) => {
        try {
            await fetch(`/api/teams?id=${id}`, { method: 'DELETE' });
            message.success('Equipe removida!');
            fetchTeams();
        } catch {
            message.error('Erro ao remover equipe');
        }
    };
    const handleTeamSubmit = async (values: any) => {
        try {
            setLoading(true);
            if (editingTeam) {
                await fetch(`/api/teams`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...editingTeam, ...values })
                });
                message.success('Equipe atualizada!');
            } else {
                await fetch(`/api/teams`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values)
                });
                message.success('Equipe criada!');
            }
            setTeamModalOpen(false);
            fetchTeams();
            teamForm.resetFields();
        } catch {
            message.error('Erro ao salvar equipe');
        } finally {
            setLoading(false);
        }
    };

    // Staff CRUD
    const handleStaffCreate = () => {
        setEditingStaff(null);
        staffForm.resetFields();
        setStaffModalOpen(true);
    };
    const handleStaffEdit = (staffMember: Staff) => {
        setEditingStaff(staffMember);
        staffForm.setFieldsValue({ ...staffMember, teamId: staffMember.teamId || staffMember.team?.id });
        setStaffModalOpen(true);
    };
    const handleStaffDelete = async (id: string) => {
        try {
            await fetch(`/api/staff?id=${id}`, { method: 'DELETE' });
            message.success('Colaborador removido!');
            fetchStaff();
        } catch {
            message.error('Erro ao remover colaborador');
        }
    };
    const handleStaffSubmit = async (values: any) => {
        try {
            setLoading(true);
            const payload = { ...values };
            if (editingStaff) {
                await fetch(`/api/staff`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...editingStaff, ...payload })
                });
                message.success('Colaborador atualizado!');
            } else {
                await fetch(`/api/staff`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                message.success('Colaborador criado!');
            }
            setStaffModalOpen(false);
            fetchStaff();
            staffForm.resetFields();
        } catch {
            message.error('Erro ao salvar colaborador');
        } finally {
            setLoading(false);
        }
    };

    // Staff filters
    const filteredStaff = staff.filter(member => {
        const matchesSearch = !staffSearch || member.name.toLowerCase().includes(staffSearch.toLowerCase()) || member.email?.toLowerCase().includes(staffSearch.toLowerCase());
        const matchesTeam = teamFilter === 'all' || member.teamId === teamFilter;
        return matchesSearch && matchesTeam;
    });

    // Team table columns
    const teamColumns = [
        { title: 'Nome', dataIndex: 'name', key: 'name', render: (text: string) => <span><TeamOutlined /> {text}</span> },
        { title: 'Descrição', dataIndex: 'description', key: 'description' },
        {
            title: 'Ações',
            key: 'actions',
            render: (_: any, team: Team) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleTeamEdit(team)} />
                    <Popconfirm title="Remover equipe?" onConfirm={() => handleTeamDelete(team.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // Staff table columns
    const staffColumns = [
        { title: 'Nome', dataIndex: 'name', key: 'name', render: (text: string) => <span><UserOutlined /> {text}</span> },
        {
            title: 'Equipe',
            dataIndex: 'teamName',
            key: 'teamName',
            render: (_: any, staff: Staff) => staff.team?.name || '-',
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_: any, staff: Staff) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleStaffEdit(staff)} />
                    <Popconfirm title="Remover colaborador?" onConfirm={() => handleStaffDelete(staff.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Row gutter={24}>
                <Col xs={24} md={8}>
                    <Card title="Equipes" extra={<Button icon={<PlusOutlined />} onClick={handleTeamCreate}>Nova Equipe</Button>}>
                        <Table columns={teamColumns} dataSource={teams} rowKey="id" pagination={false} loading={loading} />
                    </Card>
                </Col>
                <Col xs={24} md={16}>
                    <Card title="Colaboradores"
                        extra={<Button icon={<PlusOutlined />} onClick={handleStaffCreate}>Novo Colaborador</Button>}
                        style={{ marginBottom: 24 }}>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                                <Input
                                    placeholder="Buscar colaboradores..."
                                    value={staffSearch}
                                    onChange={e => setStaffSearch(e.target.value)}
                                    allowClear
                                />
                            </Col>
                            <Col span={12}>
                                <Select
                                    placeholder="Filtrar por equipe"
                                    value={teamFilter}
                                    onChange={setTeamFilter}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="all">Todas Equipes</Option>
                                    {teams.map(team => (
                                        <Option key={team.id} value={team.id}>{team.name}</Option>
                                    ))}
                                </Select>
                            </Col>
                        </Row>
                        <Table columns={staffColumns} dataSource={filteredStaff} rowKey="id" loading={loading} />
                    </Card>
                </Col>
            </Row>
            {/* Team Modal */}
            <Modal
                title={editingTeam ? 'Editar Equipe' : 'Nova Equipe'}
                open={teamModalOpen}
                onCancel={() => setTeamModalOpen(false)}
                footer={null}
                width={500}
            >
                <Form
                    form={teamForm}
                    layout="vertical"
                    onFinish={handleTeamSubmit}
                    autoComplete="off"
                    initialValues={editingTeam || {}}
                >
                    <Form.Item
                        name="name"
                        label="Nome da Equipe"
                        rules={[{ required: true, message: 'Por favor, insira o nome da equipe' }]}
                    >
                        <Input placeholder="Ex: Equipe Backend" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Descrição"
                        rules={[{ max: 200, message: 'Descrição deve ter no máximo 200 caracteres' }]}
                    >
                        <Input placeholder="Descrição da equipe (opcional)" />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Button onClick={() => setTeamModalOpen(false)} style={{ marginRight: 8 }}>
                            Cancelar
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>
                            {editingTeam ? 'Salvar' : 'Criar Equipe'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            {/* Staff Modal */}
            <Modal
                title={editingStaff ? 'Editar Colaborador' : 'Novo Colaborador'}
                open={staffModalOpen}
                onCancel={() => setStaffModalOpen(false)}
                footer={null}
                width={500}
            >
                <Form
                    form={staffForm}
                    layout="vertical"
                    onFinish={handleStaffSubmit}
                    autoComplete="off"
                    initialValues={editingStaff ? { ...editingStaff, teamId: editingStaff.teamId || editingStaff.team?.id } : {}}
                >
                    <Form.Item
                        name="name"
                        label="Nome do Colaborador"
                        rules={[{ required: true, message: 'Por favor, insira o nome do colaborador' }]}
                    >
                        <Input placeholder="Ex: João Silva" />
                    </Form.Item>
                    <Form.Item
                        name="teamId"
                        label="Equipe"
                        rules={[{ required: true, message: 'Selecione uma equipe' }]}
                    >
                        <Select placeholder="Selecione a equipe">
                            {teams.map(team => (
                                <Option key={team.id} value={team.id}>{team.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Button onClick={() => setStaffModalOpen(false)} style={{ marginRight: 8 }}>
                            Cancelar
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>
                            {editingStaff ? 'Salvar' : 'Criar Colaborador'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
