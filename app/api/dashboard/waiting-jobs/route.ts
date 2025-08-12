// api/dashboard/waiting-jobs/route.ts
import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET() {
    try {
        const result = await pgPool.query(`
            SELECT 
                j.id,
                j.title,
                j.status,
                j.created_at,
                j.waiting_reason,
                j.priority,
                c.first_name,
                c.last_name,
                v.year,
                v.make,
                v.model
            FROM jobs j
            LEFT JOIN customers c ON j.customer_id = c.id
            LEFT JOIN vehicles v ON j.vehicle_id = v.id
            WHERE j.status = 'Waiting'
            ORDER BY 
                CASE j.priority 
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 3
                    ELSE 4
                END,
                j.created_at ASC
            LIMIT 10
        `);

        const waitingJobs = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            customer: row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : 'Unknown Customer',
            vehicle: row.year && row.make && row.model ? `${row.year} ${row.make} ${row.model}` : 'No Vehicle',
            status: row.status,
            createdDate: row.created_at,
            priority: row.priority || 'medium',
            waitingReason: row.waiting_reason || 'Waiting for parts/approval'
        }));

        return NextResponse.json(waitingJobs);
    } catch (error) {
        console.error('GET /api/dashboard/waiting-jobs error:', error);
        return new NextResponse('Failed to fetch waiting jobs', { status: 500 });
    }
}