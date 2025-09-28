import { Period, PeriodStaff, SprintStatus, Staff, Task, TasksPeriod } from '@/types';
import { isRangeOverlap } from '@/utils/dateRange';
import { calculateProductData, parseSprintStatus, ProductData } from '@/utils/productCalculations';
import { Card, Carousel, Col, Divider, Empty, Progress, Row, Select, Spin, Statistic, Tag, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import "../globals.css";
const { Title, Text } = Typography;
const { Option } = Select;

const statusMap = {
  [SprintStatus.Planning]: { color: 'default', label: 'Planejamento' },
  [SprintStatus.Active]: { color: 'processing', label: 'Em Andamento' },
  [SprintStatus.Testing]: { color: 'warning', label: 'Testando' },
  [SprintStatus.Completed]: { color: 'success', label: 'Concluído' },
};

export default function MilestonesDashboard() {
  const [productsData, setProductsData] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | SprintStatus>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksPeriod, setTasksPeriod] = useState<TasksPeriod[]>([]);
  const [periodStaffs, setPeriodStaffs] = useState<PeriodStaff[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [projectsRes, sprintsRes, tasksRes, tasksPeriodRes, periodStaffRes, staffRes, periodsRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/sprints'),
          fetch('/api/tasks'),
          fetch('/api/tasksPeriod'),
          fetch('/api/periodStaff'),
          fetch('/api/staff'),
          fetch('/api/periods'),
        ]);
        const [projectsData, sprintsData, tasksData, tasksPeriodData, periodStaffData, staffData, periodsData] = await Promise.all([
          projectsRes.json(),
          sprintsRes.json(),
          tasksRes.json(),
          tasksPeriodRes.json(),
          periodStaffRes.json(),
          staffRes.json(),
          periodsRes.json(),
        ]);
        const calculated = calculateProductData(
          projectsData?.data || [],
          sprintsData?.data || [],
          tasksData?.data || []
        );
        setProductsData(calculated);
        setTasks(tasksData?.data || []);
        setTasksPeriod(tasksPeriodData?.data || []);
        setPeriodStaffs(periodStaffData?.data || []);
        setStaffs(staffData?.data || []);
        setPeriods(periodsData?.data || []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filtro de milestones por status
  const filteredProducts = useMemo(() => {
    if (statusFilter === 'all') return productsData;
    return productsData.map(product => ({
      ...product,
      sprints: product.sprints.filter(s => parseSprintStatus(s.status) === statusFilter)
    }));
  }, [productsData, statusFilter]);

  return (
    <Card style={{ minHeight: 500 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4}>Milestones</Title>
        </Col>
        <Col>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ minWidth: 200 }}
            allowClear={false}
          >
            <Option value="all">Todas</Option>
            <Option value={SprintStatus.Planning}>Planejamento</Option>
            <Option value={SprintStatus.Active}>Em Andamento</Option>
            <Option value={SprintStatus.Testing}>Testando</Option>
            <Option value={SprintStatus.Completed}>Concluído</Option>
          </Select>
        </Col>
      </Row>
      {loading ? (
        <Spin />
      ) : filteredProducts.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredProducts.map(product => {
            const total = product.sprints.length;
            const abertas = product.sprints.filter(s => parseSprintStatus(s.status) !== SprintStatus.Completed).length;
            const porStatus = {
              [SprintStatus.Planning]: 0,
              [SprintStatus.Active]: 0,
              [SprintStatus.Testing]: 0,
              [SprintStatus.Completed]: 0,
            };
            product.sprints.forEach(s => {
              porStatus[parseSprintStatus(s.status)]++;
            });
            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={product.project.id}>
                <Card title={product.project.name} bordered hoverable
                  style={{ height: '100%', background: '#f7f7f7ff', minHeight: "min-content" }}>
                  <Row gutter={8} style={{ marginBottom: 8 }}>
                    {Object.entries(porStatus).map(([statusStr, count]) => {
                      const status = Number(statusStr) as SprintStatus;
                      return (
                        <Col key={status} span={12} style={{ marginBottom: 4 }}>
                          <Tag color={statusMap[status]?.color || 'default'}>
                            {statusMap[status]?.label || status}: {count}
                          </Tag>
                        </Col>
                      );
                    })}
                  </Row>
                  <Divider style={{ margin: '12px 0' }} />
                  {product.sprints.length === 0 ? (
                    <Text type="secondary">Nenhuma milestone cadastrada</Text>
                  ) : (
                    <Carousel
                      arrows
                      slidesToShow={1}
                      slidesToScroll={1}
                      adaptiveHeight
                      style={{ width: '100%', minHeight: "min-content" }}
                    >
                      {[...product.sprints]
                        .sort((a, b) => {
                          if (!a.startDate || !b.startDate) return 0;
                          return dayjs(a.startDate).isAfter(dayjs(b.startDate)) ? 1 : -1;
                        })
                        .map(sprint => {
                          const status = parseSprintStatus(sprint.status);
                          const atrasada = status !== SprintStatus.Completed && sprint.endDate && dayjs().isAfter(dayjs(sprint.endDate), 'day');
                          // Calcular progresso da milestone (sprint) pelas tasks do tipo 'project' associadas
                          const sprintTasks = tasks.filter(t => t.sprintId === sprint.id && t.type === 'project');
                          let sprintProgress = 0;
                          if (sprintTasks.length > 0) {
                            sprintProgress = Math.round(
                              sprintTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / sprintTasks.length
                            );
                          }
                          // TasksPeriod relacionadas a este sprint (milestone) do projeto atual, usando isRangeOverlap
                          const sprintTasksPeriod = tasksPeriod.filter(tp => {
                            if (tp.projectId !== product.project.id) return false;
                            const ps = periodStaffs.find(ps => ps.id === tp.periodStaffId);
                            if (!ps) return false;
                            const period = periods.find((p: Period) => p.id === ps.periodId);
                            if (!period || !period.startDate || !period.endDate || !sprint.startDate || !sprint.endDate) return false;
                            return isRangeOverlap(sprint.startDate, sprint.endDate, period.startDate, period.endDate);
                          });
                          // Helper para pegar nome do staff
                          const getStaffName = (periodStaffId: string) => {
                            const ps = periodStaffs.find(ps => ps.id === periodStaffId);
                            if (!ps) return '-';
                            const staff = staffs.find(s => s.id === ps.staffId);
                            return staff ? staff.name : '-';
                          };
                          // Destacar tasksPeriod fora do range da milestone
                          const isOutOfRange = (tp: TasksPeriod) => {
                            const ps = periodStaffs.find(ps => ps.id === tp.periodStaffId);
                            if (!ps) return false;
                            const period = { startDate: sprint.startDate, endDate: sprint.endDate };
                            // Aqui, period é a milestone
                            // Supondo que a task associada tenha startDate/endDate, mas TasksPeriod não tem, então não destacamos por data da task
                            // Se quiser destacar por outra lógica, ajustar aqui
                            return false;
                          };
                          return (
                            <div key={sprint.id}>
                              <Card size="default" style={{ marginBottom: 8, background: '#ffffffff', minHeight: "min-content" }}>
                                <Row align="middle" justify="space-between">
                                  <Col span={16}>
                                    <Tooltip title={sprint.name}><Text strong ellipsis>{sprint.name}</Text></Tooltip>
                                    <br />
                                    <Tag color={statusMap[status]?.color}>{statusMap[status]?.label}</Tag>
                                    {atrasada && <Tag color="red">Atrasada</Tag>}
                                  </Col>
                                  <Col span={8} style={{ textAlign: 'right' }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      {sprint.startDate && dayjs(sprint.startDate).format('DD/MM')} - {sprint.endDate && dayjs(sprint.endDate).format('DD/MM')}
                                    </Text>
                                    <Progress percent={sprintProgress} size="small" style={{ marginTop: 4 }} status={status === SprintStatus.Completed ? 'success' : 'active'} />
                                  </Col>
                                </Row>
                                <Divider style={{ margin: '8px 0' }} />
                                <Statistic title="Total de Tasks" value={sprintTasksPeriod.length} style={{ marginBottom: 8 }} />
                                <div style={{ minHeight: "min-content", overflowY: 'auto' }}>
                                  <table style={{ width: '100%', fontSize: 12 }}>
                                    <thead>
                                      <tr>
                                        <th style={{ textAlign: 'left' }}>Período</th>
                                        <th style={{ textAlign: 'left' }}>Nº</th>
                                        <th style={{ textAlign: 'left' }}>Staff</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {sprintTasksPeriod.map(tp => {
                                        // Buscar o período relacionado
                                        const ps = periodStaffs.find(ps => ps.id === tp.periodStaffId);
                                        const period = ps ? periods.find(p => p.id === ps.periodId) : undefined;
                                        return (
                                          <tr key={tp.id} style={isOutOfRange(tp) ? { background: '#fffbe6' } : {}}>
                                            <td>{period ? period.name : '-'}</td>
                                            <td>{tp.taskNumber}</td>
                                            <td>{getStaffName(tp.periodStaffId)}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                  {sprintTasksPeriod.length === 0 && <Text type="secondary">Nenhuma task relacionada</Text>}
                                </div>
                              </Card>
                            </div>
                          );
                        })}
                    </Carousel>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Empty description="Nenhum projeto encontrado" style={{ marginTop: 40 }} />
      )}
    </Card>
  );
}
