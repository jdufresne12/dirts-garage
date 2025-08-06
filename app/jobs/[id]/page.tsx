'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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


// Main Component
const JobDetailsPage = () => {
    const { id } = useParams();

    const [isLoading, setIsLoading] = useState(true);
    const [jobData, setJobData] = useState<Job>();
    const [jobSteps, setJobSteps] = useState<JobStep[]>();
    const [parts, setParts] = useState<Part[]>();
    const [notes, setNotes] = useState<Note[]>([]);

    const [customer, setCustomer] = useState<Customer>();
    const [vehicle, setVehicle] = useState<Vehicle | undefined>();

    useEffect(() => {
        try {
            fetch(`/api/jobs/${id}`)
                .then(res => res.json())
                .then(data => {
                    setJobData(data)
                    setCustomer(data.customer)
                    setVehicle(data.vehicle || undefined)
                })
                .catch(error => console.error("Failed gather job data:", error))
        } catch (error) {
            console.error("failed gathering job data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [])

    const calculateCostSummary = (): CostSummary => {
        return {
            partsAndMaterials: parts ? parts.reduce((sum, part) => sum + (part.price * part.quantity), 0) : 0,
            labor: jobSteps ? jobSteps.reduce((sum, step) => sum + (step.actual_hours || 0) * 125, 0) : 0,
            hours: jobSteps ? jobSteps.reduce((sum, step) => sum + (step.actual_hours || 0), 0) : 0,
        };
    };

    const handleJobUpdate = async (updatedFields: Partial<Job>) => {
        setJobData(prev => prev ? { ...prev, ...updatedFields } : prev);

        if (jobData?.id) {
            try {
                const response = await fetch(`/api/jobs/${jobData.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedFields)
                });

                if (!response.ok) {
                    throw new Error('Failed to update job');
                }

                const updatedJob = await response.json();
            } catch (error) {
                console.error("Job detail update failed: ", error);
            }
        }
    };

    const handleNewCustomer = async (newCustomer: Customer) => {
        if (newCustomer.id === customer?.id) return;
        setCustomer(newCustomer);
        setVehicle(undefined);

        // Update job data locally
        setJobData(prev => prev ? {
            ...prev,
            customer_id: newCustomer.id,
            vehicle_id: null
        } : prev);

        try {
            await handleJobUpdate({
                customer_id: newCustomer.id,
                vehicle_id: null // Clear vehicle_id in database
            });
        } catch (error) {
            console.error('Failed to update customer:', error);
        }
    };

    const handleNewVehicle = async (newVehicle: Vehicle) => {
        if (newVehicle.id === vehicle?.id) return;

        setVehicle(newVehicle);
        setJobData(prev => prev ? {
            ...prev,
            vehicleId: newVehicle.id,
            vehicle_id: newVehicle.id
        } : prev);

        // Update job in database
        try {
            await handleJobUpdate({ vehicle_id: newVehicle.id });
        } catch (error) {
            console.error('Failed to update vehicle:', error);
        }
    };

    if (isLoading || !jobData) {
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

            {/* Mobile */}
            <div className="md:hidden px-6 space-y-4">
                <CustomerInfo customer={customer} handleUpdate={handleNewCustomer} />
                <VehicleInfo vehicle={vehicle} customer_id={customer?.id} handleUpdate={handleNewVehicle} />
            </div>

            <div className="flex flex-col md:flex-row ">
                {/* Main Content */}
                <div className="flex-1 p-6 sm:p-6">
                    <JobSteps job_id={jobData.id} jobSteps={jobSteps || []} setJobSteps={setJobSteps} />
                    <PartsAndMaterials job_id={jobData.id} parts={parts || []} setParts={setParts} />
                    <PhotoDocumentation job_id={jobData.id} />
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden md:block w-80 pt-6 pr-6 space-y-6">
                    <CustomerInfo customer={customer} handleUpdate={handleNewCustomer} />
                    <VehicleInfo vehicle={vehicle} customer_id={customer?.id} handleUpdate={handleNewVehicle} />
                    <JobNotes job_id={jobData.id} Notes={notes} setNotes={setNotes} />
                    <CostSummary
                        costSummary={calculateCostSummary()}
                        jobData={jobData}
                        customer={customer!}
                        vehicle={vehicle!}
                        jobSteps={jobSteps || []}
                        parts={parts || []}
                    />
                </div>
            </div>

            {/* Mobile */}
            <div className="md:hidden px-6 pb-6 space-y-4">
                <JobNotes job_id={jobData.id} Notes={notes} setNotes={setNotes} />
                <div className='h-5' />
                <CostSummary
                    costSummary={calculateCostSummary()}
                    jobData={jobData}
                    customer={customer!}
                    vehicle={vehicle!}
                    jobSteps={jobSteps || []}
                    parts={parts || []}
                />
            </div>
        </div>
    );
};

export default JobDetailsPage;