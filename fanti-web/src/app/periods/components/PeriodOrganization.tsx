"use client";
import React, { useRef } from 'react';
import { Button, Form, Input, Typography, Card, Select, InputNumber, Tag, Space, Row, Col, Tooltip, Table } from 'antd';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
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
    <div style={{ padding: 0, height: '100%', overflow: 'auto' }}>
      {/* Cards de colaboradores */}
      <div>
        {organizingPeriod.staffs?.map((staff: Staff) => {
          const data = organizationHook.orgData[staff.id];
          if (!data) return null;


          return (
            <Card key={staff.id} style={{ marginBottom: 14 }}

            >
              <Row gutter={10} align="middle" style={{ marginBottom: 18 }}>
                <Col flex="auto">
                  <Text strong style={{ fontSize: 18 }}>{staff.name}</Text>
                </Col>
                <Col>
                  <Text strong>Total:</Text>
                </Col>
                <Col>
                  <InputNumber
                    min={0}
                    value={data.totalHours}
                    onChange={v => updateTotalHours(staff.id, v ?? 0)}
                    style={{ width: 80 }}
                  />
                </Col>
                <Col>
                  <Tooltip title="Atualizar total de horas">
                    <Button
                      icon={<SyncOutlined style={{ fontSize: 13 }} />}
                      size="small"
                      shape="circle"
                      type="primary"
                      style={{ width: 22, height: 22, minWidth: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                      onClick={() => {
                        updateTotalHours(staff.id, organizationHook.editTotals?.[staff.id]);
                        if (typeof organizationHook.setEditTotals === 'function') {
                          organizationHook.setEditTotals((prev: any) => ({ ...prev, [staff.id]: undefined }));
                        }
                      }}
                    />
                  </Tooltip>
                </Col>
                <Col>
                  <Text type="secondary">Restantes:</Text>
                </Col>
                <Col>
                  <Input value={data.remaining} disabled style={{ width: 70, background: '#fafafa', color: '#222' }} />
                </Col>
              </Row>

              {/* Lista de Tasks agrupadas por projeto em Card e tabela */}

              <div style={{ marginBottom: 16, marginTop: 10 }}>
                {(() => {
                  const grouped: Record<string, TaskItem[]> = {};
                  data.tasks.forEach((task: TaskItem) => {
                    const key = String(task.projectId ?? '0');
                    if (!grouped[key]) grouped[key] = [];
                    grouped[key].push(task);
                  });
                  const rows: { project: string; number: string; hours: number; idx: number; task: TaskItem }[] = [];
                  Object.entries(grouped).forEach(([projectId, tasks]) => {
                    const projectName = projects.find(p => String(p.id) === projectId)?.name || 'Projeto não encontrado';
                    tasks.forEach((task, idx) => {
                      rows.push({ project: projectName, number: String(task.number ?? ''), hours: task.hours, idx: data.tasks.indexOf(task), task });
                    });
                  });
                  return (
                    <Table
                      size="small"
                      bordered
                      pagination={false}
                      dataSource={rows}
                      rowKey={r => `${r.project}-${r.number}-${r.idx}`}
                      columns={[
                        { title: 'Projeto', dataIndex: 'project', key: 'project', render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span> },
                        { title: 'Nº Task', dataIndex: 'number', key: 'number', align: 'center' as const },
                        { title: 'Horas', dataIndex: 'hours', key: 'hours', align: 'center' as const, render: (v: number, r) => <Tag color={getTaskColor(v)}>{v}h</Tag> },
                        {
                          title: '',
                          key: 'actions',
                          align: 'center' as const,
                          render: (_: any, r) => (
                            <Button size="small" danger type="text" onClick={() => removeTask(staff.id, r.idx)}>
                              Remover
                            </Button>
                          )
                        }
                      ]}
                      style={{ marginTop: 8 }}
                    />
                  );
                })()}
              </div>

              {/* Form para adicionar nova Task */}
              <Row gutter={10} align="middle" style={{ marginBottom: 2 }}>
                <Col>
                  <Text strong>Projeto:</Text>
                </Col>
                <Col>
                  <Select
                    style={{ minWidth: 150 }}
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
                </Col>
                <Col>
                  <Text strong>Nº Task:</Text>
                </Col>
                <Col>
                  <Input
                    style={{ width: 90 }}
                    value={organizationHook.newTaskInputs[staff.id]?.number || ''}
                    onChange={(e: any) => organizationHook.setNewTaskInputs((prev: any) => ({
                      ...prev,
                      [staff.id]: { ...prev[staff.id], number: e.target.value }
                    }))}
                  />
                </Col>
                <Col>
                  <Text strong>Horas:</Text>
                </Col>
                <Col>
                  <InputNumber
                    style={{ width: 70 }}
                    value={organizationHook.newTaskInputs[staff.id]?.hours || 0}
                    onChange={(v: number | null) => organizationHook.setNewTaskInputs((prev: any) => ({
                      ...prev,
                      [staff.id]: { ...prev[staff.id], hours: v || 0 }
                    }))}
                  />
                </Col>
                <Col flex="auto" />
                <Col style={{ textAlign: 'right' }}>
                  <Button
                    type="primary"
                    style={{ width: 90 }}
                    onClick={() => addTask(staff.id)}
                    disabled={
                      !organizationHook.newTaskInputs[staff.id]?.number ||
                      !organizationHook.newTaskInputs[staff.id]?.hours ||
                      !organizationHook.newTaskInputs[staff.id]?.projectId ||
                      data.remaining < (organizationHook.newTaskInputs[staff.id]?.hours || 0)
                    }
                  >
                    Adicionar
                  </Button>
                </Col>
              </Row>
            </Card>
          );
        })}
      </div>
    </div>
  );
}