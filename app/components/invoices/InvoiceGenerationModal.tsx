'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, RefreshCw, Lock, Unlock } from 'lucide-react';
import InvoicePreview from './InvoicePreview';
import InvoiceEditor from './InvoiceEditor';
import helpers from '@/app/utils/helpers';

interface LaborSettings {
    type: 'hourly' | 'fixed';
    hourly_rate: number;
    fixed_amount: number;
    description: string;
    consolidate_labor: boolean;
}

interface InvoiceGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobData: Job;
    customer: Customer;
    existingInvoice?: Invoice | null;
    mode: 'create' | 'edit' | 'view';
    onInvoiceCreated?: (invoice: Invoice) => void;
    onInvoiceUpdated?: (invoice: Invoice) => void;
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
    existingInvoice = null,
    mode = 'create',
    onInvoiceCreated,
    onInvoiceUpdated
}: InvoiceGenerationModalProps) {
    // Generate stable invoice ID once
    const stableInvoiceId = useMemo(() =>
        existingInvoice?.id || `INV-${helpers.generateUniqueID()}`,
        [existingInvoice?.id]
    );

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [laborSettings, setLaborSettings] = useState<LaborSettings>({
        type: 'hourly',
        hourly_rate: 125,
        fixed_amount: 0,
        description: `Labor - ${jobData?.title || 'Service'}`,
        consolidate_labor: true
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
    const [syncEnabled, setSyncEnabled] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [payments, setPayments] = useState<Payment[]>([]);

    const safeNumber = (value: string | number | null | undefined): number => {
        if (value === null || value === undefined || value === '') return 0;
        const num = typeof value === 'string' ? parseFloat(value) : Number(value);
        return isNaN(num) ? 0 : num;
    };

    const totalLaborHours = useMemo(() => {
        if (!jobData.job_steps) return 0;
        return jobData.job_steps.reduce((sum, step) => {
            return sum + (safeNumber(step.actual_hours) || 0);
        }, 0);
    }, [jobData.job_steps]);

    const generateLineItemsFromJob = useCallback((invoiceId: string, settings: LaborSettings): InvoiceLineItem[] => {
        const items: InvoiceLineItem[] = [];

        // Add labor items
        if (totalLaborHours > 0) {
            if (settings.consolidate_labor) {
                // Single labor line item
                const rate = settings.type === 'hourly' ? settings.hourly_rate : settings.fixed_amount;
                const quantity = settings.type === 'hourly' ? totalLaborHours : 1;
                const amount = settings.type === 'hourly' ? totalLaborHours * rate : rate;

                items.push({
                    id: helpers.generateUniqueID(),
                    invoice_id: invoiceId,
                    source_type: 'job_labor',
                    source_id: undefined,
                    type: 'labor',
                    description: settings.description,
                    quantity: quantity,
                    rate: rate,
                    amount: amount,
                    taxable: true,
                    is_locked: false
                });
            } else {
                // Separate line items for each job step
                jobData.job_steps?.forEach((step) => {
                    const hours = safeNumber(step.actual_hours);
                    if (hours > 0) {
                        items.push({
                            id: helpers.generateUniqueID(),
                            invoice_id: invoiceId,
                            source_type: 'job_labor',
                            source_id: step.id,
                            type: 'labor',
                            description: `${step.title} - ${hours} hours`,
                            quantity: hours,
                            rate: settings.hourly_rate,
                            amount: hours * settings.hourly_rate,
                            taxable: true,
                            is_locked: false
                        });
                    }
                });
            }
        }

        // Add parts items
        if (jobData.parts && jobData.parts.length > 0) {
            jobData.parts.forEach((part) => {
                const quantity = safeNumber(part.quantity);
                const rate = safeNumber(part.price);

                items.push({
                    id: helpers.generateUniqueID(),
                    invoice_id: invoiceId,
                    source_type: 'job_part',
                    source_id: part.id,
                    type: 'part',
                    description: `${part.name} - ${part.part_number}`,
                    quantity: quantity,
                    rate: rate,
                    amount: quantity * rate,
                    taxable: true,
                    is_locked: false
                });
            });
        }

        return items;
    }, [totalLaborHours, jobData.job_steps, jobData.parts]);

    const calculateTotals = useCallback((lineItems: InvoiceLineItem[], discountAmount: number = 0, taxRate: number = 0) => {
        const subtotal = lineItems.reduce((sum, item) => sum + safeNumber(item.amount), 0);
        const discount = safeNumber(discountAmount);
        const taxableAmount = subtotal - discount;
        const taxAmount = (taxableAmount * safeNumber(taxRate)) / 100;
        const total = taxableAmount + taxAmount;

        return {
            subtotal,
            tax_amount: taxAmount,
            amount: total
        };
    }, []);

    useEffect(() => {
        if (isOpen && !isInitialized) {
            if (mode === 'edit' && existingInvoice) {
                // Load existing invoice
                setInvoice(existingInvoice);
                setSyncEnabled(existingInvoice.auto_sync_enabled);
                loadPayments(existingInvoice.id);

                // Extract labor settings from existing line items
                const laborItem = existingInvoice.line_items?.find(item => item.type === 'labor');
                if (laborItem) {
                    const isFixed = laborItem.quantity === 1;
                    setLaborSettings({
                        type: isFixed ? 'fixed' : 'hourly',
                        hourly_rate: isFixed ? 125 : laborItem.rate,
                        fixed_amount: isFixed ? laborItem.amount : 0,
                        description: laborItem.description,
                        consolidate_labor: !existingInvoice.line_items?.some(item =>
                            item.source_type === 'job_labor' && item.source_id
                        )
                    });
                }
            } else {
                // Create new invoice
                const initialLaborSettings = {
                    type: 'hourly' as const,
                    hourly_rate: 125,
                    fixed_amount: 0,
                    description: `Labor - ${jobData?.title || 'Service'}`,
                    consolidate_labor: true
                };

                const generatedItems = generateLineItemsFromJob(stableInvoiceId, initialLaborSettings);
                const totals = calculateTotals(generatedItems, 0, 8.5);

                const newInvoice: Invoice = {
                    id: stableInvoiceId,
                    date: new Date().toISOString().split('T')[0],
                    due_date: '',
                    amount: totals.amount,
                    amount_paid: 0,
                    status: 'draft',
                    customer_id: customer.id,
                    job_id: jobData.id,
                    subtotal: totals.subtotal,
                    tax_rate: 8.5,
                    tax_amount: totals.tax_amount,
                    discount_amount: 0,
                    notes: 'Thank you for your business!',
                    revision_number: 1,
                    auto_sync_enabled: true,
                    line_items: generatedItems
                };

                setInvoice(newInvoice);
                setLaborSettings(initialLaborSettings);
                setSyncEnabled(true);
                setPayments([]);
            }

            setHasUnsavedChanges(false);
            setIsInitialized(true);
        }
    }, [isOpen, mode, existingInvoice, stableInvoiceId, jobData.id, jobData.title, customer?.id, isInitialized, generateLineItemsFromJob, calculateTotals]);

    useEffect(() => {
        if (!isOpen) {
            setIsInitialized(false);
            setInvoice(null);
            setHasUnsavedChanges(false);
        }
    }, [isOpen]);

    const loadPayments = async (invoiceId: string) => {
        try {
            const response = await fetch(`/api/payments?invoice_id=${invoiceId}`);
            if (response.ok) {
                const paymentsData = await response.json();
                setPayments(paymentsData);
            }
        } catch (error) {
            console.error('Error loading payments:', error);
        }
    };

    const handleInvoiceChange = useCallback((updatedInvoice: Invoice) => {
        setInvoice(updatedInvoice);
        setHasUnsavedChanges(true);
    }, []);

    const handleLaborSettingsChange = useCallback((newSettings: LaborSettings) => {
        setLaborSettings(newSettings);

        // Regenerate labor line items if sync is enabled
        if (syncEnabled && invoice) {
            const currentItems = invoice.line_items || [];
            // Remove existing labor items that aren't locked
            const nonLaborItems = currentItems.filter(item =>
                item.type !== 'labor' || item.is_locked
            );

            // Generate new labor items
            const newLaborItems = generateLineItemsFromJob(invoice.id, newSettings).filter(item =>
                item.type === 'labor'
            );

            const updatedItems = [...nonLaborItems, ...newLaborItems];
            const totals = calculateTotals(updatedItems, invoice.discount_amount, invoice.tax_rate);

            setInvoice(prev => prev ? {
                ...prev,
                line_items: updatedItems,
                ...totals
            } : null);
            setHasUnsavedChanges(true);
        }
    }, [syncEnabled, invoice, generateLineItemsFromJob, calculateTotals]);

    const handleSyncToggle = useCallback((enabled: boolean) => {
        setSyncEnabled(enabled);
        if (invoice) {
            setInvoice(prev => prev ? {
                ...prev,
                auto_sync_enabled: enabled
            } : null);
            setHasUnsavedChanges(true);
        }
    }, [invoice]);

    const handleSyncWithJob = useCallback(() => {
        if (!invoice) return;

        const generatedItems = generateLineItemsFromJob(invoice.id, laborSettings);

        // Preserve custom items and locked items
        const currentItems = invoice.line_items || [];
        const preservedItems = currentItems.filter(item =>
            (item.source_type === 'custom' || item.source_type === 'fee' || item.source_type === 'discount') ||
            item.is_locked
        );

        const allItems = [...generatedItems, ...preservedItems];
        const totals = calculateTotals(allItems, invoice.discount_amount, invoice.tax_rate);

        setInvoice(prev => prev ? {
            ...prev,
            line_items: allItems,
            revision_number: prev.revision_number + 1,
            ...totals
        } : null);

        setHasUnsavedChanges(true);
    }, [invoice, generateLineItemsFromJob, laborSettings, calculateTotals]);

    const handleSubmit = async () => {
        if (!invoice) return;

        setIsProcessing(true);
        try {
            if (mode === 'create') {
                const response = await fetch('/api/invoices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        invoice: {
                            ...invoice,
                            line_items: undefined
                        },
                        line_items: invoice.line_items || []
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to create invoice');
                }

                const createdInvoice = await response.json();
                onInvoiceCreated?.(createdInvoice);
                alert(`Invoice ${invoice.id} created successfully!`);
            } else {
                const response = await fetch(`/api/invoices/${invoice.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        invoice: {
                            date: invoice.date,
                            due_date: invoice.due_date,
                            amount: invoice.amount,
                            amount_paid: invoice.amount_paid,
                            status: invoice.status,
                            subtotal: invoice.subtotal,
                            tax_rate: invoice.tax_rate,
                            tax_amount: invoice.tax_amount,
                            discount_amount: invoice.discount_amount,
                            notes: invoice.notes,
                            auto_sync_enabled: invoice.auto_sync_enabled
                        },
                        line_items: invoice.line_items || []
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update invoice');
                }

                const updatedInvoice = await response.json();
                onInvoiceUpdated?.(updatedInvoice);
                alert(`Invoice ${invoice.id} updated successfully!`);
            }

            setHasUnsavedChanges(false);
            onClose();

        } catch (error) {
            console.error('Failed to save invoice:', error);
            alert(`Failed to ${mode === 'create' ? 'create' : 'update'} invoice. Please try again.`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to close?')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    if (!isOpen || !invoice) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] flex flex-col m-4">
                {/* Header */}
                <div className="border-b border-gray-200 p-4 md:p-6 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                                {mode === 'create' ? 'Create Invoice' : mode === 'edit' ? 'Edit Invoice' : 'View Invoice'}
                            </h2>
                            <p className="text-sm md:text-base text-gray-600">
                                {jobData.title} - {customer.first_name} {customer.last_name}
                                {mode !== 'create' && ` • ${invoice.id}`}
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Sync Controls */}
                            {mode !== 'view' && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleSyncWithJob}
                                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                        title="Sync with job data"
                                    >
                                        <RefreshCw size={18} />
                                    </button>

                                    <button
                                        onClick={() => handleSyncToggle(!syncEnabled)}
                                        className={`p-2 rounded-lg transition-colors ${syncEnabled
                                            ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                            }`}
                                        title={syncEnabled ? 'Auto-sync enabled' : 'Auto-sync disabled'}
                                    >
                                        {syncEnabled ? <Unlock size={18} /> : <Lock size={18} />}
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X size={20} className="md:w-6 md:h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="mt-3 flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${syncEnabled ? 'bg-green-500' : 'bg-gray-400'
                                }`} />
                            <span className="text-gray-600">
                                Auto-sync {syncEnabled ? 'enabled' : 'disabled'}
                            </span>
                        </div>

                        {hasUnsavedChanges && (
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                                <span className="text-gray-600">Unsaved changes</span>
                            </div>
                        )}

                        {mode !== 'create' && (
                            <span className="text-gray-600">
                                Revision {invoice.revision_number}
                            </span>
                        )}
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
                <div className="flex-1 overflow-hidden">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex h-full">
                        {/* Left Panel - Preview */}
                        <div className="flex-1 overflow-y-auto bg-gray-50">
                            <div className="p-6">
                                <InvoicePreview
                                    invoice={invoice}
                                    customer={customer}
                                    vehicle={jobData.vehicle}
                                    businessInfo={businessInfo}
                                    showSyncIndicators={true}
                                    payments={payments}
                                />
                            </div>
                        </div>

                        {/* Right Panel - Editor */}
                        <div className="w-96 border-l border-gray-200 overflow-y-auto">
                            <div className="p-6">
                                <InvoiceEditor
                                    invoice={invoice}
                                    onInvoiceChange={handleInvoiceChange}
                                    jobData={jobData}
                                    laborSettings={laborSettings}
                                    onLaborSettingsChange={handleLaborSettingsChange}
                                    syncEnabled={syncEnabled}
                                    onSyncToggle={handleSyncToggle}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden h-full">
                        {activeTab === 'preview' ? (
                            <div className="h-full p-4 overflow-y-auto bg-gray-50">
                                <InvoicePreview
                                    invoice={invoice}
                                    customer={customer}
                                    vehicle={jobData.vehicle}
                                    businessInfo={businessInfo}
                                    showSyncIndicators={true}
                                    payments={payments}
                                />
                            </div>
                        ) : (
                            <div className="h-full p-4 overflow-y-auto">
                                <InvoiceEditor
                                    invoice={invoice}
                                    onInvoiceChange={handleInvoiceChange}
                                    jobData={jobData}
                                    laborSettings={laborSettings}
                                    onLaborSettingsChange={handleLaborSettingsChange}
                                    syncEnabled={syncEnabled}
                                    onSyncToggle={handleSyncToggle}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 md:p-6 flex-shrink-0">
                    <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center justify-center md:justify-start space-x-4">
                            {mode === 'create' && (
                                <label className="flex items-center">
                                    <input type="checkbox" className="mr-2" defaultChecked />
                                    <span className="text-xs md:text-sm text-gray-700">Email to customer</span>
                                </label>
                            )}

                            {/* Invoice Summary */}
                            <div className="text-xs md:text-sm text-gray-600">
                                Total: <span className="font-semibold text-gray-900">${invoice.amount.toFixed(2)}</span>
                                {invoice.line_items && (
                                    <span className="ml-2">({invoice.line_items.length} items)</span>
                                )}
                            </div>
                        </div>

                        <div className="flex space-x-2 md:space-x-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 md:flex-none px-3 md:px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            {mode !== 'view' && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isProcessing}
                                    className="flex-1 md:flex-none px-3 md:px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                            {mode === 'create' ? 'Creating...' : 'Updating...'}
                                        </>
                                    ) : (
                                        <>
                                            {mode === 'create' ? 'Create Invoice' : 'Update Invoice'}
                                            {hasUnsavedChanges && (
                                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full ml-2"></div>
                                            )}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}