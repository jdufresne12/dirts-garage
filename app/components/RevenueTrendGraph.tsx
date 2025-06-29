import React from 'react';

export default function RevenueTrendGraph() {
    const data = [
        { month: 'Jan', value: 12000 },
        { month: 'Feb', value: 15000 },
        { month: 'Mar', value: 14000 },
        { month: 'Apr', value: 17500 },
        { month: 'May', value: 16800 },
        { month: 'Jun', value: 20000 }
    ];

    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="h-full bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <button className="px-3 py-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors self-start sm:self-auto">
                    View Details
                </button>
            </div>

            <div className="relative h-48 sm:h-56 lg:h-64">
                <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="xMidYMid meet">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4, 5].map(i => (
                        <line
                            key={i}
                            x1="40"
                            y1={i * 40 + 20}
                            x2="580"
                            y2={i * 40 + 20}
                            stroke="#f3f4f6"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Revenue line */}
                    <polyline
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={data.map((d, i) =>
                            `${i * 90 + 70},${220 - (d.value / maxValue) * 180}`
                        ).join(' ')}
                    />

                    {/* Data points */}
                    {data.map((d, i) => (
                        <circle
                            key={i}
                            cx={i * 90 + 70}
                            cy={220 - (d.value / maxValue) * 180}
                            r="3"
                            fill="#f97316"
                            stroke="#fff"
                            strokeWidth="2"
                        />
                    ))}

                    {/* X-axis labels */}
                    {data.map((d, i) => (
                        <text
                            key={i}
                            x={i * 90 + 70}
                            y="235"
                            textAnchor="middle"
                            className="fill-gray-600 text-xs sm:text-sm"
                            fontSize="12"
                        >
                            {d.month}
                        </text>
                    ))}

                    {/* Y-axis labels - simplified for mobile */}
                    {['$0', '$5K', '$10K', '$15K', '$20K'].map((label, i) => (
                        <text
                            key={i}
                            x="5"
                            y={220 - i * 45}
                            className="fill-gray-600 text-xs"
                            fontSize="10"
                        >
                            <tspan className="sm:hidden">{label}</tspan>
                            <tspan className="hidden sm:inline">
                                {i === 0 ? '$0' :
                                    i === 1 ? '$5,000' :
                                        i === 2 ? '$10,000' :
                                            i === 3 ? '$15,000' : '$20,000'}
                            </tspan>
                        </text>
                    ))}
                </svg>
            </div>
        </div>
    );
}