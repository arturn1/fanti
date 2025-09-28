'use client';


import OverviewTab from '@/app/(overview)/OverviewTab';
import { Typography } from 'antd';
import { useState } from 'react';

const { Title } = Typography;


export default function DashboardPage() {
  const [activeKey, setActiveKey] = useState('overview');
  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f0f2f5' }}>
      <OverviewTab />
    </div>
  );
}