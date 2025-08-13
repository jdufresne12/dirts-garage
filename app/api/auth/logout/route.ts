import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = cookies();

        // Clear the session cookie
        (await cookieStore).set({
            name: 'session',
            value: '',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 0, // Expire immediately
            path: '/'
        });

        return NextResponse.json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error("Logout API error:", error);
        return NextResponse.json(
            { success: false, error: "Logout failed" },
            { status: 500 }
        );
    }
}