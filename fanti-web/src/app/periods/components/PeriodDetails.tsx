import { Descriptions, Typography, Tag, Table, Collapse, Progress, Space } from 'antd';
import dayjs from 'dayjs';
import { Staff, Period, PeriodStaff, TasksPeriod, Project } from '../../../types';

const { Text } = Typography;

interface PeriodDetailsProps {
  period: Period & { staffs?: Staff[] };
  periodStaffs: PeriodStaff[];
  tasksPeriod: TasksPeriod[];
  projects: Project[];
}

export default function PeriodDetails({ period, periodStaffs, tasksPeriod, projects }: PeriodDetailsProps) {
  // Get all periodStaffs for this period
  const periodStaffsForPeriod = periodStaffs.filter(ps => ps.periodId === period.id);

  // Helper to get all tasks for a periodStaff
  const getTasksForPeriodStaff = (periodStaffId: string) =>
    tasksPeriod.filter(tp => tp.periodStaffId === periodStaffId);

  // Helper to get project name
  const getProjectName = (projectId: string | number | undefined) => {
    if (!projectId) return '-';
    return projects.find(p => String(p.id) === String(projectId))?.name || 'Projeto não encontrado';
  };

  // Métricas gerais do período
  const totalPeriodHours = periodStaffsForPeriod.reduce((sum, ps) => sum + ps.totalHours, 0);
  const assignedHours = periodStaffsForPeriod.reduce((sum, ps) => {
    const staffTasks = getTasksForPeriodStaff(ps.id);
    return sum + staffTasks.reduce((s, t) => s + t.taskHours, 0);
  }, 0);
  const remainingHours = totalPeriodHours - assignedHours;
  const utilizationPercentage = totalPeriodHours > 0 ? (assignedHours / totalPeriodHours) * 100 : 0;

  // Horas por projeto
  const projectHoursMap: Record<string, number> = {};
  periodStaffsForPeriod.forEach(ps => {
    getTasksForPeriodStaff(ps.id).forEach(tp => {
      if (tp.projectId) {
        const key = String(tp.projectId);
        if (!projectHoursMap[key]) projectHoursMap[key] = 0;
        projectHoursMap[key] += tp.taskHours;
      }
    });
  });
  const projectHours = Object.entries(projectHoursMap)
    .filter(([_, hours]) => typeof hours === 'number' && hours > 0)
    .map(([projectId, hours]) => {
      const project = projects.find(p => String(p.id) === projectId);
      return { projectId, projectName: project?.name || 'Projeto não encontrado', hours };
    });

  // Colaboradores para tabela
  const staffTableData = (period.staffs || []).map(staff => {
    const ps = periodStaffsForPeriod.find(ps => ps.staffId === staff.id);
    if (!ps) return null;
    const staffTasks = getTasksForPeriodStaff(ps.id);
    const totalAssigned = staffTasks.reduce((sum, t) => sum + t.taskHours, 0);
    return {
      key: staff.id,
      name: staff.name,
      total: ps.totalHours,
      assigned: totalAssigned,
      remaining: ps.totalHours - totalAssigned,
      tasks: staffTasks,
      psId: ps.id
    };
  }).filter(Boolean);

  const columns = [
    { title: 'Colaborador', dataIndex: 'name', key: 'name' },
    { title: 'Total (h)', dataIndex: 'total', key: 'total', align: 'center' as const },
    { title: 'Atribuídas (h)', dataIndex: 'assigned', key: 'assigned', align: 'center' as const },
    {
      title: 'Restantes (h)', dataIndex: 'remaining', key: 'remaining', align: 'center' as const,
      render: (v: number) => <Text type={v < 0 ? 'danger' : undefined}>{v}</Text>
    },
    {
      title: 'Utilização', key: 'util', align: 'center' as const,
      render: (_: any, record: any) => (
        <Progress percent={record.total > 0 ? Math.round((record.assigned / record.total) * 100) : 0} size="small" status={record.assigned > record.total ? 'exception' : 'normal'} />
      )
    }
  ];

  return (
    <div>
      <Descriptions title="Informações do Período" bordered column={2}>
        <Descriptions.Item label="Nome">{period.name}</Descriptions.Item>
        <Descriptions.Item label="Data de Início">{period.startDate ? dayjs(period.startDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
        <Descriptions.Item label="Data de Fim">{period.endDate ? dayjs(period.endDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
        <Descriptions.Item label="Horas Totais"><Text strong>{totalPeriodHours}h</Text></Descriptions.Item>
        <Descriptions.Item label="Horas Atribuídas"><Text strong type="secondary">{assignedHours}h</Text></Descriptions.Item>
        <Descriptions.Item label="Horas Restantes"><Text strong type={remainingHours < 0 ? 'danger' : undefined}>{remainingHours}h</Text></Descriptions.Item>
        <Descriptions.Item label="Utilização"><Progress percent={Math.round(utilizationPercentage)} size="small" status={utilizationPercentage > 100 ? 'exception' : 'normal'} /></Descriptions.Item>
      </Descriptions>

      <Descriptions title="Horas por Projeto" bordered column={1} style={{ marginTop: 24 }}>
        {projectHours.length > 0 ? (
          projectHours.map(ph => (
            <Descriptions.Item key={ph.projectId} label={ph.projectName}>
              <Text strong style={{ fontSize: '15px' }}>{Number(ph.hours)}h</Text>
            </Descriptions.Item>
          ))
        ) : (
          <Descriptions.Item label="Nenhum projeto com horas">-</Descriptions.Item>
        )}
      </Descriptions>

      <div style={{ marginTop: 32 }}>
        <Table
          columns={columns}
          dataSource={staffTableData}
          pagination={false}
          expandable={{
            expandedRowRender: (record: any) => {
              // Agrupa horas por projeto para este colaborador
              const projectHoursMap: Record<string, { name: string, hours: number }> = {};
              record.tasks.forEach((task: any) => {
                const projectId = String(task.projectId || '0');
                const projectName = getProjectName(task.projectId);
                if (!projectHoursMap[projectId]) {
                  projectHoursMap[projectId] = { name: projectName, hours: 0 };
                }
                projectHoursMap[projectId].hours += task.taskHours;
              });
              const projectHoursArr = Object.values(projectHoursMap).filter(ph => ph.hours > 0);
              return (
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                    {projectHoursArr.length > 0 ? projectHoursArr.map((ph, idx) => (
                      <Tag key={ph.name + idx} color="blue">
                        {ph.name}: {ph.hours}h
                      </Tag>
                    )) : <span>-</span>}
                  </div>
                </div>
              );
            },
            rowExpandable: (record: any) => record.tasks.length > 0
          }}
          style={{ marginTop: 16 }}
        />
      </div>
    </div>
  );
}
