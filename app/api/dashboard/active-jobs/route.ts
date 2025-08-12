// api/dashboard/active-jobs/route.ts
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
                j.estimated_completion,
                c.first_name,
                c.last_name,
                v.year,
                v.make,
                v.model
            FROM jobs j
            LEFT JOIN customers c ON j.customer_id = c.id
            LEFT JOIN vehicles v ON j.vehicle_id = v.id
            WHERE j.status = 'In Progress'
            ORDER BY j.estimated_completion ASC
            LIMIT 10
        `);

        const activeJobs = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            customer: row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : 'Unknown Customer',
            vehicle: row.year && row.make && row.model ? `${row.year} ${row.make} ${row.model}` : 'No Vehicle',
            status: row.status,
            startedDate: row.created_at,
            estimatedCompletion: row.estimated_completion
        }));

        return NextResponse.json(activeJobs);
    } catch (error) {
        console.error('GET /api/dashboard/active-jobs error:', error);
        return new NextResponse('Failed to fetch active jobs', { status: 500 });
    }
}