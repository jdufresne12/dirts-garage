import React, { useState } from 'react';
import InvoiceGenerationModal from '../invoices/InvoiceGenerationModal';

interface CostSummaryProps {
    costSummary: CostSummary;
    jobData: Job;
    customer: Customer;
    vehicle: Vehicle;
    jobSteps: JobStep[];
    parts: Part[];
}

export default function CostSummary({
    costSummary,
    jobData,
    customer,
    vehicle,
    jobSteps,
    parts
}: CostSummaryProps) {
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    const total = costSummary.partsAndMaterials + costSummary.labor;

    // Determine if job is ready for invoicing
    const isReadyForInvoice = jobData.status === "Completed" || jobData.status === "completed";
    const isAlreadyInvoiced = jobData.invoiced;

    const handleInvoiceClick = () => {
        if (isAlreadyInvoiced) {
            // TODO: Navigate to view existing invoice
            console.log('Navigate to existing invoice');
        } else {
            setShowInvoiceModal(true);
        }
    };

    return (
        <>
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Cost Summary</h3>
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

                <button
                    onClick={handleInvoiceClick}
                    disabled={!isReadyForInvoice && !isAlreadyInvoiced}
                    className={`w-full mt-4 py-2 rounded-lg transition-colors ${isAlreadyInvoiced
                        ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
                        : isReadyForInvoice
                            ? 'bg-orange-400 text-white hover:bg-orange-500'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {isAlreadyInvoiced
                        ? 'View Invoice'
                        : isReadyForInvoice
                            ? 'Generate Invoice'
                            : 'Complete Job to Invoice'
                    }
                </button>

                {!isReadyForInvoice && !isAlreadyInvoiced && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Job must be completed before generating invoice
                    </p>
                )}
            </div>

            {/* Invoice Generation Modal */}
            <InvoiceGenerationModal
                isOpen={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                jobData={jobData}
                customer={customer}
                vehicle={vehicle}
                jobSteps={jobSteps}
                parts={parts}
            />
        </>
    );
}