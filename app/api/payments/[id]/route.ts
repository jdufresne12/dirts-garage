// app/api/payments/[id]/route.ts
import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET(_req: Request, context: { params: { id: string } }) {
    const { id } = await context.params;

    try {
        const result = await pgPool.query('SELECT * FROM payments WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return new NextResponse('Payment not found', { status: 404 });
        }

        // Parse numeric fields
        const payment = {
            ...result.rows[0],
            amount: parseFloat(result.rows[0].amount)
        };

        return NextResponse.json(payment);
    } catch (error) {
        console.error(`GET /api/payments/${id} error:`, error);
        return new NextResponse('Failed to fetch payment', { status: 500 });
    }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
    const { id } = await context.params;
    const body = await req.json();

    try {
        const validFields = [
            'amount',
            'payment_date',
            'payment_method',
            'reference_number',
            'notes'
        ];

        const updates: Record<string, any> = {};
        validFields.forEach(field => {
            if (body.hasOwnProperty(field)) {
                let value = body[field];

                // Handle numeric fields
                if (field === 'amount') {
                    if (value === '' || value === null || value === undefined) {
                        return new NextResponse('Amount is required', { status: 400 });
                    }
                    value = parseFloat(value);
                    if (value <= 0) {
                        return new NextResponse('Amount must be positive', { status: 400 });
                    }
                }

                // Handle required date fields
                if (field === 'payment_date') {
                    if (value === '' || value === null || value === undefined) {
                        return new NextResponse('Payment date is required', { status: 400 });
                    }
                }

                updates[field] = value;
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
            `UPDATE payments SET ${setClause}, updated_at = NOW() WHERE id = ${keys.length + 1} RETURNING *`,
            [...values, id]
        );

        if (result.rowCount === 0) {
            return new NextResponse('Payment not found', { status: 404 });
        }

        // Parse numeric fields for response
        const updatedPayment = {
            ...result.rows[0],
            amount: parseFloat(result.rows[0].amount)
        };

        return NextResponse.json(updatedPayment);
    } catch (error) {
        console.error(`PUT /api/payments/${id} error:`, error);
        return new NextResponse('Failed to update payment', { status: 500 });
    }
}

export async function DELETE(_req: Request, context: { params: { id: string } }) {
    const { id } = await context.params;

    try {
        const result = await pgPool.query(
            'DELETE FROM payments WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            return new NextResponse('Payment not found', { status: 404 });
        }

        return NextResponse.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error(`DELETE /api/payments/${id} error:`, error);
        return new NextResponse('Failed to delete payment', { status: 500 });
    }
}