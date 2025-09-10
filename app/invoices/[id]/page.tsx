'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Download,
    Edit,
    Eye,
    Trash2,
    CreditCard,
    Plus,
    DollarSign,
    Receipt,
    X
} from 'lucide-react';
import InvoicePreview from '@/app/components/invoices/InvoicePreview';
import InvoiceGenerationModal from '@/app/components/invoices/InvoiceGenerationModal';
import { handlePDFGeneration } from '@/app/lib/pdf-generator';
import Loading from '@/app/components/Loading';

const businessInfo = {
    name: "J&J Machine and Auto",
    address: "154 South Parliman rd",
    city: "Lagrangeville",
    state: "NY",
    zipcode: "12540",
    phone: "(845) 224-7046",
    email: "Johndirt30@gmail.com"
};

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const invoiceId = params.id as string;

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [jobData, setJobData] = useState<Job | null>(null); // Add job data state
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [isProcessingPDF, setIsProcessingPDF] = useState(false);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoadingPayments, setIsLoadingPayments] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Payment form state
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'cash',
        reference: '',
        notes: ''
    });

    useEffect(() => {
        if (invoiceId) {
            loadInvoice();
            loadPayments();
        }
    }, [invoiceId]);

    const loadInvoice = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/invoices/${invoiceId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    setError('Invoice not found');
                } else {
                    setError('Failed to load invoice');
                }
                return;
            }

            const invoiceData = await response.json();
            // Handle Date format
            invoiceData.date = invoiceData.date ? invoiceData.date.split("T")[0] : invoiceData.date;
            invoiceData.due_date = invoiceData.due_date ? invoiceData.due_date.split("T")[0] : invoiceData.due_date;
            setInvoice(invoiceData);

            // TO-DO: Load full job data with job steps and parts for sync functionality
            if (invoiceData.job_id) {
                try {
                    const jobResponse = await fetch(`/api/jobs/${invoiceData.job_id}`);
                    if (jobResponse.ok) {
                        const fullJobData = await jobResponse.json();
                        setJobData(fullJobData);
                    }
                } catch (jobError) {
                    console.error('Error loading job data:', jobError);
                }
            }
        } catch (err) {
            console.error('Error loading invoice:', err);
            setError('Failed to load invoice');
        } finally {
            setIsLoading(false);
        }
    };

    const loadPayments = async () => {
        if (!invoiceId) return;

        setIsLoadingPayments(true);
        try {
            const response = await fetch(`/api/payments?invoice_id=${invoiceId}`);
            if (response.ok) {
                const paymentsData = await response.json();
                setPayments(paymentsData);
            }
        } catch (error) {
            console.error('Error loading payments:', error);
        } finally {
            setIsLoadingPayments(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!invoice) return;

        setIsProcessingPDF(true);
        try {
            await handlePDFGeneration(
                invoice,
                invoice.customer!,
                invoice.job?.vehicle,
                payments,
                'download'
            );
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsProcessingPDF(false);
        }
    };

    const handlePreviewPDF = async () => {
        if (!invoice) return;

        setIsProcessingPDF(true);
        try {
            await handlePDFGeneration(
                invoice,
                invoice.customer!,
                invoice.job?.vehicle,
                payments,
                'preview'
            );
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsProcessingPDF(false);
        }
    };

    const handleDeleteInvoice = async () => {
        if (!invoice) return;

        const confirmMessage = `Are you sure you want to delete Invoice ${invoice.id}? This action cannot be undone.`;
        if (!confirm(confirmMessage)) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/invoices/${invoice.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete invoice');
            }

            alert('Invoice deleted successfully!');

            // Navigate back to the job page if we have a job_id, otherwise go to invoices list
            if (invoice.job_id) {
                router.push(`/jobs/${invoice.job_id}`);
            } else {
                router.push('/invoices');
            }

        } catch (error) {
            console.error('Failed to delete invoice:', error);
            alert('Failed to delete invoice. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleInvoiceUpdated = (updatedInvoice: Invoice) => {
        setInvoice(updatedInvoice);
        setShowEditModal(false);
    };

    const handleAddPayment = async () => {
        if (!invoice || !paymentForm.amount) return;

        setIsProcessingPayment(true);
        try {
            const paymentAmount = parseFloat(paymentForm.amount);

            // Create payment via API
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoice_id: invoice.id,
                    amount: paymentAmount,
                    payment_date: paymentForm.date,
                    payment_method: paymentForm.method,
                    reference_number: paymentForm.reference,
                    notes: paymentForm.notes
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create payment');
            }

            // Reload both invoice and payments to get updated amounts
            await loadInvoice();
            await loadPayments();

            // Reset form
            setPaymentForm({
                amount: '',
                date: new Date().toISOString().split('T')[0],
                method: 'cash',
                reference: '',
                notes: ''
            });
            setShowPaymentForm(false);
        } catch (error) {
            console.error('Failed to add payment:', error);
            alert('Failed to add payment. Please try again.');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleDeletePayment = async (paymentId: string) => {
        if (!confirm('Are you sure you want to delete this payment?')) return;

        try {
            const response = await fetch(`/api/payments/${paymentId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete payment');
            }

            // Reload both invoice and payments
            await loadInvoice();
            await loadPayments();

            alert('Payment deleted successfully!');

        } catch (error) {
            console.error('Failed to delete payment:', error);
            alert('Failed to delete payment. Please try again.');
        }
    };

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
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[status as keyof typeof statusColors] || statusColors.draft
                }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {error || 'Invoice not found'}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        The invoice you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.
                    </p>
                    <button
                        onClick={() => router.push('/invoices')}
                        className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        <ArrowLeft className="mr-2" size={16} />
                        Back to Invoices
                    </button>
                </div>
            </div>
        );
    }

    const balanceDue = invoice.amount - invoice.amount_paid;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="flex items-center p-4 gap-6">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowLeft className="mr-2" size={16} />
                        Back
                    </button>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Invoice {invoice.id}
                        </h1>
                        <div className="flex items-center space-x-3 mt-1">
                            {getStatusBadge(invoice.status)}
                            {invoice.revision_number > 1 && (
                                <span className="text-sm text-gray-500">
                                    Revision {invoice.revision_number}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Invoice Preview */}
                    <div className="lg:col-span-2">
                        <InvoicePreview
                            invoice={invoice}
                            customer={invoice.customer!}
                            vehicle={invoice.job?.vehicle}
                            businessInfo={businessInfo}
                            showSyncIndicators={false}
                            payments={payments}
                        />
                    </div>

                    {/* Sidebar - Actions and Payments */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    disabled={!jobData} // Disable if job data not loaded
                                    className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Edit className="mr-2" size={16} />
                                    {!jobData ? 'Loading...' : 'Edit Invoice'}
                                </button>

                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={isProcessingPDF}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <Download className="mr-2" size={16} />
                                    {isProcessingPDF ? 'Generating...' : 'Download PDF'}
                                </button>

                                <button
                                    onClick={handlePreviewPDF}
                                    disabled={isProcessingPDF}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <Eye className="mr-2" size={16} />
                                    Preview PDF
                                </button>

                                <button
                                    onClick={handleDeleteInvoice}
                                    disabled={isDeleting}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="mr-2" size={16} />
                                    {isDeleting ? 'Deleting...' : 'Delete Invoice'}
                                </button>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="font-semibold">${invoice.amount.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Amount Paid:</span>
                                    <span className="font-semibold text-green-600">${invoice.amount_paid.toFixed(2)}</span>
                                </div>

                                <div className="border-t pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-900 font-semibold">Balance Due:</span>
                                        <span className={`font-bold text-lg ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                            ${balanceDue.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {balanceDue > 0 && (
                                    <button
                                        onClick={() => setShowPaymentForm(true)}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mt-4"
                                    >
                                        <CreditCard className="mr-2" size={16} />
                                        Add Payment
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Payment History */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                                {balanceDue > 0 && (
                                    <button
                                        onClick={() => setShowPaymentForm(true)}
                                        className="text-sm text-orange-600 hover:text-orange-700"
                                    >
                                        <Plus size={16} />
                                    </button>
                                )}
                            </div>

                            {isLoadingPayments ? (
                                <div className="text-center py-6">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                                    <p className="mt-2 text-sm text-gray-500">Loading payments...</p>
                                </div>
                            ) : payments.length === 0 ? (
                                <div className="text-center py-6">
                                    <Receipt className="mx-auto h-12 w-12 text-gray-300" />
                                    <p className="mt-2 text-sm text-gray-500">No payments recorded</p>
                                    {balanceDue > 0 && (
                                        <button
                                            onClick={() => setShowPaymentForm(true)}
                                            className="mt-2 text-sm text-orange-600 hover:text-orange-700"
                                        >
                                            Add first payment
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {payments.map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <div className="font-medium">${payment.amount.toFixed(2)}</div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(payment.payment_date).toLocaleDateString()} • {payment.payment_method.replace('_', ' ')}
                                                </div>
                                                {payment.reference_number && (
                                                    <div className="text-xs text-gray-400">Ref: {payment.reference_number}</div>
                                                )}
                                                {payment.notes && (
                                                    <div className="text-xs text-gray-400 mt-1">{payment.notes}</div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeletePayment(payment.id)}
                                                className="text-gray-400 hover:text-red-600 ml-3"
                                                title="Delete payment"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Job Information */}
                        {invoice.job && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Job</h3>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Job Title:</span>
                                        <p className="text-sm text-gray-900">{invoice.job.title}</p>
                                    </div>
                                    {invoice.job.description && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Description:</span>
                                            <p className="text-sm text-gray-900">{invoice.job.description}</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => router.push(`/jobs/${invoice.job_id}`)}
                                        className="mt-3 text-sm text-orange-600 hover:text-orange-700"
                                    >
                                        View Job Details →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Form Modal */}
            {showPaymentForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Add Payment</h3>
                                <button
                                    onClick={() => setShowPaymentForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Amount
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max={balanceDue}
                                            value={paymentForm.amount}
                                            onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                                            className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-xs text-gray-500">
                                            Balance due: ${parseFloat(balanceDue.toFixed(2))}
                                        </p>
                                        {balanceDue > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setPaymentForm(prev => ({ ...prev, amount: balanceDue.toFixed(2) }))}
                                                className="text-xs text-orange-600 hover:text-orange-700"
                                            >
                                                Pay full balance
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Date
                                    </label>
                                    <input
                                        type="date"
                                        value={paymentForm.date}
                                        onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Method
                                    </label>
                                    <select
                                        value={paymentForm.method}
                                        onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="check">Check</option>
                                        <option value="credit_card">Credit Card</option>
                                        <option value="debit_card">Debit Card</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reference Number (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentForm.reference}
                                        onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="Check #, transaction ID, etc."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={paymentForm.notes}
                                        onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="Additional notes about this payment"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => setShowPaymentForm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddPayment}
                                    disabled={!paymentForm.amount || isProcessingPayment}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessingPayment ? 'Adding...' : 'Add Payment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Invoice Modal */}
            {showEditModal && invoice && jobData && (
                <InvoiceGenerationModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    jobData={jobData}
                    customer={invoice.customer!}
                    existingInvoice={invoice}
                    mode="edit"
                    onInvoiceUpdated={handleInvoiceUpdated}
                />
            )}
        </div>
    );
}