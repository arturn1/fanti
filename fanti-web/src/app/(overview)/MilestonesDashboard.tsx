
import { Period, PeriodStaff, SprintStatus, Staff, Task, TasksPeriod, TaskType } from '@/types';
import { isRangeOverlap } from '@/utils/dateRange';
import { calculateProductData, parseSprintStatus, ProductData } from '@/utils/productCalculations';
import { Card, Carousel, Col, Divider, Empty, Progress, Row, Select, Tag, Tooltip, Typography, Modal, Table } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

const statusMap = {
  [SprintStatus.Planning]: { color: 'default', label: 'Planejamento' },
  [SprintStatus.Active]: { color: 'processing', label: 'Em Andamento' },
  [SprintStatus.Testing]: { color: 'warning', label: 'Testando' },
  [SprintStatus.Completed]: { color: 'success', label: 'Concluído' },
};

interface MilestonesDashboardProps {
  projects: any[];
  sprints: any[];
  tasks: Task[];
  tasksPeriod: TasksPeriod[];
  periodStaffs: PeriodStaff[];
  staffs: Staff[];
  periods: Period[];
}

export default function MilestonesDashboard({ projects, sprints, tasks, tasksPeriod, periodStaffs, staffs, periods }: MilestonesDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'notCompleted' | SprintStatus>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSprint, setModalSprint] = useState<any | null>(null);
  const [modalTasks, setModalTasks] = useState<any[]>([]);

  const statusMap = {
    [SprintStatus.Planning]: { color: 'default', label: 'Planejamento' },
    [SprintStatus.Active]: { color: 'processing', label: 'Em Andamento' },
    [SprintStatus.Testing]: { color: 'warning', label: 'Testando' },
    [SprintStatus.Completed]: { color: 'success', label: 'Concluído' },
  };

  interface MilestonesDashboardProps {
    projects: any[];
    sprints: any[];
    tasks: Task[];
    tasksPeriod: TasksPeriod[];
    periodStaffs: PeriodStaff[];
    staffs: Staff[];
    periods: Period[];
  }

  const productsData: ProductData[] = useMemo(() => calculateProductData(projects, sprints, tasks), [projects, sprints, tasks]);
  const filteredProducts = useMemo(() => {
    let filtered = productsData;
    if (statusFilter === 'notCompleted') {
      filtered = productsData.map(product => ({
        ...product,
        sprints: product.sprints.filter(s => parseSprintStatus(s.status) !== SprintStatus.Completed)
      }));
    } else if (statusFilter !== 'all') {
      filtered = productsData.map(product => ({
        ...product,
        sprints: product.sprints.filter(s => parseSprintStatus(s.status) === statusFilter)
      }));
    }
    return filtered.filter(product => product.sprints && product.sprints.length > 0);
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
            <Option value="notCompleted">Todas menos concluídas</Option>
            <Option value={SprintStatus.Planning}>Planejamento</Option>
            <Option value={SprintStatus.Active}>Em Andamento</Option>
            <Option value={SprintStatus.Testing}>Testando</Option>
            <Option value={SprintStatus.Completed}>Concluído</Option>
          </Select>
        </Col>
      </Row>
      {filteredProducts.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {filteredProducts.map(product => {
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
                  <Card title={product.project.name} bordered hoverable style={{ height: '100%', background: '#f7f7f7ff', minHeight: "min-content" }}>
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
                            const sprintTasksPeriod = tasksPeriod.filter(tp => {
                              if (tp.projectId !== product.project.id) return false;
                              const ps = periodStaffs.find(ps => ps.id === tp.periodStaffId);
                              if (!ps) return false;
                              const period = periods.find((p: Period) => p.id === ps.periodId);
                              if (!period || !period.startDate || !period.endDate || !sprint.startDate || !sprint.endDate) return false;
                              return isRangeOverlap(sprint.startDate, sprint.endDate, period.startDate, period.endDate);
                            });
                            const columns: ColumnsType<any> = [
                              { title: 'Sprint', dataIndex: 'periodName', key: 'periodName' },
                              { title: 'Nº', dataIndex: 'taskNumber', key: 'taskNumber' },
                              { title: 'Responsável', dataIndex: 'staffName', key: 'staffName' },
                            ];
                            const previewRows = sprintTasksPeriod.slice(0, 3).map(tp => {
                              const ps = periodStaffs.find(ps => ps.id === tp.periodStaffId);
                              const period = ps ? periods.find(p => p.id === ps.periodId) : undefined;
                              const staff = ps ? staffs.find(s => s.id === ps.staffId) : undefined;
                              return {
                                key: tp.id,
                                periodName: period ? period.name : '-',
                                taskNumber: tp.taskNumber,
                                staffName: staff ? staff.name : '-',
                              };
                            });
                            const allRows = sprintTasksPeriod.map(tp => {
                              const ps = periodStaffs.find(ps => ps.id === tp.periodStaffId);
                              const period = ps ? periods.find(p => p.id === ps.periodId) : undefined;
                              const staff = ps ? staffs.find(s => s.id === ps.staffId) : undefined;
                              return {
                                key: tp.id,
                                periodName: period ? period.name : '-',
                                taskNumber: tp.taskNumber,
                                staffName: staff ? staff.name : '-',
                              };
                            });
                            return (
                              <div key={sprint.id}>
                                <Card
                                  size="default"
                                  style={{ marginBottom: 8, background: '#fff', minHeight: "min-content", cursor: 'pointer', boxShadow: '0 2px 8px #f0f1f2' }}
                                  onClick={() => {
                                    setModalSprint(sprint);
                                    setModalTasks(allRows);
                                    setModalOpen(true);
                                  }}
                                >
                                  <Row align="middle" justify="space-between" style={{ marginBottom: 8 }}>
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
                                    </Col>
                                  </Row>
                                  <Divider style={{ margin: '8px 0' }} />
                                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, fontWeight: 500, justifyContent: 'space-between' }}>
                                    <span>Total de Tasks:</span>
                                    <span style={{ color: '#1890ff', fontWeight: 600 }}>{sprintTasksPeriod.length}</span>
                                  </div>
                                  <Table
                                    columns={columns}
                                    dataSource={previewRows}
                                    size="small"
                                    pagination={false}
                                    scroll={{ x: true }}
                                    style={{ marginBottom: 0 }}
                                  />
                                  {sprintTasksPeriod.length > 3 && (
                                    <div style={{ fontSize: 12, color: '#888', marginTop: 4, textAlign: 'right' }}>
                                      ...e mais {sprintTasksPeriod.length - 3} tarefas
                                    </div>
                                  )}
                                  {sprintTasksPeriod.length === 0 && <Text type="secondary">Nenhuma task relacionada</Text>}
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
          <Modal
            open={modalOpen}
            onCancel={() => setModalOpen(false)}
            title={modalSprint ? modalSprint.name : ''}
            footer={null}
            width={600}
            centered
          >
            {modalSprint && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <Tag color={statusMap[parseSprintStatus(modalSprint.status)]?.color}>
                    {statusMap[parseSprintStatus(modalSprint.status)]?.label}
                  </Tag>
                  <span style={{ marginLeft: 8, color: '#888' }}>
                    {modalSprint.startDate && dayjs(modalSprint.startDate).format('DD/MM/YYYY')} - {modalSprint.endDate && dayjs(modalSprint.endDate).format('DD/MM/YYYY')}
                  </span>
                </div>
                <div style={{ marginBottom: 12 }}>
                </div>
                <Table
                  columns={[
                    { title: 'Sprint', dataIndex: 'periodName', key: 'periodName' },
                    { title: 'Nº', dataIndex: 'taskNumber', key: 'taskNumber' },
                    { title: 'Responsável', dataIndex: 'staffName', key: 'staffName' },
                  ]}
                  dataSource={modalTasks}
                  size="small"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: true, y: 320 }}
                />
              </>
            )}
          </Modal>
        </>
      ) : (
        <Empty description="Nenhum projeto encontrado" style={{ marginTop: 40 }} />
      )}
    </Card>
  );
}

