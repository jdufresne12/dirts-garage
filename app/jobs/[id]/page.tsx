'use client'
import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Loading from '@/app/components/Loading';

import VehicleInfo from '@/app/components/jobs/VehicalInfoCard';
import CustomerInfo from '@/app/components/jobs/CustomerInfoCard';
import CostSummary from '@/app/components/jobs/CostSummary';
import JobNotes from '@/app/components/jobs/JobNotes';
import JobSteps from '@/app/components/jobs/JobSteps';
import PartsAndMaterials from '@/app/components/jobs/PartsAndMaterials';
import PhotoDocumentation from '@/app/components/jobs/PhotoDocumentation';
import JobDetailsCard from '@/app/components/jobs/JobDetailsCard';
import Link from 'next/link';
import mockData from '@/app/data/mock-data';

const mockJobData: Job = {
    id: "2025-0156",
    customerId: "CUST001",
    vehicleId: "1",
    title: "LS3 Engine Rebuild",
    description: "Complete engine rebuild including bore, hone, and performance upgrades. Customer wants forged internals for future power goals.",
    status: "In Progress",
    priority: "High",
    estimatedStartDate: "2025-06-20",
    startDate: "2025-06-20",
    estimatedCompletion: "2025-07-05",
    estimatedCost: 3500.00,
    actualCost: 0,
    invoiced: false,
};

const mockJobSteps: JobStep[] = [
    {
        id: "1",
        title: "Initial Inspection & Teardown",
        description:
            "Engine removed from vehicle. Initial inspection completed. Block and heads sent for cleaning and inspection.",
        status: "Completed",
        completedDate: "2025-06-21T14:30",
        estimatedHours: 5,
        actualHours: 5
    },
    {
        id: "2",
        title: "Machine Shop Work",
        description:
            "Block bored .030 over, decked, and honed. Heads reconditioned with new valves and guides.",
        status: "Completed",
        completedDate: "2025-06-23T16:00",
        estimatedHours: 5,
        actualHours: 5
    },
    {
        id: "3",
        title: "Engine Assembly",
        description:
            "Currently installing pistons and connecting rods. Waiting for torque plates to arrive for final assembly.",
        status: "In Progress",
        startDate: "2025-06-24T08:00",
        estimatedHours: 5
    },
    {
        id: "4",
        title: "Installation & Final Inspection",
        description:
            "Install engine back into vehicle and perform final quality checks.",
        status: "Pending",
        estimatedHours: 5
    }
];

const mockParts: Part[] = [
    { id: "1", jobId: "2025-0156", name: "Forged Pistons (.030 over)", partNumber: "Summit Racing SUM-2618-030", quantity: 8, price: 459.99, status: "Received", url: "https://test.com" },
    { id: "2", jobId: "2025-0156", name: "Connecting Rods", partNumber: "Eagle CRS6200A33D", quantity: 8, price: 389.99, status: "Received", url: "https://test.com" },
    { id: "3", jobId: "2025-0156", name: "ARP Head Studs", partNumber: "ARP 234-4316", quantity: 1, price: 189.99, status: "Ordered", url: "https://test.com" },
    { id: "4", jobId: "2025-0156", name: "Engine Gasket Set", partNumber: "Fel-Pro HS26332PT", quantity: 1, price: 129.99, status: "Received", url: "https://test.com" },
    { id: "5", jobId: "2025-0156", name: "Performance Camshaft", partNumber: "Comp Cams 12-600-4", quantity: 1, price: 279.99, status: "Needed", url: "https://test.com" }
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
    const [isLoading, setIsLoading] = useState(true);
    const [jobData, setJobData] = useState<Job>();
    const [jobSteps, setJobSteps] = useState<JobStep[]>();
    const [parts, setParts] = useState<Part[]>();
    const [notes, setNotes] = useState<Note[]>([]);

    const [customer, setCustomer] = useState<Customer>();
    const [vehicle, setVehicle] = useState<Vehicle | undefined>();

    useEffect(() => {
        // Fetch job data, steps, parts, notes from API
        setJobData(mockJobData);
        setCustomer(mockData.customers[0]);
        setVehicle(mockData.vehicles[0]);
        setJobSteps(mockJobSteps);
        setParts(mockParts);
        setNotes(mockNotes);

        setIsLoading(false);
    }, [])

    const calculateCostSummary = (): CostSummary => {
        return {
            partsAndMaterials: parts ? parts.reduce((sum, part) => sum + (part.price * part.quantity), 0) : 0,
            labor: jobSteps ? jobSteps.reduce((sum, step) => sum + (step.actualHours || 0) * 125, 0) : 0,
            hours: jobSteps ? jobSteps.reduce((sum, step) => sum + (step.actualHours || 0), 0) : 0,
        };
    };

    const handleJobUpdate = (updatedFields: Partial<Job>) => {
        setJobData(prev => prev ? { ...prev, ...updatedFields } : prev);
        // Here you would typically make an API call to update the job
        // await updateJob(jobData?.id ?? '', updatedFields);
    };

    const handleNewCustomer = (newCustomer: Customer) => {
        if (newCustomer.id === customer?.id) return;
        setCustomer(newCustomer);
        setJobData(prev => prev ? { ...prev, customerId: newCustomer.id } : prev);
        setVehicle(undefined);
    }

    const handleNewVehicle = (newVehicle: Vehicle) => {
        if (newVehicle.id === vehicle?.id) return;
        setVehicle(newVehicle);
        setJobData(prev => prev ? { ...prev, vehicleId: newVehicle.id } : prev);
    }

    if (isLoading || !jobData || !jobSteps || !parts) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex items-center pt-8 sm:pt-5 pl-5 pb-1">
                <Link
                    href="/jobs"
                    className="flex justify-center items-center h-8 w-fit px-2 rounded-lg bg-orange-400 gap-1 text-white font-sans hover:text-orange-400"
                >
                    <ArrowLeft className="size-5 hover:scale-110" /> back to all jobs
                </Link>
            </div>

            <div className='pt-4 px-6'>
                <JobDetailsCard job={jobData} onJobUpdate={handleJobUpdate} />
            </div>

            {/* Mobile: Customer and Vehicle cards at top */}
            <div className="md:hidden px-6 space-y-4">
                <CustomerInfo customer={customer} handleUpdate={handleNewCustomer} />
                <VehicleInfo vehicle={vehicle} customerId={customer?.id} handleUpdate={handleNewVehicle} />
            </div>

            <div className="flex flex-col md:flex-row ">
                {/* Main Content */}
                <div className="flex-1 p-6 sm:p-6">
                    <JobSteps jobSteps={jobSteps} setJobSteps={setJobSteps} />
                    <PartsAndMaterials parts={parts} setParts={setParts} jobId={jobData.id} />
                    <PhotoDocumentation />
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden md:block w-80 pt-6 pr-6 space-y-6">
                    <CustomerInfo customer={customer} handleUpdate={handleNewCustomer} />
                    <VehicleInfo vehicle={vehicle} customerId={customer?.id} handleUpdate={handleNewVehicle} />
                    <JobNotes Notes={notes} setNotes={setNotes} />
                    <CostSummary
                        costSummary={calculateCostSummary()}
                        jobData={jobData}
                        customer={customer!}
                        vehicle={vehicle!}
                        jobSteps={jobSteps}
                        parts={parts}
                    />
                </div>
            </div>

            {/* Mobile: Cost Summary and Notes at bottom */}
            <div className="md:hidden px-6 pb-6 space-y-4">
                <JobNotes Notes={notes} setNotes={setNotes} />
                <div className='h-5' />
                <CostSummary
                    costSummary={calculateCostSummary()}
                    jobData={jobData}
                    customer={customer!}
                    vehicle={vehicle!}
                    jobSteps={jobSteps}
                    parts={parts}
                />
            </div>
        </div>
    );
};

export default JobDetailsPage;