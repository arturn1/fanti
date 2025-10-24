'use client';

import { Sprint, SprintStatus } from '@/types';
import type { ProductData as ProductDataType } from '@/utils/productCalculations';
import { parseSprintStatus } from '@/utils/productCalculations';
import { CheckCircleOutlined, ClockCircleOutlined, DeleteOutlined, EditOutlined, PauseCircleOutlined, PlayCircleOutlined, ProjectOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Modal, Popconfirm, Row, Select, Space, Table, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';

interface MilestonesModalProps {
  open: boolean;
  onClose: () => void;
  selectedProduct: ProductDataType | null;
  milestoneSearchText: string;
  setMilestoneSearchText: (s: string) => void;
  milestoneStatusFilter: string;
  setMilestoneStatusFilter: (s: string) => void;
  onEditMilestone: (sprint: Sprint) => void;
  onDeleteMilestone: (sprintId: string) => void;
  getFilteredMilestones: () => any[];
  getSprintStatusName: (status: SprintStatus) => string;
}

export default function MilestonesModal({
  open,
  onClose,
  selectedProduct,
  milestoneSearchText,
  setMilestoneSearchText,
  milestoneStatusFilter,
  setMilestoneStatusFilter,
  onEditMilestone,
  onDeleteMilestone,
  getFilteredMilestones,
  getSprintStatusName
}: MilestonesModalProps) {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ProjectOutlined />
          <span>Milestones - {selectedProduct?.project.name}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 20 }}
    >
      {selectedProduct && (
        <>
          {/* Filtros do Modal */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12}>
              <Input
                placeholder="Buscar milestone por nome..."
                prefix={<SearchOutlined />}
                value={milestoneSearchText}
                onChange={(e) => setMilestoneSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filtrar por status"
                value={milestoneStatusFilter}
                onChange={setMilestoneStatusFilter}
              >
                <Select.Option value="all">Todos os Status</Select.Option>
                <Select.Option value="1">Planejamento</Select.Option>
                <Select.Option value="2">Ativo</Select.Option>
                <Select.Option value="3">Testando</Select.Option>
                <Select.Option value="4">Concluído</Select.Option>
              </Select>
            </Col>
          </Row>

          {/* Tabela de Milestones */}
          <Table
            dataSource={getFilteredMilestones()}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 800 }}
            columns={[
              {
                title: 'Nome',
                dataIndex: 'name',
                key: 'name',
                width: 200,
                ellipsis: true,
              },
              {
                title: 'Descrição',
                dataIndex: 'description',
                key: 'description',
                ellipsis: true,
                render: (text: any) => text || '-'
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                width: 120,
                align: 'center',
                render: (status: any) => {
                  const sprintStatus = parseSprintStatus(status);
                  let color = 'default';
                  let icon = <ClockCircleOutlined />;

                  switch (sprintStatus) {
                    case SprintStatus.Planning:
                      color = 'default';
                      icon = <ClockCircleOutlined />;
                      break;
                    case SprintStatus.Active:
                      color = 'processing';
                      icon = <PlayCircleOutlined />;
                      break;
                    case SprintStatus.Testing:
                      color = 'warning';
                      icon = <PauseCircleOutlined />;
                      break;
                    case SprintStatus.Completed:
                      color = 'success';
                      icon = <CheckCircleOutlined />;
                      break;
                  }

                  return (
                    <Tag color={color} icon={icon}>
                      {getSprintStatusName(sprintStatus)}
                    </Tag>
                  );
                }
              },
              {
                title: 'Data Início',
                dataIndex: 'startDate',
                key: 'startDate',
                width: 120,
                render: (date: any) => dayjs(date).format('DD/MM/YYYY')
              },
              {
                title: 'Data Fim',
                dataIndex: 'endDate',
                key: 'endDate',
                width: 120,
                render: (date: any) => dayjs(date).format('DD/MM/YYYY')
              },
              {
                title: 'Ações',
                key: 'actions',
                width: 120,
                align: 'center',
                render: (_: any, record: any) => (
                  <Space>
                    <Tooltip title="Editar">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => onEditMilestone(record)}
                      />
                    </Tooltip>
                    <Popconfirm
                      title="Confirmar exclusão"
                      description="Tem certeza que deseja excluir este milestone?"
                      onConfirm={() => onDeleteMilestone(record.id)}
                      okText="Sim"
                      cancelText="Não"
                    >
                      <Tooltip title="Excluir">
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Tooltip>
                    </Popconfirm>
                  </Space>
                )
              }
            ]}
          />
        </>
      )}
    </Modal>
  );
}
