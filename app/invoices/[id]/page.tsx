'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import InvoiceTemplate from '@/app/components/invoices/InvoiceTemplate';
import Loading from '@/app/components/Loading';
import mockData from '@/app/data/mock-data';

// This would come from your API in a real app
const mockInvoiceData = {
    invoiceNumber: 'INV-2025-07-001',
    date: '2025-07-15',
    dueDate: '2025-08-14',
    subtotal: 4039.95,
    taxRate: 8.5,
    taxAmount: 343.40,
    discountAmount: 0,
    totalAmount: 4383.35,
    lineItems: [
        {
            id: 'labor-1',
            type: 'labor' as const,
            description: 'Labor - LS3 Engine Rebuild',
            quantity: 24,
            rate: 125,
            amount: 3000,
            taxable: true
        },
        {
            id: 'part-1',
            type: 'part' as const,
            description: 'Forged Pistons (.030 over) - SUM-2618-030',
            quantity: 8,
            rate: 459.99,
            amount: 459.99,
            taxable: true
        },
        {
            id: 'part-2',
            type: 'part' as const,
            description: 'Connecting Rods - CRS6200A33D',
            quantity: 8,
            rate: 389.99,
            amount: 389.99,
            taxable: true
        },
        {
            id: 'part-3',
            type: 'part' as const,
            description: 'ARP Head Studs - ARP-234-4316',
            quantity: 1,
            rate: 189.99,
            amount: 189.99,
            taxable: true
        }
    ],
    notes: 'Thank you for your business! Payment is due within 30 days.',
    terms: 'Net 30'
};

const businessInfo = {
    name: "Dirt's Garage",
    address: "123 Main Street",
    city: "Springfield",
    state: "IL",
    zipcode: "62701",
    phone: "(555) 123-4567",
    email: "info@dirtsgarage.com",
    website: "www.dirtsgarage.com"
};

export default function InvoicePage() {
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [invoiceData, setInvoiceData] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [vehicle, setVehicle] = useState(null);
    const [jobData, setJobData] = useState(null);

    useEffect(() => {
        // In a real app, you'd fetch the invoice data by ID
        const fetchInvoiceData = async () => {
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mock data - replace with actual API call
                setInvoiceData(mockInvoiceData);
                setCustomer(mockData.customers[0]);
                setVehicle(mockData.vehicles[0]);
                setJobData({
                    id: "2025-0156",
                    title: "LS3 Engine Rebuild",
                    description: "Complete engine rebuild including bore, hone, and performance upgrades"
                });

                setIsLoading(false);
            } catch (error) {
                console.error('Failed to fetch invoice:', error);
                setIsLoading(false);
            }
        };

        if (id) {
            fetchInvoiceData();
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    if (!invoiceData || !customer || !vehicle || !jobData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
                    <p className="text-gray-600">The requested invoice could not be found.</p>
                </div>
            </div>
        );
    }

    return (
        <InvoiceTemplate
            invoiceData={invoiceData}
            jobData={jobData}
            customer={customer}
            vehicle={vehicle}
            businessInfo={businessInfo}
        />
    );
}

// Helper function to generate invoice URL
export function generateInvoiceUrl(invoiceId: string): string {
    return `/invoices/${invoiceId}`;
}