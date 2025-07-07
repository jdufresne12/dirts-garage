interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address?: string;
    notes?: string;
    status: Status;
    vehicleCount?: number;
    jobCount?: number;
    vehicles?: Vehicle[] | null;
    jobs?: Job[] | null;
    invoices?: Invoice[] | null;
    totalSpent?: number;
    amountOwed?: number
};

interface Job {
    id: string;
    title: string;
    description: string;
    status: Status;
    estimatedStartDate: string;
    estimatedEndDay?: string;
    startDate: string;
    endDate?: string;
    estimatedCompletion?: string;
    estimatedCost: number;
    actualCost: number;
    priority: "Low" | "Medium" | "High";
    parts: Part[] | null;
    customerId: string | null;
    vehicleId: string | null;
    notes?: string;
    waitingReason?: string;
    invoiced?: boolean;
    invoiceAmount?: number;
};

interface Invoice {
    id: string;
    date: string;
    amount: number;
    amountPaid: number;
    status: Status;
    dueDate: string;
    paidDate?: string;
    customerId: string;
    jobId: string;
    customer: Customer | null;
    job: Job | null;
};

interface Vehicle {
    id: string;
    year: number;
    make: string;
    model: string;
    vin?: string;
    licensePlate?: string;
    color?: string;
    mileage?: number;
    customerId: string;
    jobs?: Job[];
};

interface Part {
    id: string;
    jobId: number | null;
    name: string;
    description?: string;
    quantity: number;
    price: number;
    partNumber: string;
};

interface Status {
    type: "Active" | "Waiting" | "Completed" | 'On Hold' | "Payment" | "none";
    color: string;
    message?: string
}''

