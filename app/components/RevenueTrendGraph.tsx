import React from 'react';

export default function RevenueTrendGraph() {
    const data = [
        { month: 'Jan', value: 12000 },
        { month: 'Feb', value: 15000 },
        { month: 'Mar', value: 14000 },
        { month: 'Apr', value: 17500 },
        { month: 'May', value: 16800 },
        { month: 'Jun', value: 18540 }
    ];

    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <button className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100">
                    View Details
                </button>
            </div>

            <div className="relative h-64">
                <svg className="w-full h-full" viewBox="0 0 600 240">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4, 5].map(i => (
                        <line
                            key={i}
                            x1="0"
                            y1={i * 40 + 20}
                            x2="600"
                            y2={i * 40 + 20}
                            stroke="#f3f4f6"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Revenue line */}
                    <polyline
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="3"
                        points={data.map((d, i) =>
                            `${i * 100 + 50},${220 - (d.value / maxValue) * 180}`
                        ).join(' ')}
                    />

                    {/* Data points */}
                    {data.map((d, i) => (
                        <circle
                            key={i}
                            cx={i * 100 + 50}
                            cy={220 - (d.value / maxValue) * 180}
                            r="4"
                            fill="#f97316"
                        />
                    ))}

                    {/* X-axis labels */}
                    {data.map((d, i) => (
                        <text
                            key={i}
                            x={i * 100 + 50}
                            y="235"
                            textAnchor="middle"
                            className="fill-gray-600 text-sm"
                        >
                            {d.month}
                        </text>
                    ))}

                    {/* Y-axis labels */}
                    {['$0', '$2,000', '$4,000', '$6,000', '$8,000', '$10,000', '$12,000', '$14,000', '$16,000', '$18,000', '$20,000'].map((label, i) => (
                        <text
                            key={i}
                            x="5"
                            y={220 - i * 20}
                            className="fill-gray-600 text-xs"
                        >
                            {label}
                        </text>
                    ))}
                </svg>
            </div>
        </div>
    );
};