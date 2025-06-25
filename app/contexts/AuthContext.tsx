'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLoading } from './LoadingContext'

interface User {
    id: string;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

// Hardcoded user credentials (replace with API call later)
const HARDCODED_USERS = [
    {
        id: '1',
        username: 'admin',
        password: 'password123',
        email: 'admin@dirtsgarage.com'
    },
    {
        id: '2',
        username: 'user',
        password: 'user123',
        email: 'user@dirtsgarage.com'
    }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { showLoading, hideLoading } = useLoading();
    const [user, setUser] = useState<User | null>(null);

    // Check for existing session on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            showLoading('Authenticating...');
            const response = await fetch('/api/auth/check');
            if (response.ok) {
                const userData = await response.json();
                setUser(userData.user);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            hideLoading();
        }
    };

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            showLoading('Logging in...');

            await new Promise(resolve => setTimeout(resolve, 2000));
            // Find user in hardcoded list
            const foundUser = HARDCODED_USERS.find(
                u => u.username === username && u.password === password
            );

            if (!foundUser) {
                return false;
            }

            // Set session cookie
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: foundUser.id,
                    username: foundUser.username,
                    email: foundUser.email
                }),
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData.user);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        } finally {
            hideLoading();
        }
    };

    const logout = async () => {
        try {
            showLoading("Logging out...")
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
            setUser(null);
            window.location.href = 'login';
        } catch (error) {
            console.error('Logout failed:', error);
            setUser(null);
        } finally {
            hideLoading();
        }
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}