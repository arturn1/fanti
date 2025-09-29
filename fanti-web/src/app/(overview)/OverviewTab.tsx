
import { Card, Spin } from 'antd';
import { useEffect, useState } from 'react';
import MilestonesDashboard from './MilestonesDashboard';
import PeriodsBySprintDashboard from './PeriodsBySprintDashboard';
import ProjectsDashboard from './ProjectsDashboard';

export default function OverviewTab() {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tasksPeriod, setTasksPeriod] = useState([]);
  const [periodStaffs, setPeriodStaffs] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [periods, setPeriods] = useState([]);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [projectsRes, sprintsRes, tasksRes, tasksPeriodRes, periodStaffsRes, staffsRes, periodsRes] = await Promise.all([
          fetch('/api/projects?versions=true'),
          fetch('/api/sprints'),
          fetch('/api/tasks'),
          fetch('/api/tasksPeriod'),
          fetch('/api/periodStaff'),
          fetch('/api/staff'),
          fetch('/api/periods'),
        ]);
        const [projectsJson, sprintsJson, tasksJson, tasksPeriodJson, periodStaffsJson, staffsJson, periodsJson] = await Promise.all([
          projectsRes.json(),
          sprintsRes.json(),
          tasksRes.json(),
          tasksPeriodRes.json(),
          periodStaffsRes.json(),
          staffsRes.json(),
          periodsRes.json(),
        ]);
        setProjects(projectsJson?.data || []);
        setSprints(sprintsJson?.data || []);
        setTasks(tasksJson?.data || []);
        setTasksPeriod(tasksPeriodJson?.data || []);
        setPeriodStaffs(periodStaffsJson?.data || []);
        setStaffs(staffsJson?.data || []);
        setPeriods(periodsJson?.data || []);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {loading ? <Spin size="large" style={{ margin: '64px auto' }} /> : (
        <>
          <Card bordered style={{ width: '100%' }} bodyStyle={{ padding: 24 }}>
            <ProjectsDashboard projects={projects} />
          </Card>
          <Card bordered style={{ width: '100%' }} bodyStyle={{ padding: 24 }}>
            <MilestonesDashboard
              projects={projects}
              sprints={sprints}
              tasks={tasks}
              tasksPeriod={tasksPeriod}
              periodStaffs={periodStaffs}
              staffs={staffs}
              periods={periods}
            />
          </Card>
          <Card bordered style={{ width: '100%' }} bodyStyle={{ padding: 24 }}>
            <PeriodsBySprintDashboard
              periods={periods}
              periodStaffs={periodStaffs}
              tasksPeriod={tasksPeriod}
              tasks={tasks}
              staffs={staffs}
            />
          </Card>
        </>
      )}
    </div>
  );
}
