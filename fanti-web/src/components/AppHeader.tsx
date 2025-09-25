'use client';

import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Button, message } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  ProjectOutlined,
  CalendarOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  ToolOutlined,
  PicRightOutlined
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const { Header } = Layout;
const { Text } = Typography;

export default function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      message.success('Logout realizado com sucesso!');
      router.push('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
      message.error('Erro ao fazer logout');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <Space direction="vertical" size={0} style={{ padding: '8px 0' }}>
          <Text strong>{user?.name}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {user?.email}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {user?.role}
          </Text>
        </Space>
      ),
      disabled: true,
    },
    {
      key: 'divider-1',
      type: 'divider' as const,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configurações',
      onClick: () => {
        message.info('Configurações em desenvolvimento');
      },
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      onClick: handleLogout,
    },
  ];

  const navigationItems = [
    {
      key: '/',
      icon: <CheckSquareOutlined />,
      label: <Link href="/">Home</Link>,
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: <Link href="/projects">Produtos</Link>,
    },
    {
      key: '/sprints',
      icon: <ToolOutlined />,
      label: <Link href="/sprints">Milestones</Link>,
    },
    {
      key: '/tasks',
      icon: <PicRightOutlined />,
      label: <Link href="/tasks">RoadMap</Link>,
    },
    {
      key: '/periods',
      icon: <CalendarOutlined />,
      label: <Link href="/periods">Sprints</Link>,
    },
    {
      key: '/teams-staff',
      icon: <TeamOutlined />,
      label: <Link href="/teams-staff">Equipes & Colaboradores</Link>,
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <Link href="/users">Usuários</Link>,
    },
  ];

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 24px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <div style={{ marginRight: '48px' }}>
          <Text
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1890ff'
            }}
          >
            Fanti
          </Text>
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={navigationItems}
          style={{
            border: 'none',
            flex: 1,
            justifyContent: 'flex-start'
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
        >
          <Button type="text" style={{ padding: '0 8px', height: 'auto' }}>
            <Space>
              <Avatar
                size="small"
                icon={<UserOutlined />}
                src={user?.avatar && user.avatar.trim() !== '' ? user.avatar : undefined}
                style={{ backgroundColor: '#1890ff' }}
              />
              <span style={{ color: '#262626' }}>
                {user?.name || 'Usuário'}
              </span>
            </Space>
          </Button>
        </Dropdown>
      </div>
    </Header>
  );
}
