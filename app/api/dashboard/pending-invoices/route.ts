import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET() {
    try {
        const result = await pgPool.query(`
            SELECT 
                j.id,
                j.title,
                j.actual_cost,
                j.completion_date,
                c.first_name,
                c.last_name,
                v.year,
                v.make,
                v.model
            FROM jobs j
            LEFT JOIN customers c ON j.customer_id = c.id
            LEFT JOIN vehicles v ON j.vehicle_id = v.id
            WHERE j.status = 'Completed' 
                AND j.invoiced = false
                AND j.actual_cost > 0
            ORDER BY j.completion_date ASC
            LIMIT 10
        `);

        const pendingInvoices = result.rows.map(row => {
            const completedDate = new Date(row.completion_date);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - completedDate.getTime());
            const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 30; // Consider overdue after 30 days

            return {
                id: row.id,
                customer: row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : 'Unknown Customer',
                amount: parseFloat(row.actual_cost),
                jobTitle: row.title,
                completedDate: row.completion_date,
                daysOverdue: daysOverdue > 0 ? daysOverdue : 0
            };
        });

        return NextResponse.json(pendingInvoices);
    } catch (error) {
        console.error('GET /api/dashboard/pending-invoices error:', error);
        return new NextResponse('Failed to fetch pending invoices', { status: 500 });
    }
}