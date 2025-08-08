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
    job_steps?: JobStep[] | null; // Add job steps to job interface
    // Enhanced invoice relationship
    invoice_id?: string | null; // Link to current invoice
    invoiced?: boolean; // Keep for backward compatibility
    invoice_amount?: number; // Keep for backward compatibility
    invoice?: Invoice | null; // Full invoice relationship
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

interface Invoice {
    id: string;
    date: string;
    due_date?: string;
    amount: number;
    amount_paid: number;
    status: 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled';
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
    revision_number: number; // Track invoice versions
    auto_sync_enabled: boolean; // Toggle for automatic job sync
    created_at?: string;
    updated_at?: string;
}

interface InvoiceLineItem {
    id: string;
    invoice_id: string;
    source_type?: 'job_labor' | 'job_part' | 'custom' | 'fee' | 'discount'; // Links to job data
    source_id?: string; // JobStep.id or Part.id for automatic syncing
    type: 'labor' | 'part' | 'fee' | 'discount' | 'custom';
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    taxable: boolean;
    is_locked: boolean; // Prevents auto-updates when manually modified
    created_at?: string;
    updated_at?: string;
}

// Sync-related types for smart invoice updates
interface JobSyncData {
    labor_hours: number;
    labor_items: Array<{
        id: string; // JobStep.id
        description: string;
        hours: number;
        rate: number;
    }>;
    parts: Array<{
        id: string; // Part.id
        name: string;
        part_number: string;
        quantity: number;
        price: number;
    }>;
}

interface InvoiceSyncResult {
    invoice: Invoice;
    job_data: JobSyncData;
    changes: Array<{
        type: 'added' | 'updated' | 'removed';
        item_type: 'labor' | 'part';
        description: string;
        old_value?: any;
        new_value?: any;
    }>;
    recommended_action: 'auto_sync' | 'prompt_user' | 'no_action';
    can_auto_sync: boolean;
}

interface LaborSettings {
    type: 'hourly' | 'fixed';
    hourly_rate: number;
    fixed_amount: number;
    description: string;
    consolidate_labor: boolean; // Whether to show as one line item or separate by job step
}

interface BusinessInfo {
    name: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    phone: string;
    email: string;
}

interface Payment {
    id: string;
    invoice_id: string;
    amount: number;
    payment_date: string;
    payment_method: 'cash' | 'check' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'other';
    reference_number?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}