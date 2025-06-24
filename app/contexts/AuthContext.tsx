'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
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
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/api/auth/check');
            if (response.ok) {
                const userData = await response.json();
                setUser(userData.user);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            setIsLoading(true);

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
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
            setUser(null);
            window.location.href = 'login';
        } catch (error) {
            console.error('Logout failed:', error);
            setUser(null);
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
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