'use client';

import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  message,
  Typography 
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Project, SprintStatus, CreateSprintCommand, CreateTaskDto, Sprint } from '@/types';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Text } = Typography;

interface CreateSprintModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateSprintModal({ visible, onClose, onSuccess }: CreateSprintModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // Carregar projetos disponíveis
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await fetch(`/api/projects`).then(res => res.json()).then(data => data?.data as Project[]);
        setProjects(projectsData);
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
      }
    };

    if (visible) {
      loadProjects();
    }
  }, [visible]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const sprintData: CreateSprintCommand = {
        projectId: values.projectId || "00000000-0000-0000-0000-000000000000", // GUID vazio se não selecionado
        name: values.name,
        description: values.description || "",
        goal: values.goal,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        status: "1", // String conforme esperado pelo comando
      };

      // Criar o sprint
      const createdSprint = await fetch(`/api/sprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sprintData)
      }).then(res => res.json()).then(data => data?.data as Sprint);

      if (!createdSprint) {
        throw new Error('Sprint não foi criado corretamente.');
      }
      
      // Criar automaticamente uma task do tipo "project" com os dados do sprint
      const taskData: CreateTaskDto = {
        ProjectId: values.projectId || "00000000-0000-0000-0000-000000000000",
        SprintId: createdSprint.id, // Usar o ID do sprint criado
        Title: values.name, // Nome do sprint como título da task
        Description: values.description ? 
          `Sprint: ${values.name}\n\nObjetivo: ${values.goal}\n\nDescrição: ${values.description}` :
          `Sprint: ${values.name}\n\nObjetivo: ${values.goal}`,
        Priority: "2", // Prioridade média
        Status: "1", // Status inicial (Backlog)
        Type: "project", // Tipo projeto (milestone)
        StartDate: values.dateRange[0].format('YYYY-MM-DD'),
        EndDate: values.dateRange[1].format('YYYY-MM-DD'),
        Progress: 0,
        Color: "#722ed1", // Cor roxa para sprints/milestones
        IsDisabled: false,
        HideChildren: false
      };

      // Criar a task do tipo projeto
      await fetch(`/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      
      message.success('Sprint e milestone criados com sucesso!');
      form.resetFields();
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Erro ao criar sprint:', error);
      message.error('Erro ao criar sprint. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Criar Nova Milestone"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
        <Text style={{ fontSize: 12, color: '#52c41a' }}>
          💡 <strong>Dica:</strong> Ao criar um sprint, uma task do tipo "projeto" (milestone) será automaticamente criada no Gantt com as mesmas informações.
        </Text>
      </div>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="projectId"
          label="Projeto (Opcional)"
        >
          <Select
            placeholder="Selecione o projeto (opcional)"
            loading={projects.length === 0}
            allowClear
          >
            {projects.map((project) => (
              <Select.Option key={project.id} value={project.id}>
                {project.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label="Nome da Milestone"
          rules={[{ required: true, message: 'Digite o nome da milestone' }]}
        >
          <Input placeholder="Ex: Milestone 1" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição"
        >
          <TextArea 
            rows={3} 
            placeholder="Descrição da milestone (opcional)"
          />
        </Form.Item>

        <Form.Item
          name="goal"
          label="Objetivo"
          rules={[{ required: true, message: 'Digite o objetivo da milestone' }]}
        >
          <TextArea 
            rows={2} 
            placeholder="Qual é o objetivo desta milestone?"
          />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Período da Milestone"
          rules={[{ required: true, message: 'Selecione o período da milestone' }]}
        >
          <RangePicker 
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder={['Data de início', 'Data de fim']}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            Cancelar
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>
            Criar Milestone
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
