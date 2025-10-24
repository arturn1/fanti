import { getSprintStatusLabel, Sprint, SprintStatus, Task } from '@/types';
import { DatePicker, Form, Input, message, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
const { RangePicker } = DatePicker;


const { Option } = Select;
const { TextArea } = Input;

interface EditSprintModalProps {
  sprint: Sprint | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  updateSprint: (sprintId: string, data: any) => Promise<Sprint>;
  updateTask: (taskId: string, data: any) => Promise<any>;
  getTasksBySprint: (sprintId: string) => Promise<Task[]>;
}

export default function EditSprintModal({
  sprint,
  visible,
  onClose,
  onSuccess,
  updateSprint,
  updateTask,
  getTasksBySprint
}: EditSprintModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sprint) {
      form.setFieldsValue({
        ...sprint,
        dateRange: [
          sprint.startDate ? dayjs(sprint.startDate) : null,
          sprint.endDate ? dayjs(sprint.endDate) : null
        ],
        status: getSprintStatusLabel(sprint.status)
      });
    }
  }, [sprint]);

  const handleSubmit = async (values: any) => {
    if (!sprint) return;

    try {
      setLoading(true);

      const sprintData = {
        id: sprint.id,
        projectId: values.projectId,
        name: values.name,
        description: values.description || '',
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        goal: values.goal || '',
        status: values.status.toString()
      };

      await updateSprint(sprint.id, sprintData);

      const allTasks: Task[] = await getTasksBySprint(sprint.id);

      const task: Task | undefined = allTasks.find(task => task.sprintId === sprint.id &&
        task.type == 'project'
      );

      const updateData = {
        title: values.name,
        description: values.description,
        progress: values.progress,
        projectId: values.projectId,
        sprintId: values.sprintId,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
      };

      await updateTask(task!.id, updateData);

      message.success('Sprint atualizada com sucesso!');
      onSuccess();
      form.resetFields();
    } catch (error) {
      message.error('Erro ao atualizar sprint');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    form.setFieldsValue(sprint)
    onClose();
  };

  return (
    <Modal
      title="Editar Sprint"
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
      destroyOnHidden={true}
      forceRender={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        preserve={false}
        key={`sprint-${sprint?.id || 'new'}-${visible}`}
      >
        <Form.Item
          name="projectId"
          label="Projeto"
          rules={[{ required: true, message: 'Selecione um projeto' }]}
        >
          <Select placeholder="Selecione um projeto" disabled>
            <Option key={sprint?.projectId} value={sprint?.projectId}>
              {sprint?.projectName}
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label="Nome do Sprint"
          rules={[{ required: true, message: 'Digite o nome do sprint' }]}
        >
          <Input
            placeholder="Ex: Sprint 1"
            disabled
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição"
        >
          <TextArea
            rows={3}
            placeholder="Descrição do sprint (opcional)"
          />
        </Form.Item>

        <Form.Item
          name="goal"
          label="Objetivo"
          rules={[{ required: true, message: 'Digite o objetivo do sprint' }]}
        >
          <TextArea
            rows={2}
            placeholder="Qual é o objetivo deste sprint?"
          />
        </Form.Item>

        <div style={{}}>
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
        </div>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Selecione o status' }]}
        >
          <Select placeholder="Selecione o status">
            <Option value={SprintStatus.Planning}>Planejamento</Option>
            <Option value={SprintStatus.Active}>Ativo</Option>
            <Option value={SprintStatus.Testing}>Revisão</Option>
            <Option value={SprintStatus.Completed}>Concluído</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}


