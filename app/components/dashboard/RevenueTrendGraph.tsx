import React, { useState, useEffect } from 'react';

interface RevenueData {
    month: string;
    revenue: number;
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

    const maxValue = data.length > 0 ? Math.max(...data.map(d => d.revenue)) : 1000;
    // Add 10% padding above the highest value, then round up to nearest 50
    const paddedMax = maxValue * 1.1;
    const chartMax = Math.ceil(paddedMax / 50) * 50;
    const yAxisSteps = 5;
    const stepValue = chartMax / yAxisSteps;

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
        return `$${Math.round(amount)}`;
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
                <div className="text-xs text-gray-500">Last 6 months</div>
            </div>

            {data.length > 0 ? (
                <div className="relative h-64">
                    {/* Chart container with proper positioning */}
                    <div className="absolute inset-0 flex">
                        {/* Y-axis labels */}
                        <div className="w-8 flex flex-col justify-between text-xs text-gray-500 pr-2 pb-6">
                            {Array.from({ length: yAxisSteps + 1 }, (_, i) => {
                                const value = stepValue * (yAxisSteps - i);
                                return (
                                    <div key={i} className="flex items-center justify-end h-0">
                                        <span>{formatCurrency(value)}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Chart area */}
                        <div className="flex-1 flex flex-col">
                            {/* Grid and bars container */}
                            <div className="flex-1 relative border-l border-b border-gray-200">
                                {/* Horizontal grid lines */}
                                {Array.from({ length: yAxisSteps + 1 }, (_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-full border-t border-gray-100"
                                        style={{
                                            top: `${(i / yAxisSteps) * 100}%`,
                                            borderTopWidth: i === yAxisSteps ? '0px' : '1px'
                                        }}
                                    />
                                ))}

                                {/* Bars */}
                                <div className="absolute inset-0 flex items-end px-2" style={{ justifyContent: 'space-around' }}>
                                    {data.map((d, i) => {
                                        const heightPercentage = chartMax > 0 ? (d.revenue / chartMax) * 100 : 0; // Use full 100% with chartMax
                                        const barHeight = Math.max(heightPercentage, d.revenue > 0 ? 2 : 0); // Minimum 2% height if there's revenue
                                        const currentDate = new Date();
                                        const currentMonthKey = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                                        const isCurrentMonth = d.month === currentMonthKey;

                                        return (
                                            <div key={i} className="flex flex-col items-center justify-end h-full" style={{ flex: '1 1 0%' }}>
                                                {/* Value label above bar - positioned relative to the bar */}
                                                {/* {d.revenue > 0 && (
                                                    <div
                                                        className="text-xs font-medium text-gray-700 mb-1"
                                                        style={{
                                                            marginBottom: `${Math.max(barHeight + 2, 5)}%`,
                                                            position: 'absolute',
                                                            bottom: '100%'
                                                        }}
                                                    >
                                                        {formatCurrency(d.revenue)}
                                                    </div>
                                                )} */}

                                                {/* Bar */}
                                                <div
                                                    className={`w-8 rounded-t-md transition-all duration-300 hover:opacity-80 cursor-pointer ${isCurrentMonth
                                                        ? 'bg-orange-500'
                                                        : 'bg-orange-400'
                                                        }`}
                                                    style={{
                                                        height: `${barHeight}%`,
                                                        minHeight: d.revenue > 0 ? '8px' : '2px'
                                                    }}
                                                    title={`${d.month}: ${formatCurrency(d.revenue)}`}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* X-axis labels */}
                            <div className="flex pt-3 text-xs text-gray-600" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
                                {data.map((d, i) => (
                                    <div key={i} className="text-center" style={{ width: `${100 / data.length}%` }}>
                                        {d.month}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
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