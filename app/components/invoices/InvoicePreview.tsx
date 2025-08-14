'use client'
import React from 'react';
import { Wrench, Package, Edit3, Lock } from 'lucide-react';

interface InvoicePreviewProps {
    invoice: Invoice;
    customer: Customer;
    vehicle?: Vehicle;
    businessInfo: BusinessInfo;
    showSyncIndicators?: boolean;
    payments?: Payment[];
}

// Helper function to safely convert values to numbers
const safeNumber = (value: string | number | null): number => {
    if (value === null || value === undefined || value === '') return 0;
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(num) ? 0 : num;
};

export default function InvoicePreview({
    invoice,
    customer,
    vehicle,
    businessInfo,
    showSyncIndicators = false,
    payments = []
}: InvoicePreviewProps) {

    // Helper to get source indicator
    const getSourceIndicator = (item: InvoiceLineItem) => {
        if (!showSyncIndicators) return null;

        let icon = null;
        let color = '';
        let tooltip = '';

        if (item.is_locked) {
            icon = <Lock size={12} />;
            color = 'text-gray-500';
            tooltip = 'Locked item';
        } else {
            switch (item.source_type) {
                case 'job_labor':
                    icon = <Wrench size={12} />;
                    color = 'text-blue-500';
                    tooltip = 'Synced from job labor';
                    break;
                case 'job_part':
                    icon = <Package size={12} />;
                    color = 'text-green-500';
                    tooltip = 'Synced from job parts';
                    break;
                case 'custom':
                case 'fee':
                case 'discount':
                    icon = <Edit3 size={12} />;
                    color = 'text-purple-500';
                    tooltip = 'Custom item';
                    break;
                default:
                    return null;
            }
        }

        return (
            <span
                className={`inline-flex ${color} ml-2`}
                title={tooltip}
            >
                {icon}
            </span>
        );
    };

    // Helper to format status
    const getStatusBadge = (status: string) => {
        const statusColors = {
            draft: 'bg-gray-100 text-gray-800',
            pending: 'bg-yellow-100 text-yellow-800',
            sent: 'bg-blue-100 text-blue-800',
            paid: 'bg-green-100 text-green-800',
            overdue: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-500'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || statusColors.draft
                }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-8">
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
                    <div className="flex items-center justify-between md:justify-end space-x-3 mb-2">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">INVOICE</h2>
                        {getStatusBadge(invoice.status)}
                    </div>
                    <p className="text-base md:text-lg font-semibold text-gray-700">{invoice.id}</p>
                    {invoice.revision_number > 1 && (
                        <p className="text-xs text-gray-500">Revision {invoice.revision_number}</p>
                    )}
                    <div className="mt-2 md:mt-4 text-sm text-gray-600">
                        <p><span className="font-medium">Date:</span> {new Date(invoice.date).toLocaleDateString()}</p>
                        {invoice.due_date && (
                            <p><span className="font-medium">Due Date:</span> {new Date(invoice.due_date).toLocaleDateString()}</p>
                        )}
                        {invoice.paid_date && (
                            <p><span className="font-medium">Paid Date:</span> {new Date(invoice.paid_date).toLocaleDateString()}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bill To & Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
                <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                    <div className="text-gray-700 text-sm md:text-base">
                        <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                        {customer.address && <p>{customer.address}</p>}
                        {customer.city && customer.state && customer.zipcode && (
                            <p>{customer.city}, {customer.state} {customer.zipcode}</p>
                        )}
                        <p>{customer.phone}</p>
                        <p>{customer.email}</p>
                    </div>
                </div>

                {vehicle && (
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Vehicle:</h3>
                        <div className="text-gray-700 text-sm md:text-base">
                            <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                            {vehicle.vin ? <p>VIN: {vehicle.vin}</p> : ''}
                            {vehicle.license_plate ? <p>License: {vehicle.license_plate}</p> : ''}
                            {vehicle.mileage ? <p>Mileage: {vehicle.mileage.toLocaleString()}</p> : ''}
                        </div>
                    </div>
                )}
            </div>

            {/* Sync Status Indicator */}
            {showSyncIndicators && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${invoice.auto_sync_enabled ? 'bg-green-500' : 'bg-gray-400'
                                }`} />
                            <span className="text-gray-600">
                                Auto-sync {invoice.auto_sync_enabled ? 'enabled' : 'disabled'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                                <Wrench size={10} className="text-blue-500" />
                                <span>Labor</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Package size={10} className="text-green-500" />
                                <span>Parts</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Edit3 size={10} className="text-purple-500" />
                                <span>Custom</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Lock size={10} className="text-gray-500" />
                                <span>Locked</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                            {invoice.line_items && invoice.line_items.map((item) => (
                                <tr key={item.id} className="border-b border-gray-200">
                                    <td className="py-2 md:py-3 text-gray-700 text-sm md:text-base pr-2">
                                        <div className="break-words">
                                            <div className="flex items-center">
                                                <span>{item.description}</span>
                                                {getSourceIndicator(item)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 md:py-3 text-center text-gray-700 text-sm md:text-base">
                                        {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(2)}
                                    </td>
                                    <td className="py-2 md:py-3 text-right text-gray-700 text-sm md:text-base">
                                        ${safeNumber(item.rate).toFixed(2)}
                                    </td>
                                    <td className="py-2 md:py-3 text-right text-gray-700 text-sm md:text-base font-medium">
                                        ${safeNumber(item.amount).toFixed(2)}
                                        {!item.taxable && (
                                            <span className="text-xs text-gray-400 block">Tax exempt</span>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {/* Empty state */}
                            {(!invoice.line_items || invoice.line_items.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-gray-500">
                                        No line items added yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-full max-w-xs md:w-64">
                    <div className="flex justify-between py-1 md:py-2 text-sm md:text-base">
                        <span className="text-gray-700">Subtotal:</span>
                        <span className="text-gray-700">${safeNumber(invoice.subtotal).toFixed(2)}</span>
                    </div>
                    {invoice.discount_amount > 0 && (
                        <div className="flex justify-between py-1 md:py-2 text-sm md:text-base">
                            <span className="text-gray-700">Discount:</span>
                            <span className="text-green-600">-${safeNumber(invoice.discount_amount).toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between border-b-2 border-gray-300 py-1 md:py-2 text-sm md:text-base">
                        <span className="text-gray-700">Tax ({invoice.tax_rate}%):</span>
                        <span className="text-gray-700">${safeNumber(invoice.tax_amount).toFixed(2)}</span>
                    </div>
                    {payments && payments.length > 0 && (
                        <>
                            {payments.map((payment) => (
                                <div key={payment.id} className="flex justify-between py-1 md:py-2 text-sm text-red-500">
                                    <span>
                                        {payment.payment_method} - {new Date(payment.payment_date).toLocaleDateString()}
                                    </span>
                                    <span>-${payment.amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </>
                    )}
                    <div className="flex justify-between py-1 md:py-2 border-t-2 border-gray-300 font-bold text-base md:text-lg">
                        <span>Total:</span>
                        <span>${safeNumber(invoice.amount - (invoice.amount_paid || 0)).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
                    <p className="text-gray-700 text-sm md:text-base whitespace-pre-wrap">{invoice.notes}</p>
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>Thank you for your business!</p>
                {invoice.created_at && (
                    <p className="mt-1">
                        Invoice created on {new Date(invoice.created_at).toLocaleDateString()}
                    </p>
                )}
            </div>
        </div>
    );
}