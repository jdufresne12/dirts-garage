'use client'
import React, { useState } from 'react';
import AddJobStepModal from './AddJobStepModal';
import { Timer, X } from 'lucide-react';

interface JobStepsProps {
    steps: JobStep[];
}

export default function JobSteps({ steps }: JobStepsProps) {
    const [showAddProgressModal, setShowAddProgressModal] = useState(false);
    const [selectedStep, setSelectedStep] = useState<JobStep>();

    const totalEstimatedHours = steps.reduce((sum, step) => sum + (step.estimatedHours || 0), 0);
    const totalActualHours = steps.reduce((sum, step) => sum + (step.actualHours || 0), 0);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'border-green-400';
            case 'in-progress':
                return 'border-orange-400';
            default:
                return 'border-gray-300';
        }
    };

    const handleAddStep = (stepData: JobStep) => {
        console.log(stepData)
    };

    const handleEditStep = (stepData: JobStep) => {
        console.log(stepData)
    };

    const handleClickedStep = (stepData: JobStep) => {
        setSelectedStep(stepData);
        setShowAddProgressModal(true);
    };

    const handleClose = () => {
        if (selectedStep) {
            setSelectedStep(undefined);
        }
        setShowAddProgressModal
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-semibold">Work Progress & Time Tracking</h2>
                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                        <span>Estimated: {totalEstimatedHours} hrs</span>
                        <span>Actual: {totalActualHours} hrs</span>
                        {totalEstimatedHours > 0 && (
                            <span className={`font-medium ${totalActualHours > totalEstimatedHours ? 'text-red-600' : 'text-green-600'}`}>
                                {totalActualHours <= totalEstimatedHours ? 'On Track' : `${(totalActualHours - totalEstimatedHours).toFixed(1)} hrs over`}
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setShowAddProgressModal(true)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                >
                    Add Step
                </button>
            </div>

            <div className="space-y-6">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        onClick={() => handleClickedStep(step)}
                        className={`border-l-4 ${getStatusColor(step.status)} pl-6 relative hover:scale-102`}
                    >
                        <div className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                                    <p className="text-gray-600 mt-1">{step.description}</p>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                                        {step.status === 'completed' && step.completedDate && (
                                            <span>Completed {new Date(step.completedDate).toLocaleDateString()}</span>
                                        )}
                                        {step.status === 'in-progress' && step.startDate && (
                                            <span>Started {new Date(step.startDate).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:items-end gap-2">
                                    {/* Time tracking info */}
                                    <div className="flex flex-col sm:items-end text-sm">
                                        {step.estimatedHours && (
                                            <span className="text-gray-600">Est: {step.estimatedHours} hrs</span>
                                        )}
                                        {step.actualHours !== undefined && step.actualHours > 0 && (
                                            <span className="font-medium text-gray-900">
                                                Actual: {step.actualHours} hrs
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modals */}
            <AddJobStepModal
                isOpen={showAddProgressModal}
                onClose={() => setShowAddProgressModal(false)}
                onSave={selectedStep ? handleEditStep : handleAddStep}
                stepData={selectedStep ? selectedStep : undefined}
            />
        </div>
    );
}