import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = cookies();
        const sessionCookie = (await cookieStore).get("session");

        if (!sessionCookie?.value) {
            return NextResponse.json(
                { success: false, error: "Not Authenticated" },
                { status: 401 }
            )
        }

        const sessionData = JSON.parse(sessionCookie.value);
        return NextResponse.json({
            success: true,
            user: {
                id: sessionData.id,
                username: sessionData.username,
                email: sessionData.email,
                loginTime: sessionData.loginTime,
            }
        })

    } catch (error) {
        console.error("Authentication check API error:", error)
        return NextResponse.json(
            { success: false, error: "Authentication check failed" },
            { status: 500 }
        )
    }
}