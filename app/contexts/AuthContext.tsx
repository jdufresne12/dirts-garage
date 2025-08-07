'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLoading } from './LoadingContext'

interface User {
    id: string;
    name: string;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

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
                const data = await response.json();
                if (data.success && data.user) {
                    setUser(data.user);
                }
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

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setUser(data.user);
                return true;
            } else {
                console.error('Login failed:', data.error);
                return false;
            }

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
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
            // Still clear local state even if API call fails
            setUser(null);
            window.location.href = '/login';
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