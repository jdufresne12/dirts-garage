'use client'

import React from 'react';
import Image from 'next/image';
import { useLoading } from '@/app/contexts/LoadingContext';

export default function Loading() {
    const { isLoading, loadingMessage } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center max-w-sm w-full mx-4">
                <Image
                    src="/gear.png"
                    alt="Dirt's Garage Logo"
                    width={500}
                    height={500}
                    className="size-20 mb-4 slow-spin"
                    priority
                />
                <div className="text-lg text-gray-700 font-medium text-center">
                    {loadingMessage}
                </div>

                {/* Optional: Progress dots */}
                <div className="flex space-x-1 mt-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    );
}