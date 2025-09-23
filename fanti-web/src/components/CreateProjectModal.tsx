'use client';

import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  message 
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProjectStatus, CreateProjectCommand } from '@/types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectModal({ visible, onClose, onSuccess }: CreateProjectModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Formato esperado pelo backend CreateProjectsCommand
      const projectData: CreateProjectCommand = {
        name: values.name,
        description: values.description || "",
        url: values.url || "",
        startDate: values.dateRange ? values.dateRange[0].format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
        endDate: values.dateRange ? values.dateRange[1].format('YYYY-MM-DD') : "",
        status: "1", // String conforme esperado pelo comando
        ownerId: "00000000-0000-0000-0000-000000000000" // GUID vazio como padrão
      };

      await fetch(`/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      
      message.success('Produto criado com sucesso!');
      form.resetFields();
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      message.error('Erro ao criar produto. Tente novamente.');
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
      title="Criar Novo Produto"
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
          rules={[
            { required: true, message: 'Digite a descrição do produto' }
          ]}
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
          name="dateRange"
          label="Período do Produto (Opcional)"
        >
          <RangePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder={['Data de início', 'Data de fim']}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
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
            icon={<PlusOutlined />}
          >
            Criar Produto
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
