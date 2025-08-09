import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface InvoicesTableProps {
    invoices: Invoice[];
    customerData: Customer;
    isInvoicesLoading: boolean;
    getInvoiceStatusBadge: (status: string) => string;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({
    invoices,
    customerData,
    isInvoicesLoading,
    getInvoiceStatusBadge
}) => {
    return (
        <div>
            {/* <Link
                href={`/invoices/new?customer_id=${customerData.id}`}
                className="flex w-fit items-center mb-4 p-1 text-center text-sm font-medium transition-colors whitespace-nowrap
                text-orange-400 rounded-lg hover:border-orange-400 hover:border-1"
            >
                <Plus className="size-3 mr-1 text-orange-400 md:size-4" /> Create Invoice
            </Link> */}

            {isInvoicesLoading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
            ) : invoices && invoices.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.map(invoice => (
                                <tr
                                    key={invoice.id}
                                    onClick={() => window.location.href = `/invoices/${invoice.id}`}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {invoice.id.toString().padStart(3, '0')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${(invoice.amount || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${(invoice.amount_paid || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {invoice.date ? new Date(invoice.date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getInvoiceStatusBadge(invoice.status)}`}>
                                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    No invoices found for this customer
                </div>
            )}
        </div>
    );
};

export default InvoicesTable;