'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';

// Create a separate component for the login form that uses useSearchParams
function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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

    return (
        <div className="h-screen flex items-center justify-center bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
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
                        Dirt&apos;s Garage
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
                                autoComplete="username"
                                className="relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-t-md 
                                    focus:outline-none focus:ring-orange-400 focus:border-orange-400 focus:z-10 sm:text-sm"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="relative flex items-center">
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                autoComplete="current-password"
                                className="block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-b-md 
            focus:outline-none focus:ring-orange-400 focus:border-orange-400 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="absolute right-3"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-300 transition-colors" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-300 transition-colors" />
                                )}
                            </button>
                        </div>

                    </div>

                    {error && (
                        <div className="rounded-md bg-red-900 border border-red-700 p-4">
                            <div className="text-sm text-red-200">{error}</div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-orange-400
                                hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 disabled:opacity-50 disabled:cursor-not-allowed
                                transition-colors duration-200"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Loading component to show while suspense boundary loads
function LoginLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
            <div className="text-white">Loading...</div>
        </div>
    );
}

// Main component with Suspense boundary
export default function LoginPage() {
    return (
        <Suspense fallback={<LoginLoading />}>
            <LoginForm />
        </Suspense>
    );
}