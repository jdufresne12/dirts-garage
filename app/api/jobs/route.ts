import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET() {
    try {
        // Gather Jobs data with customer and vehicle nested inside 
        const result = await pgPool.query(`
            SELECT 
                j.*,
                json_build_object(
                    'id', c.id,
                    'first_name', c.first_name,
                    'last_name', c.last_name,
                    'email', c.email,
                    'phone', c.phone
                ) as customer,
                json_build_object(
                    'id', v.id,
                    'make', v.make,
                    'model', v.model,
                    'year', v.year
                ) as vehicle
            FROM jobs j
            LEFT JOIN customers c ON j.customer_id = c.id
            LEFT JOIN vehicles v ON j.vehicle_id = v.id
            ORDER BY j.created_at DESC
        `);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('GET /api/jobs error:', error);
        console.error('Error details:', (error as Error).message);
        return NextResponse.json(
            { error: 'Failed to fetch jobs', details: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            id,
            customer_id,
            vehicle_id,
            title,
            description,
            status = 'Waiting',
            waiting_reason = null,
            latest_update = null,
            estimated_start_date,
            estimated_completion,
            start_date,
            completion_date,
            estimated_cost = 0,
            actual_cost = 0,
            priority = 'Medium',
            invoiced = false,
            invoice_amount = 0
        } = body;

        // Helper function to convert empty strings to null for dates
        const formatDate = (dateStr: string | null | undefined) => {
            if (!dateStr || dateStr.trim() === '') return null;
            return dateStr;
        };

        // Ensure numeric fields are not null
        const safeEstimatedCost = estimated_cost ?? 0;
        const safeActualCost = actual_cost ?? 0;
        const safeInvoiceAmount = invoice_amount ?? 0;
        const safeInvoiced = invoiced ?? false;

        // Format dates properly
        const safeEstimatedStartDate = formatDate(estimated_start_date);
        const safeEstimatedCompletion = formatDate(estimated_completion);
        const safeStartDate = formatDate(start_date);
        const safeCompletionDate = formatDate(completion_date);

        const result = await pgPool.query(
            `INSERT INTO jobs (
                id, customer_id, vehicle_id, title, description, status, 
                waiting_reason, latest_update, estimated_start_date, 
                estimated_completion, start_date, completion_date, 
                estimated_cost, actual_cost, priority, invoiced, 
                invoice_amount, created_at, updated_at
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
                $11, $12, $13, $14, $15, $16, $17, NOW(), NOW()
            )
            RETURNING *`,
            [
                id, customer_id, vehicle_id, title, description, status,
                waiting_reason, latest_update, safeEstimatedStartDate,
                safeEstimatedCompletion, safeStartDate, safeCompletionDate,
                safeEstimatedCost, safeActualCost, priority, safeInvoiced,
                safeInvoiceAmount
            ]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('POST /api/jobs error:', error);
        console.error('Error details:', (error as Error).message);
        return NextResponse.json(
            { error: 'Failed to create job', details: (error as Error).message },
            { status: 500 }
        );
    }
}