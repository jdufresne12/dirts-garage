import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const result = await pgPool.query(
            'SELECT * FROM vehicles WHERE customer_id = $1 ORDER BY created_at DESC',
            [id]
        );

        console.log('Query result rows:', result.rows.length);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('GET /api/vehicles/customer/[id] error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}