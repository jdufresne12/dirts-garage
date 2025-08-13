import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = cookies();
        const sessionCookie = (await cookieStore).get('session');

        if (!sessionCookie) {
            return NextResponse.json(
                { success: false, error: "No session found" },
                { status: 401 }
            );
        }

        const sessionData = JSON.parse(sessionCookie.value);

        // Optional: Add session expiry check here
        const loginTime = new Date(sessionData.loginTime);
        const now = new Date();
        const sessionAge = now.getTime() - loginTime.getTime();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

        if (sessionAge > maxAge) {
            return NextResponse.json(
                { success: false, error: "Session expired" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: sessionData.id,
                name: sessionData.name,
                username: sessionData.username,
                email: sessionData.email
            }
        });

    } catch (error) {
        console.error("Auth check error:", error);
        return NextResponse.json(
            { success: false, error: "Authentication check failed" },
            { status: 500 }
        );
    }
}