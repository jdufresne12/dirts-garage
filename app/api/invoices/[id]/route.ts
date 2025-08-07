// app/api/invoices/[id]/route.ts
import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET(_req: Request, context: { params: { id: string } }) {
    const { id } = await context.params;

    try {
        // Get invoice data with related data
        const invoiceResult = await pgPool.query(`
            SELECT 
                i.*,
                c.first_name, c.last_name, c.email, c.phone, c.address, c.city, c.state, c.zipcode,
                j.title as job_title, j.description as job_description,
                v.year, v.make, v.model, v.vin
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.id
            LEFT JOIN jobs j ON i.job_id = j.id
            LEFT JOIN vehicles v ON j.vehicle_id = v.id
            WHERE i.id = $1
        `, [id]);

        if (invoiceResult.rows.length === 0) {
            return new NextResponse('Invoice not found', { status: 404 });
        }

        const invoice = invoiceResult.rows[0];

        // Get line items for this invoice
        const lineItemsResult = await pgPool.query(`
            SELECT * FROM invoice_line_items 
            WHERE invoice_id = $1 
            ORDER BY created_at
        `, [id]);

        // Construct the response object
        const invoiceData = {
            id: invoice.id,
            date: invoice.date,
            amount: parseFloat(invoice.amount),
            amount_paid: parseFloat(invoice.amount_paid),
            status: invoice.status,
            due_date: invoice.due_date,
            paid_date: invoice.paid_date,
            customer_id: invoice.customer_id,
            job_id: invoice.job_id,
            subtotal: parseFloat(invoice.subtotal),
            tax_rate: parseFloat(invoice.tax_rate),
            tax_amount: parseFloat(invoice.tax_amount),
            discount_amount: parseFloat(invoice.discount_amount),
            notes: invoice.notes,
            created_at: invoice.created_at,
            updated_at: invoice.updated_at,
            customer: invoice.customer_id ? {
                id: invoice.customer_id,
                first_name: invoice.first_name,
                last_name: invoice.last_name,
                email: invoice.email,
                phone: invoice.phone,
                address: invoice.address,
                city: invoice.city,
                state: invoice.state,
                zipcode: invoice.zipcode
            } : null,
            job: invoice.job_id ? {
                id: invoice.job_id,
                title: invoice.job_title,
                description: invoice.job_description,
                vehicle: invoice.year ? {
                    year: invoice.year,
                    make: invoice.make,
                    model: invoice.model,
                    vin: invoice.vin
                } : null
            } : null,
            line_items: lineItemsResult.rows.map(item => ({
                id: item.id,
                invoice_id: item.invoice_id,
                key: item.id, // Using id as key since your schema doesn't have key field
                type: item.type,
                description: item.description,
                quantity: parseFloat(item.quantity),
                rate: parseFloat(item.rate),
                amount: parseFloat(item.amount),
                taxable: item.taxable,
                created_at: item.created_at,
                updated_at: item.updated_at
            }))
        };

        return NextResponse.json(invoiceData);
    } catch (error) {
        console.error(`Error fetching invoice ${id}:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    const body = await req.json();

    try {
        const validFields = [
            'date',
            'amount',
            'amount_paid',
            'status',
            'due_date',
            'paid_date',
            'subtotal',
            'tax_rate',
            'tax_amount',
            'discount_amount',
            'notes'
        ];

        const updates: Record<string, any> = {};
        validFields.forEach(field => {
            if (body.hasOwnProperty(field)) {
                let value = body[field];

                // Handle date fields
                if (['date', 'due_date', 'paid_date'].includes(field)) {
                    if (value === '' || value === null || value === undefined) {
                        value = null;
                    }
                }

                // Handle numeric fields
                if (['amount', 'amount_paid', 'subtotal', 'tax_rate', 'tax_amount', 'discount_amount'].includes(field)) {
                    if (value === '' || value === null || value === undefined) {
                        value = null;
                    } else {
                        value = parseFloat(value);
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
            `UPDATE invoices SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
            [...values, id]
        );

        if (result.rowCount === 0) {
            return new NextResponse('Invoice not found', { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error(`PUT /api/invoices/${id} error:`, error);
        return new NextResponse('Failed to update invoice', { status: 500 });
    }
}

export async function DELETE(_req: Request, context: { params: { id: string } }) {
    const { id } = await context.params;

    try {
        // Delete line items first (cascade should handle this, but being explicit)
        await pgPool.query('DELETE FROM invoice_line_items WHERE invoice_id = $1', [id]);

        // Delete the invoice
        const result = await pgPool.query('DELETE FROM invoices WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return new NextResponse('Invoice not found', { status: 404 });
        }

        return NextResponse.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error(`DELETE /api/invoices/${id} error:`, error);
        return new NextResponse('Failed to delete invoice', { status: 500 });
    }
}