// Mock data for jobs
export const mockJobs = {
    inProgress: [
        {
            id: 'J001',
            customer: 'Mike Johnson',
            vehicle: '2018 Chevrolet Camaro SS',
            workOrder: 'LS3 Engine Rebuild',
            startDate: '2024-06-20',
            estimatedCompletion: '2024-07-05',
            progress: 75,
            estimatedCost: 8500,
            actualCost: 6200,
            technician: 'John Smith',
            priority: 'High',
            notes: 'Waiting for custom pistons'
        },
        {
            id: 'J002',
            customer: 'Sarah Davis',
            vehicle: '1969 Ford Mustang Boss 429',
            workOrder: 'Transmission Rebuild',
            startDate: '2024-06-25',
            estimatedCompletion: '2024-07-10',
            progress: 45,
            estimatedCost: 4200,
            actualCost: 2100,
            technician: 'Mike Wilson',
            priority: 'Medium',
            notes: 'Customer approved additional work'
        },
        {
            id: 'J003',
            customer: 'Tom Wilson',
            vehicle: '1970 Plymouth Cuda 440',
            workOrder: 'Complete Restoration',
            startDate: '2024-05-15',
            estimatedCompletion: '2024-08-30',
            progress: 60,
            estimatedCost: 25000,
            actualCost: 18500,
            technician: 'Team Project',
            priority: 'High',
            notes: 'Paint booth scheduled next week'
        }
    ],
    waiting: [
        {
            id: 'J004',
            customer: 'Alex Martinez',
            vehicle: '1970 Chevelle SS',
            workOrder: 'Engine Performance Upgrade',
            startDate: null,
            estimatedCompletion: null,
            progress: 0,
            estimatedCost: 6500,
            actualCost: 0,
            technician: 'Unassigned',
            priority: 'Medium',
            notes: 'Waiting for customer approval',
            waitingReason: 'Customer Approval'
        },
        {
            id: 'J005',
            customer: 'Jennifer Lee',
            vehicle: '2019 Corvette Z06',
            workOrder: 'Suspension Overhaul',
            startDate: null,
            estimatedCompletion: null,
            progress: 0,
            estimatedCost: 3200,
            actualCost: 0,
            technician: 'Unassigned',
            priority: 'Low',
            notes: 'Parts on order - ETA 2 weeks',
            waitingReason: 'Parts Delivery'
        }
    ],
    completed: [
        {
            id: 'J006',
            customer: 'Robert Garcia',
            vehicle: '2017 Toyota Tacoma',
            workOrder: 'Brake System Overhaul',
            startDate: '2024-06-10',
            completedDate: '2024-06-18',
            estimatedCost: 800,
            actualCost: 750,
            technician: 'Sarah Johnson',
            priority: 'Medium',
            invoiced: true,
            invoiceAmount: 750
        },
        {
            id: 'J007',
            customer: 'Lisa Brown',
            vehicle: '2015 Ford F-150',
            workOrder: 'Oil Change & Inspection',
            startDate: '2024-06-15',
            completedDate: '2024-06-15',
            estimatedCost: 150,
            actualCost: 145,
            technician: 'Mike Wilson',
            priority: 'Low',
            invoiced: true,
            invoiceAmount: 145
        }
    ]
};