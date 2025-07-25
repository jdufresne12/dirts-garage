'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { X, Send, Save, Eye, Calculator, DollarSign, Calendar, FileText, Download, Plus, Trash2, Edit3 } from 'lucide-react';
import { InvoicePDFGenerator } from '@/app/lib/pdf-generator';

// Types for the invoice
interface InvoiceLineItem {
    id: string;
    type: 'labor' | 'part' | 'fee' | 'discount' | 'custom';
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    taxable: boolean;
}

interface InvoiceData {
    invoiceNumber: string;
    date: string;
    dueDate: string;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    lineItems: InvoiceLineItem[];
    notes: string;
    terms: string;
    laborType: 'hourly' | 'fixed';
    laborRate: number;
    laborDescription: string;
    laborAmount: number;
}

// Props interface
interface InvoiceGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobData: Job;
    customer: Customer;
    vehicle: Vehicle;
    jobSteps: JobStep[];
    parts: Part[];
}

// Business info - you can move this to a config file later
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
    vehicle,
    jobSteps,
    parts
}: InvoiceGenerationModalProps) {
    const [invoiceData, setInvoiceData] = useState<InvoiceData>({
        invoiceNumber: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        subtotal: 0,
        taxRate: 8.5,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        lineItems: [],
        notes: 'Thank you for your business!',
        terms: 'Net 30',
        laborType: 'hourly',
        laborRate: 125,
        laborDescription: `Labor - ${jobData?.title || 'Service'}`,
        laborAmount: 0
    });

    // State for add item form
    const [showAddItemForm, setShowAddItemForm] = useState(false);
    const [newItem, setNewItem] = useState({
        description: '',
        quantity: 1,
        rate: 0
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');

    // Generate invoice number and line items when modal opens
    useEffect(() => {
        if (isOpen) {
            generateInvoiceNumber();
            generateLineItems();
            setDueDate();
        }
    }, [isOpen, jobSteps, parts]);

    // Calculate totals when line items or adjustments change
    useEffect(() => {
        calculateTotals();
    }, [invoiceData.lineItems, invoiceData.discountAmount, invoiceData.taxRate]);

    const generateInvoiceNumber = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const sequence = Math.floor(Math.random() * 999) + 1;
        const invoiceNumber = `INV-${year}-${month}-${sequence.toString().padStart(3, '0')}`;

        setInvoiceData(prev => ({ ...prev, invoiceNumber }));
    };

    const setDueDate = () => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        setInvoiceData(prev => ({
            ...prev,
            dueDate: dueDate.toISOString().split('T')[0]
        }));
    };

    const generateLineItems = () => {
        const items: InvoiceLineItem[] = [];

        // Add labor items from job steps
        if (jobSteps && jobSteps.length > 0) {
            const totalLaborHours = jobSteps.reduce((sum, step) => sum + (step.actualHours || 0), 0);
            if (totalLaborHours > 0) {
                items.push({
                    id: 'labor-1',
                    type: 'labor',
                    description: invoiceData.laborDescription,
                    quantity: totalLaborHours,
                    rate: invoiceData.laborRate,
                    amount: totalLaborHours * invoiceData.laborRate,
                    taxable: true
                });
            }
        }

        // Add parts items
        if (parts && parts.length > 0) {
            parts.forEach((part, index) => {
                items.push({
                    id: `part-${index + 1}`,
                    type: 'part',
                    description: `${part.name} - ${part.partNumber}`,
                    quantity: part.quantity,
                    rate: part.price,
                    amount: part.quantity * part.price,
                    taxable: true
                });
            });
        }

        setInvoiceData(prev => ({ ...prev, lineItems: items }));
    };

    const calculateTotals = () => {
        const subtotal = invoiceData.lineItems.reduce((sum, item) => sum + item.amount, 0);
        const discountAmount = invoiceData.discountAmount || 0;
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = (taxableAmount * invoiceData.taxRate) / 100;
        const totalAmount = taxableAmount + taxAmount;

        setInvoiceData(prev => ({
            ...prev,
            subtotal,
            taxAmount,
            totalAmount
        }));
    };

    // Use useCallback to prevent function recreation on every render
    const handleLaborTypeChange = useCallback((type: 'hourly' | 'fixed') => {
        setInvoiceData(prev => {
            const newData = { ...prev, laborType: type };

            // Update labor line item if it exists
            const updatedItems = prev.lineItems.map(item => {
                if (item.type === 'labor') {
                    if (type === 'fixed') {
                        return {
                            ...item,
                            quantity: 1,
                            rate: prev.laborAmount,
                            amount: prev.laborAmount,
                            description: prev.laborDescription
                        };
                    } else {
                        // Back to hourly
                        const totalHours = jobSteps ? jobSteps.reduce((sum, step) => sum + (step.actualHours || 0), 0) : 0;
                        return {
                            ...item,
                            quantity: totalHours,
                            rate: prev.laborRate,
                            amount: totalHours * prev.laborRate,
                            description: prev.laborDescription
                        };
                    }
                }
                return item;
            });

            return { ...newData, lineItems: updatedItems };
        });
    }, [jobSteps]);

    const handleLaborRateChange = useCallback((value: string) => {
        const rate = parseFloat(value) || 0;
        setInvoiceData(prev => {
            const newData = { ...prev, laborRate: rate };

            // Update labor line item if it exists and we're in hourly mode
            if (prev.laborType === 'hourly') {
                const updatedItems = prev.lineItems.map(item => {
                    if (item.type === 'labor') {
                        return {
                            ...item,
                            rate: rate,
                            amount: item.quantity * rate
                        };
                    }
                    return item;
                });
                return { ...newData, lineItems: updatedItems };
            }

            return newData;
        });
    }, []);

    const handleLaborAmountChange = useCallback((value: string) => {
        const amount = parseFloat(value) || 0;
        setInvoiceData(prev => {
            const newData = { ...prev, laborAmount: amount };

            // Update labor line item if it exists and we're in fixed mode
            if (prev.laborType === 'fixed') {
                const updatedItems = prev.lineItems.map(item => {
                    if (item.type === 'labor') {
                        return {
                            ...item,
                            rate: amount,
                            amount: amount
                        };
                    }
                    return item;
                });
                return { ...newData, lineItems: updatedItems };
            }

            return newData;
        });
    }, []);

    const handleLaborDescriptionChange = useCallback((value: string) => {
        setInvoiceData(prev => {
            const newData = { ...prev, laborDescription: value };

            // Update labor line item description if it exists
            const updatedItems = prev.lineItems.map(item => {
                if (item.type === 'labor') {
                    return {
                        ...item,
                        description: value
                    };
                }
                return item;
            });

            return { ...newData, lineItems: updatedItems };
        });
    }, []);

    const handleAddItem = useCallback(() => {
        if (!newItem.description.trim()) return;

        const item: InvoiceLineItem = {
            id: `custom-${Date.now()}`,
            type: 'custom',
            description: newItem.description,
            quantity: newItem.quantity,
            rate: newItem.rate,
            amount: newItem.quantity * newItem.rate,
            taxable: true
        };

        setInvoiceData(prev => ({
            ...prev,
            lineItems: [...prev.lineItems, item]
        }));

        // Reset form
        setNewItem({
            description: '',
            quantity: 1,
            rate: 0
        });
        setShowAddItemForm(false);
    }, [newItem]);

    const handleRemoveItem = useCallback((id: string) => {
        setInvoiceData(prev => ({
            ...prev,
            lineItems: prev.lineItems.filter(item => item.id !== id)
        }));
    }, []);

    const handleDiscountChange = useCallback((value: string) => {
        const discountAmount = parseFloat(value) || 0;
        setInvoiceData(prev => ({ ...prev, discountAmount }));
    }, []);

    const handleTaxRateChange = useCallback((value: string) => {
        const taxRate = parseFloat(value) || 0;
        setInvoiceData(prev => ({ ...prev, taxRate }));
    }, []);

    const handlePDFDownload = async () => {
        setIsGeneratingPDF(true);
        try {
            // Use the main InvoicePDFGenerator instead of SimplePDFGenerator
            const pdfGenerator = new InvoicePDFGenerator();

            await pdfGenerator.generateInvoicePDF(
                invoiceData,
                {
                    ...customer,
                    address: customer.address ?? "",
                    city: customer.city ?? "",
                    state: customer.state ?? "",
                    zipcode: customer.zipcode ?? "",
                },
                // Add the vehicle parameter that was missing
                {
                    year: vehicle?.year || 2020,
                    make: vehicle?.make || "Unknown",
                    model: vehicle?.model || "Unknown",
                    vin: vehicle?.vin || "Unknown"
                },
                businessInfo,
                jobData.title
            );

            pdfGenerator.downloadPDF(`invoice-${invoiceData.invoiceNumber}.pdf`);

        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleGenerate = async (action: 'save' | 'send' | 'pdf-download' | 'pdf-preview') => {
        setIsGenerating(true);

        try {
            if (action === 'pdf-download') {
                await handlePDFDownload();
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 2000));

            if (action === 'send') {
                alert(`Invoice ${invoiceData.invoiceNumber} generated and sent to ${customer.email}!`);
            } else {
                alert(`Invoice ${invoiceData.invoiceNumber} saved as draft!`);
            }

            onClose();
        } catch (error) {
            console.error('Operation failed:', error);
            alert('Operation failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    // Invoice Preview Component
    const InvoicePreview = ({ className = "" }) => (
        <div className={`bg-white rounded-lg shadow-sm p-4 md:p-8 ${className}`}>
            {/* Invoice Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 md:mb-8 space-y-4 md:space-y-0">
                <div className="order-2 md:order-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-orange-600">{businessInfo.name}</h1>
                    <div className="text-gray-600 mt-2 text-sm md:text-base">
                        <p>{businessInfo.address}</p>
                        <p>{businessInfo.city}, {businessInfo.state} {businessInfo.zipcode}</p>
                        <p>{businessInfo.phone}</p>
                        <p>{businessInfo.email}</p>
                    </div>
                </div>
                <div className="text-left md:text-right order-1 md:order-2">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">INVOICE</h2>
                    <p className="text-base md:text-lg font-semibold text-gray-700">{invoiceData.invoiceNumber}</p>
                    <div className="mt-2 md:mt-4 text-sm text-gray-600">
                        <p><span className="font-medium">Date:</span> {invoiceData.date}</p>
                        <p><span className="font-medium">Due:</span> {invoiceData.dueDate}</p>
                    </div>
                </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
                <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                    <div className="text-gray-700 text-sm md:text-base">
                        <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                        <p>{customer.address}</p>
                        <p>{customer.city}, {customer.state} {customer.zipcode}</p>
                        <p>{customer.phone}</p>
                        <p>{customer.email}</p>
                    </div>
                </div>
            </div>

            {/* Line Items */}
            <div className="mb-6 md:mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-300">
                                <th className="text-left py-2 font-semibold text-sm md:text-base">Description</th>
                                <th className="text-center py-2 font-semibold w-12 md:w-20 text-sm md:text-base">Qty</th>
                                <th className="text-right py-2 font-semibold w-16 md:w-24 text-sm md:text-base">Rate</th>
                                <th className="text-right py-2 font-semibold w-20 md:w-24 text-sm md:text-base">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.lineItems.map((item) => (
                                <tr key={item.id} className="border-b border-gray-200">
                                    <td className="py-2 md:py-3 text-gray-700 text-sm md:text-base pr-2">
                                        <div className="break-words">{item.description}</div>
                                    </td>
                                    <td className="py-2 md:py-3 text-center text-gray-700 text-sm md:text-base">{item.quantity}</td>
                                    <td className="py-2 md:py-3 text-right text-gray-700 text-sm md:text-base">${item.rate.toFixed(2)}</td>
                                    <td className="py-2 md:py-3 text-right text-gray-700 text-sm md:text-base font-medium">${item.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-full max-w-xs md:w-64">
                    <div className="flex justify-between py-1 md:py-2 text-sm md:text-base">
                        <span className="text-gray-700">Subtotal:</span>
                        <span className="text-gray-700">${invoiceData.subtotal.toFixed(2)}</span>
                    </div>
                    {invoiceData.discountAmount > 0 && (
                        <div className="flex justify-between py-1 md:py-2 text-sm md:text-base">
                            <span className="text-gray-700">Discount:</span>
                            <span className="text-gray-700">-${invoiceData.discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-1 md:py-2 text-sm md:text-base">
                        <span className="text-gray-700">Tax ({invoiceData.taxRate}%):</span>
                        <span className="text-gray-700">${invoiceData.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 md:py-2 border-t-2 border-gray-300 font-bold text-base md:text-lg">
                        <span>Total:</span>
                        <span>${invoiceData.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Terms */}
            {invoiceData.notes && (
                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
                    <p className="text-gray-700 text-sm md:text-base">{invoiceData.notes}</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 md:p-4">
            <div className="bg-white rounded-lg w-full h-full md:max-w-6xl md:h-auto md:max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-200 p-4 md:p-6 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg md:text-2xl font-bold text-gray-900">Generate Invoice</h2>
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
                        <div className="flex-1 overflow-y-auto bg-gray-50">
                            <div className="p-6">
                                <InvoicePreview className="max-w-2xl mx-auto" />
                            </div>
                        </div>

                        {/* Right Panel - Controls */}
                        <div className="w-80 border-l border-gray-200 overflow-y-auto">
                            <div className="p-6">
                                <div className={`space-y-4 md:space-y-6`}>
                                    {/* Invoice Details */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center text-sm md:text-base">
                                            <FileText className="mr-2" size={16} />
                                            Invoice Details
                                        </h3>
                                        <div className="space-y-3 md:space-y-4">
                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                    Invoice Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={invoiceData.date}
                                                    onChange={(e) => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
                                                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                    Due Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={invoiceData.dueDate}
                                                    onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                                                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Labor Settings */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center text-sm md:text-base">
                                            <Edit3 className="mr-2" size={16} />
                                            Labor Settings
                                        </h3>
                                        <div className="space-y-3 md:space-y-4">
                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                    Labor Type
                                                </label>
                                                <div className="flex space-x-4">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="laborType"
                                                            value="hourly"
                                                            checked={invoiceData.laborType === 'hourly'}
                                                            onChange={() => handleLaborTypeChange('hourly')}
                                                            className="mr-2"
                                                        />
                                                        <span className="text-sm">Hourly</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="laborType"
                                                            value="fixed"
                                                            checked={invoiceData.laborType === 'fixed'}
                                                            onChange={() => handleLaborTypeChange('fixed')}
                                                            className="mr-2"
                                                        />
                                                        <span className="text-sm">Fixed Rate</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                    Labor Description
                                                </label>
                                                <input
                                                    type="text"
                                                    value={invoiceData.laborDescription}
                                                    onChange={(e) => handleLaborDescriptionChange(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>

                                            {invoiceData.laborType === 'hourly' ? (
                                                <div>
                                                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                        Hourly Rate ($)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={invoiceData.laborRate}
                                                        onChange={(e) => handleLaborRateChange(e.target.value)}
                                                        className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                        Fixed Amount ($)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={invoiceData.laborAmount}
                                                        onChange={(e) => handleLaborAmountChange(e.target.value)}
                                                        className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Add Custom Item */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center text-sm md:text-base">
                                            <Plus className="mr-2" size={16} />
                                            Add Custom Item
                                        </h3>

                                        {!showAddItemForm ? (
                                            <button
                                                onClick={() => setShowAddItemForm(true)}
                                                className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors"
                                            >
                                                <Plus className="inline mr-2" size={16} />
                                                Add Item
                                            </button>
                                        ) : (
                                            <div className="space-y-3 p-3 border border-gray-200 rounded-md">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Description
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newItem.description}
                                                        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                        placeholder="Enter item description"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Quantity
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={newItem.quantity}
                                                            onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Rate ($)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={newItem.rate}
                                                            onChange={(e) => setNewItem(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    Total: ${(newItem.quantity * newItem.rate).toFixed(2)}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={handleAddItem}
                                                        disabled={!newItem.description.trim()}
                                                        className="flex-1 px-3 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Add Item
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowAddItemForm(false);
                                                            setNewItem({ description: '', quantity: 1, rate: 0 });
                                                        }}
                                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Show custom items */}
                                        {invoiceData.lineItems.filter(item => item.type === 'custom').length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                <p className="text-xs font-medium text-gray-700">Custom Items:</p>
                                                {invoiceData.lineItems.filter(item => item.type === 'custom').map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                                        <div className="flex-1">
                                                            <div className="font-medium">{item.description}</div>
                                                            <div className="text-xs text-gray-600">
                                                                {item.quantity} × ${item.rate.toFixed(2)} = ${item.amount.toFixed(2)}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Adjustments */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center text-sm md:text-base">
                                            <Calculator className="mr-2" size={16} />
                                            Adjustments
                                        </h3>
                                        <div className="space-y-3 md:space-y-4">
                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                    Discount Amount ($)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={invoiceData.discountAmount}
                                                    onChange={(e) => handleDiscountChange(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                    Tax Rate (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    value={invoiceData.taxRate}
                                                    onChange={(e) => handleTaxRateChange(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                            Notes
                                        </label>
                                        <textarea
                                            value={invoiceData.notes}
                                            onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                                            rows={3}
                                            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="Thank you message, payment instructions, etc."
                                        />
                                    </div>

                                    {/* Summary */}
                                    <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Summary</h4>
                                        <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                                            <div className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span>${invoiceData.subtotal.toFixed(2)}</span>
                                            </div>
                                            {invoiceData.discountAmount > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>Discount:</span>
                                                    <span>-${invoiceData.discountAmount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span>Tax:</span>
                                                <span>${invoiceData.taxAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-sm md:text-lg pt-1 md:pt-2 border-t">
                                                <span>Total:</span>
                                                <span>${invoiceData.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden h-full">
                        {activeTab === 'preview' ? (
                            <div className="h-full p-4 overflow-y-auto bg-gray-50">
                                <InvoicePreview />
                            </div>
                        ) : (
                            <div className="h-full p-4 overflow-y-auto">
                                <div className={`space-y-4 md:space-y-6`}>
                                    {/* Invoice Details */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center text-sm md:text-base">
                                            <FileText className="mr-2" size={16} />
                                            Invoice Details
                                        </h3>
                                        <div className="space-y-3 md:space-y-4">
                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                    Invoice Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={invoiceData.date}
                                                    onChange={(e) => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
                                                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                    Due Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={invoiceData.dueDate}
                                                    onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                                                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Labor Settings */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center text-sm md:text-base">
                                            <Edit3 className="mr-2" size={16} />
                                            Labor Settings
                                        </h3>
                                        <div className="space-y-3 md:space-y-4">
                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                    Labor Type
                                                </label>
                                                <div className="flex space-x-4">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="laborType"
                                                            value="hourly"
                                                            checked={invoiceData.laborType === 'hourly'}
                                                            onChange={() => handleLaborTypeChange('hourly')}
                                                            className="mr-2"
                                                        />
                                                        <span className="text-sm">Hourly</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="laborType"
                                                            value="fixed"
                                                            checked={invoiceData.laborType === 'fixed'}
                                                            onChange={() => handleLaborTypeChange('fixed')}
                                                            className="mr-2"
                                                        />
                                                        <span className="text-sm">Fixed Rate</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                    Labor Description
                                                </label>
                                                <input
                                                    type="text"
                                                    value={invoiceData.laborDescription}
                                                    onChange={(e) => handleLaborDescriptionChange(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>

                                            {invoiceData.laborType === 'hourly' ? (
                                                <div>
                                                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                        Hourly Rate ($)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={invoiceData.laborRate}
                                                        onChange={(e) => handleLaborRateChange(e.target.value)}
                                                        className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                        Fixed Amount ($)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={invoiceData.laborAmount}
                                                        onChange={(e) => handleLaborAmountChange(e.target.value)}
                                                        className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Add Custom Item */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center text-sm md:text-base">
                                            <Plus className="mr-2" size={16} />
                                            Add Custom Item
                                        </h3>

                                        {!showAddItemForm ? (
                                            <button
                                                onClick={() => setShowAddItemForm(true)}
                                                className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors"
                                            >
                                                <Plus className="inline mr-2" size={16} />
                                                Add Item
                                            </button>
                                        ) : (
                                            <div className="space-y-3 p-3 border border-gray-200 rounded-md">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Description
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newItem.description}
                                                        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                        placeholder="Enter item description"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Quantity
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={newItem.quantity}
                                                            onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Rate ($)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={newItem.rate}
                                                            onChange={(e) => setNewItem(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    Total: ${(newItem.quantity * newItem.rate).toFixed(2)}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={handleAddItem}
                                                        disabled={!newItem.description.trim()}
                                                        className="flex-1 px-3 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Add Item
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowAddItemForm(false);
                                                            setNewItem({ description: '', quantity: 1, rate: 0 });
                                                        }}
                                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Show custom items */}
                                        {invoiceData.lineItems.filter(item => item.type === 'custom').length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                <p className="text-xs font-medium text-gray-700">Custom Items:</p>
                                                {invoiceData.lineItems.filter(item => item.type === 'custom').map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                                        <div className="flex-1">
                                                            <div className="font-medium">{item.description}</div>
                                                            <div className="text-xs text-gray-600">
                                                                {item.quantity} × ${item.rate.toFixed(2)} = ${item.amount.toFixed(2)}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Adjustments */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center text-sm md:text-base">
                                            <Calculator className="mr-2" size={16} />
                                            Adjustments
                                        </h3>
                                        <div className="space-y-3 md:space-y-4">
                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                    Discount Amount ($)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={invoiceData.discountAmount}
                                                    onChange={(e) => handleDiscountChange(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                                    Tax Rate (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    value={invoiceData.taxRate}
                                                    onChange={(e) => handleTaxRateChange(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                            Notes
                                        </label>
                                        <textarea
                                            value={invoiceData.notes}
                                            onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                                            rows={3}
                                            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="Thank you message, payment instructions, etc."
                                        />
                                    </div>

                                    {/* Summary */}
                                    <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Summary</h4>
                                        <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                                            <div className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span>${invoiceData.subtotal.toFixed(2)}</span>
                                            </div>
                                            {invoiceData.discountAmount > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>Discount:</span>
                                                    <span>-${invoiceData.discountAmount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span>Tax:</span>
                                                <span>${invoiceData.taxAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-sm md:text-lg pt-1 md:pt-2 border-t">
                                                <span>Total:</span>
                                                <span>${invoiceData.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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

                        {/* Button Groups */}
                        <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-3">
                            {/* First Row - Main Actions */}
                            <div className="flex space-x-2 md:space-x-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 md:flex-none px-3 md:px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleGenerate('pdf-download')}
                                    disabled={isGenerating || isGeneratingPDF}
                                    className="flex-1 md:flex-none px-3 md:px-4 py-2 text-sm text-orange-500 bg-white border border-orange-400 rounded-lg hover:bg-orange-50 flex items-center justify-center"
                                >
                                    <Download className="mr-1 md:mr-2" size={14} />
                                    <span className="hidden sm:inline">Download PDF</span>
                                    <span className="sm:hidden">PDF</span>
                                </button>
                                <button
                                    onClick={() => handleGenerate('send')}
                                    disabled={isGenerating || isGeneratingPDF}
                                    className="flex-1 md:flex-none px-3 md:px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                            <span className="hidden sm:inline">Generating...</span>
                                            <span className="sm:hidden">...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-1 md:mr-2" size={14} />
                                            <span className="hidden sm:inline">Generate & Send</span>
                                            <span className="sm:hidden">Send</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}