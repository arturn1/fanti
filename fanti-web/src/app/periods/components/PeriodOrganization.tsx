"use client";
import React from 'react';
import { Button, Form, Input, Typography, Card, Select, InputNumber, Tag, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Staff, Period, Project, TaskItem } from '../../../types';

const { Text } = Typography;
const { Option } = Select;

interface PeriodOrganizationProps {
  organizingPeriod: Period;
  projects: Project[];
  organizationHook: any;
  updateTotalHours: (staffId: string, value: number) => void;
  addTask: (staffId: string) => void;
  removeTask: (staffId: string, index: number) => void;
  getTaskColor: (hours: number) => string;
  onBack: () => void;
}

export default function PeriodOrganization({
  organizingPeriod,
  projects,
  organizationHook,
  updateTotalHours,
  addTask,
  removeTask,
  getTaskColor,
  onBack
}: PeriodOrganizationProps) {
  return (
    <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>
      {/* Header com botão voltar */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ marginBottom: 16 }}
        >
          Voltar para Períodos
        </Button>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Organização do Período: {organizingPeriod.name}
        </Typography.Title>
      </div>

      {/* Cards de colaboradores */}
      <div>
        {organizingPeriod.staffs?.map((staff: Staff) => {
          const data = organizationHook.orgData[staff.id];
          if (!data) return null;

          return (
            <Card key={staff.id} style={{ marginBottom: 16 }}>
              <Typography.Title level={4}>{staff.name}</Typography.Title>

              {/* Total de Horas e Horas Restantes */}
              <Form layout="inline" style={{ marginBottom: 16 }}>
                <Form.Item label="Total de Horas">
                  <InputNumber value={data.totalHours} onChange={(v) => updateTotalHours(staff.id, v || 0)} />
                </Form.Item>
                <Form.Item label="Horas Restantes">
                  <Input value={data.remaining} disabled />
                </Form.Item>
              </Form>

              {/* Lista de Tasks */}
              <div style={{ marginBottom: 16 }}>
                <Typography.Text strong style={{ marginBottom: 8, display: 'block' }}>Tasks Atribuídas:</Typography.Text>
                <Space wrap>
                  {data.tasks.map((task: TaskItem, index: number) => {
                    const projectName = projects.find(p => p.id === task.projectId)?.name || 'Projeto não encontrado';
                    return (
                      <Tag key={task.id || index} closable onClose={() => removeTask(staff.id, index)} color={getTaskColor(task.hours)}>
                        Task {task.number} ({projectName}): {task.hours}h
                      </Tag>
                    );
                  })}
                </Space>
              </div>

              {/* Form para adicionar nova Task */}
              <Form layout="inline">
                <Form.Item label="Projeto">
                  <Select
                    style={{ minWidth: 180 }}
                    placeholder="Selecione o projeto"
                    value={organizationHook.newTaskInputs[staff.id]?.projectId || undefined}
                    onChange={(projectId: string) => organizationHook.setNewTaskInputs((prev: any) => ({
                      ...prev,
                      [staff.id]: { ...prev[staff.id], projectId }
                    }))}
                  >
                    {projects.map(project => (
                      <Option key={project.id} value={project.id}>{project.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Número da Task">
                  <Input
                    style={{ width: 120 }}
                    value={organizationHook.newTaskInputs[staff.id]?.number || ''}
                    onChange={(e: any) => organizationHook.setNewTaskInputs((prev: any) => ({
                      ...prev,
                      [staff.id]: { ...prev[staff.id], number: e.target.value }
                    }))}
                  />
                </Form.Item>
                <Form.Item label="Horas">
                  <InputNumber
                    style={{ width: 100 }}
                    value={organizationHook.newTaskInputs[staff.id]?.hours || 0}
                    onChange={(v: number | null) => organizationHook.setNewTaskInputs((prev: any) => ({
                      ...prev,
                      [staff.id]: { ...prev[staff.id], hours: v || 0 }
                    }))}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    onClick={() => addTask(staff.id)}
                    disabled={
                      !organizationHook.newTaskInputs[staff.id]?.number ||
                      !organizationHook.newTaskInputs[staff.id]?.hours ||
                      !organizationHook.newTaskInputs[staff.id]?.projectId ||
                      data.remaining < (organizationHook.newTaskInputs[staff.id]?.hours || 0)
                    }
                  >
                    Adicionar Task
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          );
        })}
      </div>
    </div>
  );
}