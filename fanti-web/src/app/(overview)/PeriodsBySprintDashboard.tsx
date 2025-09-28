import { Period, PeriodStaff, Task, TasksPeriod } from '@/types';
import { Card, Col, Row, Select, Spin, Typography } from 'antd';
import { ArcElement, BarElement, CategoryScale, Chart, Title as ChartTitle, Tooltip as ChartTooltip, Legend, LinearScale, LineElement, PointElement } from 'chart.js';
import { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

Chart.register(CategoryScale, LinearScale, BarElement, ChartTitle, ChartTooltip, Legend, ArcElement, PointElement, LineElement);

const { Title } = Typography;

export default function PeriodsBySprintDashboard() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [periodStaffs, setPeriodStaffs] = useState<PeriodStaff[]>([]);
  const [tasksPeriod, setTasksPeriod] = useState<TasksPeriod[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | undefined>();
  const [staffs, setStaffs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [periodsRes, periodStaffsRes, tasksPeriodRes, tasksRes, staffsRes] = await Promise.all([
          fetch('/api/periods'),
          fetch('/api/periodStaff'),
          fetch('/api/tasksPeriod'),
          fetch('/api/tasks'),
          fetch('/api/staff'),
        ]);
        const [periodsJson, periodStaffsJson, tasksPeriodJson, tasksJson, staffsJson] = await Promise.all([
          periodsRes.json(),
          periodStaffsRes.json(),
          tasksPeriodRes.json(),
          tasksRes.json(),
          staffsRes.json(),
        ]);
        setPeriods(periodsJson?.data || []);
        setPeriodStaffs(periodStaffsJson?.data || []);
        setTasksPeriod(tasksPeriodJson?.data || []);
        setTasks(tasksJson?.data || []);
        setStaffs(staffsJson?.data || []);
        if ((periodsJson?.data || []).length > 0) {
          setSelectedPeriodId(periodsJson.data[0].id);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filtrar PeriodStaffs do período selecionado
  const filteredPeriodStaffs = useMemo(() => periodStaffs.filter(ps => ps.periodId === selectedPeriodId), [periodStaffs, selectedPeriodId]);
  const periodStaffIds = useMemo(() => filteredPeriodStaffs.map(ps => ps.id), [filteredPeriodStaffs]);

  // Filtrar TasksPeriod do período selecionado
  const filteredTasksPeriod = useMemo(() => tasksPeriod.filter(tp => periodStaffIds.includes(tp.periodStaffId)), [tasksPeriod, periodStaffIds]);

  // Cálculo de horas totais e atribuídas
  const totalHours = useMemo(() => filteredTasksPeriod.reduce((sum, tp) => sum + (tp.taskHours || 0), 0), [filteredTasksPeriod]);
  // Horas atribuídas: considerar apenas TasksPeriod que têm projectId e periodStaffId definidos (ou ajuste conforme regra)
  const assignedHours = useMemo(() => filteredTasksPeriod.filter(tp => tp.projectId && tp.periodStaffId).reduce((sum, tp) => sum + (tp.taskHours || 0), 0), [filteredTasksPeriod]);

  // Horas por Staff
  const hoursByStaff: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTasksPeriod.forEach(tp => {
      const ps = periodStaffs.find(ps => ps.id === tp.periodStaffId);
      if (ps && ps.staffId) {
        map[ps.staffId] = (map[ps.staffId] || 0) + (tp.taskHours || 0);
      }
    });
    return map;
  }, [filteredTasksPeriod, periodStaffs]);

  // Horas por Projeto
  const hoursByProject: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTasksPeriod.forEach(tp => {
      if (tp.projectId) {
        map[tp.projectId] = (map[tp.projectId] || 0) + (tp.taskHours || 0);
      }
    });
    return map;
  }, [filteredTasksPeriod]);

  // Cálculo de métricas igual ao modal Detalhes do Período
  const totalPeriodHours = useMemo(() =>
    filteredPeriodStaffs.reduce((sum, ps) => sum + (ps.totalHours || 0), 0),
    [filteredPeriodStaffs]
  );
  const assignedPeriodHours = useMemo(() =>
    filteredTasksPeriod.reduce((sum, tp) => sum + (tp.taskHours || 0), 0),
    [filteredTasksPeriod]
  );
  const remainingPeriodHours = totalPeriodHours - assignedPeriodHours;
  const utilizationPercentage = totalPeriodHours > 0 ? (assignedPeriodHours / totalPeriodHours) * 100 : 0;

  const doughnutOptions = { cutout: '70%', plugins: { legend: { display: false } } };

  // Matriz de horas totais e atribuídas por staff (com nomes)
  const staffLabels = useMemo(() => filteredPeriodStaffs.map(ps => {
    const staff = staffs.find(s => s.id === ps.staffId);
    return staff ? staff.name : ps.staffId;
  }), [filteredPeriodStaffs, staffs]);
  const staffTotalHours = useMemo(() => filteredPeriodStaffs.map(ps => ps.totalHours || 0), [filteredPeriodStaffs]);
  const staffAssignedHours = useMemo(() => filteredPeriodStaffs.map(ps =>
    filteredTasksPeriod.filter(tp => tp.periodStaffId === ps.id).reduce((sum, tp) => sum + (tp.taskHours || 0), 0)
  ), [filteredPeriodStaffs, filteredTasksPeriod]);

  return (
    <Card style={{ minHeight: 400 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }} gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Title level={4} style={{ marginBottom: 0 }}>Análise de Horas por Período</Title>
        </Col>
        <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
          <Select
            value={selectedPeriodId}
            onChange={setSelectedPeriodId}
            style={{ minWidth: 200 }}
            loading={loading}
          >
            {periods.map(p => (
              <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
      {loading ? <Spin /> : (
        <Row gutter={[24, 24]} justify="center" align="top">
          <Col xs={24} md={8}>
            <Card title="Métricas de Horas do Período"
              size="small"
              style={{ padding: 16, minHeight: 400 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <b>Horas Totais no Período:</b> <span style={{ fontWeight: 600 }}>{totalPeriodHours}h</span>
                </div>
                <div>
                  <b>Horas Atribuídas:</b> <span style={{ fontWeight: 600, color: '#1890ff' }}>{assignedPeriodHours}h</span>
                </div>
                <div>
                  <b>Horas Restantes:</b> <span style={{ fontWeight: 600, color: remainingPeriodHours >= 0 ? '#52c41a' : '#ff4d4f' }}>{remainingPeriodHours}h</span>
                </div>
                <div>
                  <b>Taxa de Utilização:</b> <span style={{ fontWeight: 600, color: utilizationPercentage > 100 ? '#ff4d4f' : utilizationPercentage > 80 ? '#faad14' : '#52c41a' }}>{utilizationPercentage.toFixed(1)}%</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card title="Horas Totais x Atribuídas" size="small" style={{
              padding: 16, minHeight: 400, maxWidth: 380,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <Doughnut
                data={{
                  labels: ['Horas Atribuídas', 'Horas Restantes'],
                  datasets: [{
                    data: [assignedPeriodHours, remainingPeriodHours],
                    backgroundColor: ['#888', '#e0e7ef'], // 'Atribuídas' cinza sólido
                    borderColor: ['#7d8a97ff', '#d1d9e0ff'],
                    borderWidth: 2,
                  }],
                }}
                options={doughnutOptions}
              />
              {/* Labels customizados na parte de baixo */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, background: '#e0e7ef', display: 'inline-block', borderRadius: 4, border: '1px solid #b3c2d1' }} />
                  <span style={{ color: '#3a4a5a', fontWeight: 500 }}>Restantes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, background: '#888', display: 'inline-block', borderRadius: 4, border: '1px solid #e0e7ef' }} />
                  <span style={{ color: '#444', fontWeight: 500 }}>Atribuídas</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={10}>
            <Card title="Horas por Staff" size="small" style={{ padding: 16, minHeight: 400 }}>
              <Bar
                data={{
                  labels: staffLabels,
                  datasets: [
                    {
                      label: 'Atribuídas',
                      data: staffAssignedHours,
                      backgroundColor: '#888',
                      borderColor: '#888',
                      borderWidth: 2,
                      barPercentage: 0.7,
                      categoryPercentage: 0.7,
                    },
                    {
                      label: 'Total',
                      data: staffTotalHours,
                      backgroundColor: '#e0e7ef',
                      borderColor: '#b3c2d1',
                      borderWidth: 2,
                      barPercentage: 0.7,
                      categoryPercentage: 0.7,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: true } },
                  scales: {
                    x: { stacked: true },
                    y: { beginAtZero: true, stacked: false },
                  },
                }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </Card>
  );
}
