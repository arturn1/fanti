import { ProjectVersionDto } from '@/components/ProjectsDashboard';
import { Button, DatePicker, Form, Input, List, Modal, Popconfirm, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

interface VersionModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  versions: ProjectVersionDto[];
  onCreate: (version: string, date: any) => Promise<void>;
  onEdit: (id: string, version: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function VersionModal({ open, onClose, projectId, versions, onCreate, onEdit, onDelete }: VersionModalProps) {
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingVersion, setEditingVersion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onCreate(values.version, values.date.toISOString());
      form.resetFields();
      message.success('Versão adicionada!');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editingVersion) return;
    setLoading(true);
    await onEdit(id, editingVersion);
    setEditingId(null);
    setEditingVersion('');
    setLoading(false);
    message.success('Versão editada!');
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await onDelete(id);
    setLoading(false);
    message.success('Versão excluída!');
  };

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setEditingVersion('');
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Gerenciar Versões"
      footer={null}
      width={600}

      destroyOnClose
    >
      <Form form={form} layout="inline" onFinish={handleCreate} style={{ marginBottom: 16 }}>
        <Form.Item name="version" rules={[{ required: true, message: 'Informe a versão' }]}>
          <Input placeholder="Versão" maxLength={32} />
        </Form.Item>
        <Form.Item name="date" rules={[{ required: true, message: 'Informe a data' }]}>
          <DatePicker format="DD/MM/YYYY" style={{ minWidth: 120 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>Adicionar</Button>
        </Form.Item>
      </Form>
      <List
        size="small"
        header={<b>Versões anteriores</b>}
        dataSource={versions.sort((a, b) => new Date(b.deployDate).getTime() - new Date(a.deployDate).getTime())}
        renderItem={item => (
          <List.Item
            actions={[
              editingId === item.id ? (
                <>
                  <Button size="small" type="link" onClick={() => handleEdit(item.id)} loading={loading}>Salvar</Button>
                  <Button size="small" type="link" onClick={() => { setEditingId(null); setEditingVersion(''); }}>Cancelar</Button>
                </>
              ) : (
                <>
                  <Button size="small" type="link" onClick={() => { setEditingId(item.id); setEditingVersion(item.version); }}>Editar</Button>
                  <Popconfirm title="Excluir versão?" onConfirm={() => handleDelete(item.id)} okText="Sim" cancelText="Não">
                    <Button size="small" type="link" danger loading={loading}>Excluir</Button>
                  </Popconfirm>
                </>
              )
            ]}
          >
            {editingId === item.id ? (
              <Input
                value={editingVersion}
                onChange={e => setEditingVersion(e.target.value)}
                style={{ width: 120 }}
                maxLength={32}
              />
            ) : (
              <span>
                <b>{item.version}</b> <span style={{ color: '#888' }}>({dayjs(item.deployDate).format('DD/MM/YYYY')})</span>
              </span>
            )}
          </List.Item>
        )}
      />
    </Modal>
  );
}
