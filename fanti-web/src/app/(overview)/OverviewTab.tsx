
import { usePeriods, usePeriodStaff, useProjectVersions, useSprints, useStaff, useTasks, useTasksPeriod } from '@/hooks';
import { Card, Spin } from 'antd';
import { useState } from 'react';
import MilestonesDashboard from './MilestonesDashboard';
import PeriodsBySprintDashboard from './PeriodsBySprintDashboard';
import ProjectsDashboard from './ProjectsDashboard';

export default function OverviewTab() {

  const { projectVersions, loading: loadingProjectVersions} = useProjectVersions();
  const { sprints, loading: loadingSprints } = useSprints();
  const { tasks, loading: loadingTasks } = useTasks();
  const { tasksPeriod, loading: loadingTasksPeriod } = useTasksPeriod();
  const { periodStaffs, loading: loadingPeriodStaffs } = usePeriodStaff();
  const { staffs, loading: loadingStaffs } = useStaff();
  const { periods, loading: loadingPeriods } = usePeriods();

  // Derived states
  const anyLoading =
    loadingProjectVersions ||
    loadingSprints ||
    loadingTasks ||
    loadingTasksPeriod ||
    loadingPeriodStaffs ||
    loadingStaffs ||
    loadingPeriods;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {anyLoading ? <Spin size="large" style={{ margin: '64px auto' }} /> : (
        <>
          <Card bordered style={{ width: '100%' }} bodyStyle={{ padding: 24 }}>
            <ProjectsDashboard projects={projectVersions} />
          </Card>
          <Card bordered style={{ width: '100%' }} bodyStyle={{ padding: 24 }}>
            <MilestonesDashboard
              projects={projectVersions}
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
