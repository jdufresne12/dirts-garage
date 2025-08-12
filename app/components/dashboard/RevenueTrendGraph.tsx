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
            if (!response.ok) throw new Error('Failed to fetch revenue data');
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
        if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
        return `$${amount.toFixed(0)}`;
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-6 shadow-sm h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h3>
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse">Loading chart...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <button className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100">
                    View Details
                </button>
            </div>

            {data.length > 0 ? (
                <div className="h-80">
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
                                className="fill-gray-600 text-sm"
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
                                    {formatCurrency(value)}
                                </text>
                            );
                        })}
                    </svg>
                </div>
            ) : (
                <div className="h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-sm">No revenue data available</p>
                    </div>
                </div>
            )}
        </div>
    );
}