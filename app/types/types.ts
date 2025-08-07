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
    customer_id: string | null;
    customer?: Customer;
    vehicle_id: string | null;
    vehicle?: Vehicle;
    title: string;
    description: string;
    status: string;
    waiting_reason?: string;
    latest_update?: string;
    estimated_start_date?: string;
    estimated_completion?: string;
    start_date?: string;
    completion_date?: string;
    estimated_cost: number;
    actual_cost: number;
    priority: "Low" | "Medium" | "High";
    parts?: Part[] | null;
    invoiced?: boolean;
    invoice_amount?: number;
};

interface Invoice {
    id: string;
    date: string;
    amount: number;
    amount_paid: number;
    status: string;
    due_date?: string;
    paid_date?: string;
    customer_id: string;
    job_id: string;
    customer?: Customer | null;
    job?: Job | null;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    discount_amount: number;
    notes?: string;
    line_items?: InvoiceLineItem[];
    created_at?: string;
    updated_at?: string;
};

interface InvoiceLineItem {
    id: string;
    invoice_id: string;
    key: string;
    type: 'labor' | 'part' | 'fee' | 'discount' | 'custom';
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    taxable: boolean;
    created_at?: string;
    updated_at?: string;
}

interface Part {
    id: string;
    job_id: string | null;
    name: string;
    description?: string;
    quantity: number;
    price: number;
    part_number: string;
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
    job_id: string;
    title: string;
    description: string;
    start_date?: string;
    completed_date?: string;
    estimated_start_date?: string;
    order?: number;
    status: string;
    estimated_hours?: number;
    actual_hours?: number;
    technician?: string;
}

interface CostSummary {
    partsAndMaterials: number,
    hours: number,
    labor: number,
}

