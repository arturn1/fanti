'use client';

import {  CreateTaskCommand, Task, TaskCategory, Team } from '@/types';
import { getAllStatusColors } from '@/utils/taskColors';
import {
  App,
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
const { RangePicker } = DatePicker;

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

const { Option } = Select;
const { TextArea } = Input;

interface CreateSubtaskModalProps {
  parentTask: Task | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateSubtaskModal: React.FC<CreateSubtaskModalProps> = ({
  parentTask,
  visible,
  onClose,
  onSuccess
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const teams = useTeams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        status: 0,
        type: "task",
      });
    }
  }, [visible, form]);

  const handleSubmit = async (values: any) => {
    if (!parentTask) return;

    try {
      setLoading(true);
      const taskData: CreateTaskCommand = {
        ProjectId: parentTask.projectId,
        SprintId: parentTask.sprintId,
        ParentTaskId: parentTask.id,
        Title: values.title,
        Description: values.description || '',
        Status: values.status,
        Type: values.type,
        Category: values.category,
        StartDate: values.dateRange ? values.dateRange[0].toISOString() : new Date().toISOString(),
        EndDate: values.dateRange ? values.dateRange[1].toISOString() : "",
        Progress: 0,
        TeamId: values.teamId,
      };
      await fetch(`/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      message.success('Subtarefa criada com sucesso!');
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error('Erro ao criar subtarefa');
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
      title="Criar Subtarefa"
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
          Criar Subtarefa
        </Button>,
      ]}
      width={600}
      destroyOnHidden
    >
      {parentTask && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
          <Space direction="vertical" size="small">
            <strong>🎯 Tarefa Pai: {parentTask.title}</strong>
            <div style={{ fontSize: '12px', color: '#666' }}>
              A subtarefa herdará automaticamente o projeto e sprint da tarefa pai
            </div>
          </Space>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="title"
          label="Título"
          rules={[{ required: true, message: 'Por favor, informe o título da subtarefa' }]}
        >
          <Input placeholder="Digite o título da subtarefa" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição"
        >
          <TextArea
            placeholder="Digite a descrição da subtarefa"
            rows={3}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Por favor, selecione o status' }]}
        >
          <Select placeholder="Selecione o status">
            {getAllStatusColors().map(({ status, name }) => (
              <Option key={status} value={status}>
                {name}
              </Option>
            ))}
          </Select>
        </Form.Item>


        <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
          <Form.Item
            name="type"
            label="Tipo"
            style={{ flex: 1, marginRight: 8 }}
            rules={[{ required: true, message: 'Por favor, selecione o tipo' }]}
          >
            <Select placeholder="Selecione o tipo">
              <Option value="task">Tarefa</Option>
              <Option value="milestone">Marco</Option>
              <Option value="project">Projeto</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="category"
            label="Categoria"
            style={{ flex: 1, marginRight: 8 }}
            rules={[{ required: true, message: 'Por favor, selecione a categoria' }]}
          >
            <Select placeholder="Selecione a categoria">
              <Option value={TaskCategory.Improvement}>Melhoria</Option>
              <Option value={TaskCategory.Development}>Desenvolvimento</Option>
              <Option value={TaskCategory.BugFix}>Correção</Option>
              <Option value={TaskCategory.Hotfix}>Hotfix</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="teamId"
            label="Equipe"
            style={{ flex: 1 }}
            rules={[]}
          >
            <Select placeholder="Selecione a equipe">
              {teams.map((team) => (
                <Option key={team.id} value={team.id}>{team.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Space.Compact>

        <Space.Compact style={{ display: 'flex', marginBottom: 16 }}>
          <Form.Item
            name="dateRange"
            label="Período do Produto (Opcional)"
            style={{ flex: 1, marginRight: 8 }}
          >
            <RangePicker
              style={{ width: '100%', flex: 1 }}
              format="DD/MM/YYYY"
              placeholder={['Data de início', 'Data de fim']}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
        </Space.Compact>
      </Form>
    </Modal>
  );
};
