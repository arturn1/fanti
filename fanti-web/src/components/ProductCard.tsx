import { ProjectStatus, SprintStatus } from '@/types';
import { ProductData, parseSprintStatus } from '@/utils/productCalculations';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ProjectOutlined,
  TagsOutlined
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Card,
  Col,
  Progress,
  Row,
  Statistic,
  Tag,
  Timeline,
  Tooltip,
  Typography
} from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

// Função para calcular dias úteis entre duas datas
const calculateBusinessDays = (startDate: string | Date, endDate: string | Date): number => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  let businessDays = 0;
  let current = start;

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    // 1 = Segunda, 2 = Terça, ..., 6 = Sábado, 0 = Domingo
    const dayOfWeek = current.day();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Segunda a Sexta
      businessDays++;
    }
    current = current.add(1, 'day');
  }

  return businessDays;
};

// Função para calcular número de sprints (2 semanas cada)
const calculateSprints = (businessDays: number): number => {
  const businessDaysPerSprint = 10; // 2 semanas = 10 dias úteis
  return Math.ceil(businessDays / businessDaysPerSprint);
};

interface ProductCardProps {
  productData: ProductData;
  showActions?: boolean;
  onViewDetails?: (projectId: string) => void;
  onAddMilestone?: () => void;
  milestoneFilter?: 'all' | 'active'; // 'all' para home, 'active' para milestones
}

export default function ProductCard({
  productData,
  showActions = false,
  onViewDetails,
  onAddMilestone,
  milestoneFilter = 'all'
}: ProductCardProps) {

  // Função para converter status de string para enum de projeto
  const parseProjectStatus = (status: string | number): ProjectStatus => {
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    return statusNum as ProjectStatus;
  };

  const getStatusConfig = (status: ProductData['status']) => {
    const configs = {
      planning: { color: 'default', icon: <ClockCircleOutlined />, text: 'Planejamento' },
      active: { color: 'processing', icon: <PlayCircleOutlined />, text: 'Ativo' },
      testing: { color: 'warning', icon: <PauseCircleOutlined />, text: 'Testando' },
      completed: { color: 'success', icon: <CheckCircleOutlined />, text: 'Concluído' },
      mixed: { color: 'default', icon: <ProjectOutlined />, text: 'Misto' }
    };
    return configs[status] || configs.planning;
  };

  const statusConfig = getStatusConfig(productData.status);

  // Filtrar milestones em andamento baseado na data atual
  const today = dayjs();
  const activeMilestones = productData.sprints.filter(sprint => {
    // Milestone em andamento se:
    // 1. Não está concluído E
    // 2. Data atual está entre startDate e endDate
    if (parseSprintStatus(sprint.status) === SprintStatus.Completed) return false;

    const startDate = sprint.startDate ? dayjs(sprint.startDate) : null;
    const endDate = sprint.endDate ? dayjs(sprint.endDate) : null;

    // Se não tem datas, considera em andamento se não está concluído
    if (!startDate && !endDate) return true;

    // Se tem data de início, verificar se já começou
    const hasStarted = !startDate || today.isAfter(startDate) || today.isSame(startDate, 'day');

    // Se tem data de fim, verificar se ainda não terminou
    const hasNotEnded = !endDate || today.isBefore(endDate) || today.isSame(endDate, 'day');

    return hasStarted && hasNotEnded;
  });

  // Estatísticas para exibição
  const milestonesCount = milestoneFilter === 'active'
    ? `${activeMilestones.length}/${productData.sprints.length}`
    : productData.sprints.length;

  const tasksDisplay = milestoneFilter === 'active'
    ? `${productData.completedTasks}/${productData.totalTasks}`
    : productData.tasks.filter(t => t.type !== 'project').length;

  return (
    <Card
      onClick={() => onViewDetails?.(productData.project.id)}
      style={{
        height: '100%',
        cursor: onViewDetails ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column'
      }}
      bodyStyle={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px'
      }}
      cover={
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <Avatar
            size={64}
            icon={<ProjectOutlined />}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
          <Badge
            status={statusConfig.color as any}
            style={{ position: 'absolute', top: 16, right: 16 }}
          />
        </div>
      }
      actions={showActions ? [
        <Tooltip title="Ver Detalhes" key="view">
          <EyeOutlined onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(productData.project.id);
          }} />
        </Tooltip>,
        <Tooltip title="Adicionar Milestone" key="add">
          <PlusOutlined onClick={(e) => {
            e.stopPropagation();
            onAddMilestone?.();
          }} />
        </Tooltip>
      ] : undefined}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Text strong ellipsis style={{ flex: 1 }}>
            {productData.project.name}
          </Text>
          {statusConfig.icon}
        </div>

        {/* Status Tag */}
        <Tag color={statusConfig.color} style={{ marginBottom: 12, alignSelf: 'flex-start' }}>
          {statusConfig.text}
        </Tag>

        {/* Progresso */}
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">Progresso Geral</Text>
          <Progress
            percent={productData.progress}
            size="small"
            status={productData.progress === 100 ? 'success' : 'active'}
            style={{ marginTop: 4 }}
          />
        </div>

        {/* Estatísticas */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Statistic
              title={milestoneFilter === 'active' ? "Em Andamento" : "Milestones"}
              value={milestonesCount}
              prefix={<CalendarOutlined />}
              valueStyle={{ fontSize: '16px' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Tarefas"
              value={tasksDisplay}
              prefix={<TagsOutlined />}
              valueStyle={{ fontSize: '16px' }}
            />
          </Col>
        </Row>

        {/* Conteúdo flexível que ocupa o espaço restante */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Timeline dos Milestones em Andamento */}
            {activeMilestones.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Milestones em Andamento
                </Text>
                <Timeline
                  style={{ marginTop: 8, maxHeight: '140px', overflow: 'hidden' }}
                >
                  {activeMilestones.slice(0, 3).map(sprint => {
                    const startDate = sprint.startDate ? dayjs(sprint.startDate) : today;
                    const endDate = sprint.endDate ? dayjs(sprint.endDate) : today.add(2, 'week');
                    const businessDays = calculateBusinessDays(startDate.toDate(), endDate.toDate());
                    const sprintsCount = calculateSprints(businessDays);

                    // Calcular progresso do milestone baseado na tarefa 'project' do sprint
                    const sprintTasks = productData.tasks.filter(t => t.sprintId === sprint.id);
                    const projectTask = sprintTasks.find(t => t.type === 'project');
                    const sprintProgress = projectTask ? projectTask.progress || 0 : 0;

                    // Contar apenas tarefas que NÃO são do tipo 'project'
                    const nonProjectTasks = sprintTasks.filter(t => t.type !== 'project');

                    return (
                      <Timeline.Item
                        key={sprint.id}
                        color={
                          parseSprintStatus(sprint.status) === SprintStatus.Active ? 'blue' :
                            parseSprintStatus(sprint.status) === SprintStatus.Testing ? 'orange' : 'gray'
                        }
                        style={{ paddingBottom: '8px' }}
                      >
                        <div>
                          <Text style={{ fontSize: '12px', fontWeight: 'bold' }} ellipsis>
                            {sprint.name} <span style={{ color: '#1890ff', fontWeight: 'normal' }}>({sprintProgress}%)</span>
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '10px' }}>
                            {startDate.format('DD/MM')} - {endDate.format('DD/MM')}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '10px' }}>
                            {businessDays} dias úteis • {sprintsCount} sprint{sprintsCount > 1 ? 's' : ''} • {nonProjectTasks.length} tarefa{nonProjectTasks.length !== 1 ? 's' : ''}
                          </Text>
                        </div>
                      </Timeline.Item>
                    );
                  })}
                  {activeMilestones.length > 3 && (
                    <Timeline.Item color="gray">
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        +{activeMilestones.length - 3} mais...
                      </Text>
                    </Timeline.Item>
                  )}
                </Timeline>

              </div>
            )}

            {/* Mensagem quando não há milestones em andamento */}
            {activeMilestones.length === 0 && (
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Nenhum milestone em andamento
                </Text>
              </div>
            )}
          </div>

          {/* Descrição - sempre no final */}
          {productData.project.description && (
            <div style={{ marginTop: 'auto', paddingTop: 8 }}>
              <Text type="secondary" style={{ fontSize: '12px' }} ellipsis>
                {productData.project.description}
              </Text>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
