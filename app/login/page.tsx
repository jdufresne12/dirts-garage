'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/app/contexts/AuthContext';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showCredentials, setShowCredentials] = useState(false);

    const { login, isAuthenticated } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const redirectPath = searchParams.get('redirect') || '/';

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push(redirectPath);
        }
    }, [isAuthenticated, router, redirectPath]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const success = await login(username, password);

            if (success) {
                router.push(redirectPath);
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = (demoUsername: string, demoPassword: string) => {
        setUsername(demoUsername);
        setPassword(demoPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <Image
                        src="/gear.png"
                        alt="Dirt's Garage Logo"
                        width={500}
                        height={500}
                        className="mx-auto size-40 mb-15 slow-spin"
                        priority
                    />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-orange-400">
                        Dirt's Garage
                    </h2>
                    <p className="mt-2 text-center text-sm text-white">
                        Welcome back! Please sign in to your account.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-white rounded-t-md 
                                    focus:outline-none focus:ring-orange-400 focus:border-orange-400 focus:z-10 sm:text-sm"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-white rounded-b-md 
                                    focus:outline-none focus:ring-orange-400 focus:border-orange-400 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-700">{error}</div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-orange-400
                                hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>

                    {/* Demo Credentials Section */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-950 text-gray-500 bg-none">Demo Credentials</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={() => setShowCredentials(!showCredentials)}
                                className="text-sm text-gray-600 hover:text-gray-400 underline"
                            >
                                {showCredentials ? 'Hide' : 'Show'} demo login options
                            </button>

                            {showCredentials && (
                                <div className="mt-3 space-y-2">
                                    <div className="text-xs text-gray-600 mb-2">
                                        Click to auto-fill credentials:
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDemoLogin('admin', 'password123')}
                                        className="w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-300 rounded border"
                                    >
                                        <strong>Admin:</strong> admin / password123
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDemoLogin('user', 'user123')}
                                        className="w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-300 rounded border"
                                    >
                                        <strong>User:</strong> user / user123
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}