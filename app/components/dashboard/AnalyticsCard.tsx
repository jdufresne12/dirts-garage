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
        <div className="bg-white rounded-lg border-l-4 border-l-orange-400 p-3 sm:p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">{value}</p>
                    {change && (
                        <p className={`text-xs sm:text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'} leading-tight`}>
                            {change}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className="flex-shrink-0">
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-gray-400" />
                    </div>
                )}
            </div>
        </div>
    );
};