// api/dashboard/analytics/route.ts
import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET() {
    try {
        // Get current date ranges
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const lastWeek = new Date(thisWeek.getTime() - 7 * 24 * 60 * 60 * 1000);

        // 1. Active Jobs Count
        const activeJobsResult = await pgPool.query(
            `SELECT COUNT(*) as count FROM jobs WHERE status IN ('In Progress', 'Waiting')`
        );
        const activeJobsCount = parseInt(activeJobsResult.rows[0].count);

        // Active jobs from last week for comparison
        const activeJobsLastWeekResult = await pgPool.query(
            `SELECT COUNT(*) as count FROM jobs WHERE status IN ('In Progress', 'Waiting') AND created_at < $1`,
            [lastWeek.toISOString()]
        );
        const activeJobsLastWeek = parseInt(activeJobsLastWeekResult.rows[0].count);
        const activeJobsChange = activeJobsCount - activeJobsLastWeek;

        // 2. Revenue This Month
        const revenueResult = await pgPool.query(
            `SELECT COALESCE(SUM(actual_cost), 0) as revenue FROM jobs WHERE completion_date >= $1 AND status = 'Completed'`,
            [thisMonth.toISOString()]
        );
        const thisMonthRevenue = parseFloat(revenueResult.rows[0].revenue);

        // Last month revenue for comparison
        const lastMonthRevenueResult = await pgPool.query(
            `SELECT COALESCE(SUM(actual_cost), 0) as revenue FROM jobs WHERE completion_date >= $1 AND completion_date < $2 AND status = 'Completed'`,
            [lastMonth.toISOString(), thisMonth.toISOString()]
        );
        const lastMonthRevenue = parseFloat(lastMonthRevenueResult.rows[0].revenue);
        const revenueChangePercent = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

        // 3. Pending Invoices
        const pendingInvoicesResult = await pgPool.query(
            `SELECT COALESCE(SUM(invoice_amount), 0) as amount, COUNT(*) as count FROM jobs WHERE invoiced = false AND status = 'Completed'`
        );
        const pendingInvoicesAmount = parseFloat(pendingInvoicesResult.rows[0].amount);
        const pendingInvoicesCount = parseInt(pendingInvoicesResult.rows[0].count);

        // Check for overdue invoices (assuming jobs completed > 30 days ago without invoicing are overdue)
        const overdueDate = new Date();
        overdueDate.setDate(overdueDate.getDate() - 30);
        const overdueInvoicesResult = await pgPool.query(
            `SELECT COUNT(*) as count FROM jobs WHERE invoiced = false AND status = 'Completed' AND completion_date < $1`,
            [overdueDate.toISOString()]
        );
        const overdueCount = parseInt(overdueInvoicesResult.rows[0].count);

        // 4. Completed This Week
        const completedThisWeekResult = await pgPool.query(
            `SELECT COUNT(*) as count FROM jobs WHERE status = 'Completed' AND completion_date >= $1`,
            [thisWeek.toISOString()]
        );
        const completedThisWeek = parseInt(completedThisWeekResult.rows[0].count);

        // Build response
        const analytics = {
            activeJobs: {
                value: activeJobsCount,
                change: activeJobsChange > 0 ? `+${activeJobsChange} from last week` : `${activeJobsChange} from last week`,
                changeType: activeJobsChange >= 0 ? 'positive' : 'negative'
            },
            revenue: {
                value: thisMonthRevenue,
                change: `${revenueChangePercent >= 0 ? '+' : ''}${revenueChangePercent.toFixed(1)}% from last month`,
                changeType: revenueChangePercent >= 0 ? 'positive' : 'negative'
            },
            pendingInvoices: {
                value: pendingInvoicesAmount,
                change: overdueCount > 0 ? `${overdueCount} overdue` : 'All current',
                changeType: overdueCount > 0 ? 'negative' : 'positive'
            },
            completedThisWeek: {
                value: completedThisWeek,
                change: 'On schedule', // You can enhance this with more logic
                changeType: 'positive'
            }
        };

        return NextResponse.json(analytics);
    } catch (error) {
        console.error('GET /api/dashboard/analytics error:', error);
        return new NextResponse('Failed to fetch analytics', { status: 500 });
    }
}