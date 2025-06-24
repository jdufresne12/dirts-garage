import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const { id, username, email } = await request.json();
        const sessionData = {
            id,
            username,
            email,
            loginTime: new Date().toISOString(),
        }

        // Set session cookie (expires in 7 days)
        const cookieStore = cookies();
        (await cookieStore).set({
            name: 'session',
            value: JSON.stringify(sessionData),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: '/' // Set path to root so it's accessible across the site
        })

        return NextResponse.json({
            success: true,
            user: { id, username, email },
        });
    } catch (error) {
        console.error("Login API error:", error);
        return NextResponse.json(
            { success: false, error: "Login failed" },
            { status: 500 }
        )
    }
}