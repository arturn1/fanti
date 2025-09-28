'use client';

import { Project, Sprint, SprintStatus } from '@/types';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ProjectOutlined,
  SearchOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd';
import { useEffect, useState } from 'react';
// import { sprintsService } from '@/services/sprints';
// import { projectsService } from '@/services/projects';
// import { tasksService } from '@/services/tasks';
import CreateSprintModal from '@/app/sprints/components/CreateSprintModal';
import EditSprintModal from '@/app/sprints/components/EditSprintModal';
import ProductCard from '@/app/projects/components/ProductCard';
import { calculateProductData, parseSprintStatus, ProductData as ProductDataType } from '@/utils/productCalculations';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { Option } = Select;

export default function SprintsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [productsData, setProductsData] = useState<ProductDataType[]>([]);
  const router = useRouter();

  // Filtros
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal de detalhes das milestones
  const [milestonesModalVisible, setMilestonesModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDataType | null>(null);
  const [milestoneSearchText, setMilestoneSearchText] = useState('');
  const [milestoneStatusFilter, setMilestoneStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  // Effect para atualizar selectedProduct quando productsData mudar
  useEffect(() => {
    if (selectedProduct && productsData.length > 0) {
      const updatedProduct = productsData.find(p => p.project.id === selectedProduct.project.id);
      if (updatedProduct) {
        setSelectedProduct(updatedProduct);
      }
    }
  }, [productsData, selectedProduct?.project.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsRes, sprintsRes, tasksRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/sprints'),
        fetch('/api/tasks'),
      ]);
      const [projectsData, sprintsData, tasksData] = await Promise.all([
        projectsRes.json(),
        sprintsRes.json(),
        tasksRes.json(),
      ]);
      setProjects(projectsData?.data || []);
      const calculatedProductsData = calculateProductData(
        projectsData?.data || [],
        sprintsData?.data || [],
        tasksData?.data || []
      );
      setProductsData(calculatedProductsData);
    } catch (error) {
      message.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getSprintStatusName = (status: SprintStatus): string => {
    switch (status) {
      case SprintStatus.Planning:
        return 'Planejamento';
      case SprintStatus.Active:
        return 'Ativo';
      case SprintStatus.Testing:
        return 'Testando';
      case SprintStatus.Completed:
        return 'Concluído';
      default:
        return 'Desconhecido';
    }
  };

  const handleCardClick = (projectId: string) => {
    const productData = productsData.find(p => p.project.id === projectId);
    if (productData) {
      setSelectedProduct(productData);
      setMilestonesModalVisible(true);
      setMilestoneSearchText('');
      setMilestoneStatusFilter('all');
    }
  };

  const handleEditMilestone = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setEditModalVisible(true);
    setMilestonesModalVisible(false);
  };

  const handleDeleteMilestone = async (sprintId: string) => {
    try {
      const res = await fetch(`/api/sprints?id=${sprintId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        message.success('Milestone excluído com sucesso!');
        await loadData();
      } else {
        message.error('Erro ao excluir milestone');
      }
    } catch (error) {
      message.error('Erro ao excluir milestone');
    }
  };

  const getFilteredMilestones = () => {
    if (!selectedProduct) return [];

    return selectedProduct.sprints.filter(sprint => {
      const matchesSearch = !milestoneSearchText ||
        sprint.name.toLowerCase().includes(milestoneSearchText.toLowerCase()) ||
        sprint.description?.toLowerCase().includes(milestoneSearchText.toLowerCase());

      const matchesStatus = milestoneStatusFilter === 'all' ||
        parseSprintStatus(sprint.status).toString() === milestoneStatusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const filteredProducts = productsData.filter(productData => {
    const matchesSearch = !searchText ||
      productData.project.name.toLowerCase().includes(searchText.toLowerCase()) ||
      productData.project.description?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || productData.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const renderProductCard = (productData: ProductDataType) => {
    return (
      <Col xs={24} sm={12} lg={8} xl={6} key={productData.project.id}>
        <ProductCard
          productData={productData}
          showActions={true}
          onViewDetails={handleCardClick}
          onAddMilestone={() => setCreateModalVisible(true)}
          milestoneFilter="active"
        />
      </Col>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header Minimalista */}
      {/* Filtros Minimalistas */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Buscar produtos ou descrições..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderColor: '#d9d9d9' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filtrar por status"
              style={{ width: '100%' }}
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Option value="all">Todos os Status</Option>
              <Option value="planning">Planejamento</Option>
              <Option value="active">Em Andamento</Option>
              <Option value="testing">Em Teste</Option>
              <Option value="completed">Concluído</Option>
            </Select>
          </Col>
          <Col
            xs={24}
            sm={12}
            md={8}
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
              style={{ borderColor: '#d9d9d9' }}
            >
              Novo Milestone
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Cards dos Produtos */}
      <Card>
        {loading ? (
          <Row gutter={[16, 16]}>
            {[1, 2, 3, 4].map(i => (
              <Col xs={24} sm={12} lg={8} xl={6} key={i}>
                <Card loading style={{ height: '400px' }} />
              </Col>
            ))}
          </Row>
        ) : filteredProducts.length > 0 ? (
          <Row gutter={[16, 16]}>
            {filteredProducts.map(renderProductCard)}
          </Row>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Nenhum produto encontrado"
            style={{ marginTop: 40 }}
          >
            <Button type="default" onClick={() => setCreateModalVisible(true)}>
              Criar Primeiro Milestone
            </Button>
          </Empty>
        )}
      </Card>

      <CreateSprintModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={() => {
          loadData();
          setCreateModalVisible(false);
          message.success('Milestone criado com sucesso!');
        }}
      />

      <EditSprintModal
        sprint={selectedSprint}
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedSprint(null);
        }}
        onSuccess={async () => {
          await loadData(); // Recarrega todos os dados
          setEditModalVisible(false);
          setSelectedSprint(null);
          setMilestonesModalVisible(true); // Reabre o modal de detalhes
          message.success('Milestone atualizado com sucesso!');
        }}
      />

      {/* Modal de Detalhes das Milestones */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ProjectOutlined />
            <span>Milestones - {selectedProduct?.project.name}</span>
          </div>
        }
        open={milestonesModalVisible}
        onCancel={() => setMilestonesModalVisible(false)}
        footer={null}
        width={1000}
        style={{ top: 20 }}
      >
        {selectedProduct && (
          <>
            {/* Filtros do Modal */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12}>
                <Input
                  placeholder="Buscar milestone por nome..."
                  prefix={<SearchOutlined />}
                  value={milestoneSearchText}
                  onChange={(e) => setMilestoneSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Filtrar por status"
                  value={milestoneStatusFilter}
                  onChange={setMilestoneStatusFilter}
                >
                  <Select.Option value="all">Todos os Status</Select.Option>
                  <Select.Option value="1">Planejamento</Select.Option>
                  <Select.Option value="2">Ativo</Select.Option>
                  <Select.Option value="3">Testando</Select.Option>
                  <Select.Option value="4">Concluído</Select.Option>
                </Select>
              </Col>
            </Row>

            {/* Tabela de Milestones */}
            <Table
              dataSource={getFilteredMilestones()}
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: 800 }}
              columns={[
                {
                  title: 'Nome',
                  dataIndex: 'name',
                  key: 'name',
                  width: 200,
                  ellipsis: true,
                },
                {
                  title: 'Descrição',
                  dataIndex: 'description',
                  key: 'description',
                  ellipsis: true,
                  render: (text) => text || '-'
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  width: 120,
                  align: 'center',
                  render: (status) => {
                    const sprintStatus = parseSprintStatus(status);
                    let color = 'default';
                    let icon = <ClockCircleOutlined />;

                    switch (sprintStatus) {
                      case SprintStatus.Planning:
                        color = 'default';
                        icon = <ClockCircleOutlined />;
                        break;
                      case SprintStatus.Active:
                        color = 'processing';
                        icon = <PlayCircleOutlined />;
                        break;
                      case SprintStatus.Testing:
                        color = 'warning';
                        icon = <PauseCircleOutlined />;
                        break;
                      case SprintStatus.Completed:
                        color = 'success';
                        icon = <CheckCircleOutlined />;
                        break;
                    }

                    return (
                      <Tag color={color} icon={icon}>
                        {getSprintStatusName(sprintStatus)}
                      </Tag>
                    );
                  }
                },
                {
                  title: 'Data Início',
                  dataIndex: 'startDate',
                  key: 'startDate',
                  width: 120,
                  render: (date) => dayjs(date).format('DD/MM/YYYY')
                },
                {
                  title: 'Data Fim',
                  dataIndex: 'endDate',
                  key: 'endDate',
                  width: 120,
                  render: (date) => dayjs(date).format('DD/MM/YYYY')
                },
                {
                  title: 'Ações',
                  key: 'actions',
                  width: 120,
                  align: 'center',
                  render: (_, record) => (
                    <Space>
                      <Tooltip title="Editar">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEditMilestone(record)}
                        />
                      </Tooltip>
                      <Popconfirm
                        title="Confirmar exclusão"
                        description="Tem certeza que deseja excluir este milestone?"
                        onConfirm={() => handleDeleteMilestone(record.id)}
                        okText="Sim"
                        cancelText="Não"
                      >
                        <Tooltip title="Excluir">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Tooltip>
                      </Popconfirm>
                    </Space>
                  )
                }
              ]}
            />
          </>
        )}
      </Modal>
    </div>
  );
}