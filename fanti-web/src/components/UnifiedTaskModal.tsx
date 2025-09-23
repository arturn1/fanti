'use client';

// import { taskAssignmentsService } from '@/services/taskAssignments';
// import { taskDependenciesService } from '@/services/taskDependencies';
// import { tasksService } from '@/services/tasks';
// import { usersService } from '@/services/users';
import { AssignmentRole, getTaskStatusByDisplayName, getTaskStatusDisplayName, getTaskStatusName, Project, Sprint, Task, TaskAssignment, TaskDependency, TaskStatus, User } from '@/types';
import { getAllStatusColors } from '@/utils/taskColors';
import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  List,
  Modal,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Typography
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

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
  const [assignmentsWithUsers, setAssignmentsWithUsers] = useState<(TaskAssignment & { user: User })[]>([]);
  const [dependenciesWithTasks, setDependenciesWithTasks] = useState<(TaskDependency & { predecessorTask: Task })[]>([]);
  const [successorDependenciesWithTasks, setSuccessorDependenciesWithTasks] = useState<(TaskDependency & { successorTask: Task })[]>([]);
  const [currentTab, setCurrentTab] = useState(activeTab);

  const statusColors = getAllStatusColors();

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
        isCompleted: isDone
      });
      // Carregar atribuições e dependências via API interna
      const [assignmentsRes, dependenciesRes, allDependenciesRes] = await Promise.all([
        fetch(`/api/taskAssignments?taskId=${task.id}`),
        fetch(`/api/taskDependencies?taskId=${task.id}`),
        fetch('/api/taskDependencies')
      ]);
      const [assignmentsData, dependenciesData, allDependencies] = await Promise.all([
        assignmentsRes.json(),
        dependenciesRes.json(),
        allDependenciesRes.json()
      ]);
      setAssignmentsWithUsers((assignmentsData?.data || []).map((assignment: TaskAssignment) => {
        const user = users.find((u: User) => u.id === assignment.userId);
        return { ...assignment, user: user! };
      }));
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
        title: values.name,
        description: values.description,
        status: backendStatus,
        progress: values.progress,
        projectId: values.projectId,
        sprintId: values.sprintId,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD')
      };
      const res = await fetch(`/api/tasks?id=${task?.id}`, {
        method: 'PATCH',
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

  const handleAssignUser = async (userId: string) => {
    if (!task) return;
    try {
      const res = await fetch('/api/taskAssignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          userId,
          role: AssignmentRole.Assignee
        })
      });
      if (res.ok) {
        const updatedRes = await fetch(`/api/taskAssignments?taskId=${task.id}`);
        const updatedAssignments = await updatedRes.json();
        setAssignmentsWithUsers((updatedAssignments?.data || []).map((assignment: TaskAssignment) => {
          const user = users.find((u: User) => u.id === assignment.userId);
          return { ...assignment, user: user! };
        }));
        message.success('Usuário atribuído com sucesso!');
      } else {
        message.error('Erro ao atribuir usuário');
      }
    } catch (error) {
      console.error('Erro ao atribuir usuário:', error);
      message.error('Erro ao atribuir usuário');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const res = await fetch(`/api/taskAssignments?id=${assignmentId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const updatedRes = await fetch(`/api/taskAssignments?taskId=${task!.id}`);
        const updatedAssignments = await updatedRes.json();
        setAssignmentsWithUsers((updatedAssignments?.data || []).map((assignment: TaskAssignment) => {
          const user = users.find((u: User) => u.id === assignment.userId);
          return { ...assignment, user: user! };
        }));
        message.success('Atribuição removida com sucesso!');
      } else {
        message.error('Erro ao remover atribuição');
      }
    } catch (error) {
      console.error('Erro ao remover atribuição:', error);
      message.error('Erro ao remover atribuição');
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

  const availableUsers = users.filter(user =>
    !assignmentsWithUsers.some(assignment => assignment.userId === user.id)
  );

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

        <TabPane tab="Equipe" key="team">
          <Card size="small" style={{ marginBottom: 16 }}>
            <Title level={5}>
              <UserOutlined /> Atribuir Usuário
            </Title>
            <Select
              placeholder="Selecione um usuário para atribuir"
              style={{ width: '100%' }}
              onSelect={(value: string | undefined) => {
                if (value) handleAssignUser(value);
              }}
              value={undefined}
            >
              {availableUsers.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.name} - {user.email}
                </Option>
              ))}
            </Select>
          </Card>

          <Card size="small">
            <Title level={5}>Equipe Atribuída</Title>
            <List
              dataSource={assignmentsWithUsers}
              renderItem={(assignment) => (
                <List.Item
                  actions={[
                    <Button
                      key="remove"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveAssignment(assignment.id)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={<UserOutlined />}
                    title={assignment.user?.name || 'Usuário'}
                    description={assignment.user?.email}
                  />
                  <Tag>{assignment.user?.role}</Tag>
                </List.Item>
              )}
              locale={{ emptyText: 'Nenhum usuário atribuído' }}
            />
          </Card>
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
      </Tabs>
    </Modal>
  );
};
