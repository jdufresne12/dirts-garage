const TimeTracking = ({ timeTracking }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-semibold">Time Tracking</h2>
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 whitespace-nowrap">
                Clock In
            </button>
        </div>

        <div className="space-y-4">
            {timeTracking.map((entry, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-4">
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{entry.task}</h4>
                        <p className="text-sm text-gray-600">{entry.technician} • {entry.date}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-semibold">{entry.hours} hrs</span>
                    </div>
                </div>
            ))}
            <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Labor Hours:</span>
                    <span className="text-lg font-bold">15.5 hrs</span>
                </div>
            </div>
        </div>
    </div>
);