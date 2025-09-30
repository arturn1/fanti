'use client';

import OverviewTab from '@/app/(overview)/OverviewTab';

export default function DashboardPage() {
  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f0f2f5' }}>
      <OverviewTab />
    </div>
  );
}