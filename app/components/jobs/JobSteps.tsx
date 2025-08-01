'use client'
import React, { useState } from 'react';
import AddJobStepModal from './AddJobStepModal';
import { Timer, X, Edit } from 'lucide-react';
import helpers from '@/app/utils/helpers';

interface JobStepsProps {
    jobSteps: JobStep[];
    setJobSteps: React.Dispatch<React.SetStateAction<JobStep[] | undefined>>;
}

export default function JobSteps({ jobSteps, setJobSteps }: JobStepsProps) {
    const [showAddProgressModal, setShowAddProgressModal] = useState(false);
    const [selectedStep, setSelectedStep] = useState<JobStep>();
    const [showStepInfo, setShowStepInfo] = useState<{ [key: number]: boolean }>({});

    const totalEstimatedHours = jobSteps?.reduce((sum, step: JobStep) => sum + (step.estimated_hours || 0), 0);
    const totalActualHours = jobSteps?.reduce((sum, step: JobStep) => sum + (step.actual_hours || 0), 0);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'border-green-400';
            case 'In Progress':
                return 'border-orange-400';
            default:
                return 'border-gray-300';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full';
            case 'In Progress':
                return 'px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full';
            default:
                return 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full';
        }
    };

    const handleStepClick = (index: number) => {
        setShowStepInfo(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleEditStep = (step: JobStep) => {
        setSelectedStep(step);
        setShowAddProgressModal(true);
    };

    const handleAddStep = (stepData: JobStep) => {
        // API call to add step to db
        // If successful, update the steps state
        console.log(stepData)
        setJobSteps((prevSteps) => [
            ...(prevSteps ?? []),
            stepData
        ]);
    };

    const handleUpdateStep = (stepData: JobStep) => {
        // API call to update step to db
        // If successful, update the steps state
        console.log(stepData)
        setJobSteps((prevSteps) =>
            (prevSteps ?? []).map(step => step.id === stepData.id ? stepData : step)
        );
    };

    const handleDeleteStep = (id: string) => {
        // API call to delete step to db
        // If successful, update the steps state
        console.log(id)
        setJobSteps(prev => (prev ?? []).filter(step => step.id !== id));
    };

    const handleClose = () => {
        if (selectedStep) {
            setSelectedStep(undefined);
        }
        setShowAddProgressModal(false);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
                {jobSteps && jobSteps.length > 0 && <button
                    onClick={() => setShowAddProgressModal(true)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                >
                    Add Step
                </button>}
            </div>

            <div className="space-y-4">
                {jobSteps && jobSteps.length > 0 ? jobSteps.map((step, index) => (
                    <div key={step.id} className="border border-gray-200 rounded-lg hover:scale-101">
                        <div
                            onClick={() => handleStepClick(index)}
                            className={`border-l-4 ${getStatusColor(step.status)} pl-6 p-4 cursor-pointer`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                                    <div className="text-sm space-x-3">
                                        {step.estimated_hours && (
                                            <span className="text-gray-600">Est: {step.estimated_hours} hrs</span>
                                        )}
                                        {step.actual_hours !== undefined && step.actual_hours > 0 && (
                                            <span className="font-medium text-gray-900">
                                                Actual: {step.actual_hours} hrs
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mt-1">{step.description}</p>
                                </div>
                                <span className={`flex ${getStatusBadge(step.status)} whitespace-nowrap justify-center items-center`}>
                                    {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Expanded content - Step Details */}
                        {showStepInfo[index] && step && (
                            <div className='w-full bg-gray-50 rounded-b-lg border-t border-gray-200'>
                                <div className="p-4">
                                    {/* Header with title and edit button */}
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Step Details</h3>
                                        <button
                                            onClick={() => handleEditStep(step)}
                                        >
                                            <Edit className="size-4 text-orange-400 mr-2 hover:scale-105" />
                                        </button>
                                    </div>

                                    {step.description && (
                                        <div className='mb-4'>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Description
                                            </label>
                                            <p className="text-sm text-gray-900 font-medium">{step.description}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {/* Basic Information */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                    Step Title
                                                </label>
                                                <p className="text-sm text-gray-900 font-medium">{step.title}</p>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                    Status
                                                </label>
                                                <span className={`${getStatusBadge(step.status)} inline-block`}>
                                                    {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                                                </span>
                                            </div>

                                            {step.technician && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        Technician
                                                    </label>
                                                    <p className="text-sm text-gray-900">{step.technician}</p>
                                                </div>
                                            )}

                                            {step.order && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        Order
                                                    </label>
                                                    <p className="text-sm text-gray-900">{step.order}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Time Tracking & Dates */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                    Estimated Hours
                                                </label>
                                                <p className="text-sm text-gray-900">{step.estimated_hours || 0} hrs</p>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                    Actual Hours
                                                </label>
                                                <p className="text-sm text-gray-900 font-semibold">{step.actual_hours || 0} hrs</p>
                                            </div>

                                            {step.estimated_hours && step.actual_hours && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        Variance
                                                    </label>
                                                    <p className={`text-sm font-semibold ${(step.actual_hours - step.estimated_hours) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                        {step.actual_hours - step.estimated_hours > 0 ? '+' : ''}{(step.actual_hours - step.estimated_hours).toFixed(1)} hrs
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dates section */}
                                    {(step.start_date || step.completed_date || step.estimated_start) && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {step.estimated_start && (
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                            Estimated Start Date
                                                        </label>
                                                        <p className="text-sm text-gray-900">{helpers.displayDateAndTimeShort(step.estimated_start)}</p>
                                                    </div>
                                                )}

                                                {step.start_date && (
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                            Start Date
                                                        </label>
                                                        <p className="text-sm text-gray-900">{helpers.displayDateAndTimeShort(step.start_date)}</p>
                                                    </div>
                                                )}

                                                {step.completed_date && (
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                            Completed Date
                                                        </label>
                                                        <p className="text-sm text-gray-900">{helpers.displayDateAndTimeShort(step.completed_date)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-12 px-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center">
                            {/* Icon */}
                            <div className="mx-auto mb-4 w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                    />
                                </svg>
                            </div>

                            {/* Main message */}
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No progress steps created yet
                            </h3>

                            {/* Subtitle */}
                            <p className="text-sm text-gray-500 mb-6 max-w-md">
                                Break down this job into manageable steps to track progress and time.
                                Click "Add Step" to get started.
                            </p>

                            {/* CTA Button */}
                            <button
                                onClick={() => setShowAddProgressModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors duration-200"
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Add First Step
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddJobStepModal
                isOpen={showAddProgressModal}
                onClose={handleClose}
                onSave={selectedStep ? handleUpdateStep : handleAddStep}
                onDelete={handleDeleteStep}
                stepData={selectedStep ? selectedStep : undefined}
            />
        </div>
    );
}