import React, { useState, useEffect } from 'react';
import { Edit, Eye, RefreshCw } from 'lucide-react';
import InvoiceGenerationModal from '../invoices/InvoiceGenerationModal';

interface CostSummaryProps {
    costSummary: CostSummary;
    jobData: Job;
    customer: Customer;
    jobSteps: JobStep[];
    parts: Part[];
}

export default function CostSummary({
    costSummary,
    jobData,
    customer,
    jobSteps,
    parts
}: CostSummaryProps) {
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [existingInvoice, setExistingInvoice] = useState<Invoice | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
    const [syncStatus, setSyncStatus] = useState<{
        needed: boolean;
        lastSynced?: string;
    }>({ needed: false });

    const total = costSummary.partsAndMaterials + costSummary.labor;

    // Determine if job is ready for invoicing
    const isReadyForInvoice = jobData.status === "Completed" || jobData.status === "completed";
    const hasInvoice = Boolean(jobData.invoice_id);

    // Load existing invoice if available
    useEffect(() => {
        if (hasInvoice && jobData.invoice_id) {
            loadExistingInvoice(jobData.invoice_id);
        }
    }, [hasInvoice, jobData.invoice_id]);

    const loadExistingInvoice = async (invoiceId: string) => {
        setIsLoadingInvoice(true);
        try {
            const response = await fetch(`/api/invoices/${invoiceId}`);
            if (response.ok) {
                const invoice = await response.json();

                // Handle Date format
                invoice.date = invoice.date ? invoice.date.split("T")[0] : invoice.date;
                invoice.due_date = invoice.due_date ? invoice.due_date.split("T")[0] : invoice.due_date;

                setExistingInvoice(invoice);

                // Check sync status if auto-sync is enabled
                if (invoice.auto_sync_enabled) {
                    checkSyncStatus(invoiceId);
                }
            } else {
                console.error('Failed to load invoice');
                setExistingInvoice(null);
            }
        } catch (error) {
            console.error('Error loading invoice:', error);
            setExistingInvoice(null);
        } finally {
            setIsLoadingInvoice(false);
        }
    };

    const checkSyncStatus = async (invoiceId: string) => {
        try {
            const response = await fetch(`/api/invoices/${invoiceId}/sync-status`);
            if (response.ok) {
                const status = await response.json();
                setSyncStatus(status);
            }
        } catch (error) {
            console.error('Error checking sync status:', error);
        }
    };

    const handleInvoiceClick = () => {
        if (hasInvoice && existingInvoice) {
            window.location.href = `/invoices/${jobData.invoice_id}`
        } else {
            setModalMode('create');
            setShowInvoiceModal(true);
        }
    };

    const handleViewInvoice = () => {
        if (existingInvoice) {
            setModalMode('view');
            setShowInvoiceModal(true);
        }
    };

    const handleSyncInvoice = async () => {
        if (!existingInvoice) return;

        try {
            const response = await fetch(`/api/invoices/${existingInvoice.id}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ force_sync: true })
            });

            if (response.ok) {
                // Reload invoice after sync
                await loadExistingInvoice(existingInvoice.id);
                alert('Invoice synced successfully with latest job data!');
            } else {
                alert('Failed to sync invoice. Please try again.');
            }
        } catch (error) {
            console.error('Error syncing invoice:', error);
            alert('Failed to sync invoice. Please try again.');
        }
    };

    const handleInvoiceCreated = (invoice: Invoice) => {
        setExistingInvoice(invoice);
        window.location.href = `/invoices/${invoice.id}`
    };

    const handleInvoiceUpdated = (invoice: Invoice) => {
        setExistingInvoice(invoice);
        setSyncStatus({ needed: false });
    };

    const getInvoiceStatus = () => {
        if (!existingInvoice) return null;

        const statusColors = {
            draft: 'bg-gray-100 text-gray-800',
            pending: 'bg-yellow-100 text-yellow-800',
            sent: 'bg-blue-100 text-blue-800',
            paid: 'bg-green-100 text-green-800',
            overdue: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-500'
        };

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[existingInvoice.status as keyof typeof statusColors] || statusColors.draft
                }`}>
                {existingInvoice.status.charAt(0).toUpperCase() + existingInvoice.status.slice(1)}
            </span>
        );
    };

    return (
        <>
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Cost Summary</h3>
                    {syncStatus.needed && existingInvoice && (
                        <button
                            onClick={handleSyncInvoice}
                            className="p-1 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded"
                            title="Sync needed - job data has changed"
                        >
                            <RefreshCw size={16} />
                        </button>
                    )}
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Parts & Materials:</span>
                        <span>${costSummary.partsAndMaterials.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Labor ({Number(costSummary.hours)} hours):</span>
                        <span>${costSummary.labor.toLocaleString()}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${total.toLocaleString()}</span>
                    </div>
                </div>

                {/* Invoice Status and Actions */}
                {hasInvoice && existingInvoice && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">Invoice:</span>
                                <span className="text-sm text-gray-600">{existingInvoice.id}</span>
                                {getInvoiceStatus()}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div>
                                <span className="text-gray-500">Amount: </span>
                                <span className="font-medium">${existingInvoice.amount.toFixed(2)}</span>
                                {existingInvoice.amount_paid > 0 && (
                                    <span className="text-green-600 ml-2">
                                        (${existingInvoice.amount_paid.toFixed(2)} paid)
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={handleViewInvoice}
                                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                                    title="View invoice"
                                >
                                    <Eye size={14} />
                                </button>
                                <button
                                    onClick={handleInvoiceClick}
                                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                                    title="Edit invoice"
                                >
                                    <Edit size={14} />
                                </button>
                            </div>
                        </div>

                        {syncStatus.needed && (
                            <div className="mt-2 text-xs text-orange-600 flex items-center">
                                <RefreshCw size={12} className="mr-1" />
                                Job data has changed - sync recommended
                            </div>
                        )}
                    </div>
                )}

                {/* Main Action Button */}
                <button
                    onClick={handleInvoiceClick}
                    disabled={(!isReadyForInvoice && !hasInvoice) || isLoadingInvoice}
                    className={`w-full mt-4 py-2 rounded-lg transition-colors ${hasInvoice
                        ? 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
                        : isReadyForInvoice
                            ? 'bg-orange-400 text-white hover:bg-orange-500'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {isLoadingInvoice ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            Loading...
                        </div>
                    ) : hasInvoice ? (
                        `Manage Invoice`
                    ) : isReadyForInvoice ? (
                        'Generate Invoice'
                    ) : (
                        'Complete Job to Invoice'
                    )}
                </button>

                {!isReadyForInvoice && !hasInvoice && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Job must be completed before generating invoice
                    </p>
                )}
            </div>

            {/* Invoice Generation Modal */}
            <InvoiceGenerationModal
                isOpen={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                jobData={{
                    ...jobData,
                    job_steps: jobSteps,
                    parts: parts
                }}
                customer={customer}
                existingInvoice={existingInvoice}
                mode={modalMode}
                onInvoiceCreated={handleInvoiceCreated}
                onInvoiceUpdated={handleInvoiceUpdated}
            />
        </>
    );
}