interface Customer {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    notes?: string;
    status: string;
    jobs?: Job[] | null;
    vehicles?: Vehicle[] | null;
    invoices?: Invoice[] | null;
};

interface Vehicle {
    id: string;
    year: number;
    make: string;
    model: string;
    engine?: string;
    transmission?: string;
    vin?: string;
    license_plate?: string;
    color?: string;
    mileage?: number;
    customer_id: string;
};

interface Job {
    id: string;
    customerId: string | null;
    vehicleId: string | null;
    title: string;
    description: string;
    status: string;
    waitingReason?: string;
    latestUpdate?: string;
    estimatedStartDate?: string;
    estimatedCompletion?: string;
    startDate?: string;
    completionDate?: string;
    estimatedCost: number;
    actualCost: number;
    priority: "Low" | "Medium" | "High";
    parts?: Part[] | null;
    invoiced?: boolean;
    invoiceAmount?: number;
};

interface Invoice {
    id: string;
    date: string;
    amount: number;
    amountPaid: number;
    status: string;
    dueDate: string;
    paidDate?: string;
    customerId: string;
    jobId: string;
    customer: Customer | null;
    job: Job | null;
};

interface Part {
    id: string;
    jobId: string | null;
    name: string;
    description?: string;
    quantity: number;
    price: number;
    partNumber: string;
    url?: string;
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
    estimatedStartDate?: string;
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

