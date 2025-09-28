'use client';

import { getTaskStatusByDisplayName, getTaskStatusDisplayName, getTaskStatusName, Period, PeriodStaff, Staff, Task, TaskCategory, TaskDependency, TasksPeriod, TaskStatus, Team, User } from '@/types';
import { isRangeOverlap } from '@/utils/dateRange';
import { getAllStatusColors } from '@/utils/taskColors';
import {
  CloseOutlined,
  EditOutlined,
  SaveOutlined
} from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Typography
} from 'antd';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import React, { useEffect, useState } from 'react';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
// Fetch teams for the Team select field
const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  useEffect(() => {
    fetch('/api/teams')
      .then(res => res.json())
      .then(data => setTeams(data?.data || []));
  }, []);
  return teams;
};

// --- TasksPeriodsTab component ---
interface TasksPeriodsTabProps {
  task: Task | null;
}

const TasksPeriodsTab: React.FC<TasksPeriodsTabProps> = ({ task }) => {
  const [loading, setLoading] = useState(false);
  const [tasksPeriods, setTasksPeriods] = useState<TasksPeriod[]>([]);
  const [periodStaffs, setPeriodStaffs] = useState<PeriodStaff[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);

  useEffect(() => {
    if (!task?.projectId) return;
    setLoading(true);
    Promise.all([
      fetch('/api/tasksPeriod').then(res => res.json()),
      fetch('/api/periodStaff').then(res => res.json()),
      fetch('/api/staff').then(res => res.json()),
      fetch('/api/periods').then(res => res.json())
    ])
      .then(([tasksPeriodData, periodStaffData, staffData, periodsData]) => {
        // Filtrar usando os dados recebidos diretamente
        const filtered = (tasksPeriodData?.data || []).filter((tp: TasksPeriod) => {
          if (tp.projectId !== task.projectId) {
            return false;
          }
          const periodStaff = (periodStaffData?.data || []).find((ps: PeriodStaff) => ps.id === tp.periodStaffId);
          if (!periodStaff) {
            return false;
          }
          const period = (periodsData?.data || []).find((p: Period) => p.id === periodStaff.periodId);
          if (!period) {
            return false;
          }
          if (!period.startDate || !period.endDate || !task.startDate || !task.endDate) {
            return false;
          }
          return isRangeOverlap(period.startDate, period.endDate, task.startDate, task.endDate);
        });
        setTasksPeriods(filtered);
        setPeriodStaffs(periodStaffData?.data || []);
        setStaffs(staffData?.data || []);
        setPeriods(periodsData?.data || []);
      })
      .catch(() => {
        setTasksPeriods([]);
        setPeriodStaffs([]);
        setStaffs([]);
        setPeriods([]);
      })
      .finally(() => setLoading(false));
  }, [task?.projectId]);

  // Helper to get staff name from periodStaffId
  const getStaffName = (periodStaffId: string) => {
    const periodStaff = periodStaffs.find(ps => ps.id === periodStaffId);
    if (!periodStaff) return '-';
    const staff = staffs.find(s => s.id === periodStaff.staffId);
    return staff ? staff.name : '-';
  };

  // Helper to get period name from periodStaffId
  const getPeriodName = (periodStaffId: string) => {
    const periodStaff = periodStaffs.find(ps => ps.id === periodStaffId);
    if (!periodStaff) return '-';
    const period = periods.find(p => p.id === periodStaff.periodId);
    return period ? period.name : '-';
  };

  const columns = [
    { title: 'Sprint', dataIndex: 'periodStaffId', key: 'periodName', render: (id: string) => getPeriodName(id) },
    { title: 'Número da tarefa', dataIndex: 'taskNumber', key: 'taskNumber' },
    { title: 'Horas', dataIndex: 'taskHours', key: 'taskHours' },
    { title: 'Staff', dataIndex: 'periodStaffId', key: 'periodStaffId', render: (id: string) => getStaffName(id) },
  ];

  return (
    <Spin spinning={loading}>
      <Table
        dataSource={tasksPeriods}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        locale={{ emptyText: 'Nenhum registro encontrado para este projeto.' }}
      />
    </Spin>
  );
};

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface UnifiedTaskModalProps {
  task: Task | null;
  tasks: Task[];
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activeTab?: string;
}

export const UnifiedTaskModal: React.FC<UnifiedTaskModalProps> = ({
  task,
  tasks,
  visible,
  onClose,
  onSuccess,
  activeTab = 'edit'
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [dependenciesWithTasks, setDependenciesWithTasks] = useState<(TaskDependency & { predecessorTask: Task })[]>([]);
  const [successorDependenciesWithTasks, setSuccessorDependenciesWithTasks] = useState<(TaskDependency & { successorTask: Task })[]>([]);
  const [currentTab, setCurrentTab] = useState(activeTab);

  const statusColors = getAllStatusColors();
  const teams = useTeams();

  useEffect(() => {
    if (visible) {
      loadData();
      if (task) {
        loadTaskData();
      }
    }
  }, [visible, task]);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  // Funções auxiliares para tasks do tipo projeto
  const calculateProjectProgress = (childTasks: Task[]): number => {
    if (!childTasks || childTasks.length === 0) return 0;

    const totalProgress = childTasks.reduce((sum, child) => sum + (child.progress || 0), 0);
    return Math.round(totalProgress / childTasks.length);
  };

  const calculateProjectStatus = (childTasks: Task[]): TaskStatus => {
    if (!childTasks || childTasks.length === 0) return TaskStatus.ToDo;

    const allDone = childTasks.every(child => child.status === 'Done' || child.status === TaskStatus.Done);
    const anyInProgress = childTasks.some(child => child.status === 'InProgress' || child.status === TaskStatus.InProgress);

    if (allDone) return TaskStatus.Done;
    if (anyInProgress) return TaskStatus.InProgress;
    return TaskStatus.ToDo;
  };

  const isProjectType = task?.type === 'project';
  const childTasks = tasks.filter(t => t.parentTaskId === task?.id);
  const calculatedProgress = isProjectType ? calculateProjectProgress(childTasks) : (task?.progress || 0);
  const calculatedStatus = isProjectType ? calculateProjectStatus(childTasks) : task?.status;

  const loadData = async () => {
    try {
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      setUsers(usersData?.data || []);
    } catch (error) {
      message.error('Erro ao carregar dados:' + error);
    }
  };

  const loadTaskData = async () => {
    if (!task) return;
    try {
      const statusToUse = calculatedStatus || task.status;
      const statusDisplayName = typeof statusToUse === 'string'
        ? getTaskStatusDisplayName(statusToUse)
        : getTaskStatusDisplayName(getTaskStatusName(statusToUse));
      const isDone = (typeof statusToUse === 'string' && statusToUse === 'Done') ||
        (typeof statusToUse === 'number' && statusToUse === TaskStatus.Done);
      form.setFieldsValue({
        name: task.title,
        description: task.description,
        status: statusDisplayName,
        progress: calculatedProgress,
        projectId: task.projectId,
        sprintId: task.sprintId,
        startDate: task.startDate ? dayjs(task.startDate) : null,
        endDate: task.endDate ? dayjs(task.endDate) : null,
        isCompleted: isDone,
        type: task.type,
        category: task.category || TaskCategory.Desenvolvimento,
        teamId: task.teamId || undefined
      });
      // Carregar atribuições e dependências via API interna
      const [dependenciesRes, allDependenciesRes] = await Promise.all([
        fetch(`/api/taskDependencies?taskId=${task.id}`),
        fetch('/api/taskDependencies')
      ]);
      const [dependenciesData, allDependencies] = await Promise.all([
        dependenciesRes.json(),
        allDependenciesRes.json()
      ]);

      const predecessorDeps = (dependenciesData?.data || []).filter((dep: TaskDependency) => dep.successorTaskId === task.id);
      setDependenciesWithTasks(predecessorDeps.map((dependency: TaskDependency) => {
        const predecessorTask = tasks.find((t: Task) => t.id === dependency.predecessorTaskId);
        return { ...dependency, predecessorTask: predecessorTask! };
      }));
      const successorDeps = (allDependencies?.data || []).filter((dep: TaskDependency) => dep.predecessorTaskId === task.id);
      setSuccessorDependenciesWithTasks(successorDeps.map((dependency: TaskDependency) => {
        const successorTask = tasks.find((t: Task) => t.id === dependency.successorTaskId);
        return { ...dependency, successorTask: successorTask! };
      }));
    } catch (error) {
      console.error('Erro ao carregar dados da tarefa:', error);
    }
  };

  const handleSave = async () => {
    if (!task) return;
    try {
      setLoading(true);
      const values = await form.validateFields();
      const backendStatus = getTaskStatusByDisplayName(values.status);
      const updateData = {
        id: task.id,
        title: values.name,
        description: values.description,
        status: backendStatus,
        progress: values.progress,
        projectId: values.projectId,
        sprintId: values.sprintId,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD'),
        type: values.type,
        category: values.category,
        teamId: values.teamId
      };
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        message.success('Tarefa atualizada com sucesso!');
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        message.error(err?.message || 'Erro ao atualizar tarefa');
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      message.error('Erro ao atualizar tarefa');
    } finally {
      setLoading(false);
    }
  };


  const handleRemoveDependency = async (dependencyId: string) => {
    try {
      const res = await fetch(`/api/taskDependencies?id=${dependencyId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        // Recarregar dependências predecessoras
        const updatedRes = await fetch(`/api/taskDependencies?taskId=${task!.id}`);
        const updatedDependencies = await updatedRes.json();
        const predecessorDeps = (updatedDependencies?.data || []).filter((dep: TaskDependency) => dep.successorTaskId === task!.id);
        setDependenciesWithTasks(predecessorDeps.map((dependency: TaskDependency) => {
          const predecessorTask = tasks.find((t: Task) => t.id === dependency.predecessorTaskId);
          return { ...dependency, predecessorTask: predecessorTask! };
        }));
        // Recarregar dependências sucessoras
        const allRes = await fetch('/api/taskDependencies');
        const allDependencies = await allRes.json();
        const successorDeps = (allDependencies?.data || []).filter((dep: TaskDependency) => dep.predecessorTaskId === task!.id);
        setSuccessorDependenciesWithTasks(successorDeps.map((dependency: TaskDependency) => {
          const successorTask = tasks.find((t: Task) => t.id === dependency.successorTaskId);
          return { ...dependency, successorTask: successorTask! };
        }));
        message.success('Dependência removida com sucesso!');
      } else {
        message.error('Erro ao remover dependência');
      }
    } catch (error) {
      console.error('Erro ao remover dependência:', error);
      message.error('Erro ao remover dependência');
    }
  };

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          {task?.title || 'Editar Tarefa'}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          <CloseOutlined /> Fechar
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={loading}
          onClick={handleSave}
        >
          <SaveOutlined /> Salvar
        </Button>
      ]}
    >

      <Tabs activeKey={currentTab} onChange={setCurrentTab}>
        <TabPane tab="Editar" key="edit">
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Nome da Tarefa"
                  rules={!isProjectType ? [{ required: true, message: 'Nome é obrigatório' }] : []}
                >
                  {isProjectType ? (
                    <Input disabled placeholder="Nome da tarefa" />
                  ) : (
                    <Input placeholder="Nome da tarefa" />
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="description" label="Descrição">
                  <TextArea rows={3} placeholder="Descrição da tarefa" />
                </Form.Item>
              </Col>
            </Row>


            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Tipo"
                  rules={[{ required: true, message: 'Por favor, selecione o tipo' }]}
                >
                  <Select placeholder="Selecione o tipo">
                    <Option value="task">Tarefa</Option>
                    <Option value="milestone">Marco</Option>
                    <Option value="project">Projeto</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Categoria"
                  rules={[{ required: true, message: 'Por favor, selecione a categoria' }]}
                >
                  <Select placeholder="Selecione a categoria">
                    <Option value={TaskCategory.Melhoria}>Melhoria</Option>
                    <Option value={TaskCategory.Desenvolvimento}>Desenvolvimento</Option>
                    <Option value={TaskCategory.Correcao}>Correção</Option>
                    <Option value={TaskCategory.Hotfix}>Hotfix</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="teamId"
                  label="Equipe"
                  rules={[{ required: false }]}
                >
                  <Select placeholder="Selecione a equipe">
                    {teams.map((team) => (
                      <Option key={team.id} value={team.id}>{team.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="progress"
                  label={isProjectType ? "Progresso (%) - Calculado" : "Progresso (%)"}
                  rules={!isProjectType ? [
                    {
                      validator: (_, value) => {
                        if (value === null || value === undefined || value === '') {
                          return Promise.resolve();
                        }
                        const numValue = Number(value);
                        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
                          return Promise.reject(new Error('O progresso deve estar entre 0 e 100%'));
                        }
                        return Promise.resolve();
                      }
                    }
                  ] : []}
                >
                  <Input
                    type="number"
                    placeholder="0-100"
                    min={0}
                    max={100}
                    disabled={isProjectType}
                    suffix={isProjectType ? `(${childTasks.length} tarefas)` : undefined}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label={isProjectType ? "Status - Baseado nos filhos" : "Status"}>
                  <Select
                    placeholder="Selecione o status"
                    disabled={isProjectType}
                  >
                    {statusColors.map((colorInfo) => (
                      <Option
                        key={colorInfo.status}
                        value={colorInfo.name}
                        data-status-id={colorInfo.status}
                      >
                        <Space>
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor: colorInfo.color,
                              borderRadius: 2,
                              display: 'inline-block'
                            }}
                          />
                          {colorInfo.name}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="Data de Início"
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label="Data de Fim"
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>

            {isProjectType && (
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={24}>
                  <Card size="small" title="Resumo do Projeto" style={{ backgroundColor: '#f9f9f9' }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Text strong>Total de Tarefas: </Text>
                        <Text>{childTasks.length}</Text>
                      </Col>
                      <Col span={8}>
                        <Text strong>Concluídas: </Text>
                        <Text>{childTasks.filter(t => t.status == 'Done' || t.status == TaskStatus.Done).length}</Text>
                      </Col>
                      <Col span={8}>
                        <Text strong>Em Progresso: </Text>
                        <Text>{childTasks.filter(t => t.status == 'InProgress' || t.status == TaskStatus.InProgress).length}</Text>
                      </Col>
                    </Row>
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        O progresso e status são calculados automaticamente baseados nas tarefas filhas.
                      </Text>
                    </div>
                  </Card>
                </Col>
              </Row>
            )}

          </Form>
        </TabPane>

        <TabPane tab="Dependências" key="dependencies">
          <Row gutter={16}>
            {/* Card de Dependências Predecessoras */}
            <Col span={12}>
              <Card
                size="small"
                title={
                  <Space>
                    <span style={{ color: '#ff7a00' }}>📥</span>
                    <Text strong style={{ color: '#ff7a00' }}>Predecessoras</Text>
                  </Space>
                }
                style={{ height: '100%' }}
              >
                <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: '12px' }}>
                  Tarefas que devem terminar antes desta começar
                </Text>

                <Space wrap style={{ width: '100%' }}>
                  {dependenciesWithTasks.length > 0 ? (
                    dependenciesWithTasks.map((dependency) => (
                      <Tag
                        key={dependency.id}
                        color="orange"
                        closable
                        onClose={() => handleRemoveDependency(dependency.id)}
                        style={{
                          marginBottom: 8,
                          padding: '4px 8px',
                          fontSize: '12px',
                          borderRadius: '12px'
                        }}
                      >
                        {dependency.predecessorTask?.title || 'Tarefa'}
                      </Tag>
                    ))
                  ) : (
                    <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '12px' }}>
                      Nenhuma dependência predecessora
                    </Text>
                  )}
                </Space>
              </Card>
            </Col>

            {/* Card de Dependências Sucessoras */}
            <Col span={12}>
              <Card
                size="small"
                title={
                  <Space>
                    <span style={{ color: '#1890ff' }}>📤</span>
                    <Text strong style={{ color: '#1890ff' }}>Sucessoras</Text>
                  </Space>
                }
                style={{ height: '100%' }}
              >
                <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: '12px' }}>
                  Tarefas que dependem desta ser concluída
                </Text>

                <Space wrap style={{ width: '100%' }}>
                  {successorDependenciesWithTasks.length > 0 ? (
                    successorDependenciesWithTasks.map((dependency) => (
                      <Tag
                        key={dependency.id}
                        color="blue"
                        closable
                        onClose={() => handleRemoveDependency(dependency.id)}
                        style={{
                          marginBottom: 8,
                          padding: '4px 8px',
                          fontSize: '12px',
                          borderRadius: '12px'
                        }}
                      >
                        {dependency.successorTask?.title || 'Tarefa'}
                      </Tag>
                    ))
                  ) : (
                    <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '12px' }}>
                      Nenhuma dependência sucessora
                    </Text>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Tasks" key="tasks">
          {/* TasksPeriods Table */}
          <TasksPeriodsTab task={task} />
        </TabPane>
      </Tabs>
    </Modal>

  )
}
