'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Wrench,
    Package,
    Receipt,
    BarChart3,
    Calendar,
    Settings,
    ChevronLeft,
    ChevronRight,
    X,
    Menu
} from 'lucide-react';

interface NavbarProps {
    isMobile: boolean;
}
interface MenuItem {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href: string;
}

export default function Navbar({ isMobile }: NavbarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const menuItems: MenuItem[] = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
        { icon: Users, label: 'Customers', href: '/customers' },
        { icon: Wrench, label: 'Jobs', href: '/jobs' },
        { icon: Package, label: 'Inventory', href: '/inventory' },
        { icon: Receipt, label: 'Invoicing', href: '/invoicing' },
        { icon: BarChart3, label: 'Reports', href: '/reports' },
        { icon: Calendar, label: 'Schedule', href: '/schedule' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    // Close mobile menu when clicking a link
    const handleLinkClick = () => {
        if (isMobile) {
            setMobileMenuOpen(false);
        }
    };

    if (isMobile) {
        return (
            <>
                <div className="fixed top-0 left-0 right-0 bg-slate-800 text-white z-40 border-b border-slate-700">
                    <div className="flex items-center justify-between p-4">
                        {/* Logo and Title */}
                        <div className="flex items-center space-x-3">
                            <Image
                                src="/gear.png"
                                alt="Dirt's Garage Logo"
                                width={500}
                                height={500}
                                className="size-7"
                                priority
                            />
                            <span className="text-lg font-bold text-orange-400">Dirt's Garage</span>
                        </div>

                        {/* Hamburger Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Slide-out Menu */}
                <div className={`
                    fixed top-16 left-0 h-full bg-slate-800 text-white z-50 
                    transition-transform duration-300 ease-in-out w-64
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    {/* Navigation Items */}
                    <nav className="p-4">
                        <ul className="space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            onClick={handleLinkClick}
                                            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${isActive
                                                ? 'bg-orange-500 text-white shadow-lg'
                                                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'
                                                }`} />
                                            <span className="font-medium">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Mobile Footer */}
                    <div className="absolute bottom-15 left-0 right-0 p-4 border-t border-slate-700">
                        <div className="text-xs text-slate-400">
                            <p className="mb-1">Logged in as:</p>
                            <p className="font-medium text-slate-300">Garage Admin</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Desktop Sidebar
    return (
        <div className={`
            relative min-h-screen flex flex-col bg-slate-800 text-white 
            transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}
        `}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                {!isCollapsed && (
                    <div className="flex items-center space-x-3">
                        <div className="items-center justify-center">
                            <Image
                                src="/gear.png"
                                alt="Dirt's Garage Logo"
                                width={500}
                                height={500}
                                className="size-7"
                                priority
                            />
                        </div>
                        <span className="text-xl font-bold text-orange-400">Dirt's Garage</span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 rounded-full transition-colors hover:bg-slate-700"
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <ChevronLeft className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 py-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <li key={item.label} className="relative group">
                                <Link
                                    href={item.href}
                                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-orange-500 text-white shadow-lg'
                                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                                        }`} />
                                    {!isCollapsed && (
                                        <span className="font-medium truncate">{item.label}</span>
                                    )}
                                </Link>

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-slate-900 text-white px-2 py-1 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                                        {item.label}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700">
                {!isCollapsed && (
                    <div className="text-xs text-slate-400">
                        <p className="mb-1">Logged in as:</p>
                        <p className="font-medium text-slate-300">Garage Admin</p>
                    </div>
                )}
            </div>
        </div>
    );
}