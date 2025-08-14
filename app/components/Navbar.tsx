'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Wrench,
    Receipt,
    Calendar,
    Settings,
    ChevronLeft,
    ChevronRight,
    X,
    LogOut,
    Menu
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SignOutModal from './SignOutModal';

interface NavbarProps {
    isMobile: boolean;
}
interface MenuItem {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href: string;
}

export default function Navbar({ isMobile }: NavbarProps) {
    const { user, logout } = useAuth();
    const pathname = `/${usePathname().split('/')[1]}`;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showSignOutModal, setShowSignoutModal] = useState(false);

    const menuItems: MenuItem[] = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
        { icon: Users, label: 'Customers', href: '/customers' },
        { icon: Wrench, label: 'Jobs', href: '/jobs' },
        // { icon: Receipt, label: 'Invoicing', href: '/invoices' },
        // { icon: Calendar, label: 'Schedule', href: '/schedule' },
        // { icon: Settings, label: 'Settings', href: '/settings' },
    ];


    if (isMobile) {
        return (
            <>
                {/* Mobile Header */}
                <div className="fixed top-0 left-0 right-0 bg-slate-800 text-white z-40 border-b border-slate-700">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3 min-w-0">
                            <Image
                                src="/gear.png"
                                alt="Dirt&apos;s Garage Logo"
                                width={28}
                                height={28}
                                className="flex-shrink-0"
                                priority
                            />
                            <span className="text-lg font-bold text-orange-400 truncate">Dirt&apos;s Garage</span>
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg hover:bg-slate-700 transition-colors flex-shrink-0"
                        >
                            {mobileMenuOpen ? (
                                <X className="size-6" />
                            ) : (
                                <Menu className="size-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Slide-out Menu */}
                <div className={`fixed top-16 left-0 h-full bg-slate-800 text-white z-50 
                    transition-transform duration-300 ease-in-out w-64
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <nav className="p-4">
                        <ul className="space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${isActive
                                                ? 'bg-orange-500 text-white shadow-lg'
                                                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                                }`}
                                        >
                                            <Icon className={`size-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'
                                                }`} />
                                            <span className="font-medium">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                            <li key={'Sign Out'} className="relative group">
                                <button
                                    onClick={() => setShowSignoutModal(true)}
                                    className='w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-700 hover:text-white'
                                >
                                    <LogOut className='size-5 flex-shrink-0 text-slate-400 group-hover:text-white' />
                                    {!isCollapsed && (
                                        <span className="font-medium">Sign Out</span>
                                    )}
                                </button>
                            </li>
                        </ul>
                    </nav>

                    {/* Mobile Footer */}
                    <div className="absolute bottom-15 left-0 right-0 p-4 border-t border-slate-700">
                        <div className="text-xs text-slate-400">
                            <p className="mb-1">Logged in as:</p>
                            <p className="font-medium text-slate-300 truncate">{user?.username}</p>
                        </div>
                    </div>
                </div>

                <SignOutModal isOpen={showSignOutModal} onClose={() => setShowSignoutModal(false)} />
            </>
        );
    }

    // Desktop Sidebar
    return (
        <div className={`
            flex-shrink-0 h-screen flex flex-col bg-slate-800 text-white 
            transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-fit'}
        `}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                {!isCollapsed && (
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="flex-shrink-0">
                            <Image
                                src="/gear.png"
                                alt="Dirt's Garage Logo"
                                width={28}
                                height={28}
                                className="size-4 lg:size-6"
                                priority
                            />
                        </div>
                        <span className="text-md lg:text-xl font-bold text-orange-400 truncate">
                            Dirt&apos;s Garage
                        </span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 ml-1 rounded-full transition-colors hover:bg-slate-700 flex-shrink-0"
                >
                    {isCollapsed ? (
                        <ChevronRight className="size-5" />
                    ) : (
                        <ChevronLeft className="size-5" />
                    )}
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 py-4 overflow-hidden">
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
                                    <Icon className={`size-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                                        }`} />
                                    {!isCollapsed && (
                                        <span className="text-sm lg:text-lg font-medium truncate">{item.label}</span>
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
                    <li key={'Sign Out'} className="relative group">
                        <button
                            onClick={() => setShowSignoutModal(true)}
                            className='w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-700 hover:text-white'
                        >
                            <LogOut className='size-5 flex-shrink-0 text-slate-400 group-hover:text-white' />
                            {!isCollapsed && (
                                <span className="text-sm lg:text-lg font-medium truncate">Sign Out</span>
                            )}
                        </button>

                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-slate-900 text-white px-2 py-1 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                                Sign Out
                            </div>
                        )}
                    </li>
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700 flex-shrink-0">
                {!isCollapsed && (
                    <div className="text-xs text-slate-400">
                        <p className="mb-1">Logged in as:</p>
                        <p className="font-medium text-slate-300 truncate">
                            {user?.username || 'Garage Admin'}
                        </p>
                    </div>
                )}
            </div>

            <SignOutModal isOpen={showSignOutModal} onClose={() => setShowSignoutModal(false)} />
        </div>
    );
}