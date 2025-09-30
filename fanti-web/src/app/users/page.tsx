'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import {
  Card,
  Table,
  Button,
  Space,
  message,
  Tag,
  Typography,
  Row,
  Col,
  Input,
  Select,
  Avatar,
  Statistic
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  TeamOutlined,
  MailOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { User, UserRole } from '@/types';
// import { usersService } from '@/services/users';


const { Title, Text } = Typography;
const { Option } = Select;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data?.data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      message.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuários baseado nos critérios
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchText ||
      (user.name && user.name.toLowerCase().includes(searchText.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchText.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchText.toLowerCase()));

    const matchesRole = !selectedRole || user.role === String(selectedRole);
    const matchesStatus = !selectedStatus ||
      (selectedStatus === 'active' && user.isActive === true) ||
      (selectedStatus === 'inactive' && user.isActive === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Estatísticas
  const totalUsers = users.length;
  const activeUsers = users.filter(u => (u.isActive ?? true)).length;
  const roles = [...new Set(users.map(u => u.role).filter((r): r is string => !!r))];
  const adminUsers = users.filter(u => u.role === 'Admin').length;

  // Helper para obter nome da role
  const getRoleName = (role: string) => {
    switch (role) {
      case 'Admin': return 'Administrador';
      case 'ProductOwner': return 'Product Owner';
      case 'ScrumMaster': return 'Scrum Master';
      case 'Developer': return 'Desenvolvedor';
      case 'Stakeholder': return 'Stakeholder';
      default: return 'Não definido';
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Usuário',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar
            size="small"
            src={record.avatar && typeof record.avatar === 'string' && record.avatar.trim() !== '' ? record.avatar : undefined}
            icon={<UserOutlined />}
            style={{ backgroundColor: record.isActive === true ? '#1890ff' : '#d9d9d9' }}
          />
          <div>
            <Text strong>{record.name || (record.last_name || '').trim()}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </Text>
          </div>
        </Space>
      ),
      sorter: (a, b) => {
        const nameA = a.name || (a.last_name || '').trim();
        const nameB = b.name || (b.last_name || '').trim();
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Cargo/Função',
      dataIndex: 'role',
      key: 'role',
      render: (role) => role ? (
        <Tag color={
          role === UserRole.Admin ? 'red' :
            role === UserRole.ProductOwner ? 'orange' :
              role === UserRole.ScrumMaster ? 'purple' :
                role === UserRole.Developer ? 'blue' :
                  'default'
        }>
          {getRoleName(role)}
        </Tag>
      ) : <Text type="secondary">Não definido</Text>,
      filters: roles.map(role => ({ text: getRoleName(role), value: role })),
      onFilter: (value, record) => record.role === String(value),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={(isActive ?? true) ? 'success' : 'default'}>
          {(isActive ?? true) ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
      filters: [
        { text: 'Ativo', value: true },
        { text: 'Inativo', value: false },
      ],
      onFilter: (value, record) => (record.isActive ?? true) === value,
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => (
        <Text type="secondary" style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          {id}
        </Text>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
        title={selectedUser ? `Detalhes do usuário: ${selectedUser.name || selectedUser.email}` : 'Detalhes do usuário'}
      >
        <pre style={{ maxHeight: 500, overflow: 'auto', background: '#f6f6f6', padding: 16, borderRadius: 8 }}>
          {selectedUser ? JSON.stringify(selectedUser, null, 2) : ''}
        </pre>
      </Modal>
      <Card>
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <TeamOutlined /> Usuários
            </Title>
          </Col>
          <Col flex="auto">
            <Text type="secondary">
              Gerenciamento de usuários integrado com serviço externo de identidade (OIDC)
            </Text>
          </Col>
        </Row>

        {/* Estatísticas */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={6}>
            <Statistic
              title="Total de Usuários"
              value={totalUsers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </Col>
          <Col xs={6}>
            <Statistic
              title="Usuários Ativos"
              value={activeUsers}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            />
          </Col>
          <Col xs={6}>
            <Statistic
              title="Administradores"
              value={adminUsers}
              prefix={<UserOutlined style={{ color: '#f5222d' }} />}
            />
          </Col>
          <Col xs={6}>
            <Statistic
              title="Funções Diferentes"
              value={roles.length}
              prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
            />
          </Col>
        </Row>

        {/* Filtros */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Buscar por nome ou email..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Filtrar por cargo"
              value={selectedRole}
              onChange={setSelectedRole}
              allowClear
              style={{ width: '100%' }}
            >
              {roles.map(role => (
                <Option key={role} value={role}>{getRoleName(role)}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Filtrar por status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="active">Ativo</Option>
              <Option value="inactive">Inativo</Option>
            </Select>
          </Col>
        </Row>

        {/* Tabela */}
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} usuários`,
          }}
          scroll={{ x: 800 }}
          size="middle"
          onRow={record => ({
            onClick: () => {
              setSelectedUser(record);
              setModalVisible(true);
            }
          })}
        />

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            💡 Os usuários são gerenciados pelo serviço externo de identidade (OIDC).
            Novos usuários são criados automaticamente no primeiro login.
          </Text>
        </div>
      </Card>
    </>
  );
}
