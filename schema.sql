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
CREATE INDEX idx_customers_email ON customers(email);

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
CREATE INDEX idx_vehicles_customer_id ON vehicles(customer_id);

-- Jobs table
CREATE TABLE jobs (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    vehicle_id TEXT,
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
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_vehicle_id ON jobs(vehicle_id);
CREATE INDEX idx_jobs_status ON jobs(status);

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
CREATE INDEX idx_parts_job_id ON parts(job_id);

-- Invoices table
CREATE TABLE invoices (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    customer_id TEXT,
    date DATE NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    due_date DATE,
    paid_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT;
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE invoice_line_items (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL,
    invoice_id TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    taxable BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_job_id ON invoices(job_id);
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

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

-- Triggers to auto-update updated_at
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
