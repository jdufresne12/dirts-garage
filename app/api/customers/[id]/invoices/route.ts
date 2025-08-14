// app/api/customers/[id]/invoices/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: customerId } = await params;

        // Get invoices for the customer with job information - using the same structure as the main invoices API
        const query = `
            SELECT 
                i.*,
                j.title as job_title,
                j.description as job_description,
                v.year, v.make, v.model, v.vin,
                COALESCE(
                    (SELECT COUNT(*) FROM invoice_line_items ili WHERE ili.invoice_id = i.id),
                    0
                ) as line_item_count
            FROM invoices i
            LEFT JOIN jobs j ON i.job_id = j.id
            LEFT JOIN vehicles v ON j.vehicle_id = v.id
            WHERE i.customer_id = $1
            ORDER BY i.created_at DESC
        `;

        const result = await pgPool.query(query, [customerId]);

        // Format the invoices data to match the Invoice interface
        const invoices = result.rows.map(invoice => ({
            id: invoice.id,
            date: invoice.date,
            due_date: invoice.due_date,
            amount: parseFloat(invoice.amount) || 0,
            amount_paid: parseFloat(invoice.amount_paid) || 0,
            status: invoice.status,
            paid_date: invoice.paid_date,
            customer_id: invoice.customer_id,
            job_id: invoice.job_id,
            subtotal: parseFloat(invoice.subtotal) || 0,
            tax_rate: parseFloat(invoice.tax_rate) || 0,
            tax_amount: parseFloat(invoice.tax_amount) || 0,
            discount_amount: parseFloat(invoice.discount_amount) || 0,
            notes: invoice.notes,
            revision_number: invoice.revision_number || 1,
            auto_sync_enabled: invoice.auto_sync_enabled || false,
            created_at: invoice.created_at,
            updated_at: invoice.updated_at,
            // Job info (if available)
            job: invoice.job_id ? {
                id: invoice.job_id,
                title: invoice.job_title,
                description: invoice.job_description,
                vehicle: invoice.year ? {
                    year: parseInt(invoice.year),
                    make: invoice.make,
                    model: invoice.model,
                    vin: invoice.vin
                } : null
            } : null,
            // Calculated fields
            balance_due: (parseFloat(invoice.amount) || 0) - (parseFloat(invoice.amount_paid) || 0),
            is_overdue: invoice.due_date && new Date(invoice.due_date) < new Date() &&
                (parseFloat(invoice.amount_paid) || 0) < (parseFloat(invoice.amount) || 0),
            line_item_count: parseInt(invoice.line_item_count) || 0
        }));

        return NextResponse.json(invoices);

    } catch (error) {
        console.error('Error fetching customer invoices:', error);
        return new NextResponse(
            JSON.stringify({
                error: 'Internal server error',
                details: (error instanceof Error) ? error.message : String(error)
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}