'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Project, ProjectStatus, UpdateProjectCommand } from '@/types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface EditProjectModalProps {
  visible: boolean;
  project: Project | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProjectModal({ visible, project, onClose, onSuccess }: EditProjectModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Função para converter status do backend para enum
  const parseProjectStatus = (status: ProjectStatus | string): ProjectStatus => {
    if (typeof status === 'string') {
      const statusNumber = parseInt(status);
      return statusNumber as ProjectStatus;
    }
    return status;
  };

  // Preencher formulário quando projeto for selecionado
  useEffect(() => {
    if (visible && project) {
      const dateRange = project.startDate && project.endDate
        ? [dayjs(project.startDate), dayjs(project.endDate)]
        : undefined;

      form.setFieldsValue({
        name: project.name,
        description: project.description,
        url: project.url,
        status: parseProjectStatus(project.status), // Converter status para enum
        dateRange: dateRange,
      });
    }
  }, [visible, project, form]);

  const handleSubmit = async (values: any) => {
    if (!project) return;

    try {
      setLoading(true);

      // Criar comando de atualização
      const updateData: UpdateProjectCommand = {
        id: project.id,
        name: values.name,
        description: values.description || "",
        url: values.url || "",
        startDate: values.dateRange ? values.dateRange[0].format('YYYY-MM-DD') : "",
        endDate: values.dateRange ? values.dateRange[1].format('YYYY-MM-DD') : "",
        status: values.status.toString(),
        ownerId: project.ownerId || "00000000-0000-0000-0000-000000000000"
      };

      await fetch(`/api/projects`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      message.success('Produto atualizado com sucesso!');
      form.resetFields();
      onSuccess();

    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      message.error('Erro ao atualizar produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const statusOptions = [
    { value: ProjectStatus.Active, label: 'Ativo' },
    { value: ProjectStatus.Completed, label: 'Concluído' },
    { value: ProjectStatus.OnHold, label: 'Em Pausa' },
    { value: ProjectStatus.Cancelled, label: 'Cancelado' },
  ];

  return (
    <Modal
      title="Editar Produto"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label="Nome do Produto"
          rules={[
            { required: true, message: 'Digite o nome do produto' },
            { min: 3, message: 'Nome deve ter pelo menos 3 caracteres' }
          ]}
        >
          <Input placeholder="Ex: Sistema de E-commerce" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição"
        >
          <TextArea
            rows={3}
            placeholder="Descreva os objetivos e escopo do produto..."
          />
        </Form.Item>

        <Form.Item
          name="url"
          label="URL do Produto (Opcional)"
        >
          <Input
            placeholder="https://exemplo.com"
            type="url"
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Selecione o status' }]}
        >
          <Select placeholder="Selecione o status">
            {statusOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Período do Produto"
        >
          <RangePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder={['Data de início', 'Data de fim']}
          />
        </Form.Item>

        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            Cancelar
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<EditOutlined />}
          >
            Atualizar Produto
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
