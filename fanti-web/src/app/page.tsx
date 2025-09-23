'use client';

// import { projectsService } from '@/services/projects';
// import { sprintsService } from '@/services/sprints';
// import { tasksService } from '@/services/tasks';
import { DashboardRawData, DashboardSummary } from '@/types/metrics';
import { calculateDashboardSummary } from '@/utils/dashboardMetrics';
import {
  RiseOutlined,
  TrophyOutlined,
  WarningOutlined
} from '@ant-design/icons';
import {
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  message
} from 'antd';
import { useEffect, useState } from 'react';

const { Text, Title } = Typography;

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [performanceView, setPerformanceView] = useState<'overview' | 'details'>('overview');
  const [dashboardData, setDashboardData] = useState<DashboardRawData>({
    projects: [],
    sprints: [],
    tasks: [],
  });
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsRes, sprintsRes, tasksRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/sprints'),
        fetch('/api/tasks'),
      ]);
      const [projects, sprints, tasks] = await Promise.all([
        projectsRes.json(),
        sprintsRes.json(),
        tasksRes.json(),
      ]);

      const rawData: DashboardRawData = {
        projects: projects?.data || [],
        sprints: sprints?.data || [],
        tasks: tasks?.data || [],
      };

      setDashboardData(rawData);

      // Calcular resumo do dashboard
      const summary = calculateDashboardSummary(rawData);
      setDashboardSummary(summary);
    } catch (error) {
      message.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardSummary) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  const {
    performanceMetrics,
    efficiencyMetrics,
    criticalProjects,
    topPerformingProjects,
    projectPerformanceData
  } = dashboardSummary;

  const performanceColumns = [
    {
      title: 'Produto',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <Tag color={
            record.status === 'completed' ? 'default' :
              record.status === 'active' ? 'default' :
                record.status === 'testing' ? 'default' : 'default'
          }>
            {record.status === 'completed' ? 'Concluído' :
              record.status === 'active' ? 'Ativo' :
                record.status === 'testing' ? 'Testando' : 'Planejamento'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Progresso',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number) => (
        <Progress
          percent={progress}
          size="small"
          strokeColor="#d9d9d9"
        />
      ),
      sorter: (a: any, b: any) => a.progress - b.progress,
    },
    {
      title: 'Milestones',
      key: 'milestones',
      width: 100,
      render: (record: any) => (
        <Tooltip title={`${record.completedMilestones} de ${record.milestones} concluídos`}>
          <span style={{
            color: record.delayedMilestones > 0 ? '#8c8c8c' : '#262626'
          }}>
            {record.completedMilestones}/{record.milestones}
            {record.delayedMilestones > 0 && (
              <WarningOutlined style={{ marginLeft: 4, color: '#8c8c8c' }} />
            )}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Tarefas',
      key: 'tasks',
      width: 100,
      render: (record: any) => (
        <span>{record.completedTasks}/{record.tasks}</span>
      ),
    },
    {
      title: 'Eficiência',
      dataIndex: 'efficiency',
      key: 'efficiency',
      width: 100,
      render: (efficiency: number) => (
        <Tag color="default">
          {efficiency}%
        </Tag>
      ),
      sorter: (a: any, b: any) => a.efficiency - b.efficiency,
    },
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* KPIs Principais - Minimalista */}
      {/* Toggle de Visualização */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0 }}>
                Performance dos Produtos
              </Title>
              <Select
                value={performanceView}
                onChange={setPerformanceView}
                style={{ width: 200 }}
              >
                <Select.Option value="overview">Visão Executiva</Select.Option>
                <Select.Option value="details">Análise Detalhada</Select.Option>
              </Select>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Conteúdo Principal */}
      {performanceView === 'overview' ? (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            {/* Resumo Executivo - Minimalista */}
            <Col xs={24}>
              <Card
                title={
                  <span>
                    <RiseOutlined style={{ marginRight: 8 }} />
                    Resumo Executivo
                  </span>
                }
              >
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#262626' }}>
                        {efficiencyMetrics.overallEfficiency}%
                      </div>
                      <Text type="secondary">Eficiência Global</Text>
                      <div style={{ marginTop: '8px' }}>
                        <Progress
                          percent={efficiencyMetrics.overallEfficiency}
                          size="small"
                          showInfo={false}
                          strokeColor="#d9d9d9"
                        />
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#262626' }}>
                        {efficiencyMetrics.onTimeDelivery}%
                      </div>
                      <Text type="secondary">Pontualidade</Text>
                      <div style={{ marginTop: '8px' }}>
                        <Progress
                          percent={efficiencyMetrics.onTimeDelivery}
                          size="small"
                          showInfo={false}
                          strokeColor="#d9d9d9"
                        />
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#262626' }}>
                        {performanceMetrics.averageProgress}%
                      </div>
                      <Text type="secondary">Progresso Médio</Text>
                      <div style={{ marginTop: '8px' }}>
                        <Progress
                          percent={performanceMetrics.averageProgress}
                          size="small"
                          showInfo={false}
                          strokeColor="#d9d9d9"
                        />
                      </div>
                    </div>
                  </Col>
                </Row>

                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  backgroundColor: '#fafafa',
                  borderRadius: '6px',
                  borderLeft: '4px solid #d9d9d9'
                }}>
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={8}>
                      <Text strong>{performanceMetrics.activeProjects}</Text>
                      <Text type="secondary" style={{ marginLeft: '4px' }}>produtos ativos</Text>
                      <Text type="secondary" style={{ marginLeft: '8px' }}>
                        / {performanceMetrics.totalProjects - performanceMetrics.activeProjects} inativos
                      </Text>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Text strong>{performanceMetrics.activeSprints}</Text>
                      <Text type="secondary" style={{ marginLeft: '4px' }}>milestones em andamento</Text>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Text strong>{performanceMetrics.totalTasks - performanceMetrics.completedTasks}</Text>
                      <Text type="secondary" style={{ marginLeft: '4px' }}>tarefas pendentes</Text>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* Top Performers */}
            {topPerformingProjects.length > 0 && (
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <span>
                      <TrophyOutlined style={{ marginRight: 8 }} />
                      Melhores Performances
                    </span>
                  }
                  style={{ height: '350px' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {topPerformingProjects.map(project => (
                      <Card key={project.key} size="small" style={{ backgroundColor: '#fafafa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text strong>{project.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {project.completedTasks}/{project.tasks} tarefas • {project.milestones} milestones
                            </Text>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Progress
                              type="circle"
                              percent={project.progress}
                              width={50}
                              strokeColor="#595959"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </Space>
                </Card>
              </Col>
            )}

            {/* Projetos Críticos */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span>
                    <WarningOutlined style={{ marginRight: 8 }} />
                    Projetos que Precisam de Atenção
                  </span>
                }
                style={{ height: '350px' }}
              >
                {criticalProjects.length > 0 ? (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {criticalProjects.slice(0, 5).map(project => (
                      <Card key={project.project.id} size="small" style={{ backgroundColor: '#fafafa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text strong>{project.project.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {project.reasons.join(' • ')}
                            </Text>
                            {project.delayedSprints > 0 && (
                              <div style={{ marginTop: '4px' }}>
                                <Tag color="default">
                                  {project.delayedSprints} MILESTONE{project.delayedSprints > 1 ? 'S' : ''} ATRASADO{project.delayedSprints > 1 ? 'S' : ''}
                                </Tag>
                              </div>
                            )}
                            {project.severity === 'high' && (
                              <Tag color="default" style={{ marginLeft: '4px' }}>CRÍTICO</Tag>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Progress
                              type="circle"
                              percent={project.progress}
                              width={50}
                              strokeColor="#8c8c8c"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </Space>
                ) : (
                  <Empty
                    description="Nenhum projeto crítico encontrado"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Row gutter={16}>
          <Col span={24}>
            <Card title="Análise Detalhada de Performance">
              <Table
                dataSource={projectPerformanceData}
                columns={performanceColumns}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
