'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Wrench,
  FileText,
  DollarSign,
} from 'lucide-react';

import AnalyticsCard from './components/dashboard/AnalyticsCard';
import RevenueTrendGraph from './components/dashboard/RevenueTrendGraph';
import PendingInvoicesTable from './components/dashboard/PendingInvoicesTable';
import ActiveJobsTable from './components/dashboard/ActiveJobsTable';
import WaitingJobsTable from './components/dashboard/WaitingJobsTable';

interface AnalyticsData {
  revenueThisMonth: {
    value: number;
    change: string;
    changeType: 'positive' | 'negative';
  };
  pendingInvoices: {
    value: number;
    change: string;
    changeType: 'positive' | 'negative';
  };
  activeJobs: {
    value: number;
    change: string;
    changeType: 'positive' | 'negative';
  };
  jobsWaiting: {
    value: number;
    change: string;
    changeType: 'positive' | 'negative';
  };
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, [refreshKey]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/dashboard/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Callback function to refresh all dashboard data
  const refreshDashboard = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
        <div className="w-full mx-auto p-6 lg:p-8">
          <div className="grid grid-cols-2 w-full gap-4 mb-6 sm:gap-6 sm:mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border-l-4 border-l-gray-300 p-6 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <div className="w-full mx-auto p-6 lg:p-8">

        {/* Top Analytics Cards - 2x2 Grid */}
        <div className="grid grid-cols-2 w-full gap-4 mb-8 sm:gap-6">
          <AnalyticsCard
            title="Revenue This Month"
            value={analytics?.revenueThisMonth.value ? formatCurrency(analytics.revenueThisMonth.value) : "$0"}
            change={analytics?.revenueThisMonth.change || "+0.0% from last month"}
            changeType={analytics?.revenueThisMonth.changeType || "positive"}
            icon={DollarSign}
          />
          <AnalyticsCard
            title="Pending Invoices"
            value={analytics?.pendingInvoices.value?.toString() || "0"}
            change={analytics?.pendingInvoices.change || "All current"}
            changeType={analytics?.pendingInvoices.changeType || "positive"}
            icon={FileText}
          />
          <AnalyticsCard
            title="Active Jobs"
            value={analytics?.activeJobs.value?.toString() || "0"}
            change={analytics?.activeJobs.change || "0 from last week"}
            changeType={analytics?.activeJobs.changeType || "positive"}
            icon={Wrench}
          />
          <AnalyticsCard
            title="Jobs Waiting"
            value={analytics?.jobsWaiting.value?.toString() || "0"}
            change={analytics?.jobsWaiting.change || "On schedule"}
            changeType={analytics?.jobsWaiting.changeType || "positive"}
            icon={Clock}
          />
        </div>

        {/* Main Content Grid - Split into 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RevenueTrendGraph key={`revenue-${refreshKey}`} />
          <PendingInvoicesTable key={`invoices-${refreshKey}`} />
        </div>

        {/* Bottom Section - Jobs Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActiveJobsTable key={`active-${refreshKey}`} />
          <WaitingJobsTable
            key={`waiting-${refreshKey}`}
            onJobStarted={refreshDashboard}
          />
        </div>

      </div>
    </div>
  );
}