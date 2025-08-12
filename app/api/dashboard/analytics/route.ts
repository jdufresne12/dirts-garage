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

        // 1. Revenue This Month
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

        // 2. Pending Invoices Count AND Amount
        const pendingInvoicesResult = await pgPool.query(
            `SELECT COUNT(*) as count, COALESCE(SUM(actual_cost), 0) as amount FROM jobs WHERE invoiced = false AND status = 'Completed'`
        );
        const pendingInvoicesCount = parseInt(pendingInvoicesResult.rows[0].count);
        const pendingInvoicesAmount = parseFloat(pendingInvoicesResult.rows[0].amount);

        // Check for overdue invoices (jobs completed > 30 days ago without invoicing)
        const overdueDate = new Date();
        overdueDate.setDate(overdueDate.getDate() - 30);
        const overdueInvoicesResult = await pgPool.query(
            `SELECT COUNT(*) as count FROM jobs WHERE invoiced = false AND status = 'Completed' AND completion_date < $1`,
            [overdueDate.toISOString()]
        );
        const overdueCount = parseInt(overdueInvoicesResult.rows[0].count);

        // 3. Active Jobs Count
        const activeJobsResult = await pgPool.query(
            `SELECT COUNT(*) as count FROM jobs WHERE status = 'In Progress'`
        );
        const activeJobsCount = parseInt(activeJobsResult.rows[0].count);

        // Active jobs from last week for comparison
        const activeJobsLastWeekResult = await pgPool.query(
            `SELECT COUNT(*) as count FROM jobs WHERE status = 'In Progress' AND created_at < $1`,
            [lastWeek.toISOString()]
        );
        const activeJobsLastWeek = parseInt(activeJobsLastWeekResult.rows[0].count);
        const activeJobsChange = activeJobsCount - activeJobsLastWeek;

        // 4. Jobs Waiting Count
        const waitingJobsResult = await pgPool.query(
            `SELECT COUNT(*) as count FROM jobs WHERE status = 'Waiting'`
        );
        const waitingJobsCount = parseInt(waitingJobsResult.rows[0].count);

        // Build response with both count and amount options for pending invoices
        const analytics = {
            revenueThisMonth: {
                value: thisMonthRevenue,
                change: `${revenueChangePercent >= 0 ? '+' : ''}${revenueChangePercent.toFixed(1)}% from last month`,
                changeType: revenueChangePercent >= 0 ? 'positive' : 'negative'
            },
            pendingInvoices: {
                value: pendingInvoicesCount, // Use count for the main display
                amount: pendingInvoicesAmount, // Include amount for reference
                change: overdueCount > 0 ? `${overdueCount} overdue` : 'All current',
                changeType: overdueCount > 0 ? 'negative' : 'positive'
            },
            activeJobs: {
                value: activeJobsCount,
                change: activeJobsChange > 0 ? `+${activeJobsChange} from last week` : `${activeJobsChange} from last week`,
                changeType: activeJobsChange >= 0 ? 'positive' : 'negative'
            },
            jobsWaiting: {
                value: waitingJobsCount,
                change: 'On schedule',
                changeType: 'positive'
            }
        };

        return NextResponse.json(analytics);
    } catch (error) {
        console.error('GET /api/dashboard/analytics error:', error);
        return new NextResponse('Failed to fetch analytics', { status: 500 });
    }
}