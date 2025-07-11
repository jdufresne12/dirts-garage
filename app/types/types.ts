interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    notes?: string;
    status: Status;
    jobs?: Job[] | null;
    jobCount?: number;
    vehicles?: Vehicle[] | null;
    vehicleCount?: number;
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
    estimatedCompletion?: string;
    startDate: string;
    endDate?: string;
    estimatedCost: number;
    actualCost: number;
    priority: "Low" | "Medium" | "High";
    parts: Part[] | null;
    customerId: string | null;
    vehicleId: string | null;
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
    engine?: string;
    transmission?: string;
    vin?: string;
    licensePlate?: string;
    color?: string;
    mileage?: number;
    customerId: string;
    jobs?: Job[];
};

interface Part {
    id: string;
    jobId: string | null;
    name: string;
    description?: string;
    quantity: number;
    price: number;
    partNumber: string;
    status: string
};

interface Note {
    id: string;
    note: string;
    timestamp: string;
}

interface JobStep {
    id: string;
    title: string;
    description: string;
    startDate?: string;
    completedDate?: string;
    order?: number;
    status: string;
    estimatedHours?: number;
    actualHours?: number;
    technician?: string;
}

interface CostSummary {
    partsAndMaterials: number,
    hours: number,
    labor: number,
}

interface Status {
    type: "Active" | "Waiting" | "Completed" | 'On Hold' | "Payment" | "none";
    color: string;
    message?: string
}''

