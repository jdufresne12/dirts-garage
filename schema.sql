-- Enable trigger function for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
);

-- Customers table
CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zipcode TEXT,
    notes TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE vehicles (
    id TEXT PRIMARY KEY,
    year INT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    engine TEXT,
    transmission TEXT,
    vin TEXT,
    license_plate TEXT,
    color TEXT,
    mileage INT,
    customer_id TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Jobs table
CREATE TABLE jobs (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    vehicle_id TEXT,
    invoice_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    waiting_reason TEXT,
    latest_update TEXT,
    estimated_start_date DATE,
    estimated_completion DATE,
    start_date DATE,
    completion_date DATE,
    estimated_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
    actual_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
    priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')) NOT NULL,
    invoiced BOOLEAN DEFAULT FALSE,
    invoice_amount NUMERIC(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

-- Notes table
CREATE TABLE notes (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    note TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Job Steps table
CREATE TABLE job_steps (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMP,
    completed_date TIMESTAMP,
    estimated_start_date TIMESTAMP,
    "order" INT,
    status TEXT NOT NULL,
    estimated_hours NUMERIC(5,2),
    actual_hours NUMERIC(5,2),
    technician TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Parts table
CREATE TABLE parts (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    quantity INT NOT NULL DEFAULT 1,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    part_number TEXT NOT NULL,
    url TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
);

-- Invoices table
CREATE TABLE invoices (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    due_date DATE,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft',
    paid_date DATE,
    customer_id TEXT NOT NULL,
    job_id TEXT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    revision_number INTEGER NOT NULL DEFAULT 1,
    auto_sync_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_invoice_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;,
    CONSTRAINT fk_invoice_job FOREIGN KEY (job_id) REFERENCES jobs(id),
    CONSTRAINT chk_invoice_status CHECK (status IN ('draft', 'pending', 'sent', 'paid', 'overdue', 'cancelled')),
    CONSTRAINT chk_amount_positive CHECK (amount >= 0),
    CONSTRAINT chk_amount_paid_positive CHECK (amount_paid >= 0),
    CONSTRAINT chk_tax_rate_valid CHECK (tax_rate >= 0 AND tax_rate <= 100)
);

-- Invoice Line Items Table
CREATE TABLE invoice_line_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    source_type TEXT,  -- 'job_labor', 'job_part', 'custom', 'fee', 'discount'
    source_id TEXT,   -- Links to JobStep.id or Part.id for syncing
    type TEXT NOT NULL, -- 'labor', 'part', 'fee', 'discount', 'custom'
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    taxable BOOLEAN NOT NULL DEFAULT TRUE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE, -- Prevents auto-updates if manually modified
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_line_item_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT chk_line_item_type CHECK (type IN ('labor', 'part', 'fee', 'discount', 'custom')),
    CONSTRAINT chk_line_item_source_type CHECK (source_type IN ('job_labor', 'job_part', 'custom', 'fee', 'discount') OR source_type IS NULL),
    CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
    CONSTRAINT chk_rate_positive CHECK (rate >= 0),
    CONSTRAINT chk_amount_valid CHECK (amount >= 0)
);

-- Invoice Change Log Table
CREATE TABLE invoice_change_logs (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    change_type TEXT NOT NULL, -- 'created', 'updated', 'synced', 'manual_edit', 'status_change'
    changed_by TEXT, -- User ID or system
    changes JSONB, -- JSON of what changed
    previous_values JSONB, -- JSON of previous values for rollback
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_change_log_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT chk_change_type CHECK (change_type IN ('created', 'updated', 'synced', 'manual_edit', 'status_change'))
);

-- PAYMENT
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(255) PRIMARY KEY,
    invoice_id VARCHAR(255) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'other')),
    reference_number VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_vehicle_id ON jobs(vehicle_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_parts_job_id ON parts(job_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_job_id ON invoices(job_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_line_items_source ON invoice_line_items(source_type, source_id);
CREATE INDEX idx_line_items_type ON invoice_line_items(type);
CREATE INDEX idx_change_logs_invoice_id ON invoice_change_logs(invoice_id);
CREATE INDEX idx_change_logs_date ON invoice_change_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON invoices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_line_items_updated_at 
    BEFORE UPDATE ON invoice_line_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_customers_updated
BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_vehicles_updated
BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_jobs_updated
BEFORE UPDATE ON jobs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_parts_updated
BEFORE UPDATE ON parts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_invoices_updated
BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_notes_updated
BEFORE UPDATE ON notes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_job_steps_updated
BEFORE UPDATE ON job_steps
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION update_invoice_amount_paid()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the invoice's amount_paid field
    UPDATE invoices 
    SET 
        amount_paid = COALESCE((
            SELECT SUM(amount) 
            FROM payments 
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        ), 0),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    -- Auto-update status to 'paid' if fully paid
    UPDATE invoices 
    SET 
        status = CASE 
            WHEN amount_paid >= amount AND status != 'paid' THEN 'paid'
            WHEN amount_paid < amount AND status = 'paid' THEN 'pending'
            ELSE status
        END,
        paid_date = CASE 
            WHEN amount_paid >= amount THEN CURRENT_DATE
            ELSE NULL
        END
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_update_invoice_trigger
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_amount_paid();

CREATE OR REPLACE FUNCTION reset_job_on_invoice_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Reset the job's invoiced status and amounts when an invoice is deleted
    UPDATE jobs
    SET 
        invoiced = FALSE,
        invoice_amount = 0,
        invoice_id = NULL
    WHERE id = OLD.job_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_reset_job_before_invoice_delete
BEFORE DELETE ON invoices
FOR EACH ROW
EXECUTE FUNCTION reset_job_on_invoice_delete();

