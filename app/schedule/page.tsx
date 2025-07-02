import React from 'react';
import Image from 'next/image'

export default function Schedule() {
    return (
        <div className='flex w-full h-1/2 items-center justify-center '>
            <div className="rounded-lg p-8 flex flex-col items-center max-w-sm w-full mx-4">
                <Image
                    src="/gear.png"
                    alt="Dirt's Garage Logo"
                    width={500}
                    height={500}
                    className="size-60 mb-4 slow-spin"
                    priority
                />
                <div className="text-2xl text-gray-700 font-medium text-center">
                    To be implemented soon!
                </div>

                <div className="flex space-x-1 mt-4">
                    <div className="size-3 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="size-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="size-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    )
}