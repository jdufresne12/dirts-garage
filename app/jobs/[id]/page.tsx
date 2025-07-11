'use client'
import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import VehicleDetails from '@/app/components/jobs/VehicleDetails';
import CustomerInfo from '@/app/components/jobs/CustomerInfoCard';
import CostSummary from '@/app/components/jobs/CostSummary';
import JobNotes from '@/app/components/jobs/JobNotes';
import JobSteps from '@/app/components/jobs/JobSteps';
import PartsAndMaterials from '@/app/components/jobs/PartsAndMaterials';
import PhotoDocumentation from '@/app/components/jobs/PhotoDocumentation';
import Link from 'next/link';

const mockJobData = {
    id: "2025-0156",
    title: "LS3 Engine Rebuild",
    customer: {
        name: "Mike Johnson",
        phone: "(555) 123-4567",
        email: "mike.johnson@email.com",
        address: "123 Main St, City, ST 12345",
        isVIP: true,
        totalSpent: 15840
    },
    vehicle: {
        year: "2018",
        make: "Chevrolet",
        model: "Camaro SS",
        vin: "1G1FE1R7XJ0123456",
        mileage: "45,200",
        color: "Summit White",
        engine: "6.2L LS3 V8",
        transmission: "6-Speed Manual"
    },
    startDate: "June 20, 2025",
    estimatedCompletion: "July 5, 2025",
    status: "In Progress"
};

const mockJobSteps: JobStep[] = [
    {
        id: "1",
        title: "Initial Inspection & Teardown",
        description:
            "Engine removed from vehicle. Initial inspection completed. Block and heads sent for cleaning and inspection.",
        status: "completed",
        completedDate: "2025-06-21T14:30",
        estimatedHours: 5,
        actualHours: 5
    },
    {
        id: "2",
        title: "Machine Shop Work",
        description:
            "Block bored .030 over, decked, and honed. Heads reconditioned with new valves and guides.",
        status: "completed",
        completedDate: "2025-06-23T16:00",
        estimatedHours: 5,
        actualHours: 5
    },
    {
        id: "3",
        title: "Engine Assembly",
        description:
            "Currently installing pistons and connecting rods. Waiting for torque plates to arrive for final assembly.",
        status: "in-progress",
        startDate: "2025-06-24T08:00",
        estimatedHours: 5
    },
    {
        id: "4",
        title: "Installation & Final Inspection",
        description:
            "Install engine back into vehicle and perform final quality checks.",
        status: "pending",
        estimatedHours: 5
    }
];

const mockParts: Part[] = [
    { id: "1", jobId: "1", name: "Forged Pistons (.030 over)", partNumber: "Summit Racing SUM-2618-030", quantity: 8, price: 459.99, status: "received" },
    { id: "1", jobId: "1", name: "Connecting Rods", partNumber: "Eagle CRS6200A33D", quantity: 8, price: 389.99, status: "received" },
    { id: "1", jobId: "1", name: "ARP Head Studs", partNumber: "ARP 234-4316", quantity: 1, price: 189.99, status: "ordered" },
    { id: "1", jobId: "1", name: "Engine Gasket Set", partNumber: "Fel-Pro HS26332PT", quantity: 1, price: 129.99, status: "received" },
    { id: "1", jobId: "1", name: "Performance Camshaft", partNumber: "Comp Cams 12-600-4", quantity: 1, price: 279.99, status: "needed" }
];

const mockNotes: Note[] = [
    {
        id: "1",
        timestamp: "2025-06-21T14:30",
        note: "Customer wants upgraded internals for future power goals. Discussed forged pistons and rods - approved upgrade."
    },
    {
        id: "2",
        timestamp: "2025-06-22T10:15",
        note: "Called customer about ARP stud delay. He's okay with 2-day delay for quality parts."
    },
    {
        id: "3",
        timestamp: "2025-06-24T09:00",
        note: "Customer sent text: \"Looking forward to getting the car back! Thanks for the updates.\""
    }
];

// Main Component
const JobDetailsPage = () => {
    const [jobData, setJobData] = useState(mockJobData);
    const [jobSteps, setJobSteps] = useState<JobStep[]>(mockJobSteps);
    const [parts, setParts] = useState<Part[]>(mockParts);
    const [notes, setNotes] = useState<Note[]>(mockNotes);
    const [costSummary, setCostSummary] = useState<CostSummary>()

    useEffect(() => {
        // Fetch job data, steps, parts, notes from API
        setJobData(mockJobData);
        setJobSteps(mockJobSteps);
        setParts(mockParts);
        setNotes(mockNotes);
        setCostSummary(calculateCostSummary())
    }, [])

    const calculateCostSummary = (): CostSummary => {
        return {
            partsAndMaterials: parts.reduce((sum, part) => sum + (part.price * part.quantity), 0),
            labor: jobSteps.reduce((sum, step) => sum + (step.actualHours || 0) * 125, 0),
            hours: jobSteps.reduce((sum, step) => sum + (step.actualHours || 0), 0),
        };
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
        switch (status) {
            case "In Progress":
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case "Waiting":
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case "On Hold":
                return `${baseClasses} bg-orange-100 text-orange-800`;
            case "Payment":
                return `${baseClasses} bg-red-100 text-red-800`;
            case "Completed":
                return `${baseClasses} bg-red-100 text-green-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-600`;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 pt-6 pb-4 px-4 sm:px-6">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/jobs"
                        className="flex items-center text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="size-5 hover:scale-110" />
                    </Link>
                    <div className="flex-1">
                        <div className='flex items-center gap-3'>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{jobData.title}</h1>
                            <span className={`${getStatusBadge(jobData.status)}`}>
                                {jobData.status}
                            </span>
                        </div>
                        <span className="text-sm text-gray-500">Job #{jobData.id}</span>
                        <div>
                            <span>{jobData.status === "Waiting" && "Estimated"} Start Data</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile: Customer and Vehicle cards at top */}
            <div className="md:hidden p-4 space-y-4">
                <CustomerInfo customer={jobData.customer} />
                <VehicleDetails vehicle={jobData.vehicle} />
            </div>

            <div className="flex flex-col md:flex-row ">
                {/* Main Content */}
                <div className="flex-1 p-4 sm:p-6">
                    <JobSteps jobSteps={jobSteps} setJobSteps={setJobSteps} />
                    <PartsAndMaterials partsAndMaterials={parts} />
                    <PhotoDocumentation />
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden md:block w-80 pt-6 pr-2 space-y-6">
                    <CustomerInfo customer={jobData.customer} />
                    <VehicleDetails vehicle={jobData.vehicle} />
                    {costSummary && <CostSummary costSummary={costSummary} />}
                    <JobNotes Notes={notes} />
                </div>
            </div>

            {/* Mobile: Cost Summary and Notes at bottom */}
            <div className="md:hidden p-4 space-y-4">
                {costSummary && <CostSummary costSummary={costSummary} />}
                <JobNotes Notes={notes} />
            </div>
        </div>
    );
};

export default JobDetailsPage;