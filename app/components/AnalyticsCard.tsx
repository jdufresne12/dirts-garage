import React from 'react';

interface AnalyticsCardProps {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
    icon: React.ComponentType<{ className?: string }>
}

export default function AnalyticsCard({ title, value, change, changeType, icon: Icon }: AnalyticsCardProps) {
    return (
        <div className={`bg-white rounded-lg border-l-4 border-l-orange-400 p-6 shadow-sm`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {change && (
                        <p className={`text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'} mt-1`}>
                            {change}
                        </p>
                    )}
                </div>
                {Icon && <Icon className="h-8 w-8 text-gray-400" />}
            </div>
        </div>
    );
};