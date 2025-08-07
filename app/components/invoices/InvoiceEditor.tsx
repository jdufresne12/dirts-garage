'use client'
import React, { useState, useCallback } from 'react';
import { FileText, Edit3, Plus, Calculator, Trash2 } from 'lucide-react';
import helpers from '@/app/utils/helpers';

// Updated interfaces to match your new types
interface LaborSettings {
    laborType: 'hourly' | 'fixed';
    laborRate: number;
    laborDescription: string;
    laborAmount: number;
}

interface InvoiceEditorProps {
    invoiceData: Invoice;
    setInvoiceData: React.Dispatch<React.SetStateAction<Invoice>>;
    laborSettings: LaborSettings;
    setLaborSettings: React.Dispatch<React.SetStateAction<LaborSettings>>;
    totalLaborHours: number;
}

// Helper function to safely convert values to numbers
const safeNumber = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(num) ? 0 : num;
};

export default function InvoiceEditor({
    invoiceData,
    setInvoiceData,
    laborSettings,
    setLaborSettings,
    totalLaborHours
}: InvoiceEditorProps) {
    // State for add item form
    const [showAddItemForm, setShowAddItemForm] = useState(false);
    const [newItem, setNewItem] = useState({
        description: '',
        quantity: 1,
        rate: 0
    });

    const handleLaborTypeChange = useCallback((type: 'hourly' | 'fixed') => {
        setLaborSettings(prev => ({ ...prev, laborType: type }));

        // Update labor line item if it exists
        setInvoiceData(prev => {
            const updatedItems = prev.line_items?.map(item => {
                if (item.key === 'labor-1') { // Use key instead of type
                    if (type === 'fixed') {
                        return {
                            ...item,
                            quantity: 1,
                            rate: laborSettings.laborAmount,
                            amount: laborSettings.laborAmount,
                            description: laborSettings.laborDescription
                        };
                    } else {
                        // Back to hourly
                        return {
                            ...item,
                            quantity: totalLaborHours,
                            rate: laborSettings.laborRate,
                            amount: totalLaborHours * laborSettings.laborRate,
                            description: laborSettings.laborDescription
                        };
                    }
                }
                return item;
            }) || [];

            return { ...prev, line_items: updatedItems };
        });
    }, [totalLaborHours, laborSettings, setLaborSettings, setInvoiceData]);

    const handleLaborRateChange = useCallback((value: string) => {
        const rate = safeNumber(value);
        setLaborSettings(prev => ({ ...prev, laborRate: rate }));

        // Update labor line item if it exists and we're in hourly mode
        if (laborSettings.laborType === 'hourly') {
            setInvoiceData(prev => {
                const updatedItems = prev.line_items?.map(item => {
                    if (item.key === 'labor-1') { // Use key instead of type
                        return {
                            ...item,
                            rate: rate,
                            amount: safeNumber(item.quantity) * rate
                        };
                    }
                    return item;
                }) || [];

                return { ...prev, line_items: updatedItems };
            });
        }
    }, [laborSettings.laborType, setLaborSettings, setInvoiceData]);

    const handleLaborAmountChange = useCallback((value: string) => {
        const amount = safeNumber(value);
        setLaborSettings(prev => ({ ...prev, laborAmount: amount }));

        // Update labor line item if it exists and we're in fixed mode
        if (laborSettings.laborType === 'fixed') {
            setInvoiceData(prev => {
                const updatedItems = prev.line_items?.map(item => {
                    if (item.key === 'labor-1') { // Use key instead of type
                        return {
                            ...item,
                            rate: amount,
                            amount: amount
                        };
                    }
                    return item;
                }) || [];

                return { ...prev, line_items: updatedItems };
            });
        }
    }, [laborSettings.laborType, setLaborSettings, setInvoiceData]);

    const handleLaborDescriptionChange = useCallback((value: string) => {
        setLaborSettings(prev => ({ ...prev, laborDescription: value }));

        // Update labor line item description if it exists
        setInvoiceData(prev => {
            const updatedItems = prev.line_items?.map(item => {
                if (item.key === 'labor-1') { // Use key instead of type
                    return {
                        ...item,
                        description: value
                    };
                }
                return item;
            }) || [];

            return { ...prev, line_items: updatedItems };
        });
    }, [setLaborSettings, setInvoiceData]);

    const handleAddItem = useCallback(() => {
        if (!newItem.description.trim()) return;

        const quantity = safeNumber(newItem.quantity);
        const rate = safeNumber(newItem.rate);

        // Generate a unique key for custom items
        const existingCustomItems = invoiceData.line_items?.filter(item => item.key.startsWith('custom-')) || [];
        const nextCustomNumber = existingCustomItems.length + 1;

        const item: InvoiceLineItem = {
            id: helpers.generateUniqueID(),
            invoice_id: invoiceData.id,
            key: `custom-${nextCustomNumber}`,
            type: 'custom',
            description: newItem.description,
            quantity: quantity,
            rate: rate,
            amount: quantity * rate,
            taxable: true
        };

        setInvoiceData(prev => ({
            ...prev,
            line_items: [...(prev.line_items || []), item]
        }));

        // Reset form
        setNewItem({
            description: '',
            quantity: 1,
            rate: 0
        });
        setShowAddItemForm(false);
    }, [newItem, invoiceData.id, invoiceData.line_items, setInvoiceData]);

    const handleRemoveItem = useCallback((id: string) => {
        setInvoiceData(prev => ({
            ...prev,
            line_items: prev.line_items?.filter(item => item.id !== id) || []
        }));
    }, [setInvoiceData]);

    const handleDiscountChange = useCallback((value: string) => {
        const discount_amount = safeNumber(value);
        setInvoiceData(prev => ({ ...prev, discount_amount }));
    }, [setInvoiceData]);

    const handleTaxRateChange = useCallback((value: string) => {
        const tax_rate = safeNumber(value);
        setInvoiceData(prev => ({ ...prev, tax_rate }));
    }, [setInvoiceData]);

    return (
        <div className="space-y-4 md:space-y-6">
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
                            value={invoiceData.due_date || ''}
                            onChange={(e) => setInvoiceData(prev => ({ ...prev, due_date: e.target.value }))}
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
                                    checked={laborSettings.laborType === 'hourly'}
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
                                    checked={laborSettings.laborType === 'fixed'}
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
                            value={laborSettings.laborDescription}
                            onChange={(e) => handleLaborDescriptionChange(e.target.value)}
                            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {laborSettings.laborType === 'hourly' ? (
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                Hourly Rate ($)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={laborSettings.laborRate}
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
                                value={laborSettings.laborAmount}
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
                {invoiceData.line_items && invoiceData.line_items?.filter(item => item.type === 'custom').length > 0 && (
                    <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-gray-700">Custom Items:</p>
                        {invoiceData.line_items.filter(item => item.type === 'custom').map((item) => (
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
                            value={invoiceData.discount_amount}
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
                            value={invoiceData.tax_rate}
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
                    value={invoiceData.notes || ''}
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
                    {invoiceData.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>-${invoiceData.discount_amount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>${invoiceData.tax_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm md:text-lg pt-1 md:pt-2 border-t">
                        <span>Total:</span>
                        <span>${invoiceData.amount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}