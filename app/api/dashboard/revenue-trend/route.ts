// api/dashboard/revenue-trend/route.ts
import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET() {
    try {
        // Get revenue data for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const result = await pgPool.query(`
            SELECT 
                DATE_TRUNC('month', completion_date) as month,
                SUM(actual_cost) as revenue,
                COUNT(*) as job_count
            FROM jobs 
            WHERE completion_date >= $1 
                AND status = 'Completed'
                AND actual_cost > 0
            GROUP BY DATE_TRUNC('month', completion_date)
            ORDER BY month ASC
        `, [sixMonthsAgo.toISOString()]);

        // Format data for chart
        const revenueData = result.rows.map(row => ({
            month: new Date(row.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            revenue: parseFloat(row.revenue),
            jobCount: parseInt(row.job_count)
        }));

        // Fill in missing months with zero revenue
        const filledData = fillMissingMonths(revenueData, sixMonthsAgo);

        return NextResponse.json(filledData);
    } catch (error) {
        console.error('GET /api/dashboard/revenue-trend error:', error);
        return new NextResponse('Failed to fetch revenue trend', { status: 500 });
    }
}

function fillMissingMonths(data: any[], startDate: Date) {
    const result = [];
    const currentDate = new Date(startDate);
    const now = new Date();

    while (currentDate <= now) {
        const monthKey = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const existingData = data.find(d => d.month === monthKey);

        result.push({
            month: monthKey,
            revenue: existingData ? existingData.revenue : 0,
            jobCount: existingData ? existingData.jobCount : 0
        });

        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return result;
}