import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { pgPool } from '@/app/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
    let client;

    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { success: false, error: "Username and password are required" },
                { status: 400 }
            );
        }

        // Get database connection
        client = await pgPool.connect();

        // Find user by username
        const result = await client.query(
            'SELECT id, name, email, username, password FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const user = result.rows[0];

        // Compare password with hashed password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Create session data (exclude password)
        const sessionData = {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            loginTime: new Date().toISOString(),
        };

        // Set session cookie (expires in 7 days)
        const cookieStore = cookies();
        (await cookieStore).set({
            name: 'session',
            value: JSON.stringify(sessionData),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email
            },
        });

    } catch (error) {
        console.error("Login API error:", error);
        return NextResponse.json(
            { success: false, error: "Login failed" },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}