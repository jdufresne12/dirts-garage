import React from 'react';
import {
  Wrench,
  FileText,
  CheckCircle,
  DollarSign,
  Plus
} from 'lucide-react';

import AnalyticsCard from './components/dashboard/AnalyticsCard';
import RevenueTrendGraph from './components/dashboard/RevenueTrendGraph';
import RecentActivity from './components/dashboard/RecentActivity';
import JobsRequiringAttention from './components/dashboard/JobsRequiringAttention';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <div className="w-full mx-auto p-6 lg:p-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-2 w-full gap-4 mb-6 sm:gap-6 sm:mb-10 ">
          <AnalyticsCard
            title="Active Jobs"
            value="12"
            change="+2 from last week"
            changeType="positive"
            icon={Wrench}
          />
          <AnalyticsCard
            title="Revenue This Month"
            value="$18,540"
            change="+15% from last month"
            changeType="positive"
            icon={DollarSign}
          />
          <AnalyticsCard
            title="Pending Invoices"
            value="$4,220"
            change="3 overdue"
            changeType="negative"
            icon={FileText}
          />
          <AnalyticsCard
            title="Completed This Week"
            value="8"
            change="On schedule"
            changeType="positive"
            icon={CheckCircle}
          />
        </div>

        <div className="w-full min-w-0 mb-6 ">
          <RevenueTrendGraph />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 w-full">
          <div className="w-full min-w-0">
            <RecentActivity />
          </div>
          <div className="w-full min-w-0">
            <JobsRequiringAttention />
          </div>
        </div>

      </div>
    </div>
  );
}