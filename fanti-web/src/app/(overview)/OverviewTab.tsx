import { Card, Typography } from 'antd';
import MilestonesDashboard from './MilestonesDashboard';
import PeriodsBySprintDashboard from './PeriodsBySprintDashboard';
import ProjectsDashboard from './ProjectsDashboard';

const { Title } = Typography;

export default function OverviewTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Card bordered style={{ width: '100%' }} bodyStyle={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        </div>
        <ProjectsDashboard />
      </Card>
      <Card bordered style={{ width: '100%' }} bodyStyle={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        </div>
        <MilestonesDashboard />
      </Card>
      <Card bordered style={{ width: '100%' }} bodyStyle={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        </div>
        <PeriodsBySprintDashboard />
      </Card>
    </div>
  );
}
