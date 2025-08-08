import { NextRequest, NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';
import helpers from '@/app/utils/helpers';

// GET /api/invoices - List all invoices with optional filters
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const customer_id = searchParams.get('customer_id');
        const job_id = searchParams.get('job_id');
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = `
            SELECT 
                i.*,
                c.first_name, c.last_name, c.email, c.phone, c.address, c.city, c.state, c.zipcode,
                j.title as job_title, j.description as job_description,
                v.year, v.make, v.model, v.vin
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.id
            LEFT JOIN jobs j ON i.job_id = j.id
            LEFT JOIN vehicles v ON j.vehicle_id = v.id
            WHERE 1=1
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (customer_id) {
            query += ` AND i.customer_id = $${paramIndex}`;
            params.push(customer_id);
            paramIndex++;
        }

        if (job_id) {
            query += ` AND i.job_id = $${paramIndex}`;
            params.push(job_id);
            paramIndex++;
        }

        if (status) {
            query += ` AND i.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        query += ` ORDER BY i.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await pgPool.query(query, params);

        const invoices = result.rows.map(row => ({
            id: row.id,
            date: row.date,
            due_date: row.due_date,
            amount: parseFloat(row.amount),
            amount_paid: parseFloat(row.amount_paid),
            status: row.status,
            paid_date: row.paid_date,
            customer_id: row.customer_id,
            job_id: row.job_id,
            subtotal: parseFloat(row.subtotal),
            tax_rate: parseFloat(row.tax_rate),
            tax_amount: parseFloat(row.tax_amount),
            discount_amount: parseFloat(row.discount_amount),
            notes: row.notes,
            revision_number: row.revision_number,
            auto_sync_enabled: row.auto_sync_enabled,
            created_at: row.created_at,
            updated_at: row.updated_at,
            customer: row.first_name ? {
                id: row.customer_id,
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email,
                phone: row.phone,
                address: row.address,
                city: row.city,
                state: row.state,
                zipcode: row.zipcode
            } : null,
            job: row.job_title ? {
                id: row.job_id,
                title: row.job_title,
                description: row.job_description,
                vehicle: row.year ? {
                    year: row.year,
                    make: row.make,
                    model: row.model,
                    vin: row.vin
                } : null
            } : null
        }));

        return NextResponse.json(invoices);
    } catch (error) {
        console.error('GET /api/invoices error:', error);
        return new NextResponse('Failed to fetch invoices', { status: 500 });
    }
}

// POST /api/invoices - Create new invoice
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { invoice, line_items = [] } = body;

        // Generate invoice ID if not provided
        const invoiceId = invoice.id || `INV-${helpers.generateUniqueID()}`;

        // Start transaction
        const client = await pgPool.connect();
        try {
            await client.query('BEGIN');

            // Insert invoice
            const invoiceQuery = `
                INSERT INTO invoices (
                    id, date, due_date, amount, amount_paid, status, customer_id, job_id,
                    subtotal, tax_rate, tax_amount, discount_amount, notes, revision_number, auto_sync_enabled
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                RETURNING *
            `;

            const invoiceResult = await client.query(invoiceQuery, [
                invoiceId,
                invoice.date,
                invoice.due_date || null,
                invoice.amount || 0,
                invoice.amount_paid || 0,
                invoice.status || 'draft',
                invoice.customer_id,
                invoice.job_id,
                invoice.subtotal || 0,
                invoice.tax_rate || 0,
                invoice.tax_amount || 0,
                invoice.discount_amount || 0,
                invoice.notes || null,
                invoice.revision_number || 1,
                invoice.auto_sync_enabled !== undefined ? invoice.auto_sync_enabled : true
            ]);

            // Insert line items
            if (line_items.length > 0) {
                const lineItemQuery = `
                    INSERT INTO invoice_line_items (
                        id, invoice_id, source_type, source_id, type, description,
                        quantity, rate, amount, taxable, is_locked
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                `;

                for (const item of line_items) {
                    await client.query(lineItemQuery, [
                        helpers.generateUniqueID(),
                        invoiceId,
                        item.source_type || null,
                        item.source_id || null,
                        item.type,
                        item.description,
                        item.quantity,
                        item.rate,
                        item.amount,
                        item.taxable !== undefined ? item.taxable : true,
                        item.is_locked || false
                    ]);
                }
            }

            // Update job to link to invoice
            await client.query(
                'UPDATE jobs SET invoice_id = $1, invoiced = true, invoice_amount = $2 WHERE id = $3',
                [invoiceId, invoice.amount, invoice.job_id]
            );

            // Log creation
            await client.query(
                `INSERT INTO invoice_change_logs (id, invoice_id, change_type, changed_by, changes) 
                 VALUES ($1, $2, 'created', 'system', $3)`,
                [helpers.generateUniqueID(), invoiceId, JSON.stringify({ created: true })]
            );

            await client.query('COMMIT');

            const createdInvoice = invoiceResult.rows[0];
            return NextResponse.json({
                ...createdInvoice,
                amount: parseFloat(createdInvoice.amount),
                amount_paid: parseFloat(createdInvoice.amount_paid),
                subtotal: parseFloat(createdInvoice.subtotal),
                tax_rate: parseFloat(createdInvoice.tax_rate),
                tax_amount: parseFloat(createdInvoice.tax_amount),
                discount_amount: parseFloat(createdInvoice.discount_amount)
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('POST /api/invoices error:', error);
        return new NextResponse('Failed to create invoice', { status: 500 });
    }
}