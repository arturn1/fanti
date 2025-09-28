'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  App,
} from 'antd';
import { Task, Project, Sprint, TaskStatus, TaskPriority, User, CreateTaskDto, getTaskStatusName, getTaskPriorityName, getTaskStatusDisplayName, getTaskStatusByDisplayName } from '@/types';
import { getAllStatusColors } from '@/utils/taskColors';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultProject?: string;
  defaultSprint?: string;
}

export default function CreateTaskModal({
  visible,
  onClose,
  onSuccess,
  defaultProject,
  defaultSprint,
}: CreateTaskModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(defaultProject);

  useEffect(() => {
    if (visible) {
      loadData();
      form.setFieldsValue({
        projectId: defaultProject,
        sprintId: defaultSprint,
        status: getTaskStatusDisplayName('ToDo'),
        priority: getTaskPriorityName(TaskPriority.Medium),
        type: "task",
      });
      setSelectedProject(defaultProject);
    }
  }, [visible, defaultProject, defaultSprint, form]);

  const loadData = async () => {
    try {
      const [projectsData, sprintsData, usersData] = await Promise.all([
        await fetch('/api/projects').then(res => res.json()).then(data => data?.data || []),
        await fetch('/api/sprints').then(res => res.json()).then(data => data?.data || []),
        await fetch('/api/users').then(res => res.json()).then(data => data?.data || []),
      ]);
      
      setProjects(projectsData);
      setSprints(sprintsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      message.error('Erro ao carregar dados');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const taskData: CreateTaskDto = {
        ProjectId: values.projectId,
        SprintId: values.sprintId,
        ParentTaskId: values.parentTaskId || undefined,
        AssigneeId: values.assignedUserId,
        Title: values.title,
        Description: values.description || '',
        Priority: values.priority,
        Status: getTaskStatusByDisplayName(values.status),
        Type: values.type,
        EstimatedHours: values.estimatedHours || 0,
        StartDate: values.startDate ? dayjs(values.startDate).format('YYYY-MM-DD') : undefined,
        EndDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : undefined,
        Progress: values.progress || 0,
        Color: undefined,
        IsDisabled: values.isDisabled || false,
        HideChildren: values.hideChildren || false,
      };
      await fetch(`/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      message.success('Tarefa criada com sucesso!');
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      message.error('Erro ao criar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Filtrar sprints baseado no projeto selecionado
  const availableSprints = sprints.filter(
    sprint => !selectedProject || sprint.projectId === selectedProject
  );

  return (
    <Modal
      title="Criar Nova Tarefa"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Criar Tarefa
        </Button>,
      ]}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="title"
          label="Título"
          rules={[{ required: true, message: 'Por favor, informe o título da tarefa' }]}
        >
          <Input placeholder="Digite o título da tarefa" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição"
        >
          <TextArea 
            placeholder="Digite a descrição da tarefa"
            rows={3}
          />
        </Form.Item>

        <Space.Compact style={{ display: 'flex', marginBottom: 16 }}>
          <Form.Item
            name="projectId"
            label="Projeto"
            style={{ flex: 1, marginRight: 8 }}
          >
            <Select
              placeholder="Selecione um projeto"
              onChange={setSelectedProject}
              allowClear
            >
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="sprintId"
            label="Sprint"
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Selecione uma sprint"
              disabled={!selectedProject}
              allowClear
            >
              {availableSprints.map(sprint => (
                <Option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Space.Compact>

        <Form.Item
          name="assignedUserId"
          label="Responsável"
        >
          <Select placeholder="Selecione um responsável" allowClear>
            {users.map(user => (
              <Option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Por favor, selecione o status' }]}
        >
          <Select placeholder="Selecione o status">
            {getAllStatusColors().map(({ status, name }) => (
              <Option key={status} value={getTaskStatusName(status)}>
                {name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label="Prioridade"
          rules={[{ required: true, message: 'Por favor, selecione a prioridade' }]}
        >
          <Select placeholder="Selecione a prioridade">
            <Option value={getTaskPriorityName(TaskPriority.Low)}>Baixa</Option>
            <Option value={getTaskPriorityName(TaskPriority.Medium)}>Média</Option>
            <Option value={getTaskPriorityName(TaskPriority.High)}>Alta</Option>
            <Option value={getTaskPriorityName(TaskPriority.Critical)}>Crítica</Option>
          </Select>
        </Form.Item>

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

        <Space.Compact style={{ display: 'flex', marginBottom: 16 }}>
          <Form.Item
            name="startDate"
            label="Data de Início"
            style={{ flex: 1, marginRight: 8 }}
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="Data de início"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Data de Fim"
            style={{ flex: 1 }}
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="Data de fim"
              format="DD/MM/YYYY"
            />
          </Form.Item>
        </Space.Compact>

                <Space.Compact style={{ width: '100%' }}>
          <Form.Item
            name="progress"
            label="Progresso (%)"
            style={{ flex: 1 }}
            rules={[
              { min: 0, max: 100, message: 'O progresso deve estar entre 0 e 100%' }
            ]}
          >
            <Input 
              type="number" 
              placeholder="0-100"
              min={0}
              max={100}
            />
          </Form.Item>
        </Space.Compact>

        <Form.Item
          name="estimatedHours"
          label="Horas Estimadas"
        >
          <Input 
            type="number" 
            placeholder="Horas estimadas"
            min={0}
            step="0.5"
          />
        </Form.Item>

        <Form.Item
          name="dueDate"
          label="Data de Vencimento"
        >
          <DatePicker 
            style={{ width: '100%' }}
            placeholder="Selecione a data de vencimento"
            format="DD/MM/YYYY"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
