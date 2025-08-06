// api/dashboard/recent-activity/route.ts
import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET() {
    try {
        // Get recent activity from the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const result = await pgPool.query(`
            SELECT 
                j.id,
                j.title,
                j.status,
                j.start_date,
                j.completion_date,
                j.updated_at,
                c.first_name,
                c.last_name,
                v.year,
                v.make,
                v.model
            FROM jobs j
            LEFT JOIN customers c ON j.customer_id = c.id
            LEFT JOIN vehicles v ON j.vehicle_id = v.id
            WHERE j.updated_at >= $1
            ORDER BY j.updated_at DESC
            LIMIT 10
        `, [sevenDaysAgo.toISOString()]);

        const activities = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            status: row.status,
            customer: row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : 'Unknown Customer',
            vehicle: row.year && row.make && row.model ? `${row.year} ${row.make} ${row.model}` : 'No Vehicle',
            timestamp: row.updated_at,
            type: getActivityType(row.status, row.start_date, row.completion_date)
        }));

        return NextResponse.json(activities);
    } catch (error) {
        console.error('GET /api/dashboard/recent-activity error:', error);
        return new NextResponse('Failed to fetch recent activity', { status: 500 });
    }
}

function getActivityType(status: string, startDate: string, completionDate: string) {
    if (completionDate) return 'completed';
    if (startDate) return 'started';
    if (status === 'In Progress') return 'in_progress';
    return 'created';
}