import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = cookies();

        // Clear session cookie
        (await cookieStore).set({
            name: 'session',
            value: '',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            expires: new Date(0),
            path: '/',
        });
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Logout API error:", error);
        return NextResponse.json(
            { success: false, error: "Logout failed" },
            { status: 500 }
        )
    }
}