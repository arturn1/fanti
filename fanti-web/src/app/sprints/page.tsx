'use client';

import CreateSprintModal from '@/app/sprints/components/CreateSprintModal';
import EditSprintModal from '@/app/sprints/components/EditSprintModal';
import ProductCard from '@/app/sprints/components/ProductCard';
import { useProjects } from '@/hooks/useProjects';
import { useSprints } from '@/hooks/useSprints';
import { useTasks } from '@/hooks/useTasks';
import { Sprint, SprintStatus } from '@/types';
import { calculateProductData, parseSprintStatus, ProductData as ProductDataType } from '@/utils/productCalculations';
import {
  SearchOutlined
} from '@ant-design/icons';
import {
  Card,
  Col,
  Empty,
  Input,
  message,
  Row,
  Select,
  Typography
} from 'antd';
import { useEffect, useState } from 'react';
import MilestonesModal from './components/MilestonesModal';


const { Title, Text } = Typography;
const { Option } = Select;

export default function SprintsPage() {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [productsData, setProductsData] = useState<ProductDataType[]>([]);
  const { projects, loading: projectsLoading } = useProjects();
  const { sprints, deleteSprint, loading: sprintsLoading, createSprint, updateSprint } = useSprints();
  const { tasks, loading: tasksLoading, createTask, updateTask, getTasksBySprint } = useTasks();
  const [loading, setLoading] = useState(false);

  const anyLoading = projectsLoading || sprintsLoading || tasksLoading || loading;


  // Filtros
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal de detalhes das milestones
  const [milestonesModalVisible, setMilestonesModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDataType | null>(null);
  const [milestoneSearchText, setMilestoneSearchText] = useState('');
  const [milestoneStatusFilter, setMilestoneStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Only run loadData when all entity loading flags are false — this ensures
    // projects, sprints and tasks have finished fetching and their values are available.
    if (projectsLoading || sprintsLoading || tasksLoading) return;

    if (projects.length > 0) {
      loadData();
    } else {
      // If there are no projects, clear productsData
      setProductsData([]);
    }
    // Re-run when any of the entities or their loading states change
  }, [projects, sprints, tasks, projectsLoading, sprintsLoading, tasksLoading]);


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
      const calculatedProductsData = calculateProductData(
        projects || [],
        sprints || [],
        tasks || []
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
    setSelectedSprint((prev) => ({ ...prev, ...sprint, projectName: selectedProduct?.project.name }));
    setEditModalVisible(true);
    setMilestonesModalVisible(false);
  };

  const handleDeleteMilestone = async (sprintId: string) => {
    try {
      await deleteSprint(sprintId);
      message.success('Milestone excluído com sucesso!');
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
          onAddMilestone={() => {
            setSelectedProduct(productData);
            setCreateModalVisible(true);
          }}
          milestoneFilter="active"
        />
      </Col>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
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
          </Col>
        </Row>
      </Card>

      {/* Cards dos Produtos */}
      <Card>
        {anyLoading ? (
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
        project={selectedProduct ? selectedProduct.project : projects[0]}
        createSprint={createSprint}
        createTask={createTask}
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
        updateSprint={updateSprint}
        updateTask={updateTask}
        getTasksBySprint={getTasksBySprint}
      />

      {/* Modal de Detalhes das Milestones (extracted) */}
      <MilestonesModal
        open={milestonesModalVisible}
        onClose={() => setMilestonesModalVisible(false)}
        selectedProduct={selectedProduct}
        milestoneSearchText={milestoneSearchText}
        setMilestoneSearchText={setMilestoneSearchText}
        milestoneStatusFilter={milestoneStatusFilter}
        setMilestoneStatusFilter={setMilestoneStatusFilter}
        onEditMilestone={handleEditMilestone}
        onDeleteMilestone={handleDeleteMilestone}
        getFilteredMilestones={getFilteredMilestones}
        getSprintStatusName={getSprintStatusName}
      />
    </div>
  );
}
