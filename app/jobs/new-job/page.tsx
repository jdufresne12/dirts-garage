'use client'
import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, User, Car, Plus, X, Save, Trash } from 'lucide-react';
import helpers from '@/app/utils/helpers';
import AddVehicleModal from '@/app/components/customers/AddVehicleModal';
import AddCustomerModal from '@/app/components/customers/AddCustomerModal';
import { mockCustomers, mockVehicles } from '@/app/data/mock-data';

const emptyJobForm: Job = {
    id: `JN-${helpers.generateUniqueID()}`,
    customer_id: '',
    vehicle_id: '',
    title: '',
    description: '',
    status: 'Waiting',
    priority: "Low",
    waiting_reason: '',
    latest_update: '',
    estimated_start_date: '',
    estimated_completion: '',
    start_date: '',
    completion_date: '',
    estimated_cost: 0,
    actual_cost: 0,
};

export default function NewJob() {
    const [currentCard, setCurrentCard] = useState<'job' | 'customer-vehicle'>('job');
    const [jobForm, setJobForm] = useState<Job>(emptyJobForm);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [customersList, setCustomersList] = useState<Customer[]>([]);
    const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [showVehicleForm, setShowVehicleForm] = useState(false);

    // Error states
    const [errors, setErrors] = useState({
        title: '',
        description: ''
    });
    const [touched, setTouched] = useState({
        title: false,
        description: false
    });

    useEffect(() => {
        fetch('/api/customers')
            .then(res => res.json())
            .then(data => setCustomersList(data))
            .catch(error => console.error("Error fetching customers:", error))
    }, [])

    useEffect(() => {
        if (jobForm.customer_id) {
            fetch(`/api/vehicles/customer/${jobForm.customer_id}`)
                .then(res => res.json())
                .then(data => {
                    setVehiclesList(data)
                })
                .catch(error => console.error("Error fetching vehicles:", error))
        } else {
            setVehiclesList([]);
            setSelectedVehicle(null);
            setJobForm(prev => ({ ...prev, vehicle_id: '' }));
        }
    }, [jobForm.customer_id])

    const validateTitle = (title: string): string => {
        if (!title.trim()) {
            return 'Title is required';
        }
        if (title.trim().length > 100) {
            return 'Title must be less than 100 characters';
        }
        return '';
    };

    const validateDescription = (description: string): string => {
        if (!description.trim()) {
            return 'Description is required';
        }
        if (description.trim().length > 500) {
            return 'Description must be less than 500 characters';
        }
        return '';
    };

    // Handle input changes with validation
    const handleTitleChange = (value: string) => {
        setJobForm(prev => ({ ...prev, title: value }));

        if (touched.title) {
            setErrors(prev => ({
                ...prev,
                title: validateTitle(value)
            }));
        }
    };

    const handleDescriptionChange = (value: string) => {
        setJobForm(prev => ({ ...prev, description: value }));

        if (touched.description) {
            setErrors(prev => ({
                ...prev,
                description: validateDescription(value)
            }));
        }
    };

    // Handle field blur (when user leaves the field)
    const handleFieldBlur = (field: 'title' | 'description') => {
        setTouched(prev => ({ ...prev, [field]: true }));

        if (field === 'title') {
            setErrors(prev => ({
                ...prev,
                title: validateTitle(jobForm.title)
            }));
        } else if (field === 'description') {
            setErrors(prev => ({
                ...prev,
                description: validateDescription(jobForm.description)
            }));
        }
    };

    const handleCustomerSelection = (customer_id: string) => {
        const customer = customersList.find(c => c.id === customer_id) || null;
        setSelectedCustomer(customer);
        setJobForm(prev => ({ ...prev, customer_id, vehicle_id: '' }));
        setSelectedVehicle(null);
    };

    const handleVehicleSelection = (vehicle_id: string) => {
        const vehicle = vehiclesList.find(v => v.id === vehicle_id) || null;
        setSelectedVehicle(vehicle);
        setJobForm(prev => ({ ...prev, vehicle_id }));
    };

    const handleAddCustomer = (customerData: Customer) => {
        setCustomersList(prev => [...prev, customerData]);
        setSelectedCustomer(customerData);
        setJobForm(prev => ({ ...prev, customer_id: customerData.id }));
        setShowCustomerForm(false);
    };

    const handleAddVehicle = (vehicleData: Vehicle) => {
        setVehiclesList(prev => [...prev, vehicleData]);
        setSelectedVehicle(vehicleData);
        setJobForm(prev => ({ ...prev, vehicle_id: vehicleData.id }));
        setShowVehicleForm(false);
    };

    const handleClearCustomer = () => {
        setJobForm(prev => ({ ...prev, customer_id: '', vehicle_id: '' }));
        setSelectedCustomer(null);
        setSelectedVehicle(null);
        setVehiclesList([]);
    };

    const handleClearVehicle = () => {
        setJobForm(prev => ({ ...prev, vehicle_id: '' }));
        setSelectedVehicle(null);
    };

    const handleJobNext = () => {
        // Mark all fields as touched to show errors
        setTouched({ title: true, description: true });

        // Validate all fields
        const titleError = validateTitle(jobForm.title);
        const descriptionError = validateDescription(jobForm.description);

        setErrors({
            title: titleError,
            description: descriptionError
        });

        // Only proceed if no errors
        if (!titleError && !descriptionError) {
            setCurrentCard('customer-vehicle');
        }
    };

    const handleCreateJob = async () => {
        try {
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobForm),
            });

            if (!response.ok) {
                throw new Error('Failed to create job');
            }

            const result = await response.text();
        } catch (error) {
            console.error('Error creating job:', error);
        }
        // Redirect to job details page
        window.location.href = `/jobs/${jobForm.id}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto sm:mt-5">
                <div className='flex flex-col justify-center items-center'>
                    <h1 className="text-3xl font-bold text-orange-500 mb-8">Create New Job</h1>

                    {/* Progress indicator */}
                    <div className="flex items-center justify-center mb-8 px-2">
                        <div className={`flex flex-col items-center sm:flex-row ${currentCard === 'job' ? 'text-orange-500' : 'text-green-500'}`}>
                            <div className={`size-8 rounded-full flex items-center justify-center text-white font-medium ${currentCard === 'job' ? 'bg-orange-500' : 'bg-green-500'}`}>
                                1
                            </div>
                            <span className="ml-2 text-xs font-medium truncate pt-3 sm:text-sm sm:pt-0">Job Details</span>
                        </div>
                        <div className="w-20 h-0.5 bg-gray-300 mx-4 -mt-6 sm:mt-0"></div>
                        <div className={`flex flex-col items-center -mb-3.5 sm:flex-row sm:mb-0 ${currentCard === 'customer-vehicle' ? 'text-orange-500' : 'text-gray-400'}`}>
                            <div className={`size-8 rounded-full flex items-center justify-center text-white font-medium ${currentCard === 'customer-vehicle' ? 'bg-orange-500' : 'bg-gray-400'}`}>
                                2
                            </div>
                            <span className="ml-2 text-xs font-medium pt-3 text-center leading-tight sm:text-sm sm:pt-0 sm:text-left">
                                Customer &<br />Vehicle
                            </span>
                        </div>

                    </div>
                </div>

                {/* Card container with sliding animation */}
                <div className="flex justify-center relative overflow-hidden">
                    <div className={`mx-5 flex transition-transform duration-500 ease-in-out ${currentCard === 'customer-vehicle' ? '-translate-x-full' : 'translate-x-0'}`}>
                        {/* Job Details form */}
                        <div className="w-full flex-shrink-0 px-4 mx-4">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="space-y-6">
                                    {/* Basic Details  */}
                                    <span className="flex border-b-1 border-gray-300 text-lg font-semibold mb-4">Basic Details</span>

                                    {/* Title field with error handling */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                        <input
                                            type="text"
                                            value={jobForm.title}
                                            onChange={(e) => handleTitleChange(e.target.value)}
                                            onBlur={() => handleFieldBlur('title')}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.title && touched.title
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                                                }`}
                                            placeholder="Enter job title..."
                                        />
                                        {errors.title && touched.title && (
                                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                        )}
                                    </div>

                                    {/* Description field with error handling */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                        <textarea
                                            value={jobForm.description}
                                            onChange={(e) => handleDescriptionChange(e.target.value)}
                                            onBlur={() => handleFieldBlur('description')}
                                            rows={3}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.description && touched.description
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                                                }`}
                                            placeholder="Describe the work to be done..."
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            {errors.description && touched.description ? (
                                                <p className="text-sm text-red-600">{errors.description}</p>
                                            ) : (
                                                <div />
                                            )}
                                            <p className="text-xs text-gray-500">
                                                {jobForm.description.length}/500
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tracking */}
                                    <span className="flex border-b-1 border-gray-300 text-lg font-semibold mb-4">Tracking Info</span>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className='grid col-span-2 md:col-span-1'>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                value={jobForm.status}
                                                onChange={(e) => setJobForm(prev => ({
                                                    ...prev,
                                                    status: e.target.value,
                                                    startDate: e.target.value === 'Waiting' ? '' : prev.start_date,
                                                    completionDate: e.target.value !== 'Completed' && e.target.value !== 'Payment' ? '' : prev.completion_date,
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            >
                                                <option value="In Progress">In Progress</option>
                                                <option value="Waiting">Waiting</option>
                                                <option value="On Hold">On Hold</option>
                                                <option value="Payment">Payment</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>

                                        <div className='grid col-span-2 md:col-span-1'>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                            <select
                                                value={jobForm.priority}
                                                onChange={(e) => setJobForm(prev => ({ ...prev, priority: e.target.value as "Low" | "Medium" | "High" }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Costs */}
                                    <span className="flex border-b-1 border-gray-300 text-lg font-semibold mb-4">Costs</span>
                                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                                                <input
                                                    type="number"
                                                    value={jobForm.estimated_cost}
                                                    onChange={(e) => setJobForm(prev => ({ ...prev, estimated_cost: parseFloat(e.target.value) || 0 }))}
                                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Actual Cost</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                                                <input
                                                    type="number"
                                                    value={jobForm.actual_cost}
                                                    className="w-full pl-8 pr-3 py-2 border bg-gray-100 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dates and Deadlines */}
                                    <span className="flex border-b-1 border-gray-300 text-lg font-semibold mb-4">Dates & Deadlines</span>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Start</label>
                                            <input
                                                type="date"
                                                value={jobForm.estimated_start_date}
                                                onChange={(e) => setJobForm(prev => ({ ...prev, estimated_start: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>

                                        {jobForm?.status !== 'Waiting' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    value={jobForm.start_date}
                                                    onChange={(e) => setJobForm(prev => ({ ...prev, start_date: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Completion</label>
                                            <input
                                                type="date"
                                                value={jobForm.estimated_completion}
                                                onChange={(e) => setJobForm(prev => ({ ...prev, estimated_completion: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>

                                        {(jobForm?.status === 'Completed' || jobForm?.status === 'Payment') && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
                                                <input
                                                    type="date"
                                                    value={jobForm.completion_date}
                                                    onChange={(e) => setJobForm(prev => ({ ...prev, completion_date: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={handleJobNext}
                                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                                    >
                                        Next
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Customer/Vehicle Details */}
                        <div className="w-full flex-shrink-0 px-4">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer & Vehicle</h2>

                                {/* Customer Section */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            Customer
                                        </h3>
                                        {!selectedCustomer && (
                                            <button
                                                onClick={() => setShowCustomerForm(true)}
                                                className="flex items-center gap-1 px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add New
                                            </button>
                                        )}
                                    </div>

                                    {!selectedCustomer && (
                                        <select
                                            value={jobForm.customer_id || ''}
                                            onChange={(e) => handleCustomerSelection(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        >
                                            <option value="">Select Customer</option>
                                            {customersList.map(customer => (
                                                <option key={customer.id} value={customer.id}>
                                                    {customer.first_name} {customer.last_name} - {customer.email}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {selectedCustomer && (
                                        <div className="flex justify-between items-start mt-2 p-3 bg-blue-50 rounded-md group">
                                            <p className="text-sm text-gray-700">
                                                <strong>{selectedCustomer.first_name} {selectedCustomer.last_name}</strong><br />
                                                {selectedCustomer.email}<br />
                                                {selectedCustomer.phone}
                                            </p>
                                            <button onClick={handleClearCustomer}>
                                                <Trash className="size-5 text-red-500 hover:text-red-600 opacity-0 transition-colors hover:scale-110 group-hover:opacity-100" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Vehicle Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                            <Car className="size-5" />
                                            Vehicle
                                        </h3>
                                        {!selectedVehicle && selectedCustomer && (
                                            <button
                                                onClick={() => setShowVehicleForm(true)}
                                                className="flex items-center gap-1 px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add New
                                            </button>
                                        )}
                                    </div>

                                    {!selectedVehicle && (
                                        <select
                                            value={jobForm.vehicle_id || ''}
                                            onChange={(e) => handleVehicleSelection(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            disabled={!jobForm.customer_id}
                                        >
                                            <option value="">
                                                {!jobForm.customer_id ? 'Select customer first' : 'Select Vehicle'}
                                            </option>
                                            {vehiclesList.map(vehicle => (
                                                <option key={vehicle.id} value={vehicle.id}>
                                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {selectedVehicle && (
                                        <div className="flex justify-between items-start mt-2 p-3 bg-blue-50 rounded-md group">
                                            <p className="text-sm text-gray-700">
                                                <strong>{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</strong><br />
                                            </p>
                                            <button onClick={handleClearVehicle}>
                                                <Trash className="size-5 text-red-500 hover:text-red-600 opacity-0 transition-colors hover:scale-110 group-hover:opacity-100" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Show message when no vehicles available */}
                                    {jobForm.customer_id && vehiclesList.length === 0 && !selectedVehicle && (
                                        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">
                                            No vehicles found for this customer.
                                            <button
                                                onClick={() => setShowVehicleForm(true)}
                                                className="text-orange-500 hover:text-orange-600 ml-1"
                                            >
                                                Add one now.
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between mt-6">
                                    <button
                                        onClick={() => setCurrentCard('job')}
                                        className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-200 transition-colors"
                                    >
                                        <ArrowLeft className="size-4" />
                                        Back
                                    </button>
                                    <button
                                        onClick={handleCreateJob}
                                        className="flex items-center gap-2 px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition-colors"
                                        disabled={!jobForm.customer_id || !jobForm.vehicle_id}
                                    >
                                        <Save className="size-4" />
                                        Create Job
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AddCustomerModal
                isOpen={showCustomerForm}
                onClose={() => setShowCustomerForm(false)}
                onSubmit={handleAddCustomer}
            />

            {selectedCustomer && (
                <AddVehicleModal
                    isOpen={showVehicleForm}
                    customer_id={selectedCustomer.id}
                    onClose={() => setShowVehicleForm(false)}
                    onSubmit={handleAddVehicle}
                />
            )}
        </div>
    );
}