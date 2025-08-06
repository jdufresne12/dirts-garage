'use client';
import React, { useState, useEffect } from 'react';

interface RevenueData {
    month: string;
    revenue: number;
    jobCount: number;
}

export default function RevenueTrendGraph() {
    const [data, setData] = useState<RevenueData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRevenueData();
    }, []);

    const fetchRevenueData = async () => {
        try {
            const response = await fetch('/api/dashboard/revenue-trend');
            if (!response.ok) {
                throw new Error('Failed to fetch revenue data');
            }
            const revenueData = await response.json();
            setData(revenueData);
        } catch (error) {
            console.error('Error fetching revenue data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const maxValue = data.length > 0 ? Math.max(...data.map(d => d.revenue)) : 0;
    const chartHeight = 200;
    const chartWidth = 580;
    const barWidth = data.length > 0 ? Math.min(60, (chartWidth - 80) / data.length - 20) : 60;
    const barSpacing = data.length > 0 ? (chartWidth - 80) / data.length : 90;

    const formatCurrency = (amount: number) => {
        if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(0)}K`;
        }
        return `$${amount.toFixed(0)}`;
    };

    const formatCurrencyFull = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="h-full bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Revenue Trend</h3>
                    <button className="px-3 py-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors self-start sm:self-auto">
                        View Details
                    </button>
                </div>
                <div className="relative h-48 sm:h-full lg:h-80 flex items-center justify-center">
                    <div className="animate-pulse">
                        <div className="flex space-x-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className={`bg-gray-200 w-12 rounded`} style={{ height: `${Math.random() * 100 + 50}px` }}></div>
                                    <div className="h-3 w-8 bg-gray-200 rounded mt-2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <button className="px-3 py-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors self-start sm:self-auto">
                    View Details
                </button>
            </div>

            {data.length > 0 ? (
                <div className="relative h-48 sm:h-full lg:h-80">
                    <svg className="w-full h-full" viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet">
                        {/* Grid lines */}
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <line
                                key={i}
                                x1="60"
                                y1={i * 40 + 40}
                                x2="580"
                                y2={i * 40 + 40}
                                stroke="#f3f4f6"
                                strokeWidth="1"
                            />
                        ))}

                        {/* Bars */}
                        {data.map((d, i) => {
                            const barHeight = maxValue > 0 ? (d.revenue / maxValue) * 180 : 0;
                            const x = i * barSpacing + 70;
                            const y = 240 - barHeight;

                            return (
                                <g key={i}>
                                    {/* Bar */}
                                    <rect
                                        x={x - barWidth / 2}
                                        y={y}
                                        width={barWidth}
                                        height={barHeight}
                                        fill="#f97316"
                                        rx="4"
                                        ry="4"
                                        className="hover:fill-orange-600 transition-colors cursor-pointer"
                                    />

                                    {/* Value on top of bar */}
                                    {barHeight > 20 && (
                                        <text
                                            x={x}
                                            y={y - 5}
                                            textAnchor="middle"
                                            className="fill-gray-700 text-xs font-medium"
                                            fontSize="10"
                                        >
                                            {formatCurrency(d.revenue)}
                                        </text>
                                    )}

                                    {/* Job count inside bar (if bar is tall enough) */}
                                    {barHeight > 30 && d.jobCount > 0 && (
                                        <text
                                            x={x}
                                            y={y + barHeight - 8}
                                            textAnchor="middle"
                                            className="fill-white text-xs font-medium"
                                            fontSize="9"
                                        >
                                            {d.jobCount} jobs
                                        </text>
                                    )}
                                </g>
                            );
                        })}

                        {/* X-axis labels */}
                        {data.map((d, i) => (
                            <text
                                key={i}
                                x={i * barSpacing + 70}
                                y="260"
                                textAnchor="middle"
                                className="fill-gray-600 text-xs sm:text-sm"
                                fontSize="12"
                            >
                                {d.month}
                            </text>
                        ))}

                        {/* Y-axis labels */}
                        {maxValue > 0 && [0, 1, 2, 3, 4, 5].map((i) => {
                            const value = (maxValue / 5) * i;
                            return (
                                <text
                                    key={i}
                                    x="5"
                                    y={240 - i * 36}
                                    className="fill-gray-600 text-xs"
                                    fontSize="10"
                                >
                                    <tspan className="sm:hidden">{formatCurrency(value)}</tspan>
                                    <tspan className="hidden sm:inline">{formatCurrencyFull(value)}</tspan>
                                </text>
                            );
                        })}
                    </svg>
                </div>
            ) : (
                <div className="relative h-48 sm:h-full lg:h-80 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-sm">No revenue data available</p>
                        <p className="text-xs text-gray-400 mt-1">Complete some jobs to see revenue trends</p>
                    </div>
                </div>
            )}

            {/* Summary stats below chart */}
            {data.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-500">Total Revenue</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {formatCurrencyFull(data.reduce((sum, d) => sum + d.revenue, 0))}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Jobs</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {data.reduce((sum, d) => sum + d.jobCount, 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Avg per Month</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {formatCurrencyFull(data.reduce((sum, d) => sum + d.revenue, 0) / data.length)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Avg per Job</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {data.reduce((sum, d) => sum + d.jobCount, 0) > 0
                                    ? formatCurrencyFull(data.reduce((sum, d) => sum + d.revenue, 0) / data.reduce((sum, d) => sum + d.jobCount, 0))
                                    : '$0'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}