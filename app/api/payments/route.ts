import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';
import helpers from '@/app/utils/helpers';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('invoice_id');

    try {
        let query = 'SELECT * FROM payments';
        const params: (string | number)[] = [];

        if (invoiceId) {
            query += ' WHERE invoice_id = $1';
            params.push(invoiceId);
        }

        query += ' ORDER BY payment_date DESC, created_at DESC';

        const result = await pgPool.query(query, params);

        // Parse numeric fields to ensure they're numbers
        const payments = result.rows.map(payment => ({
            ...payment,
            amount: parseFloat(payment.amount)
        }));

        return NextResponse.json(payments);
    } catch (error) {
        console.error('GET /api/payments error:', error);
        return new NextResponse('Failed to fetch payments', { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            invoice_id,
            amount,
            payment_date,
            payment_method,
            reference_number,
            notes
        } = body;

        // Validate required fields
        if (!invoice_id || !amount || !payment_date || !payment_method) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // Validate payment amount is positive
        if (parseFloat(amount) <= 0) {
            return new NextResponse('Payment amount must be positive', { status: 400 });
        }

        // Check if invoice exists
        const invoiceCheck = await pgPool.query(
            'SELECT id FROM invoices WHERE id = $1',
            [invoice_id]
        );

        if (invoiceCheck.rows.length === 0) {
            return new NextResponse('Invoice not found', { status: 404 });
        }

        const paymentId = helpers.generateUniqueID();

        const result = await pgPool.query(
            `INSERT INTO payments (
                id, invoice_id, amount, payment_date, payment_method, 
                reference_number, notes, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
            RETURNING *`,
            [
                paymentId,
                invoice_id,
                parseFloat(amount),
                payment_date,
                payment_method,
                reference_number || null,
                notes || null
            ]
        );

        // Parse numeric fields for response
        const createdPayment = {
            ...result.rows[0],
            amount: parseFloat(result.rows[0].amount)
        };

        return NextResponse.json(createdPayment, { status: 201 });
    } catch (error) {
        console.error('POST /api/payments error:', error);
        return new NextResponse('Failed to create payment', { status: 500 });
    }
}