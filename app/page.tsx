'use client';
import React, { useState, useEffect } from 'react';
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

interface AnalyticsData {
  activeJobs: {
    value: number;
    change: string;
    changeType: 'positive' | 'negative';
  };
  revenue: {
    value: number;
    change: string;
    changeType: 'positive' | 'negative';
  };
  pendingInvoices: {
    value: number;
    change: string;
    changeType: 'positive' | 'negative';
  };
  completedThisWeek: {
    value: number;
    change: string;
    changeType: 'positive' | 'negative';
  };
}

export default function Home() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/dashboard/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
              <div key={i} className="bg-white rounded-lg border-l-4 border-l-gray-300 p-3 sm:p-4 lg:p-6 shadow-sm animate-pulse">
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
        {/* Analytics Cards */}
        <div className="grid grid-cols-2 w-full gap-4 mb-6 sm:gap-6 sm:mb-10">
          <AnalyticsCard
            title="Active Jobs"
            value={analytics?.activeJobs.value.toString() || "0"}
            change={analytics?.activeJobs.change || ""}
            changeType={analytics?.activeJobs.changeType || "positive"}
            icon={Wrench}
          />
          <AnalyticsCard
            title="Revenue This Month"
            value={analytics?.revenue.value ? formatCurrency(analytics.revenue.value) : "$0"}
            change={analytics?.revenue.change || ""}
            changeType={analytics?.revenue.changeType || "positive"}
            icon={DollarSign}
          />
          <AnalyticsCard
            title="Pending Invoices"
            value={analytics?.pendingInvoices.value ? formatCurrency(analytics.pendingInvoices.value) : "$0"}
            change={analytics?.pendingInvoices.change || ""}
            changeType={analytics?.pendingInvoices.changeType || "positive"}
            icon={FileText}
          />
          <AnalyticsCard
            title="Completed This Week"
            value={analytics?.completedThisWeek.value.toString() || "0"}
            change={analytics?.completedThisWeek.change || ""}
            changeType={analytics?.completedThisWeek.changeType || "positive"}
            icon={CheckCircle}
          />
        </div>

        <div className="w-full min-w-0 mb-6">
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