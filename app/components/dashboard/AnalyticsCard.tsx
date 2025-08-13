interface AnalyticsCardProps {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
    icon: React.ComponentType<{ className?: string }>;
}

export default function AnalyticsCard({ title, value, change, changeType, icon: Icon }: AnalyticsCardProps) {
    return (
        <div className="flex bg-white rounded-lg border-l-4 border-l-orange-400 p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 mb-1 sm:text-sm">{title}</p>
                    <p className="text-xl font-bold text-gray-900 mb-1 sm:text-2xl">{value}</p>
                    {change && (
                        <p className={`text-xs sm:text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                            {change}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className="flex-shrink-0 ml-4">
                        <Icon className="size-6 text-gray-400 sm:size-8" />
                    </div>
                )}
            </div>
        </div>
    );
}