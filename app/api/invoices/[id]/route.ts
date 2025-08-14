import { NextRequest, NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';
import helpers from '@/app/utils/helpers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;

        // Get invoice with related data
        const invoiceQuery = `
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
        `;

        const invoiceResult = await pgPool.query(invoiceQuery, [id]);

        if (invoiceResult.rows.length === 0) {
            return new NextResponse('Invoice not found', { status: 404 });
        }

        // Get line items
        const lineItemsQuery = `
            SELECT * FROM invoice_line_items 
            WHERE invoice_id = $1 
            ORDER BY created_at ASC
        `;
        const lineItemsResult = await pgPool.query(lineItemsQuery, [id]);

        const invoice = invoiceResult.rows[0];
        const invoiceData = {
            id: invoice.id,
            date: invoice.date,
            due_date: invoice.due_date,
            amount: parseFloat(invoice.amount),
            amount_paid: parseFloat(invoice.amount_paid),
            status: invoice.status,
            paid_date: invoice.paid_date,
            customer_id: invoice.customer_id,
            job_id: invoice.job_id,
            subtotal: parseFloat(invoice.subtotal),
            tax_rate: parseFloat(invoice.tax_rate),
            tax_amount: parseFloat(invoice.tax_amount),
            discount_amount: parseFloat(invoice.discount_amount),
            notes: invoice.notes,
            revision_number: invoice.revision_number,
            auto_sync_enabled: invoice.auto_sync_enabled,
            created_at: invoice.created_at,
            updated_at: invoice.updated_at,
            customer: invoice.first_name ? {
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
            job: invoice.job_title ? {
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
                source_type: item.source_type,
                source_id: item.source_id,
                type: item.type,
                description: item.description,
                quantity: parseFloat(item.quantity),
                rate: parseFloat(item.rate),
                amount: parseFloat(item.amount),
                taxable: item.taxable,
                is_locked: item.is_locked,
                created_at: item.created_at,
                updated_at: item.updated_at
            }))
        };

        return NextResponse.json(invoiceData);
    } catch (error) {
        console.error(`GET /api/invoices/${params.id} error:`, error);
        return new NextResponse('Failed to fetch invoice', { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { invoice, line_items } = body;

        const client = await pgPool.connect();
        try {
            await client.query('BEGIN');

            // Update invoice if provided
            if (invoice) {
                const updateFields = [];
                const values = [];
                let paramIndex = 1;

                const allowedFields = [
                    'date', 'due_date', 'amount', 'amount_paid', 'status', 'paid_date',
                    'subtotal', 'tax_rate', 'tax_amount', 'discount_amount', 'notes',
                    'auto_sync_enabled'
                ];

                for (const [key, value] of Object.entries(invoice)) {
                    if (allowedFields.includes(key) && value !== undefined) {
                        updateFields.push(`${key} = $${paramIndex}`);
                        values.push(value);
                        paramIndex++;
                    }
                }

                if (updateFields.length > 0) {
                    // Increment revision number
                    updateFields.push(`revision_number = revision_number + 1`);

                    const updateQuery = `
                        UPDATE invoices 
                        SET ${updateFields.join(', ')}
                        WHERE id = $${paramIndex}
                        RETURNING *
                    `;
                    values.push(id);

                    await client.query(updateQuery, values);
                }
            }

            // Update line items if provided
            if (line_items) {
                // Delete existing line items
                await client.query('DELETE FROM invoice_line_items WHERE invoice_id = $1', [id]);

                // Insert new line items
                if (line_items.length > 0) {
                    const lineItemQuery = `
                        INSERT INTO invoice_line_items (
                            id, invoice_id, source_type, source_id, type, description,
                            quantity, rate, amount, taxable, is_locked
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    `;

                    for (const item of line_items) {
                        await client.query(lineItemQuery, [
                            item.id || helpers.generateUniqueID(),
                            id,
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
            }

            // Log the update
            await client.query(
                `INSERT INTO invoice_change_logs (id, invoice_id, change_type, changed_by, changes) 
                 VALUES ($1, $2, 'updated', 'user', $3)`,
                [helpers.generateUniqueID(), id, JSON.stringify({ updated_fields: Object.keys(invoice || {}) })]
            );

            await client.query('COMMIT');

            // Return updated invoice
            const response = await GET(req, { params });
            return response;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error(`PUT /api/invoices/${params.id} error:`, error);
        return new NextResponse('Failed to update invoice', { status: 500 });
    }
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;

        const client = await pgPool.connect();
        try {
            await client.query('BEGIN');

            // Get job_id before deleting
            const invoiceResult = await client.query('SELECT job_id FROM invoices WHERE id = $1', [id]);

            if (invoiceResult.rows.length === 0) {
                return new NextResponse('Invoice not found', { status: 404 });
            }

            const jobId = invoiceResult.rows[0].job_id;

            // Delete invoice (cascades to line_items and change_logs)
            await client.query('DELETE FROM invoices WHERE id = $1', [id]);

            // Update job to remove invoice link
            await client.query(
                'UPDATE jobs SET invoice_id = NULL, invoiced = false, invoice_amount = NULL WHERE id = $1',
                [jobId]
            );

            await client.query('COMMIT');

            return NextResponse.json({ success: true });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error(`DELETE /api/invoices/${params.id} error:`, error);
        return new NextResponse('Failed to delete invoice', { status: 500 });
    }
}
