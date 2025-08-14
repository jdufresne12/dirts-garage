import { NextResponse, NextRequest } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const customerId = params.id;

        // Get comprehensive financial summary
        const query = `
            WITH customer_payments AS (
                SELECT 
                    COALESCE(SUM(p.amount), 0) as total_payments
                FROM payments p
                JOIN invoices i ON p.invoice_id = i.id
                WHERE i.customer_id = $1
            ),
            customer_invoices AS (
                SELECT 
                    COALESCE(SUM(i.amount), 0) as total_invoiced,
                    COUNT(i.id) as invoice_count
                FROM invoices i
                WHERE i.customer_id = $1
            ),
            customer_jobs AS (
                SELECT 
                    COUNT(j.id) as job_count,
                    COALESCE(SUM(j.actual_cost), 0) as total_job_costs
                FROM jobs j
                WHERE j.customer_id = $1
            )
            SELECT 
                cp.total_payments,
                ci.total_invoiced,
                ci.invoice_count,
                cj.job_count,
                cj.total_job_costs,
                (ci.total_invoiced - cp.total_payments) as amount_owed
            FROM customer_payments cp
            CROSS JOIN customer_invoices ci
            CROSS JOIN customer_jobs cj
        `;

        const result = await pgPool.query(query, [customerId]);

        if (result.rows.length === 0) {
            return NextResponse.json({
                total_spent: 0,
                amount_owed: 0,
                total_invoiced: 0,
                invoice_count: 0,
                job_count: 0,
                total_job_costs: 0
            });
        }

        const summary = result.rows[0];

        const financialSummary = {
            total_spent: parseFloat(summary.total_payments) || 0,
            amount_owed: Math.max(0, parseFloat(summary.amount_owed) || 0),
            total_invoiced: parseFloat(summary.total_invoiced) || 0,
            invoice_count: parseInt(summary.invoice_count) || 0,
            job_count: parseInt(summary.job_count) || 0,
            total_job_costs: parseFloat(summary.total_job_costs) || 0
        };

        return NextResponse.json(financialSummary);

    } catch (error) {
        console.error('Error fetching customer financial summary:', error);
        return NextResponse.json(
            JSON.stringify({
                error: 'Internal server error',
                details: (error instanceof Error) ? error.message : String(error)
            }),
            { status: 500 }
        );
    }
}