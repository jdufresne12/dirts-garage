import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function DELETE(_req: Request, context: { params: { id: string } }) {
    const { id } = await context.params;

    try {
        await pgPool.query('DELETE FROM invoice_line_items WHERE invoice_id = $1', [id]);
        return NextResponse.json({ message: 'Line items deleted successfully' });
    } catch (error) {
        console.error(`Error deleting line items for invoice ${id}:`, error);
        return new NextResponse('Failed to delete line items', { status: 500 });
    }
}

export async function POST(req: Request, context: { params: { id: string } }) {
    const { id } = await context.params;
    const body = await req.json();
    const { line_items } = body;

    try {
        if (line_items && line_items.length > 0) {
            const lineItemPromises = line_items.map((item: any) => {
                return pgPool.query(
                    `INSERT INTO invoice_line_items (
                        id, invoice_id, key, type, description, quantity, rate, amount, taxable, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
                    [
                        `${id}-${item.key}`, // Use the key for unique ID
                        id,
                        item.key, // Store the key (labor-1, part-1, etc.)
                        item.type,
                        item.description,
                        item.quantity,
                        item.rate,
                        item.amount,
                        item.taxable || true // Default to true if not provided
                    ]
                );
            });

            await Promise.all(lineItemPromises);
        }

        return NextResponse.json({ message: 'Line items created successfully' });
    } catch (error) {
        console.error(`Error creating line items for invoice ${id}:`, error);
        return new NextResponse('Failed to create line items', { status: 500 });
    }
}