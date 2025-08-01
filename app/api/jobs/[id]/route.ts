import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET(_req: Request, context: { params: { id: string } }) {
    const { id } = await context.params;

    try {
        // Get Job data
        const jobsResult = await pgPool.query('SELECT * FROM jobs WHERE id = $1', [id]);
        if (jobsResult.rows.length === 0) {
            return new NextResponse('Job not found', { status: 404 });
        }
        const jobs = jobsResult.rows[0];

        // Get Customer Data
        let customer: Customer | undefined = undefined;
        if (jobs.customer_id) {
            const customerResult = await pgPool.query('SELECT * FROM customers WHERE id = $1', [jobs.customer_id]);
            if (customerResult.rows.length === 0) {
                return new NextResponse('Customer not found', { status: 404 });
            }
            customer = customerResult.rows[0];
        }

        let vehicle: Vehicle | undefined = undefined;
        if (jobs.vehicle_id) {
            const vehicleResult = await pgPool.query('SELECT * FROM vehicles WHERE id = $1', [jobs.vehicle_id]);
            if (vehicleResult.rows.length === 0) {
                return new NextResponse('Vehicle not found', { status: 404 });
            }
            vehicle = vehicleResult.rows[0];
        }

        const completeCustomerData = {
            ...jobs,
            customer: customer,
            vehicle: vehicle,
        };

        return NextResponse.json(completeCustomerData);
    } catch (error) {
        console.error(`Error fetching customer ${id}:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    const body = await req.json();

    try {
        const validFields = [
            'customer_id',
            'vehicle_id',
            'title',
            'description',
            'status',
            'waiting_reason',
            'latest_update',
            'estimated_start_date',
            'estimated_completion',
            'start_date',
            'completion_date',
            'estimated_cost',
            'actual_cost',
            'priority',
            'invoiced',
            'invoice_amount'
        ];

        // Define field mappings from frontend names to database column names
        const fieldMappings: Record<string, string> = {
            'estimated_start': 'estimated_start_date',
            // Add more mappings as needed
            // 'frontend_field_name': 'database_column_name'
        };

        // Define which database fields are date fields that need special handling
        const dateFields = [
            'estimated_start_date',
            'estimated_completion',
            'start_date',
            'completion_date'
        ];

        // Extract and map fields from the request body
        const updates: Record<string, any> = {};

        // First, handle direct field matches
        validFields.forEach(field => {
            if (body.hasOwnProperty(field)) {
                let value = body[field];

                // Handle date fields - convert empty strings to null
                if (dateFields.includes(field)) {
                    if (value === '' || value === null || value === undefined) {
                        value = null;
                    }
                }

                // Handle boolean fields
                if (field === 'invoiced') {
                    value = Boolean(value);
                }

                // Handle numeric fields
                if (['estimated_cost', 'actual_cost', 'invoice_amount'].includes(field)) {
                    if (value === '' || value === null || value === undefined) {
                        value = null;
                    } else {
                        value = parseFloat(value);
                    }
                }

                updates[field] = value;
            }
        });

        // Then, handle mapped fields
        Object.entries(fieldMappings).forEach(([frontendField, dbField]) => {
            if (body.hasOwnProperty(frontendField)) {
                let value = body[frontendField];

                // Handle date fields - convert empty strings to null
                if (dateFields.includes(dbField)) {
                    if (value === '' || value === null || value === undefined) {
                        value = null;
                    }
                }

                // Handle boolean fields
                if (dbField === 'invoiced') {
                    value = Boolean(value);
                }

                // Handle numeric fields
                if (['estimated_cost', 'actual_cost', 'invoice_amount'].includes(dbField)) {
                    if (value === '' || value === null || value === undefined) {
                        value = null;
                    } else {
                        value = parseFloat(value);
                    }
                }

                updates[dbField] = value; // Use the database field name
            }
        });

        // Check if there are any valid fields to update
        const keys = Object.keys(updates);
        if (keys.length === 0) {
            return new NextResponse('No valid fields to update', { status: 400 });
        }

        // Build the SET clause dynamically
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        const values = keys.map(key => updates[key]);

        // Execute the update query
        const result = await pgPool.query(
            `UPDATE jobs SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
            [...values, id]
        );

        if (result.rowCount === 0) {
            return new NextResponse('Job not found', { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error(`PUT /api/jobs/${id} error:`, error);
        return new NextResponse('Failed to update job', { status: 500 });
    }
}