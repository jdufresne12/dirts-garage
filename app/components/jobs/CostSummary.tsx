import React from 'react';

interface CostSummaryProps {
    costSummary: CostSummary
}

export default function CostSummary({ costSummary }: CostSummaryProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Cost Summary</h3>
                {/* <button className="text-gray-400 hover:text-gray-600">
                    Update
                </button> */}
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span>Parts & Materials:</span>
                    <span>${costSummary.partsAndMaterials.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Labor ({costSummary.hours} hours):</span>
                    <span>${costSummary.labor.toLocaleString()}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${costSummary.total.toLocaleString()}</span>
                </div>
            </div>

            <button className="w-full mt-4 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600">
                Generate Invoice
            </button>
        </div>
    )

};