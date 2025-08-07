import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET() {
    try {
        // Get all invoices with customer and job information
        const result = await pgPool.query(`
            SELECT 
                i.id,
                i.date,
                i.amount,
                i.amount_paid,
                i.status,
                i.due_date,
                i.paid_date,
                i.customer_id,
                i.job_id,
                i.created_at,
                i.updated_at,
                c.first_name,
                c.last_name,
                j.title as job_title
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.id
            LEFT JOIN jobs j ON i.job_id = j.id
            ORDER BY i.created_at DESC
        `);

        const invoices = result.rows.map(row => ({
            id: row.id,
            date: row.date,
            amount: parseFloat(row.amount),
            amount_paid: parseFloat(row.amount_paid),
            status: row.status,
            due_date: row.due_date,
            paid_date: row.paid_date,
            customer_id: row.customer_id,
            job_id: row.job_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
            customer_name: row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : null,
            job_title: row.job_title
        }));

        return NextResponse.json(invoices);
    } catch (error) {
        console.error('GET /api/invoices error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch invoices' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            id,
            date,
            due_date,
            amount,
            amount_paid,
            status,
            customer_id,
            job_id,
            subtotal,
            tax_rate,
            tax_amount,
            discount_amount,
            notes,
            line_items
        } = body;

        // Handle empty due_date - convert empty string to null
        const processedDueDate = due_date === '' ? null : due_date;

        // Insert the main invoice record
        const invoiceResult = await pgPool.query(
            `INSERT INTO invoices (
                id, date, due_date, amount, amount_paid, 
                status, customer_id, job_id, subtotal, tax_rate, tax_amount, 
                discount_amount, notes, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()) 
            RETURNING *`,
            [
                id,
                date,
                processedDueDate, // Use the processed due_date
                amount,
                amount_paid,
                status,
                customer_id,
                job_id,
                subtotal,
                tax_rate,
                tax_amount,
                discount_amount,
                notes
            ]
        );

        // Insert line items if provided
        if (line_items && line_items.length > 0) {
            const lineItemPromises = line_items.map((item: any) => {
                return pgPool.query(
                    `INSERT INTO invoice_line_items (
                        id, invoice_id, key, type, description, quantity, rate, amount, taxable, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
                    [
                        `${id}-${item.key}`, // Use the key for unique ID
                        id,
                        item.key, // Store the key (labor-1, part-1, etc.)
                        item.type,
                        item.description,
                        item.quantity,
                        item.rate,
                        item.amount,
                        item.taxable || true // Default to true if not provided
                    ]
                );
            });

            await Promise.all(lineItemPromises);
        }

        return NextResponse.json(invoiceResult.rows[0], { status: 201 });
    } catch (error) {
        console.error('POST /api/invoices error:', error);
        return new NextResponse('Failed to create invoice', { status: 500 });
    }
}