'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';

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

    // Render without Navbar
    if (!shouldShowSidebar) {
        return (
            <div className="min-h-screen">
                {children}
            </div>
        );
    }

    // Render with Navbar
    return (
        <div className="flex h-screen overflow-hidden">
            <Navbar isMobile={isMobile} />
            <main className={`flex-1 min-w-0 overflow-y-auto ${isMobile ? 'pt-16' : ''}`}>
                {children}
            </main>
        </div>
    );
};