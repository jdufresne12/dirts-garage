import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET(_req: Request, context: { params: { id: string } }) {
    const { id } = await context.params;

    try {
        const result = await pgPool.query('SELECT * FROM customers WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return new NextResponse('Customer not found', { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error(`Error fetching customer ${id}:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    const updates = await req.json();

    try {
        // Build SET clause dynamically
        const keys = Object.keys(updates);
        if (keys.length === 0) {
            return new NextResponse('No fields to update', { status: 400 });
        }

        // Add updated_at automatically
        // keys.push('updated_at');
        // updates['updated_at'] = new Date().toISOString();

        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        const values = keys.map(key => updates[key]);

        const result = await pgPool.query(
            `UPDATE customers SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
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
