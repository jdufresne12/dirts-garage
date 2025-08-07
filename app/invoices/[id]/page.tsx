// app/invoices/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Download,
    FileText,
    Calendar,
    DollarSign,
    User,
    Wrench,
    AlertCircle,
    CheckCircle2,
    Clock,
    CreditCard
} from 'lucide-react';
import { handlePDFGeneration } from '@/app/lib/pdf-generator';

interface InvoiceDetailData extends Invoice {
    customer?: Customer | null;
    job?: {
        id: string;
        title: string;
        description: string;
        vehicle?: {
            year: number;
            make: string;
            model: string;
            vin: string;
        } | null;
    } | null;
    line_items?: InvoiceLineItem[];
}

// Invoice Preview Component (reusing from InvoiceGenerationModal)
const InvoicePreview = ({ invoiceData, customer, vehicle, jobTitle }: {
    invoiceData: any;
    customer: Customer;
    vehicle?: any;
    jobTitle: string;
}) => {
    const businessInfo = {
        name: "Dirt's Garage",
        address: "154 South Parliman rd",
        city: "Lagrangeville",
        state: "NY",
        zipcode: "12540",
        phone: "(845) 224-7046",
        email: "Johndirt30@gmail.com"
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
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">INVOICE</h2>
                    <p className="text-base md:text-lg font-semibold text-gray-700">{invoiceData.id}</p>
                    <div className="mt-2 md:mt-4 text-sm text-gray-600">
                        <p><span className="font-medium">Date:</span> {new Date(invoiceData.date).toLocaleDateString()}</p>
                        {invoiceData.due_date && (
                            <p><span className="font-medium">Due:</span> {new Date(invoiceData.due_date).toLocaleDateString()}</p>
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
                        {customer.city && (
                            <p>{customer.city}, {customer.state} {customer.zipcode}</p>
                        )}
                        {customer.phone && <p>{customer.phone}</p>}
                        {customer.email && <p>{customer.email}</p>}
                    </div>
                </div>
                {vehicle && (
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Vehicle:</h3>
                        <div className="text-gray-700 text-sm md:text-base">
                            <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                            {vehicle.vin && <p>VIN: {vehicle.vin}</p>}
                        </div>
                    </div>
                )}
            </div>

            {/* Service Description */}
            <div className="mb-6 md:mb-8">
                <h3 className="font-semibold text-gray-900 mb-2">Service:</h3>
                <p className="text-gray-700 text-sm md:text-base">{jobTitle}</p>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto mb-6 md:mb-8">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 pr-4 font-semibold text-gray-900 text-sm md:text-base">Description</th>
                            <th className="text-right py-3 px-2 font-semibold text-gray-900 text-sm md:text-base">Qty</th>
                            <th className="text-right py-3 px-2 font-semibold text-gray-900 text-sm md:text-base">Rate</th>
                            <th className="text-right py-3 pl-2 font-semibold text-gray-900 text-sm md:text-base">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceData.line_items?.map((item: any, index: number) => (
                            <tr key={index} className="border-b border-gray-100">
                                <td className="py-3 pr-4 text-gray-800 text-sm md:text-base">{item.description}</td>
                                <td className="py-3 px-2 text-right text-gray-800 text-sm md:text-base">{item.quantity}</td>
                                <td className="py-3 px-2 text-right text-gray-800 text-sm md:text-base">${item.rate.toFixed(2)}</td>
                                <td className="py-3 pl-2 text-right text-gray-800 text-sm md:text-base">${item.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-full md:w-1/2 lg:w-1/3">
                    <div className="space-y-2 text-sm md:text-base">
                        <div className="flex justify-between py-1">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="text-gray-800">${invoiceData.subtotal.toFixed(2)}</span>
                        </div>
                        {invoiceData.discount_amount > 0 && (
                            <div className="flex justify-between py-1">
                                <span className="text-gray-600">Discount:</span>
                                <span className="text-gray-800">-${invoiceData.discount_amount.toFixed(2)}</span>
                            </div>
                        )}
                        {invoiceData.tax_amount > 0 && (
                            <div className="flex justify-between py-1">
                                <span className="text-gray-600">Tax ({invoiceData.tax_rate}%):</span>
                                <span className="text-gray-800">${invoiceData.tax_amount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-2 border-t border-gray-200 font-bold text-lg">
                            <span>Total:</span>
                            <span>${invoiceData.amount.toFixed(2)}</span>
                        </div>
                        {invoiceData.amount_paid > 0 && (
                            <div className="flex justify-between py-1 text-green-600">
                                <span>Amount Paid:</span>
                                <span>-${invoiceData.amount_paid.toFixed(2)}</span>
                            </div>
                        )}
                        {invoiceData.amount_paid !== invoiceData.amount && (
                            <div className="flex justify-between py-2 border-t border-gray-200 font-bold text-lg text-red-600">
                                <span>Amount Due:</span>
                                <span>${(invoiceData.amount - invoiceData.amount_paid).toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Notes */}
            {invoiceData.notes && (
                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
                    <p className="text-gray-700 text-sm md:text-base">{invoiceData.notes}</p>
                </div>
            )}
        </div>
    );
};

const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
        case 'paid':
            return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        case 'overdue':
            return <AlertCircle className="w-5 h-5 text-red-500" />;
        case 'pending':
            return <Clock className="w-5 h-5 text-yellow-500" />;
        default:
            return <FileText className="w-5 h-5 text-gray-500" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'bg-green-100 text-green-800';
        case 'overdue':
            return 'bg-red-100 text-red-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [invoiceData, setInvoiceData] = useState<InvoiceDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchInvoiceData(params.id as string);
        }
    }, [params.id]);

    const fetchInvoiceData = async (id: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/invoices/${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch invoice data');
            }

            const data = await response.json();
            setInvoiceData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!invoiceData || !invoiceData.customer) return;

        setIsDownloading(true);
        try {
            // Prepare data for PDF generation
            const pdfInvoiceData = {
                invoiceNumber: invoiceData.id,
                date: new Date(invoiceData.date).toLocaleDateString(),
                dueDate: invoiceData.due_date ? new Date(invoiceData.due_date).toLocaleDateString() : '',
                lineItems: invoiceData.line_items || [],
                subtotal: invoiceData.subtotal,
                taxRate: invoiceData.tax_rate,
                taxAmount: invoiceData.tax_amount,
                discountAmount: invoiceData.discount_amount,
                totalAmount: invoiceData.amount,
                notes: invoiceData.notes || ''
            };

            const vehicle = invoiceData.job?.vehicle || null;
            const jobTitle = invoiceData.job?.title || 'Service';

            await handlePDFGeneration(
                pdfInvoiceData,
                invoiceData.customer,
                jobTitle,
                'download'
            );
        } catch (error) {
            console.error('PDF download failed:', error);
            alert('Failed to download PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="bg-white rounded-lg p-8">
                            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !invoiceData) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Invoice Not Found</h2>
                        <p className="text-gray-600 mb-4">{error || 'The requested invoice could not be found.'}</p>
                        <button
                            onClick={() => router.back()}
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Invoice {invoiceData.id}</h1>
                                <p className="text-gray-600">
                                    {invoiceData.customer && `${invoiceData.customer.first_name} ${invoiceData.customer.last_name}`}
                                    {invoiceData.job && ` • ${invoiceData.job.title}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoiceData.status)}`}>
                                {getStatusIcon(invoiceData.status)}
                                <span className="ml-2 capitalize">{invoiceData.status}</span>
                            </span>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isDownloading}
                                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {isDownloading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        <span>Download PDF</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Invoice Preview */}
                    <div className="lg:col-span-3">
                        <InvoicePreview
                            invoiceData={invoiceData}
                            customer={invoiceData.customer!}
                            vehicle={invoiceData.job?.vehicle}
                            jobTitle={invoiceData.job?.title || 'Service'}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Invoice Summary */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Date
                                    </span>
                                    <span className="font-medium">{new Date(invoiceData.date).toLocaleDateString()}</span>
                                </div>
                                {invoiceData.due_date && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 flex items-center">
                                            <Clock className="w-4 h-4 mr-2" />
                                            Due Date
                                        </span>
                                        <span className="font-medium">{new Date(invoiceData.due_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 flex items-center">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Total
                                    </span>
                                    <span className="font-medium">${invoiceData.amount.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 flex items-center">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Paid
                                    </span>
                                    <span className="font-medium">${invoiceData.amount_paid.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                    <span className="text-gray-900 font-semibold">Balance Due</span>
                                    <span className="font-bold text-lg">
                                        ${(invoiceData.amount - invoiceData.amount_paid).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        {invoiceData.customer && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Customer
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p className="font-medium">{invoiceData.customer.first_name} {invoiceData.customer.last_name}</p>
                                    {invoiceData.customer.email && (
                                        <p className="text-gray-600">{invoiceData.customer.email}</p>
                                    )}
                                    {invoiceData.customer.phone && (
                                        <p className="text-gray-600">{invoiceData.customer.phone}</p>
                                    )}
                                    {invoiceData.customer.address && (
                                        <div className="text-gray-600">
                                            <p>{invoiceData.customer.address}</p>
                                            {invoiceData.customer.city && (
                                                <p>{invoiceData.customer.city}, {invoiceData.customer.state} {invoiceData.customer.zipcode}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Job Info */}
                        {invoiceData.job && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Wrench className="w-5 h-5 mr-2" />
                                    Job Details
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p className="font-medium">{invoiceData.job.title}</p>
                                    {invoiceData.job.description && (
                                        <p className="text-gray-600">{invoiceData.job.description}</p>
                                    )}
                                    {invoiceData.job.vehicle && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="font-medium text-gray-900">Vehicle</p>
                                            <p className="text-gray-600">
                                                {invoiceData.job.vehicle.year} {invoiceData.job.vehicle.make} {invoiceData.job.vehicle.model}
                                            </p>
                                            {invoiceData.job.vehicle.vin && (
                                                <p className="text-gray-600 text-xs">VIN: {invoiceData.job.vehicle.vin}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={isDownloading}
                                    className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {isDownloading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4" />
                                            <span>Download PDF</span>
                                        </>
                                    )}
                                </button>

                                {/* Placeholder for future payment functionality */}
                                {invoiceData.status !== 'paid' && (
                                    <button
                                        disabled
                                        className="w-full bg-gray-100 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        <span>Record Payment (Coming Soon)</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => router.push(`/jobs/${invoiceData.job_id}`)}
                                    className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Wrench className="w-4 h-4" />
                                    <span>View Job</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}