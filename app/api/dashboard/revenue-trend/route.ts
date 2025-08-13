// api/dashboard/revenue-trend/route.ts
import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET() {
    try {
        const result = await pgPool.query(`
            SELECT 
                DATE_TRUNC('month', payment_date) as month,
                SUM(amount) as revenue
            FROM payments 
            WHERE amount > 0
            GROUP BY DATE_TRUNC('month', payment_date)
            ORDER BY month ASC
        `);

        console.log('Database result:', result.rows);

        // Format data for chart
        const revenueData = result.rows.map(row => {
            // Extract year and month directly from the UTC date string
            const date = new Date(row.month);
            const year = date.getUTCFullYear();
            const monthIndex = date.getUTCMonth(); // 0-based month

            // Create month string manually to avoid timezone issues
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthString = `${monthNames[monthIndex]} ${year}`;

            return {
                month: monthString,
                revenue: parseFloat(row.revenue)
            };
        });

        console.log('Formatted revenue data:', revenueData);

        // Fill in missing months to ensure exactly 6 months ending with current month
        const filledData = generateSixMonthsData(revenueData);

        return NextResponse.json(filledData);
    } catch (error) {
        console.error('GET /api/dashboard/revenue-trend error:', error);
        return new NextResponse('Failed to fetch revenue trend', { status: 500 });
    }
}

function generateSixMonthsData(existingData: any[]) {
    const result = [];
    const currentDate = new Date();

    // Create month names array for consistent formatting
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Start from 5 months ago to include current month (6 total)
    for (let i = 5; i >= 0; i--) {
        const targetDate = new Date();
        targetDate.setMonth(currentDate.getMonth() - i);

        const year = targetDate.getFullYear();
        const monthIndex = targetDate.getMonth();
        const monthKey = `${monthNames[monthIndex]} ${year}`;

        const existingRecord = existingData.find(d => d.month === monthKey);

        console.log(`Looking for ${monthKey}, found:`, existingRecord);

        result.push({
            month: monthKey,
            revenue: existingRecord ? existingRecord.revenue : 0
        });
    }

    console.log('Final generated data:', result);
    return result;
}