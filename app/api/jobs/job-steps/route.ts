import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            id,
            title,
            description,
            start_date,
            completed_date,
            estimated_start_date,
            order,
            status,
            estimated_hours,
            actual_hours,
            technician,
            job_id,
        } = body;

        // Handle date fields - convert empty strings to null
        const processedStartDate = start_date === '' || start_date === null || start_date === undefined ? null : start_date;
        const processedCompletedDate = completed_date === '' || completed_date === null || completed_date === undefined ? null : completed_date;
        const processedEstimatedStartDate = estimated_start_date === '' || estimated_start_date === null || estimated_start_date === undefined ? null : estimated_start_date;

        // Handle numeric fields - convert empty strings/0 to null for optional fields
        const processedOrder = order === '' || order === null || order === undefined ? null : order;
        const processedEstimatedHours = estimated_hours === '' || estimated_hours === null || estimated_hours === undefined ? null : estimated_hours;
        const processedActualHours = actual_hours === '' || actual_hours === null || actual_hours === undefined ? null : actual_hours;

        await pgPool.query(
            `INSERT INTO job_steps (id, title, description, start_date, completed_date, estimated_start_date, "order", status, estimated_hours, actual_hours, technician, job_id, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
            [id, title, description, processedStartDate, processedCompletedDate, processedEstimatedStartDate, processedOrder, status, processedEstimatedHours, processedActualHours, technician, job_id]
        );

        return new NextResponse('Job step created', { status: 201 });
    } catch (error) {
        console.error('POST /api/job-steps error:', error);
        return new NextResponse('Failed to create job step', { status: 500 });
    }
}