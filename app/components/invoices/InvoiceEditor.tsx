'use client'
import React, { useState, useCallback } from 'react';
import {
    FileText,
    Edit3,
    Plus,
    Calculator,
    Trash2,
    Lock,
    Unlock,
    Wrench,
    Package
} from 'lucide-react';
import helpers from '@/app/utils/helpers';

interface LaborSettings {
    type: 'hourly' | 'fixed';
    hourly_rate: number;
    fixed_amount: number;
    description: string;
    consolidate_labor: boolean;
}

interface InvoiceEditorProps {
    invoice: Invoice;
    onInvoiceChange: (invoice: Invoice) => void;
    jobData: Job;
    laborSettings: LaborSettings;
    onLaborSettingsChange: (settings: LaborSettings) => void;
    syncEnabled: boolean;
    onSyncToggle: (enabled: boolean) => void;
}

// Helper function to safely convert values to numbers
const safeNumber = (value: string | number | null): number => {
    if (value === null || value === undefined || value === '') return 0;
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(num) ? 0 : num;
};

export default function InvoiceEditor({
    invoice,
    onInvoiceChange,
    laborSettings,
    onLaborSettingsChange,
    syncEnabled,
    onSyncToggle
}: InvoiceEditorProps) {
    // State for add item form
    const [showAddItemForm, setShowAddItemForm] = useState(false);
    const [newItem, setNewItem] = useState<{
        type: 'custom' | 'fee' | 'discount';
        description: string;
        quantity: number;
        rate: number;
    }>({
        type: 'custom',
        description: '',
        quantity: 1,
        rate: 0
    });

    // Helper to get source indicator icon
    const getSourceIcon = (item: InvoiceLineItem) => {
        if (item.is_locked) return <Lock size={14} className="text-gray-500" />;

        switch (item.source_type) {
            case 'job_labor':
                return <Wrench size={14} className="text-blue-500" />;
            case 'job_part':
                return <Package size={14} className="text-green-500" />;
            case 'custom':
            case 'fee':
            case 'discount':
                return <Edit3 size={14} className="text-purple-500" />;
            default:
                return null;
        }
    };

    // Helper to get source tooltip
    const getSourceTooltip = (item: InvoiceLineItem) => {
        if (item.is_locked) return 'Locked (manual override)';

        switch (item.source_type) {
            case 'job_labor':
                return 'Synced from job labor';
            case 'job_part':
                return 'Synced from job parts';
            case 'custom':
                return 'Custom item';
            case 'fee':
                return 'Additional fee';
            case 'discount':
                return 'Discount';
            default:
                return 'Manual item';
        }
    };

    // Update invoice field with automatic total recalculation
    const updateInvoiceField = useCallback((field: keyof Invoice, value: string | number | boolean | null | undefined) => {
        const updatedInvoice = {
            ...invoice,
            [field]: value
        };

        // Recalculate totals if it's a field that affects totals
        if (field === 'discount_amount' || field === 'tax_rate') {
            const lineItems = updatedInvoice.line_items || [];
            const subtotal = lineItems.reduce((sum, item) => sum + safeNumber(item.amount), 0);
            const discount = safeNumber(updatedInvoice.discount_amount);
            const taxableAmount = subtotal - discount;
            const taxAmount = (taxableAmount * safeNumber(updatedInvoice.tax_rate)) / 100;
            const total = taxableAmount + taxAmount;

            updatedInvoice.subtotal = subtotal;
            updatedInvoice.tax_amount = taxAmount;
            updatedInvoice.amount = total;
        }

        onInvoiceChange(updatedInvoice);
    }, [invoice, onInvoiceChange]);

    // Update line item with automatic total recalculation
    const updateLineItem = useCallback((itemId: string, updates: Partial<InvoiceLineItem>) => {
        const updatedItems = invoice.line_items?.map(item => {
            if (item.id === itemId) {
                const updatedItem = { ...item, ...updates };
                // Recalculate amount if quantity or rate changed
                if (updates.quantity !== undefined || updates.rate !== undefined) {
                    updatedItem.amount = safeNumber(updatedItem.quantity) * safeNumber(updatedItem.rate);
                }
                return updatedItem;
            }
            return item;
        }) || [];

        // Recalculate invoice totals
        const subtotal = updatedItems.reduce((sum, item) => sum + safeNumber(item.amount), 0);
        const discount = safeNumber(invoice.discount_amount);
        const taxableAmount = subtotal - discount;
        const taxAmount = (taxableAmount * safeNumber(invoice.tax_rate)) / 100;
        const total = taxableAmount + taxAmount;

        onInvoiceChange({
            ...invoice,
            line_items: updatedItems,
            subtotal,
            tax_amount: taxAmount,
            amount: total
        });
    }, [invoice, onInvoiceChange]);

    // Add new line item with automatic total recalculation
    const handleAddItem = useCallback(() => {
        if (!newItem.description.trim()) return;

        const quantity = safeNumber(newItem.quantity);
        const rate = safeNumber(newItem.rate);

        const item: InvoiceLineItem = {
            id: helpers.generateUniqueID(),
            invoice_id: invoice.id,
            source_type: 'custom',
            type: newItem.type,
            description: newItem.description,
            quantity: quantity,
            rate: rate,
            amount: quantity * rate,
            taxable: true,
            is_locked: false
        };

        const updatedItems = [...(invoice.line_items || []), item];

        // Recalculate invoice totals
        const subtotal = updatedItems.reduce((sum, lineItem) => sum + safeNumber(lineItem.amount), 0);
        const discount = safeNumber(invoice.discount_amount);
        const taxableAmount = subtotal - discount;
        const taxAmount = (taxableAmount * safeNumber(invoice.tax_rate)) / 100;
        const total = taxableAmount + taxAmount;

        onInvoiceChange({
            ...invoice,
            line_items: updatedItems,
            subtotal,
            tax_amount: taxAmount,
            amount: total
        });

        // Reset form
        setNewItem({
            type: 'custom',
            description: '',
            quantity: 1,
            rate: 0
        });
        setShowAddItemForm(false);
    }, [newItem, invoice, onInvoiceChange]);

    // Remove line item with automatic total recalculation
    const handleRemoveItem = useCallback((itemId: string) => {
        const updatedItems = invoice.line_items?.filter(item => item.id !== itemId) || [];

        // Recalculate invoice totals
        const subtotal = updatedItems.reduce((sum, item) => sum + safeNumber(item.amount), 0);
        const discount = safeNumber(invoice.discount_amount);
        const taxableAmount = subtotal - discount;
        const taxAmount = (taxableAmount * safeNumber(invoice.tax_rate)) / 100;
        const total = taxableAmount + taxAmount;

        onInvoiceChange({
            ...invoice,
            line_items: updatedItems,
            subtotal,
            tax_amount: taxAmount,
            amount: total
        });
    }, [invoice, onInvoiceChange]);

    // Toggle item lock
    const handleToggleItemLock = useCallback((itemId: string) => {
        updateLineItem(itemId, {
            is_locked: !invoice.line_items?.find(item => item.id === itemId)?.is_locked
        });
    }, [invoice.line_items, updateLineItem]);

    // Handle labor settings change
    const handleLaborSettingChange = useCallback((field: keyof LaborSettings, value: string | number | boolean | null | undefined) => {
        onLaborSettingsChange({
            ...laborSettings,
            [field]: value
        });
    }, [laborSettings, onLaborSettingsChange]);

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
                            value={invoice.date}
                            onChange={(e) => updateInvoiceField('date', e.target.value)}
                            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={invoice.due_date || ''}
                            onChange={(e) => updateInvoiceField('due_date', e.target.value)}
                            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={invoice.status}
                            onChange={(e) => updateInvoiceField('status', e.target.value)}
                            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="draft">Draft</option>
                            <option value="pending">Pending</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Labor Settings */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center text-sm md:text-base">
                    <Wrench className="mr-2" size={16} />
                    Labor Settings
                    <button
                        onClick={() => onSyncToggle(!syncEnabled)}
                        className={`ml-2 p-1 rounded ${syncEnabled ? 'text-orange-600' : 'text-gray-400'
                            }`}
                        title={syncEnabled ? 'Auto-sync enabled' : 'Auto-sync disabled'}
                    >
                        {syncEnabled ? <Unlock size={12} /> : <Lock size={12} />}
                    </button>
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
                                    checked={laborSettings.type === 'hourly'}
                                    onChange={() => handleLaborSettingChange('type', 'hourly')}
                                    className="mr-2"
                                />
                                <span className="text-sm">Hourly</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="laborType"
                                    value="fixed"
                                    checked={laborSettings.type === 'fixed'}
                                    onChange={() => handleLaborSettingChange('type', 'fixed')}
                                    className="mr-2"
                                />
                                <span className="text-sm">Fixed Rate</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <input
                            type="text"
                            value={laborSettings.description}
                            onChange={(e) => handleLaborSettingChange('description', e.target.value)}
                            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {laborSettings.type === 'hourly' ? (
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                Hourly Rate ($)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={laborSettings.hourly_rate == 0 ? 0 : (laborSettings.hourly_rate)}
                                onChange={(e) => handleLaborSettingChange('hourly_rate', parseFloat(e.target.value))}
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
                                value={laborSettings.fixed_amount}
                                onChange={(e) => handleLaborSettingChange('fixed_amount', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    )}

                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={laborSettings.consolidate_labor}
                                onChange={(e) => handleLaborSettingChange('consolidate_labor', e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-xs md:text-sm text-gray-700">
                                Consolidate labor into single line item
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Line Items Management */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center text-sm md:text-base">
                    <Edit3 className="mr-2" size={16} />
                    Line Items
                </h3>

                {/* Current Line Items */}
                {invoice.line_items && invoice.line_items.length > 0 && (
                    <div className="space-y-2 mb-4">
                        {invoice.line_items.map((item) => (
                            <div key={item.id} className="bg-gray-50 rounded-lg p-3 border">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            {getSourceIcon(item)}
                                            <span className="text-xs text-gray-500 capitalize">
                                                {item.type}
                                            </span>
                                            {item.source_type && (
                                                <span
                                                    className="text-xs px-2 py-0.5 bg-gray-200 rounded-full"
                                                    title={getSourceTooltip(item)}
                                                >
                                                    {item.source_type.replace('job_', '')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-sm font-medium text-gray-900 mb-1 break-words">
                                            {item.description}
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div>
                                                <span className="text-gray-500">Qty:</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.001"
                                                    value={item.quantity != 0 ? String(item.quantity).replace(/^0+/, "") : 0}
                                                    onChange={(e) => updateLineItem(item.id, {
                                                        quantity: parseFloat(e.target.value) || 0
                                                    })}
                                                    className="w-full mt-1 px-1 py-1 text-xs border border-gray-200 rounded"
                                                    disabled={item.is_locked && item.source_type === 'job_labor'}
                                                />
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Rate:</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.rate != 0 ? String(item.rate).replace(/^0+/, "") : 0}
                                                    onChange={(e) => updateLineItem(item.id, {
                                                        rate: parseFloat(e.target.value) || 0
                                                    })}
                                                    className="w-full mt-1 px-1 py-1 text-xs border border-gray-200 rounded"
                                                />
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Total:</span>
                                                <div className="mt-1 px-1 py-1 text-xs font-medium">
                                                    ${item.amount.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-1 ml-2">
                                        <button
                                            onClick={() => handleToggleItemLock(item.id)}
                                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                            title={item.is_locked ? 'Unlock item' : 'Lock item'}
                                        >
                                            {item.is_locked ? <Lock size={12} /> : <Unlock size={12} />}
                                        </button>

                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="p-1 text-red-400 hover:text-red-600 rounded"
                                            title="Remove item"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Item Form */}
                {!showAddItemForm ? (
                    <button
                        onClick={() => setShowAddItemForm(true)}
                        className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors"
                    >
                        <Plus className="inline mr-2" size={16} />
                        Add Custom Item
                    </button>
                ) : (
                    <div className="space-y-3 p-3 border border-gray-200 rounded-md bg-white">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Type
                            </label>
                            <select
                                value={newItem.type}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    type: e.target.value as 'custom' | 'fee' | 'discount'
                                }))}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="custom">Custom Item</option>
                                <option value="fee">Additional Fee</option>
                                <option value="discount">Discount</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <input
                                type="text"
                                value={newItem.description}
                                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                                    onChange={(e) => setNewItem(prev => ({
                                        ...prev,
                                        quantity: parseInt(e.target.value) || 1
                                    }))}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                                    value={newItem.rate != 0 ? String(newItem.rate).replace(/^0+/, "") : 0}
                                    onChange={(e) => setNewItem(prev => ({
                                        ...prev,
                                        rate: parseFloat(e.target.value) || 0
                                    }))}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                                    setNewItem({ type: 'custom', description: '', quantity: 1, rate: 0 });
                                }}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
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
                            value={invoice.discount_amount != 0 ? String(invoice.discount_amount).replace(/^0+/, "") : 0}
                            onChange={(e) => updateInvoiceField('discount_amount', parseFloat(e.target.value) || 0)}
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
                            value={invoice.tax_rate != 0 ? String(invoice.tax_rate).replace(/^0+/, "") : 0}
                            onChange={(e) => updateInvoiceField('tax_rate', parseFloat(e.target.value) || 0)}
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
                    value={invoice.notes || ''}
                    onChange={(e) => updateInvoiceField('notes', e.target.value)}
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
                        <span>${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    {invoice.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>-${invoice.discount_amount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Tax ({invoice.tax_rate}%):</span>
                        <span>${invoice.tax_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm md:text-lg pt-1 md:pt-2 border-t">
                        <span>Total:</span>
                        <span>${invoice.amount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}