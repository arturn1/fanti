import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { Sprint, Project, SprintStatus, Task, TaskType } from '@/types';
import dayjs from 'dayjs';
const { RangePicker } = DatePicker;


const { Option } = Select;
const { TextArea } = Input;

interface EditSprintModalProps {
    sprint: Sprint | null;
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditSprintModal({
    sprint,
    visible,
    onClose,
    onSuccess
}: EditSprintModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        if (visible) {
            loadProjects();
        }
    }, [visible]);

    // Efeito separado para carregar dados do sprint
    useEffect(() => {
        if (visible && sprint && projects.length > 0) {

            // Converter status para garantir que seja um número
            let statusValue = sprint.status;
            if (typeof statusValue === 'string') {
                statusValue = parseInt(statusValue, 10) as SprintStatus;
            }
            const dateRange = sprint.startDate && sprint.endDate
                            ? [dayjs(sprint.startDate), dayjs(sprint.endDate)]
                            : undefined;

            const formValues = {
                projectId: sprint.projectId,
                name: sprint.name,
                description: sprint.description || '',
                dateRange: dateRange,
                goal: sprint.goal || '',
                status: statusValue,
            };

            // Resetar e definir valores
            form.resetFields();
            form.setFieldsValue(formValues);

            // Verificar se os valores foram definidos
            setTimeout(() => {
            }, 200);
        }
    }, [visible, sprint, projects, form]);

    const loadProjects = async () => {
        try {
            const projectsData = await fetch('/api/projects').then(res => res.json())
                .then(data => data.data as Project[]);
            setProjects(projectsData);
        } catch (error) {
            message.error('Erro ao carregar projetos');
        }
    };

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

            await fetch(`/api/sprints`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sprintData),
            });

            const allTasks: Task[] = await fetch(`/api/tasks?sprintId=${sprint.id}`).then(res => res.json())
                .then(data => data.data as Task[]);

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
            const res = await fetch(`/api/tasks/${task?.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            message.success('Sprint atualizada com sucesso!');
            onSuccess();
            form.resetFields();
        } catch (error) {
            console.error('Error ao atualizar sprint:', error);
            message.error('Erro ao atualizar sprint');
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
            title="Editar Sprint"
            open={visible}
            onCancel={handleCancel}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={600}
            destroyOnClose={true}
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
                        {projects.map(project => (
                            <Option key={project.id} value={project.id}>
                                {project.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Nome do Sprint"
                    rules={[{ required: true, message: 'Digite o nome do sprint' }]}
                >
                    <Input
                        placeholder="Ex: Sprint 1"
                        onChange={(e) => console.log('Nome alterado:', e.target.value)}
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
