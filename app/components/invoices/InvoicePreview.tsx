'use client'
import React from 'react';

interface BusinessInfo {
    name: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    phone: string;
    email: string;
}

interface InvoicePreviewProps {
    invoiceData: Invoice;
    customer: Customer;
    businessInfo: BusinessInfo;
    className?: string;
}

// Helper function to safely convert values to numbers
const safeNumber = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(num) ? 0 : num;
};

export default function InvoicePreview({
    invoiceData,
    customer,
    businessInfo,
    className = ""
}: InvoicePreviewProps) {
    return (
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
                    <p className="text-base md:text-lg font-semibold text-gray-700">{invoiceData.id}</p>
                    <div className="mt-2 md:mt-4 text-sm text-gray-600">
                        <p><span className="font-medium">Date:</span> {invoiceData.date}</p>
                        {invoiceData.due_date && (
                            <p><span className="font-medium">Due Date:</span> {invoiceData.due_date}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bill To */}
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
                            {invoiceData.line_items && invoiceData.line_items.map((item) => (
                                <tr key={item.id} className="border-b border-gray-200">
                                    <td className="py-2 md:py-3 text-gray-700 text-sm md:text-base pr-2">
                                        <div className="break-words">{item.description}</div>
                                    </td>
                                    <td className="py-2 md:py-3 text-center text-gray-700 text-sm md:text-base">{item.quantity}</td>
                                    <td className="py-2 md:py-3 text-right text-gray-700 text-sm md:text-base">
                                        ${safeNumber(item.rate).toFixed(2)}
                                    </td>
                                    <td className="py-2 md:py-3 text-right text-gray-700 text-sm md:text-base font-medium">
                                        ${safeNumber(item.amount).toFixed(2)}
                                    </td>
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
                        <span className="text-gray-700">${safeNumber(invoiceData.subtotal).toFixed(2)}</span>
                    </div>
                    {invoiceData.discount_amount > 0 && (
                        <div className="flex justify-between py-1 md:py-2 text-sm md:text-base">
                            <span className="text-gray-700">Discount:</span>
                            <span className="text-gray-700">-${safeNumber(invoiceData.discount_amount).toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-1 md:py-2 text-sm md:text-base">
                        <span className="text-gray-700">Tax ({invoiceData.tax_rate}%):</span>
                        <span className="text-gray-700">${safeNumber(invoiceData.tax_rate).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 md:py-2 border-t-2 border-gray-300 font-bold text-base md:text-lg">
                        <span>Total:</span>
                        <span>${safeNumber(invoiceData.amount).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {invoiceData.notes && (
                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
                    <p className="text-gray-700 text-sm md:text-base">{invoiceData.notes}</p>
                </div>
            )}
        </div>
    );
}