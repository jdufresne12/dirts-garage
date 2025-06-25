'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';

interface LayoutWrapperProps {
    children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
    const pathname = usePathname();
    const [isMobile, setIsMobile] = useState(false);

    const nonSidebarRoutes = [
        '/login',
    ];
    const shouldShowSidebar = !nonSidebarRoutes.some(route =>
        pathname.startsWith(route)
    );

    // Check if screen is mobile
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 640);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Render without sidebar for auth pages, errors, etc.
    if (!shouldShowSidebar) {
        return (
            <div className="min-h-screen bg-gray-50">
                {children}
            </div>
        );
    }

    // Render with sidebar for dashboard pages
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Navbar isMobile={isMobile} />
            <main className={`flex-1 transition-all duration-300 ${isMobile ? 'pt-16' : ''
                }`}>
                <div className="">
                    {children}
                </div>
            </main>
        </div>
    );
};