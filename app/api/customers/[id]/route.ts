import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET(_req: Request, context: { params: { id: string } }) {
    const { id } = await context.params;

    try {
        // Get customer data
        const customerResult = await pgPool.query('SELECT * FROM customers WHERE id = $1', [id]);

        if (customerResult.rows.length === 0) {
            return new NextResponse('Customer not found', { status: 404 });
        }

        const customer = customerResult.rows[0];

        // Get vehicles for this customer
        const vehiclesResult = await pgPool.query(
            'SELECT * FROM vehicles WHERE customer_id = $1 ORDER BY year DESC, make, model',
            [id]
        );

        const completeCustomerData = {
            ...customer,
            vehicles: vehiclesResult.rows,
            vehicleCount: vehiclesResult.rows.length
        };

        return NextResponse.json(completeCustomerData);
    } catch (error) {
        console.error(`Error fetching customer ${id}:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    const client = await pgPool.connect();

    try {
        await client.query('BEGIN');

        // Delete vehicles first
        await client.query('DELETE FROM vehicles WHERE customer_id = $1', [id]);

        // Then delete customer
        const result = await client.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return new NextResponse('Customer not found', { status: 404 });
        }

        await client.query('COMMIT');

        return NextResponse.json({
            message: 'Customer deleted successfully',
            deletedCustomer: result.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`DELETE /api/customers/${id} error:`, error);
        return new NextResponse('Failed to delete customer', { status: 500 });
    } finally {
        client.release();
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    const body = await req.json();

    try {
        // Define the valid database fields that can be updated
        const validFields = [
            'first_name',
            'last_name',
            'phone',
            'email',
            'address',
            'city',
            'state',
            'zipcode',
            'notes',
            'status'
        ];

        // Extract only the valid fields from the request body
        const updates: Record<string, string | number | boolean | null> = {};
        validFields.forEach(field => {
            if (body.hasOwnProperty(field)) {
                updates[field] = body[field];
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
            `UPDATE customers SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
            [...values, id]
        );

        if (result.rowCount === 0) {
            return new NextResponse('Customer not found', { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error(`PUT /api/customers/${id} error:`, error);
        return new NextResponse('Failed to update customer', { status: 500 });
    }
}
