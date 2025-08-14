import { NextRequest, NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';
import helpers from '@/app/utils/helpers';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { force_sync = false, preserve_custom_items = true, lock_modified_items = false } = body;

        // Get current invoice
        const invoiceResult = await pgPool.query(
            'SELECT * FROM invoices WHERE id = $1',
            [id]
        );

        if (invoiceResult.rows.length === 0) {
            return new NextResponse('Invoice not found', { status: 404 });
        }

        const invoice = invoiceResult.rows[0];

        // Check if auto-sync is enabled
        if (!invoice.auto_sync_enabled && !force_sync) {
            return NextResponse.json({
                success: false,
                message: 'Auto-sync is disabled for this invoice'
            });
        }

        // Get current job data
        const jobDataQuery = `
            SELECT 
                j.*,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', js.id,
                            'title', js.title,
                            'description', js.description,
                            'actual_hours', js.actual_hours
                        )
                    ) FILTER (WHERE js.id IS NOT NULL), 
                    '[]'
                ) as job_steps,
                COALESCE(
                    JSON_AGG(
                        DISTINCT JSON_BUILD_OBJECT(
                            'id', p.id,
                            'name', p.name,
                            'part_number', p.part_number,
                            'quantity', p.quantity,
                            'price', p.price
                        )
                    ) FILTER (WHERE p.id IS NOT NULL), 
                    '[]'
                ) as parts
            FROM jobs j
            LEFT JOIN job_steps js ON j.id = js.job_id
            LEFT JOIN parts p ON j.id = p.job_id
            WHERE j.id = $1
            GROUP BY j.id
        `;

        const jobResult = await pgPool.query(jobDataQuery, [invoice.job_id]);

        if (jobResult.rows.length === 0) {
            return new NextResponse('Job not found', { status: 404 });
        }

        const jobData = jobResult.rows[0];
        const jobSteps = jobData.job_steps || [];
        const parts = jobData.parts || [];

        // Get current line items
        const currentLineItems = await pgPool.query(
            'SELECT * FROM invoice_line_items WHERE invoice_id = $1',
            [id]
        );

        const client = await pgPool.connect();
        try {
            await client.query('BEGIN');

            // Generate new line items from job data
            const newLineItems = [];

            // Add labor items from job steps
            const totalLaborHours = jobSteps.reduce((sum: number, step: JobStep) =>
                sum + (parseFloat(String(step.actual_hours)) || 0), 0
            );

            if (totalLaborHours > 0) {
                newLineItems.push({
                    id: helpers.generateUniqueID(),
                    source_type: 'job_labor',
                    source_id: null, // Could link to consolidated labor
                    type: 'labor',
                    description: `Labor - ${jobData.title}`,
                    quantity: totalLaborHours,
                    rate: 125, // Default rate - should be configurable
                    amount: totalLaborHours * 125,
                    taxable: true,
                    is_locked: false
                });
            }

            // Add part items
            parts.forEach((part: Part) => {
                if (part.id) {
                    newLineItems.push({
                        id: helpers.generateUniqueID(),
                        source_type: 'job_part',
                        source_id: part.id,
                        type: 'part',
                        description: `${part.name} - ${part.part_number}`,
                        quantity: parseFloat(String(part.quantity)) || 1,
                        rate: parseFloat(String(part.price)) || 0,
                        amount: (parseFloat(String(part.quantity)) || 1) * (parseFloat(String(part.price)) || 0),
                        taxable: true,
                        is_locked: false
                    });
                }
            });

            // Preserve custom items if requested
            const customItems = preserve_custom_items
                ? currentLineItems.rows.filter(item =>
                    item.source_type === 'custom' || item.source_type === 'fee' || item.source_type === 'discount'
                )
                : [];

            // Preserve locked items if requested
            const lockedItems = lock_modified_items
                ? currentLineItems.rows.filter(item => item.is_locked)
                : [];

            // Combine all line items
            const allLineItems = [...newLineItems, ...customItems, ...lockedItems];

            // Delete existing synced line items
            await client.query(
                `DELETE FROM invoice_line_items 
                 WHERE invoice_id = $1 AND (
                    source_type IN ('job_labor', 'job_part') OR 
                    (source_type IS NULL AND type IN ('labor', 'part'))
                 ) AND is_locked = false`,
                [id]
            );

            // Insert new line items
            if (allLineItems.length > 0) {
                const lineItemQuery = `
                    INSERT INTO invoice_line_items (
                        id, invoice_id, source_type, source_id, type, description,
                        quantity, rate, amount, taxable, is_locked
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                `;

                for (const item of allLineItems) {
                    await client.query(lineItemQuery, [
                        item.id,
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

            // Recalculate totals
            const subtotal = allLineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
            const discountAmount = parseFloat(invoice.discount_amount) || 0;
            const taxableAmount = subtotal - discountAmount;
            const taxAmount = (taxableAmount * parseFloat(invoice.tax_rate)) / 100;
            const totalAmount = taxableAmount + taxAmount;

            // Update invoice totals
            await client.query(
                `UPDATE invoices 
                 SET subtotal = $1, tax_amount = $2, amount = $3, revision_number = revision_number + 1
                 WHERE id = $4`,
                [subtotal, taxAmount, totalAmount, id]
            );

            // Log the sync
            await client.query(
                `INSERT INTO invoice_change_logs (id, invoice_id, change_type, changed_by, changes) 
                 VALUES ($1, $2, 'synced', 'system', $3)`,
                [helpers.generateUniqueID(), id, JSON.stringify({
                    synced_from_job: invoice.job_id,
                    labor_hours: totalLaborHours,
                    parts_count: parts.length
                })]
            );

            await client.query('COMMIT');

            return NextResponse.json({
                success: true,
                message: 'Invoice synced successfully',
                changes: {
                    labor_hours: totalLaborHours,
                    parts_count: parts.length,
                    new_subtotal: subtotal,
                    new_total: totalAmount
                }
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error(`POST /api/invoices/${params.id}/sync error:`, error);
        return new NextResponse('Failed to sync invoice', { status: 500 });
    }
}