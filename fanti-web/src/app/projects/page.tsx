'use client';

import CreateProjectModal from '@/app/projects/components/CreateProjectModal';
import EditProjectModal from '@/app/projects/components/EditProjectModal';
import { Project, ProjectStatus } from '@/types';
import {
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  LinkOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Input,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useProjects } from '@/hooks/useProjects';


const { Option } = Select;
const { Title, Text } = Typography;

export default function ProjectsPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
  const { projects, loading } = useProjects(token);
  // Estados de filtros
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  // Estados dos modais
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // O hook useProjects já faz o carregamento automático conforme o modo

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`api/projects?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Produto excluído com sucesso!');
        // O useProjects recarrega automaticamente ao mudar o modo/dados,
        // mas aqui forçamos recarregar via window.location.reload() para garantir atualização em ambos modos
        window.location.reload();
      } else {
        message.error('Erro ao excluir produto');
      }
    } catch (error) {
      message.error('Erro ao excluir produto');
    }
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setEditModalVisible(true);
  };

  const getStatusColor = (status: ProjectStatus) => {
    return 'default'; // Cor neutra para todos os status
  };

  const getStatusText = (status: ProjectStatus) => {
    const statusMap: Record<ProjectStatus, string> = {
      [ProjectStatus.Active]: 'Ativo',
      [ProjectStatus.Completed]: 'Concluído',
      [ProjectStatus.OnHold]: 'Pausado',
      [ProjectStatus.Cancelled]: 'Cancelado'
    };
    return statusMap[status] || 'Desconhecido';
  };

  // Função para converter status do backend para enum
  const parseProjectStatus = (status: ProjectStatus | string): ProjectStatus => {
    if (typeof status === 'string') {
      const statusNumber = parseInt(status);
      return statusNumber as ProjectStatus;
    }
    return status;
  };

  // Filtros
  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchText ||
      project.name.toLowerCase().includes(searchText.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<Project> = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string, record: Project) => (
        <div>
          <Text strong>{text}</Text>
          {record.description && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.description}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      width: 120,
      render: (url: string) => url ? (
        <Tooltip title={url}>
          <Button
            type="link"
            icon={<LinkOutlined />}
            onClick={() => window.open(url, '_blank')}
            size="small"
          >
            Acessar
          </Button>
        </Tooltip>
      ) : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      sorter: (a, b) => parseProjectStatus(a.status) - parseProjectStatus(b.status),
      render: (status: ProjectStatus | string) => {
        const parsedStatus = parseProjectStatus(status);
        return (
          <Tag color={getStatusColor(parsedStatus)}>
            {getStatusText(parsedStatus)}
          </Tag>
        );
      },
    },
    {
      title: 'Data de Início',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 130,
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Data de Fim',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 130,
      sorter: (a, b) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_: any, project: Project) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(project)} />
          <Popconfirm
            title="Excluir produto"
            description="Tem certeza que deseja excluir este produto?"
            onConfirm={() => handleDelete(project.id)}
            okText="Sim"
            cancelText="Não"
            align={{ offset: [-50, -10] }}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tableProps: TableProps<Project> = {
    dataSource: filteredProjects,
    columns,
    rowKey: 'id',
    loading,
    pagination: {
      total: filteredProjects.length,
      pageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total, range) =>
        `${range[0]}-${range[1]} de ${total} produtos`,
    },
    scroll: { x: 800 },
    size: 'middle',
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header Minimalista */}

      {/* Filtros Minimalistas */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8} lg={8}>
            <Input
              placeholder="Buscar produtos..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderColor: '#d9d9d9' }}
            />
          </Col>

          <Col xs={24} sm={12} md={6} lg={6}>
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">Todos os Status</Option>
              <Option value={ProjectStatus.Active}>Ativo</Option>
              <Option value={ProjectStatus.Completed}>Concluído</Option>
              <Option value={ProjectStatus.OnHold}>Pausado</Option>
              <Option value={ProjectStatus.Cancelled}>Cancelado</Option>
            </Select>
          </Col>

          <Col xs={24} sm={24} md={10} lg={10}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button
                type="default"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
                style={{ borderColor: '#d9d9d9' }}
              >
                Novo Produto
              </Button>
              <Button
                onClick={() => {
                  setSearchText('');
                  setStatusFilter('all');
                }}
                style={{ borderColor: '#d9d9d9' }}
              >
                Limpar
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Tabela */}
      <Card>
        <Table {...tableProps} />
      </Card>

      {/* Modais */}
      <CreateProjectModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={() => {
          window.location.reload();
          setCreateModalVisible(false);
        }}
      />

      <EditProjectModal
        project={selectedProject}
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedProject(null);
        }}
        onSuccess={() => {
          window.location.reload();
          setEditModalVisible(false);
          setSelectedProject(null);
        }}
      />
    </div>
  );
}
