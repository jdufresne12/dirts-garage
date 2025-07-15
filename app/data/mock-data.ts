// Mock Parts Data
export const mockParts: Part[] = [
    // Parts for Job 1 (LS3 Engine Rebuild)
    { id: "1", jobId: "1", name: "Forged Pistons (.030 over)", description: "Summit Racing SUM-2618-030", quantity: 8, price: 459.99, partNumber: "SUM-2618-030", status: "ordered" },
    { id: "2", jobId: "1", name: "Connecting Rods", description: "Eagle CRS6200A33D", quantity: 8, price: 389.99, partNumber: "CRS6200A33D", status: "received" },
    { id: "3", jobId: "1", name: "ARP Head Studs", description: "ARP 234-4316", quantity: 1, price: 189.99, partNumber: "ARP-234-4316", status: "installed" },
    { id: "4", jobId: "1", name: "Engine Gasket Set", description: "Fel-Pro HS26332PT", quantity: 1, price: 129.99, partNumber: "HS26332PT", status: "received" },
    { id: "5", jobId: "1", name: "Performance Camshaft", description: "Comp Cams 12-600-4", quantity: 1, price: 279.99, partNumber: "12-600-4", status: "ordered" },

    // Parts for Job 2 (Transmission Rebuild)
    { id: "6", jobId: "2", name: "Transmission Rebuild Kit", description: "Complete overhaul kit", quantity: 1, price: 850.00, partNumber: "TRK-4L80E", status: "received" },
    { id: "7", jobId: "2", name: "Torque Converter", description: "High-stall converter", quantity: 1, price: 425.00, partNumber: "TC-3000", status: "installed" },
    { id: "8", jobId: "2", name: "Transmission Filter", description: "OEM replacement filter", quantity: 1, price: 45.99, partNumber: "TF-4L80E", status: "installed" },

    // Parts for Job 3 (Brake System)
    { id: "9", jobId: "3", name: "Brake Pads (Front)", description: "Ceramic brake pads", quantity: 1, price: 89.99, partNumber: "BP-CER-F", status: "received" },
    { id: "10", jobId: "3", name: "Brake Rotors (Front)", description: "Drilled and slotted rotors", quantity: 2, price: 199.99, partNumber: "BR-DS-F", status: "ordered" },
    { id: "11", jobId: "3", name: "Brake Fluid", description: "DOT 4 brake fluid", quantity: 2, price: 24.99, partNumber: "BF-DOT4", status: "received" },

    // Parts for Job 4 (Oil Change)
    { id: "12", jobId: "4", name: "Engine Oil", description: "5W-30 Full Synthetic", quantity: 5, price: 35.99, partNumber: "OIL-5W30", status: "installed" },
    { id: "13", jobId: "4", name: "Oil Filter", description: "OEM oil filter", quantity: 1, price: 12.99, partNumber: "OF-OEM", status: "installed" },

    // Parts for Job 5 (Carburetor Rebuild)
    { id: "14", jobId: "5", name: "Carburetor Rebuild Kit", description: "Holley 4150 rebuild kit", quantity: 1, price: 125.00, partNumber: "HRK-4150", status: "received" },
    { id: "15", jobId: "5", name: "Accelerator Pump", description: "Replacement pump diaphragm", quantity: 1, price: 35.00, partNumber: "AP-DIAPHRAGM", status: "ordered" },

    // Parts for Job 6 (Suspension Work)
    { id: "16", jobId: "6", name: "Coilover Kit", description: "Adjustable coilovers", quantity: 4, price: 1299.99, partNumber: "COK-ADJ-4", status: "ordered" },
    { id: "17", jobId: "6", name: "Sway Bar Links", description: "Performance sway bar links", quantity: 4, price: 89.99, partNumber: "SBL-PERF-4", status: "received" },

    // Parts for Job 7 (Exhaust System)
    { id: "18", jobId: "7", name: "Cat-Back Exhaust", description: "Stainless steel exhaust system", quantity: 1, price: 899.99, partNumber: "CBE-SS", status: "installed" },
    { id: "19", jobId: "7", name: "Exhaust Tips", description: "4\" polished tips", quantity: 2, price: 149.99, partNumber: "ET-4IN-POL", status: "installed" },

    // Parts for Job 8 (Air Intake)
    { id: "20", jobId: "8", name: "Cold Air Intake", description: "Performance air intake system", quantity: 1, price: 299.99, partNumber: "CAI-PERF", status: "received" },
    { id: "21", jobId: "8", name: "Air Filter", description: "High-flow air filter", quantity: 1, price: 49.99, partNumber: "AF-HF", status: "ordered" },

    // Parts not assigned to any job
    { id: "22", jobId: null, name: "Shop Rags", description: "Lint-free cleaning rags", quantity: 50, price: 19.99, partNumber: "SR-LF-50", status: "in-stock" },
    { id: "23", jobId: null, name: "Degreaser", description: "Industrial strength degreaser", quantity: 2, price: 15.99, partNumber: "DG-IND-2", status: "in-stock" }
];

// Mock Vehicles Data
export const mockVehicles: Vehicle[] = [
    // Mike Johnson's vehicles
    {
        id: "1",
        customerId: "CUST001",
        year: 2018,
        make: "Chevrolet",
        model: "Camaro SS",
        vin: "1G1FE1R7XJ0123456",
        licensePlate: "ABC-123",
        color: "Summit White",
        mileage: 45200,
        engine: "6.2L LS3 V8",
        transmission: "T-56 6-Speed"
    },
    {
        id: "2",
        customerId: "CUST001",
        year: 1969,
        make: "Chevrolet",
        model: "Chevelle SS",
        vin: "136379L123456",
        licensePlate: "CLASSIC1",
        color: "Rally Green",
        mileage: 89000
    },

    // Sarah Davis's vehicle
    {
        id: "3",
        customerId: "CUST002",
        year: 1969,
        make: "Ford",
        model: "Mustang Boss 429",
        vin: "9F02R123456",
        licensePlate: "BOSS429",
        color: "Grabber Blue",
        mileage: 45000
    },

    // Tom Wilson's vehicle
    {
        id: "4",
        customerId: "CUST003",
        year: 1970,
        make: "Plymouth",
        model: "Cuda 440",
        vin: "BS23R0B123456",
        licensePlate: "CUDA70",
        color: "Plum Crazy Purple",
        mileage: 67000
    },

    // Alex Martinez's vehicle
    {
        id: "5",
        customerId: "CUST004",
        year: 1970,
        make: "Chevrolet",
        model: "Chevelle SS",
        vin: "136370B123456",
        licensePlate: "SS1970",
        color: "Cranberry Red",
        mileage: 52000
    },

    // Jennifer Lee's vehicle
    {
        id: "6",
        customerId: "CUST005",
        year: 2019,
        make: "Chevrolet",
        model: "Corvette Z06",
        vin: "1G1YY26E095123456",
        licensePlate: "Z06-19",
        color: "Torch Red",
        mileage: 8500
    },

    // Robert Garcia's vehicle
    {
        id: "7",
        customerId: "CUST006",
        year: 2017,
        make: "Toyota",
        model: "Tacoma",
        vin: "3TMCZ5AN9HM123456",
        licensePlate: "TACO17",
        color: "Army Green",
        mileage: 95000
    },

    // Lisa Brown's vehicle
    {
        id: "8",
        customerId: "CUST007",
        year: 2015,
        make: "Ford",
        model: "F-150",
        vin: "1FTFW1ET5FKE123456",
        licensePlate: "F150-15",
        color: "Oxford White",
        mileage: 125000
    }
];

// Mock Jobs Data
export const mockJobs: Job[] = [
    {
        id: "1",
        title: "LS3 Engine Rebuild",
        description: "Complete engine rebuild with performance upgrades including forged internals, performance camshaft, and precision machining.",
        status: "In Progress",
        estimatedStartDate: "2025-06-20",
        startDate: "2025-06-20",
        estimatedCompletion: "2025-07-15",
        estimatedCost: 8500,
        actualCost: 6200,
        priority: "High",
        parts: mockParts.filter(part => part.jobId === "1"),
        customerId: "CUST001",
        vehicleId: "1",
        latestUpdate: "Customer approved performance upgrades. Waiting for custom pistons to arrive.",
        invoiced: false
    },
    {
        id: "2",
        title: "4L80E Transmission Rebuild",
        description: "Complete transmission rebuild with upgraded components and torque converter replacement.",
        status: "In Progress",
        estimatedStartDate: "2025-06-25",
        startDate: "2025-06-25",
        estimatedCompletion: "2025-07-20",
        estimatedCost: 4200,
        actualCost: 2800,
        priority: "Medium",
        parts: mockParts.filter(part => part.jobId === "2"),
        customerId: "CUST002",
        vehicleId: "3",
        latestUpdate: "Customer approved additional work on valve body.",
        invoiced: false
    },
    {
        id: "3",
        title: "Brake System Overhaul",
        description: "Front brake replacement including pads, rotors, and brake fluid flush.",
        status: "Completed",
        estimatedStartDate: "2025-06-10",
        startDate: "2025-06-10",
        completionDate: "2025-06-18",
        estimatedCompletion: "2025-06-18",
        estimatedCost: 800,
        actualCost: 750,
        priority: "Medium",
        parts: mockParts.filter(part => part.jobId === "3"),
        customerId: "CUST006",
        vehicleId: "7",
        latestUpdate: "Work completed successfully. Customer satisfied with results.",
        invoiced: true,
        invoiceAmount: 750
    },
    {
        id: "4",
        title: "Oil Change & Inspection",
        description: "Routine oil change with full vehicle inspection and fluid top-off.",
        status: "Completed",
        estimatedStartDate: "2025-06-15",
        startDate: "2025-06-15",
        completionDate: "2025-06-15",
        estimatedCompletion: "2025-06-15",
        estimatedCost: 150,
        actualCost: 145,
        priority: "Low",
        parts: mockParts.filter(part => part.jobId === "4"),
        customerId: "CUST007",
        vehicleId: "8",
        latestUpdate: "Routine maintenance completed. Recommended brake inspection in 6 months.",
        invoiced: true,
        invoiceAmount: 145
    },
    {
        id: "5",
        title: "Carburetor Rebuild",
        description: "Complete carburetor rebuild for vintage Chevelle including cleaning and calibration.",
        status: "Waiting",
        estimatedStartDate: "2025-07-01",
        startDate: "2025-07-01",
        estimatedCompletion: "2025-07-10",
        estimatedCost: 650,
        actualCost: 0,
        priority: "Medium",
        parts: mockParts.filter(part => part.jobId === "5"),
        customerId: "CUST001",
        vehicleId: "2",
        latestUpdate: "Waiting for carburetor rebuild kit to arrive.",
        waitingReason: "Parts Delivery",
        invoiced: false
    },
    {
        id: "6",
        title: "Suspension Overhaul",
        description: "Complete suspension upgrade with coilovers and performance components.",
        status: "Waiting",
        estimatedStartDate: "2025-07-05",
        startDate: "2025-07-05",
        estimatedCompletion: "2025-07-25",
        estimatedCost: 3200,
        actualCost: 0,
        priority: "Low",
        parts: mockParts.filter(part => part.jobId === "6"),
        customerId: "CUST005",
        vehicleId: "6",
        latestUpdate: "Waiting for customer approval on upgraded components.",
        waitingReason: "Customer Approval",
        invoiced: false
    },
    {
        id: "7",
        title: "Performance Exhaust Install",
        description: "Cat-back exhaust system installation with custom tips.",
        status: "On Hold",
        estimatedStartDate: "2025-06-28",
        startDate: "2025-06-28",
        estimatedCompletion: "2025-07-05",
        estimatedCost: 1500,
        actualCost: 400,
        priority: "Low",
        parts: mockParts.filter(part => part.jobId === "7"),
        customerId: "CUST004",
        vehicleId: "5",
        latestUpdate: "On hold due to shop scheduling conflicts.",
        invoiced: false
    },
    {
        id: "8",
        title: "Cold Air Intake Install",
        description: "Performance cold air intake system installation and tuning.",
        status: "Completed",
        estimatedStartDate: "2025-06-12",
        startDate: "2025-06-12",
        completionDate: "2025-06-14",
        estimatedCompletion: "2025-06-14",
        estimatedCost: 450,
        actualCost: 425,
        priority: "Low",
        parts: mockParts.filter(part => part.jobId === "8"),
        customerId: "CUST003",
        vehicleId: "4",
        latestUpdate: "Installation completed. Customer very happy with performance gains.",
        invoiced: true,
        invoiceAmount: 425
    }
];

// Mock Invoices Data
export const mockInvoices: Invoice[] = [
    {
        id: "1",
        date: "2025-06-18",
        amount: 750.00,
        amountPaid: 750.00,
        status: "Completed",
        dueDate: "2025-07-18",
        paidDate: "2025-06-20",
        customerId: "CUST006",
        jobId: "3",
        customer: null, // Will be populated by relationship
        job: null // Will be populated by relationship
    },
    {
        id: "2",
        date: "2025-06-15",
        amount: 145.00,
        amountPaid: 145.00,
        status: "Completed",
        dueDate: "2025-07-15",
        paidDate: "2025-06-16",
        customerId: "CUST007",
        jobId: "4",
        customer: null,
        job: null
    },
    {
        id: "3",
        date: "2025-06-14",
        amount: 425.00,
        amountPaid: 425.00,
        status: "Completed",
        dueDate: "2025-07-14",
        paidDate: "2025-06-18",
        customerId: "CUST003",
        jobId: "8",
        customer: null,
        job: null
    },
    {
        id: "4",
        date: "2025-06-25",
        amount: 1250.00,
        amountPaid: 0.00,
        status: "Awaiting Payment",
        dueDate: "2025-07-25",
        customerId: "CUST001",
        jobId: "1",
        customer: null,
        job: null
    },
    {
        id: "5",
        date: "2025-06-30",
        amount: 2100.00,
        amountPaid: 1000.00,
        status: "Awaiting Payment",
        dueDate: "2025-07-30",
        customerId: "CUST002",
        jobId: "2",
        customer: null,
        job: null
    }
];

// Mock Customers Data
export const mockCustomers: Customer[] = [
    {
        id: "CUST001",
        firstName: "Mike",
        lastName: "Johnson",
        phone: "(555) 123-4567",
        email: "mike.johnson@email.com",
        address: "123 Main St",
        city: "Springfield",
        state: "IL",
        zipcode: "62701",
        vehicleCount: 2,
        jobCount: 2,
        vehicles: mockVehicles.filter(v => v.customerId === "CUST001"),
        jobs: mockJobs.filter(j => j.customerId === "CUST001"),
        invoices: mockInvoices.filter(i => i.customerId === "CUST001"),
        status: "In Progress",
        totalSpent: 15840.00,
        amountOwed: 1250.00,
        notes: ""
    },
    {
        id: "CUST002",
        firstName: "Sarah",
        lastName: "Davis",
        phone: "(555) 987-6543",
        email: "sarah.davis@email.com",
        address: "456 Oak Avenue",
        city: "Springfield",
        state: "IL",
        zipcode: "62702",
        vehicleCount: 1,
        jobCount: 1,
        vehicles: mockVehicles.filter(v => v.customerId === "CUST002"),
        jobs: mockJobs.filter(j => j.customerId === "CUST002"),
        invoices: mockInvoices.filter(i => i.customerId === "CUST002"),
        status: "In Progress",
        totalSpent: 8420.00,
        amountOwed: 1100.00,
        notes: ""
    },
    {
        id: "CUST003",
        firstName: "Tom",
        lastName: "Wilson",
        phone: "(555) 456-7890",
        email: "tom.wilson@email.com",
        address: "789 Pine Street",
        city: "Springfield",
        state: "IL",
        zipcode: "62703",
        vehicleCount: 1,
        jobCount: 1,
        vehicles: mockVehicles.filter(v => v.customerId === "CUST003"),
        jobs: mockJobs.filter(j => j.customerId === "CUST003"),
        invoices: mockInvoices.filter(i => i.customerId === "CUST003"),
        status: "Completed",
        totalSpent: 24650.00,
        amountOwed: 0.00,
        notes: ""
    },
    {
        id: "CUST004",
        firstName: "Alex",
        lastName: "Martinez",
        phone: "(555) 321-6547",
        email: "alex.martinez@email.com",
        address: "321 Elm Drive",
        city: "Springfield",
        state: "IL",
        zipcode: "62704",
        vehicleCount: 1,
        jobCount: 1,
        vehicles: mockVehicles.filter(v => v.customerId === "CUST004"),
        jobs: mockJobs.filter(j => j.customerId === "CUST004"),
        invoices: mockInvoices.filter(i => i.customerId === "CUST004"),
        status: "On Hold",
        totalSpent: 5200.00,
        amountOwed: 0.00,
        notes: ""
    },
    {
        id: "CUST005",
        firstName: "Jennifer",
        lastName: "Lee",
        phone: "(555) 654-3210",
        email: "jennifer.lee@email.com",
        address: "654 Maple Lane",
        city: "Springfield",
        state: "IL",
        zipcode: "62705",
        vehicleCount: 1,
        jobCount: 1,
        vehicles: mockVehicles.filter(v => v.customerId === "CUST005"),
        jobs: mockJobs.filter(j => j.customerId === "CUST005"),
        invoices: mockInvoices.filter(i => i.customerId === "CUST005"),
        status: "Waiting",
        totalSpent: 3200.00,
        amountOwed: 0.00,
        notes: ""
    },
    {
        id: "CUST006",
        firstName: "Robert",
        lastName: "Garcia",
        phone: "(555) 789-0123",
        email: "robert.garcia@email.com",
        address: "987 Cedar Court",
        city: "Springfield",
        state: "IL",
        zipcode: "62706",
        vehicleCount: 1,
        jobCount: 1,
        vehicles: mockVehicles.filter(v => v.customerId === "CUST006"),
        jobs: mockJobs.filter(j => j.customerId === "CUST006"),
        invoices: mockInvoices.filter(i => i.customerId === "CUST006"),
        status: "Completed",
        totalSpent: 2800.00,
        amountOwed: 0.00,
        notes: ""
    },
    {
        id: "CUST007",
        firstName: "Lisa",
        lastName: "Brown",
        phone: "(555) 147-2580",
        email: "lisa.brown@email.com",
        address: "147 Birch Boulevard",
        city: "Springfield",
        state: "IL",
        zipcode: "62707",
        vehicleCount: 1,
        jobCount: 1,
        vehicles: mockVehicles.filter(v => v.customerId === "CUST007"),
        jobs: mockJobs.filter(j => j.customerId === "CUST007"),
        invoices: mockInvoices.filter(i => i.customerId === "CUST007"),
        status: "Completed",
        totalSpent: 1450.00,
        amountOwed: 0.00,
        notes: ""
    }
];

// Helper function to get customer by ID
export const getCustomerById = (id: string): Customer | undefined => {
    return mockCustomers.find(customer => customer.id === id);
};

// Helper function to get job by ID
export const getJobById = (id: string): Job | undefined => {
    return mockJobs.find(job => job.id === id);
};

// Helper function to get vehicle by ID
export const getVehicleById = (id: string): Vehicle | undefined => {
    return mockVehicles.find(vehicle => vehicle.id === id);
};

// Helper function to get jobs by status
export const getJobsByStatus = (statusType: string): Job[] => {
    return mockJobs.filter(job => job.status === statusType);
};

// Helper function to get active jobs (for dashboard)
export const getActiveJobs = (): Job[] => {
    return mockJobs.filter(job => job.status === "Active");
};

// Helper function to get jobs requiring attention
export const getJobsRequiringAttention = (): Job[] => {
    return mockJobs.filter(job =>
        job.status === "Waiting" ||
        job.status === "Payment" ||
        (job.status === "Completed" && !job.invoiced)
    );
};

// Helper function to get overdue invoices
export const getOverdueInvoices = (): Invoice[] => {
    const today = new Date();
    return mockInvoices.filter(invoice => {
        const dueDate = new Date(invoice.dueDate);
        return dueDate < today && invoice.amountPaid < invoice.amount;
    });
};

// Helper function to get recent activity (last 30 days)
export const getRecentActivity = (): (Job | Invoice)[] => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentJobs = mockJobs.filter(job => {
        const startDate = new Date(job.startDate!);
        return startDate >= thirtyDaysAgo;
    });

    const recentInvoices = mockInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= thirtyDaysAgo;
    });

    return [...recentJobs, ...recentInvoices].sort((a, b) => {
        const dateA = 'startDate' in a ? new Date(a.startDate!) : new Date();
        const dateB = 'startDate' in b ? new Date(b.startDate!) : new Date();
        return dateB.getTime() - dateA.getTime();
    });
};

// Export everything as default for easy importing
export default {
    customers: mockCustomers,
    jobs: mockJobs,
    vehicles: mockVehicles,
    invoices: mockInvoices,
    parts: mockParts,
    // Helper functions
    getCustomerById,
    getJobById,
    getVehicleById,
    getJobsByStatus,
    getActiveJobs,
    getJobsRequiringAttention,
    getOverdueInvoices,
    getRecentActivity
};