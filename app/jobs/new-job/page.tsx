'use client'
import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, User, Car, Plus, Save, Trash, DollarSign } from 'lucide-react';
import helpers from '@/app/utils/helpers';
import AddVehicleModal from '@/app/components/customers/AddVehicleModal';
import AddCustomerModal from '@/app/components/customers/AddCustomerModal';

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
    const [currentStep, setCurrentStep] = useState<'job' | 'customer-vehicle'>('job');
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

    // useEffect(() => {
    //     console.log(jobForm)
    // }, [jobForm])

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
            setCurrentStep('customer-vehicle');
        }
    };

    const handleCreateJob = async () => {
        try {
            const jobData = {
                ...jobForm,
                estimated_cost: jobForm.estimated_cost || 0,
                actual_cost: jobForm.actual_cost || 0
            };

            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData),
            });

            if (!response.ok) {
                throw new Error('Failed to create job');
            }
        } catch (error) {
            console.error('Error creating job:', error);
        }
        window.location.href = `/jobs/${jobForm.id}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Create New Job</h1>
                    <p className="text-sm md:text-base text-gray-600">Set up job details, then assign customer and vehicle</p>
                </div>

                {/* Enhanced Progress Indicator */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-colors ${currentStep === 'job' ? 'bg-orange-500' : 'bg-green-500'
                                }`}>
                                1
                            </div>
                            <span className={`mt-2 text-xs md:text-sm font-medium ${currentStep === 'job' ? 'text-orange-600' : 'text-green-600'
                                }`}>
                                Job Details
                            </span>
                        </div>

                        {/* Connector */}
                        <div className="w-16 md:w-24 h-1 mx-4 rounded-full bg-gray-200">
                            <div className={`h-full rounded-full transition-all duration-300 ${currentStep === 'customer-vehicle' ? 'bg-orange-500 w-full' : 'bg-gray-200 w-0'
                                }`}></div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-colors ${currentStep === 'customer-vehicle' ? 'bg-orange-500' : 'bg-gray-400'
                                }`}>
                                2
                            </div>
                            <span className={`mt-2 text-xs md:text-sm font-medium text-center ${currentStep === 'customer-vehicle' ? 'text-orange-600' : 'text-gray-500'
                                }`}>
                                Customer &<br />Vehicle
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form Container */}
                <div className="relative">
                    {/* Job Details Form */}
                    {currentStep === 'job' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 animate-in slide-in-from-left-4 duration-300">
                            <div className="space-y-8">
                                {/* Basic Details Section */}
                                <div>
                                    <div className="flex items-center mb-6">
                                        <div className="w-1 h-6 bg-orange-500 rounded-full mr-3"></div>
                                        <h2 className="text-xl font-semibold text-gray-900">Basic Details</h2>
                                    </div>

                                    <div className="grid gap-6">
                                        {/* Title field with error handling */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                                            <input
                                                type="text"
                                                value={jobForm.title}
                                                onChange={(e) => handleTitleChange(e.target.value)}
                                                onBlur={() => handleFieldBlur('title')}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.title && touched.title
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                                                    : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                                                    }`}
                                                placeholder="Enter a descriptive job title..."
                                            />
                                            {errors.title && touched.title && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                                    {errors.title}
                                                </p>
                                            )}
                                        </div>

                                        {/* Description field with error handling */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                            <textarea
                                                value={jobForm.description}
                                                onChange={(e) => handleDescriptionChange(e.target.value)}
                                                onBlur={() => handleFieldBlur('description')}
                                                rows={4}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${errors.description && touched.description
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                                                    : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                                                    }`}
                                                placeholder="Describe the work to be done in detail..."
                                            />
                                            <div className="flex justify-between items-center mt-2">
                                                {errors.description && touched.description ? (
                                                    <p className="text-sm text-red-600 flex items-center">
                                                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                                        {errors.description}
                                                    </p>
                                                ) : (
                                                    <div />
                                                )}
                                                <p className={`text-xs ${jobForm.description.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {jobForm.description.length}/500
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tracking Info Section */}
                                <div>
                                    <div className="flex items-center mb-6">
                                        <div className="w-1 h-6 bg-orange-500 rounded-full mr-3"></div>
                                        <h2 className="text-xl font-semibold text-gray-900">Tracking Info</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                            <select
                                                value={jobForm.status}
                                                onChange={(e) => setJobForm(prev => ({
                                                    ...prev,
                                                    status: e.target.value,
                                                    startDate: e.target.value === 'Waiting' ? '' : prev.start_date,
                                                    completionDate: e.target.value !== 'Completed' && e.target.value !== 'Payment' ? '' : prev.completion_date,
                                                }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            >
                                                <option value="In Progress">In Progress</option>
                                                <option value="Waiting">Waiting</option>
                                                <option value="On Hold">On Hold</option>
                                                <option value="Payment">Payment</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                            <select
                                                value={jobForm.priority}
                                                onChange={(e) => setJobForm(prev => ({ ...prev, priority: e.target.value as "Low" | "Medium" | "High" }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Costs Section */}
                                <div>
                                    <div className="flex items-center mb-6">
                                        <div className="w-1 h-6 bg-orange-500 rounded-full mr-3"></div>
                                        <h2 className="text-xl font-semibold text-gray-900">Costs</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="number"
                                                    value={jobForm.estimated_cost || ''}
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value);
                                                        setJobForm(prev => ({
                                                            ...prev,
                                                            estimated_cost: isNaN(value) ? 0 : parseFloat(value.toFixed(2))
                                                        }));
                                                    }}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Actual Cost</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="number"
                                                    value={jobForm.actual_cost}
                                                    className="w-full pl-10 pr-4 py-3 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none cursor-not-allowed"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                    disabled
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">Will be calculated during job progress</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Dates Section */}
                                <div>
                                    <div className="flex items-center mb-6">
                                        <div className="w-1 h-6 bg-orange-500 rounded-full mr-3"></div>
                                        <h2 className="text-xl font-semibold text-gray-900">Dates & Deadlines</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Start</label>
                                            <input
                                                type="date"
                                                value={jobForm.estimated_start_date}
                                                onChange={(e) => setJobForm(prev => ({ ...prev, estimated_start_date: e.target.value }))}
                                                placeholder='mm/dd/yyyy'
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>

                                        {jobForm?.status !== 'Waiting' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Actual Start Date</label>
                                                <input
                                                    type="date"
                                                    value={jobForm.start_date}
                                                    onChange={(e) => setJobForm(prev => ({ ...prev, start_date: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Completion</label>
                                            <input
                                                type="date"
                                                value={jobForm.estimated_completion}
                                                onChange={(e) => setJobForm(prev => ({ ...prev, estimated_completion: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>

                                        {(jobForm?.status === 'Completed' || jobForm?.status === 'Payment') && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Completion Date</label>
                                                <input
                                                    type="date"
                                                    value={jobForm.completion_date}
                                                    onChange={(e) => setJobForm(prev => ({ ...prev, completion_date: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Next Button */}
                            <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={handleJobNext}
                                    className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                                >
                                    Continue to Customer & Vehicle
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Customer/Vehicle Details Form */}
                    {currentStep === 'customer-vehicle' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-8">
                                {/* Customer Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center">
                                            <div className="w-1 h-6 bg-orange-500 rounded-full mr-3"></div>
                                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                                <User className="w-6 h-6 text-orange-500" />
                                                Customer
                                            </h2>
                                        </div>
                                        {!selectedCustomer && (
                                            <button
                                                onClick={() => setShowCustomerForm(true)}
                                                className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                                            >
                                                <Plus className="w-4 h-4" />
                                                New Customer
                                            </button>
                                        )}
                                    </div>

                                    {!selectedCustomer && (
                                        <select
                                            value={jobForm.customer_id || ''}
                                            onChange={(e) => handleCustomerSelection(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        >
                                            <option value="">Select a customer...</option>
                                            {customersList.map(customer => (
                                                <option key={customer.id} value={customer.id}>
                                                    {customer.first_name} {customer.last_name} - {customer.email}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {selectedCustomer && (
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-1">
                                                        {selectedCustomer.first_name} {selectedCustomer.last_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-1">{selectedCustomer.email}</p>
                                                    <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                                                </div>
                                                <button
                                                    onClick={handleClearCustomer}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Vehicle Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center">
                                            <div className="w-1 h-6 bg-orange-500 rounded-full mr-3"></div>
                                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                                <Car className="w-6 h-6 text-orange-500" />
                                                Vehicle
                                            </h2>
                                        </div>
                                        {!selectedVehicle && selectedCustomer && (
                                            <button
                                                onClick={() => setShowVehicleForm(true)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                                            >
                                                <Plus className="w-4 h-4" />
                                                New Vehicle
                                            </button>
                                        )}
                                    </div>

                                    {!selectedVehicle && (
                                        <select
                                            value={jobForm.vehicle_id || ''}
                                            onChange={(e) => handleVehicleSelection(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            disabled={!jobForm.customer_id}
                                        >
                                            <option value="">
                                                {!jobForm.customer_id ? 'Select customer first' : 'Select a vehicle...'}
                                            </option>
                                            {vehiclesList.map(vehicle => (
                                                <option key={vehicle.id} value={vehicle.id}>
                                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {selectedVehicle && (
                                        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-1">
                                                        {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">Selected for this job</p>
                                                </div>
                                                <button
                                                    onClick={handleClearVehicle}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Show message when no vehicles available */}
                                    {jobForm.customer_id && vehiclesList.length === 0 && !selectedVehicle && (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                            <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600 mb-3">No vehicles found for this customer</p>
                                            <button
                                                onClick={() => setShowVehicleForm(true)}
                                                className="text-orange-500 hover:text-orange-600 font-medium"
                                            >
                                                Add the first vehicle now →
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Job Summary */}
                                {selectedCustomer && selectedVehicle && (
                                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Save className="w-5 h-5 text-orange-600" />
                                            Ready to Create Job
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Job:</span>
                                                <p className="text-gray-900">{jobForm.title}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Status:</span>
                                                <p className="text-gray-900">{jobForm.status}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Customer:</span>
                                                <p className="text-gray-900">{selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Vehicle:</span>
                                                <p className="text-gray-900">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setCurrentStep('job')}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                                >
                                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">Back to Job Details</span>
                                    <span className="sm:hidden">Back to Job Details</span>
                                </button>

                                <button
                                    onClick={handleCreateJob}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                    disabled={!jobForm.customer_id || !jobForm.vehicle_id}
                                >
                                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Create Job
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
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