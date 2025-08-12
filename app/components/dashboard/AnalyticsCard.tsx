interface AnalyticsCardProps {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
    icon: React.ComponentType<{ className?: string }>;
}

export default function AnalyticsCard({ title, value, change, changeType, icon: Icon }: AnalyticsCardProps) {
    return (
        <div className="bg-white rounded-lg border-l-4 border-l-orange-400 p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
                    {change && (
                        <p className={`text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                            {change}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className="flex-shrink-0 ml-4">
                        <Icon className="h-8 w-8 text-gray-400" />
                    </div>
                )}
            </div>
        </div>
    );
}