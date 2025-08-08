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
    CreditCard,
    Edit3
} from 'lucide-react';
import { handlePDFGeneration } from '@/app/lib/pdf-generator';
import InvoicePreview from '@/app/components/invoices/InvoicePreview';
import InvoiceGenerationModal from '@/app/components/invoices/InvoiceGenerationModal';

const businessInfo = {
    name: "Dirt's Garage",
    address: "154 South Parliman rd",
    city: "Lagrangeville",
    state: "NY",
    zipcode: "12540",
    phone: "(845) 224-7046",
    email: "Johndirt30@gmail.com"
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
    const [invoiceData, setInvoiceData] = useState<Invoice | null>(null);
    const [jobData, setJobData] = useState<Job | null>(null);
    const [partsData, setPartsData] = useState<Part[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [totalLaborHours, setTotalLaborHours] = useState(0);

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
            console.log(data)

            // Format dates
            data.date = data.date.split("T")[0]

            setInvoiceData(data);

            // Fetch related job and parts data for the update modal
            if (data.job_id) {
                await fetchJobAndPartsData(data.job_id);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const fetchJobAndPartsData = async (jobId: string) => {
        try {
            // Fetch job data
            const jobResponse = await fetch(`/api/jobs/${jobId}`);
            if (jobResponse.ok) {
                const job = await jobResponse.json();
                setJobData(job);
                console.log(job)
            }

            // Fetch job steps to calculate total labor hours
            const stepsResponse = await fetch(`/api/jobs/job-steps/${jobId}`);
            if (stepsResponse.ok) {
                const steps = await stepsResponse.json();
                const totalHours = steps.reduce((sum: number, step: any) =>
                    sum + (step.actual_hours || step.estimated_hours || 0), 0
                );
                setTotalLaborHours(totalHours);

            }

            // Fetch parts data
            const partsResponse = await fetch(`/api/jobs/parts/${jobId}`);
            if (partsResponse.ok) {
                const parts = await partsResponse.json();
                setPartsData(parts);
                console.log(parts)
            }

        } catch (error) {
            console.error('Error fetching job and parts data:', error);
        }
    };

    const handleDownloadPDF = async () => {
        if (!invoiceData || !invoiceData.customer) return;

        setIsDownloading(true);
        try {
            const pdfInvoiceData = {
                invoiceNumber: invoiceData.id,
                date: invoiceData.date,
                dueDate: invoiceData.due_date || '',
                lineItems: invoiceData.line_items || [],
                subtotal: invoiceData.subtotal,
                taxRate: invoiceData.tax_rate,
                taxAmount: invoiceData.tax_amount,
                discountAmount: invoiceData.discount_amount,
                totalAmount: invoiceData.amount,
                notes: invoiceData.notes || ''
            };

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

    const handleInvoiceUpdated = () => {
        // Refresh invoice data after update
        if (params.id) {
            fetchInvoiceData(params.id as string);
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

    if (error || !invoiceData || !invoiceData.customer) {
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
        <>
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
                                    onClick={() => setShowUpdateModal(true)}
                                    disabled={!jobData}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    <span>Edit Invoice</span>
                                </button>
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
                        {/* Invoice Preview - Using your existing component */}
                        <div className="lg:col-span-3">
                            <InvoicePreview
                                invoiceData={invoiceData}
                                customer={invoiceData.customer}
                                businessInfo={businessInfo}
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
                                        <span className="font-medium">{invoiceData.date}</span>
                                    </div>
                                    {invoiceData.due_date && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 flex items-center">
                                                <Clock className="w-4 h-4 mr-2" />
                                                Due Date
                                            </span>
                                            <span className="font-medium">{invoiceData.due_date}</span>
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
                                        onClick={() => setShowUpdateModal(true)}
                                        disabled={!jobData}
                                        className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        <span>Edit Invoice</span>
                                    </button>

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
                                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
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

            {/* Update Modal */}
            {showUpdateModal && jobData && invoiceData.customer && (
                <InvoiceGenerationModal
                    isOpen={showUpdateModal}
                    onClose={() => setShowUpdateModal(false)}
                    jobData={jobData}
                    customer={invoiceData.customer}
                    totalLaborHours={totalLaborHours}
                    parts={partsData}
                    existingInvoice={invoiceData}
                    mode="update"
                    onInvoiceUpdated={handleInvoiceUpdated}
                />
            )}
        </>
    );
}