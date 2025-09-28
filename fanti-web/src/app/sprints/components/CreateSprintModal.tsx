'use client';

import { CreateSprintCommand, CreateTaskCommand, Project, Sprint } from '@/types';
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Select,
  Typography
} from 'antd';
import { useEffect, useState } from 'react';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Text } = Typography;

interface CreateSprintModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: Project;
}

export default function CreateSprintModal({ visible, onClose, onSuccess, project }: CreateSprintModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const sprintData: CreateSprintCommand = {
        projectId: project.id,
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
      const taskData: CreateTaskCommand = {
        ProjectId: project.id,
        SprintId: createdSprint.id, // Usar o ID do sprint criado
        Title: values.name, // Nome do sprint como título da task
        Description: values.description ?
          `Sprint: ${values.name}\nObjetivo: ${values.goal}\nDescrição: ${values.description}` :
          `Sprint: ${values.name}\nObjetivo: ${values.goal}`,
        Status: 1, // Status inicial (Backlog)
        StartDate: values.dateRange[0].toISOString(),
        EndDate: values.dateRange[1].toISOString(),
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
        <Form.Item label="Projeto">
          <Input value={project ? project.name : ''} disabled />
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
