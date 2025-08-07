'use client'
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import InvoicePreview from './InvoicePreview';
import InvoiceEditor from './InvoiceEditor';
import helpers from '@/app/utils/helpers';

// Remove InvoiceData interface and use Invoice from types.ts
// Add these local interfaces for modal-specific state
interface LaborSettings {
    laborType: 'hourly' | 'fixed';
    laborRate: number;
    laborDescription: string;
    laborAmount: number;
}

interface InvoiceGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobData: Job;
    customer: Customer;
    totalLaborHours: number; // Just pass the calculated total
    parts: Part[];
}

const businessInfo = {
    name: "Dirt's Garage",
    address: "154 South Parliman rd",
    city: "Lagrangeville",
    state: "NY",
    zipcode: "12540",
    phone: "(845) 224-7046",
    email: "Johndirt30@gmail.com"
};

export default function InvoiceGenerationModal({
    isOpen,
    onClose,
    jobData,
    customer,
    totalLaborHours,
    parts
}: InvoiceGenerationModalProps) {
    const [invoiceData, setInvoiceData] = useState<Invoice>({
        id: `INV-${helpers.generateUniqueID()}`,
        date: new Date().toISOString().split('T')[0],
        due_date: '',
        amount: 0,
        amount_paid: 0,
        status: 'pending',
        customer_id: customer.id,
        job_id: jobData.id,
        subtotal: 0,
        tax_rate: 8.5,
        tax_amount: 0,
        discount_amount: 0,
        line_items: [],
        notes: 'Thank you for your business!'
    });

    const [laborSettings, setLaborSettings] = useState<LaborSettings>({
        laborType: 'hourly',
        laborRate: 125,
        laborDescription: `Labor - ${jobData?.title || 'Service'}`,
        laborAmount: 0
    });

    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');

    // Initialize invoice data when modal opens
    useEffect(() => {
        if (isOpen) {
            generateLineItems();
        }
    }, [isOpen, totalLaborHours, parts]);

    // Calculate totals when line items or adjustments change
    useEffect(() => {
        calculateTotals();
    }, [invoiceData.line_items, invoiceData.discount_amount, invoiceData.tax_rate]);

    // Helper function to safely convert values to numbers
    const safeNumber = (value: any): number => {
        if (value === null || value === undefined || value === '') return 0;
        const num = typeof value === 'string' ? parseFloat(value) : Number(value);
        return isNaN(num) ? 0 : num;
    };

    const generateLineItems = () => {
        const items: InvoiceLineItem[] = [];

        // Add labor item if there are hours
        if (totalLaborHours > 0) {
            items.push({
                id: helpers.generateUniqueID(),
                invoice_id: invoiceData.id,
                key: 'labor-1',
                type: 'labor',
                description: laborSettings.laborDescription,
                quantity: totalLaborHours,
                rate: safeNumber(laborSettings.laborRate),
                amount: totalLaborHours * safeNumber(laborSettings.laborRate),
                taxable: true
            });
        }

        // Add parts items
        if (parts && parts.length > 0) {
            parts.forEach((part, index) => {
                const quantity = safeNumber(part.quantity);
                const rate = safeNumber(part.price);

                items.push({
                    id: helpers.generateUniqueID(),
                    invoice_id: invoiceData.id,
                    key: `part-${index + 1}`,
                    type: 'part',
                    description: `${part.name} - ${part.part_number}`,
                    quantity: quantity,
                    rate: rate,
                    amount: quantity * rate,
                    taxable: true
                });
            });
        }

        setInvoiceData(prev => ({ ...prev, line_items: items }));
    };

    const calculateTotals = () => {
        const subtotal = invoiceData.line_items?.reduce((sum, item) => {
            return sum + safeNumber(item.amount);
        }, 0) || 0;

        const discount_amount = safeNumber(invoiceData.discount_amount);
        const taxableAmount = subtotal - discount_amount;
        const tax_amount = (taxableAmount * safeNumber(invoiceData.tax_rate)) / 100;
        const amount = taxableAmount + tax_amount;

        setInvoiceData(prev => ({
            ...prev,
            subtotal,
            tax_amount,
            amount
        }));
    };

    const handleCreateInvoice = async () => {
        setIsCreating(true);

        try {
            // Create invoice in database
            const response = await fetch('/api/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(invoiceData),
            });

            if (!response.ok) {
                throw new Error('Failed to create invoice');
            }

            const createdInvoice = await response.json();

            // Update job status to invoiced
            await fetch(`/api/jobs/${jobData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    invoiced: true,
                    invoice_amount: invoiceData.amount
                }),
            });

            alert(`Invoice ${invoiceData.id} created successfully!`);
            onClose();

        } catch (error) {
            console.error('Failed to create invoice:', error);
            alert('Failed to create invoice. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 md:p-4">
            <div className="bg-white rounded-lg w-full h-full md:max-w-6xl md:h-auto md:max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-200 p-4 md:p-6 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg md:text-2xl font-bold text-gray-900">Create Invoice</h2>
                            <p className="text-sm md:text-base text-gray-600">
                                {jobData.title} - {customer.first_name} {customer.last_name}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X size={20} className="md:w-6 md:h-6" />
                        </button>
                    </div>

                    {/* Mobile Tab Navigation */}
                    <div className="md:hidden mt-4 flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'preview'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Preview
                        </button>
                        <button
                            onClick={() => setActiveTab('edit')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'edit'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Edit
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex h-full">
                        {/* Left Panel - Preview */}
                        <div className="flex-1 overflow-y-auto bg-gray-50">
                            <div className="p-6">
                                <InvoicePreview
                                    invoiceData={invoiceData}
                                    customer={customer}
                                    businessInfo={businessInfo}
                                    className="max-w-2xl mx-auto"
                                />
                            </div>
                        </div>

                        {/* Right Panel - Editor */}
                        <div className="w-80 border-l border-gray-200 overflow-y-auto">
                            <div className="p-6">
                                <InvoiceEditor
                                    invoiceData={invoiceData}
                                    setInvoiceData={setInvoiceData}
                                    laborSettings={laborSettings}
                                    setLaborSettings={setLaborSettings}
                                    totalLaborHours={totalLaborHours}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden h-full">
                        {activeTab === 'preview' ? (
                            <div className="h-full p-4 overflow-y-auto bg-gray-50">
                                <InvoicePreview
                                    invoiceData={invoiceData}
                                    customer={customer}
                                    businessInfo={businessInfo}
                                />
                            </div>
                        ) : (
                            <div className="h-full p-4 overflow-y-auto">
                                <InvoiceEditor
                                    invoiceData={invoiceData}
                                    setInvoiceData={setInvoiceData}
                                    laborSettings={laborSettings}
                                    setLaborSettings={setLaborSettings}
                                    totalLaborHours={totalLaborHours}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 md:p-6 flex-shrink-0">
                    <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center justify-center md:justify-start">
                            <label className="flex items-center">
                                <input type="checkbox" className="mr-2" defaultChecked />
                                <span className="text-xs md:text-sm text-gray-700">Email to customer</span>
                            </label>
                        </div>

                        <div className="flex space-x-2 md:space-x-3">
                            <button
                                onClick={onClose}
                                className="flex-1 md:flex-none px-3 md:px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateInvoice}
                                disabled={isCreating}
                                className="flex-1 md:flex-none px-3 md:px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center"
                            >
                                {isCreating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                        Creating...
                                    </>
                                ) : (
                                    'Create Invoice'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}