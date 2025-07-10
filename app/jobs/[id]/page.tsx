'use client'
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import VehicleDetails from '@/app/components/jobs/VehicleDetails';
import CustomerInfo from '@/app/components/jobs/CustomerInfoCard';
import CostSummary from '@/app/components/jobs/CostSummary';
import JobNotes from '@/app/components/jobs/JobNotes';
import JobSteps from '@/app/components/jobs/JobSteps';
import PartsAndMaterials from '@/app/components/jobs/PartsAndMaterials';
import PhotoDocumentation from '@/app/components/jobs/PhotoDocumentation';
import Link from 'next/link';

// Main Component
const JobDetailsPage = () => {
    const [jobData, setJobData] = useState({
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
    });

    const jobSteps: JobStep[] = [
        {
            id: "1",
            title: "Initial Inspection & Teardown",
            description: "Engine removed from vehicle. Initial inspection completed. Block and heads sent for cleaning and inspection.",
            status: "completed",
            completedDate: "June 21, 2025 2:30 PM"
        },
        {
            id: "2",
            title: "Machine Shop Work",
            description: "Block bored .030 over, decked, and honed. Heads reconditioned with new valves and guides.",
            status: "completed",
            completedDate: "June 23, 2025 4:00 PM"
        },
        {
            id: "3",
            title: "Engine Assembly",
            description: "Currently installing pistons and connecting rods. Waiting for torque plates to arrive for final assembly.",
            status: "in-progress",
            startDate: "June 24, 2025 8:00 AM"
        },
        {
            id: "4",
            title: "Installation & Final Inspection",
            description: "Install engine back into vehicle and perform final quality checks.",
            status: "pending",
        }
    ];

    const partsAndMaterials: Part[] = [
        { id: "1", jobId: jobData.id, name: "Forged Pistons (.030 over)", partNumber: "Summit Racing SUM-2618-030", quantity: 8, price: 459.99, status: "received" },
        { id: "1", jobId: jobData.id, name: "Connecting Rods", partNumber: "Eagle CRS6200A33D", quantity: 8, price: 389.99, status: "received" },
        { id: "1", jobId: jobData.id, name: "ARP Head Studs", partNumber: "ARP 234-4316", quantity: 1, price: 189.99, status: "ordered" },
        { id: "1", jobId: jobData.id, name: "Engine Gasket Set", partNumber: "Fel-Pro HS26332PT", quantity: 1, price: 129.99, status: "received" },
        { id: "1", jobId: jobData.id, name: "Performance Camshaft", partNumber: "Comp Cams 12-600-4", quantity: 1, price: 279.99, status: "needed" }
    ];

    const timeTracking = [
        { task: "Engine Teardown", technician: "John Doe", date: "June 21, 2025 8:00 AM - 12:00 PM", hours: 4.0 },
        { task: "Block Preparation", technician: "Mike Smith", date: "June 22, 2025 9:00 AM - 11:30 AM", hours: 2.5 },
        { task: "Assembly Work", technician: "Mike Smith", date: "June 24, 2025 8:00 AM - 5:00 PM (In Progress)", hours: 9.0 }
    ];

    const Notes: Note[] = [
        {
            id: "1",
            timestamp: "June 21, 2:30 PM",
            note: "Customer wants upgraded internals for future power goals. Discussed forged pistons and rods - approved upgrade."
        },
        {
            id: "2",
            timestamp: "June 22, 10:15 AM",
            note: "Called customer about ARP stud delay. He's okay with 2-day delay for quality parts."
        },
        {
            id: "3",
            timestamp: "June 24, 9:00 AM",
            note: "Customer sent text: \"Looking forward to getting the car back! Thanks for the updates.\""
        }
    ];

    const costSummary: CostSummary = {
        partsAndMaterials: 1449.95,
        labor: 1937.50,
        hours: 15.5,
        total: 4282.98
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
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{jobData.title}</h1>
                        <span className="text-sm text-gray-500">Job #{jobData.id}</span>
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
                    <JobSteps steps={jobSteps} />
                    <PartsAndMaterials partsAndMaterials={partsAndMaterials} />
                    {/* <TimeTracking timeTracking={timeTracking} /> */}
                    <PhotoDocumentation />
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden md:block w-80 pt-6 pr-2 space-y-6">
                    <CustomerInfo customer={jobData.customer} />
                    <VehicleDetails vehicle={jobData.vehicle} />
                    <CostSummary costSummary={costSummary} />
                    <JobNotes Notes={Notes} />
                </div>
            </div>

            {/* Mobile: Cost Summary and Notes at bottom */}
            <div className="md:hidden p-4 space-y-4">
                <CostSummary costSummary={costSummary} />
                <JobNotes Notes={Notes} />
            </div>
        </div>
    );
};

export default JobDetailsPage;