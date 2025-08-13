import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET() {
    try {
        const result = await pgPool.query(`
            SELECT 
                i.id,
                i.amount,
                i.amount_paid,
                i.due_date,
                i.date,
                i.status,
                j.title as job_title,
                j.completion_date,
                c.first_name,
                c.last_name
            FROM invoices i
            LEFT JOIN jobs j ON i.job_id = j.id
            LEFT JOIN customers c ON j.customer_id = c.id
            WHERE i.status NOT IN ('cancelled', 'paid', 'draft')
            ORDER BY j.completion_date ASC
            LIMIT 10
        `);

        const pendingInvoices = result.rows.map(row => {
            const dueDate = new Date(row.due_date);
            const now = new Date();
            const diffTime = now.getTime() - dueDate.getTime();
            const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return {
                id: row.id,
                customer: row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : 'Unknown Customer',
                amount: parseFloat(row.amount) - parseFloat(row.amount_paid) || 0,
                jobTitle: row.job_title || 'No Job Title',
                completedDate: row.completion_date,
                invoiceDate: row.date,
                daysOverdue: row.due_Date && daysOverdue > 0 ? daysOverdue : 0
            };
        });

        return NextResponse.json(pendingInvoices);
    } catch (error) {
        console.error('GET /api/dashboard/pending-invoices error:', error);
        return new NextResponse('Failed to fetch pending invoices', { status: 500 });
    }
}