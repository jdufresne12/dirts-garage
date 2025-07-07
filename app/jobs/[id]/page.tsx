'use client'
import React, { useState } from 'react';
import {
    ArrowLeft,
    Edit,
    Plus,
    CheckCircle,
    Clock,
    AlertTriangle,
    Calendar,
    User,
    Car,
    Wrench,
    DollarSign,
    FileText,
    Camera,
    Phone,
    Mail,
    MapPin,
    X,
    Save
} from 'lucide-react';

const JobDetailsPage = () => {
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showAddProgressModal, setShowAddProgressModal] = useState(false);
    const [newNote, setNewNote] = useState('');

    // Mock data for existing job (empty for new job)
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

    const workProgress = [
        {
            id: 1,
            title: "Initial Inspection & Teardown",
            description: "Engine removed from vehicle. Initial inspection completed. Block and heads sent for cleaning and inspection.",
            status: "completed",
            completedBy: "John Doe",
            completedDate: "June 21, 2025 2:30 PM"
        },
        {
            id: 2,
            title: "Machine Shop Work",
            description: "Block bored .030 over, decked, and honed. Heads reconditioned with new valves and guides.",
            status: "completed",
            completedBy: "Machine Shop",
            completedDate: "June 23, 2025 4:00 PM"
        },
        {
            id: 3,
            title: "Engine Assembly",
            description: "Currently installing pistons and connecting rods. Waiting for torque plates to arrive for final assembly.",
            status: "in-progress",
            startedBy: "Mike Smith",
            startedDate: "June 24, 2025 8:00 AM"
        },
        {
            id: 4,
            title: "Break-in & Testing",
            description: "Engine break-in procedure and dyno testing scheduled.",
            status: "scheduled",
            scheduledDate: "July 2, 2025"
        },
        {
            id: 5,
            title: "Installation & Final Inspection",
            description: "Install engine back into vehicle and perform final quality checks.",
            status: "pending",
            scheduledDate: "July 4, 2025"
        }
    ];

    const partsAndMaterials = [
        { name: "Forged Pistons (.030 over)", partNumber: "Summit Racing SUM-2618-030", qty: 8, price: 459.99, status: "received" },
        { name: "Connecting Rods", partNumber: "Eagle CRS6200A33D", qty: 8, price: 389.99, status: "received" },
        { name: "ARP Head Studs", partNumber: "ARP 234-4316", qty: "1 Kit", price: 189.99, status: "ordered" },
        { name: "Engine Gasket Set", partNumber: "Fel-Pro HS26332PT", qty: 1, price: 129.99, status: "received" },
        { name: "Performance Camshaft", partNumber: "Comp Cams 12-600-4", qty: 1, price: 279.99, status: "needed" }
    ];

    const timeTracking = [
        { task: "Engine Teardown", technician: "John Doe", date: "June 21, 2025 8:00 AM - 12:00 PM", hours: 4.0 },
        { task: "Block Preparation", technician: "Mike Smith", date: "June 22, 2025 9:00 AM - 11:30 AM", hours: 2.5 },
        { task: "Assembly Work", technician: "Mike Smith", date: "June 24, 2025 8:00 AM - 5:00 PM (In Progress)", hours: 9.0 }
    ];

    const communications = [
        {
            id: 1,
            author: "John Doe",
            time: "June 21, 2:30 PM",
            message: "Customer wants upgraded internals for future power goals. Discussed forged pistons and rods - approved upgrade."
        },
        {
            id: 2,
            author: "Mike Smith",
            time: "June 22, 10:15 AM",
            message: "Called customer about ARP stud delay. He's okay with 2-day delay for quality parts."
        },
        {
            id: 3,
            author: "System",
            time: "June 24, 9:00 AM",
            message: "Customer sent text: \"Looking forward to getting the car back! Thanks for the updates.\""
        }
    ];

    const costSummary = {
        partsAndMaterials: 1449.95,
        labor: 1937.50,
        machineShop: 485.00,
        shopSupplies: 75.00,
        subtotal: 3947.45,
        tax: 335.53,
        total: 4282.98
    };

    const getStatusIcon = (status: any) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'in-progress':
                return <Clock className="w-5 h-5 text-orange-600" />;
            case 'scheduled':
                return <Calendar className="w-5 h-5 text-blue-600" />;
            case 'pending':
                return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
            default:
                return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
        }
    };

    const getStatusColor = (status: any) => {
        switch (status) {
            case 'completed':
                return 'border-green-400';
            case 'in-progress':
                return 'border-orange-400';
            case 'scheduled':
                return 'border-blue-400';
            default:
                return 'border-gray-300';
        }
    };

    const getPartStatusBadge = (status: any) => {
        const baseClasses = "px-2 py-1 rounded text-xs font-medium";
        switch (status) {
            case 'received':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'ordered':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'needed':
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const CustomerModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Select or Add Customer</h3>
                    <button onClick={() => setShowCustomerModal(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-4">
                    <input
                        placeholder="Search customers..."
                        className="w-full border rounded px-3 py-2 mb-4"
                    />

                    <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                        {[
                            { name: "Mike Johnson", phone: "(555) 123-4567" },
                            { name: "Sarah Davis", phone: "(555) 987-6543" },
                            { name: "Tom Wilson", phone: "(555) 456-7890" }
                        ].map((customer, index) => (
                            <div key={index} className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-sm text-gray-600">{customer.phone}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Add New Customer</h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="First Name" className="border rounded px-3 py-2" />
                            <input placeholder="Last Name" className="border rounded px-3 py-2" />
                        </div>
                        <input placeholder="Phone Number" className="w-full border rounded px-3 py-2" />
                        <input placeholder="Email" className="w-full border rounded px-3 py-2" />
                        <textarea placeholder="Address" className="w-full border rounded px-3 py-2" rows={2} />
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button className="flex-1 bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
                        Save Customer
                    </button>
                    <button
                        onClick={() => setShowCustomerModal(false)}
                        className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );

    const VehicleModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Add Vehicle</h3>
                    <button onClick={() => setShowVehicleModal(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Year" className="border rounded px-3 py-2" />
                        <input placeholder="Make" className="border rounded px-3 py-2" />
                    </div>
                    <input placeholder="Model" className="w-full border rounded px-3 py-2" />
                    <input placeholder="VIN" className="w-full border rounded px-3 py-2" />
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Mileage" className="border rounded px-3 py-2" />
                        <input placeholder="Color" className="border rounded px-3 py-2" />
                    </div>
                    <input placeholder="Engine" className="w-full border rounded px-3 py-2" />
                    <input placeholder="Transmission" className="w-full border rounded px-3 py-2" />
                </div>

                <div className="flex gap-3 pt-4">
                    <button className="flex-1 bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
                        Add Vehicle
                    </button>
                    <button
                        onClick={() => setShowVehicleModal(false)}
                        className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );

    const AddProgressModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Add Work Progress Update</h3>
                    <button onClick={() => setShowAddProgressModal(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <input placeholder="Step Title" className="w-full border rounded px-3 py-2" />
                    <textarea placeholder="Description of work completed or in progress..." className="w-full border rounded px-3 py-2" rows={3} />
                    <select className="w-full border rounded px-3 py-2">
                        <option>Select Status</option>
                        <option value="completed">Completed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="pending">Pending</option>
                    </select>
                    <input type="datetime-local" className="w-full border rounded px-3 py-2" />
                </div>

                <div className="flex gap-3 pt-4">
                    <button className="flex-1 bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
                        Add Update
                    </button>
                    <button
                        onClick={() => setShowAddProgressModal(false)}
                        className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button className="flex items-center text-gray-600 hover:text-gray-800">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span className="text-sm">Dashboard / Jobs / </span>
                        </button>
                        <span className="text-sm text-gray-500">Job #{jobData.id}</span>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{jobData.title}</h1>
                        <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                            <span><strong>Customer:</strong> {jobData.customer.name}</span>
                            <span><strong>Vehicle:</strong> {jobData.vehicle.year} {jobData.vehicle.make} {jobData.vehicle.model}</span>
                            <span><strong>Started:</strong> {jobData.startDate}</span>
                            <span><strong>Estimated Completion:</strong> {jobData.estimatedCompletion}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                            {jobData.status}
                        </span>
                    </div>
                </div>

                <div className="mt-4 flex space-x-3">
                    <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                        Update Progress
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Contact Customer
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"> Print Work Order
                    </button>
                </div>
            </div>

            <div className="flex">
                {/* Main Content */}
                <div className="flex-1 p-6">
                    {/* Work Progress */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Work Progress</h2>
                            <button
                                onClick={() => setShowAddProgressModal(true)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Add Update
                            </button>
                        </div>

                        <div className="space-y-6">
                            {workProgress.map((step, index) => (
                                <div key={step.id} className={`border-l-4 ${getStatusColor(step.status)} pl-6 relative`}>
                                    <div className="absolute -left-2.5 top-0">
                                        {getStatusIcon(step.status)}
                                    </div>
                                    <div className="pb-4">
                                        <h3 className="font-semibold text-gray-900">{step.title}</h3>
                                        <p className="text-gray-600 mt-1">{step.description}</p>
                                        <div className="text-sm text-gray-500 mt-2">
                                            {step.status === 'completed' && (
                                                <span>Completed by {step.completedBy} • {step.completedDate}</span>
                                            )}
                                            {step.status === 'in-progress' && (
                                                <span>Started by {step.startedBy} • {step.startedDate}</span>
                                            )}
                                            {step.status === 'scheduled' && (
                                                <span>Scheduled for {step.scheduledDate}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Parts & Materials */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Parts & Materials</h2>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Add Part
                            </button>
                        </div>

                        <div className="space-y-4">
                            {partsAndMaterials.map((part, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{part.name}</h4>
                                        <p className="text-sm text-gray-600">{part.partNumber} • Qty: {part.qty} • ${part.price}</p>
                                    </div>
                                    <span className={getPartStatusBadge(part.status)}>
                                        {part.status.charAt(0).toUpperCase() + part.status.slice(1)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Time Tracking */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Time Tracking</h2>
                            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                                Clock In
                            </button>
                        </div>

                        <div className="space-y-4">
                            {timeTracking.map((entry, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{entry.task}</h4>
                                        <p className="text-sm text-gray-600">{entry.technician} • {entry.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-semibold">{entry.hours} hrs</span>
                                    </div>
                                </div>
                            ))}
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Total Labor Hours:</span>
                                    <span className="text-lg font-bold">15.5 hrs</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Photo Documentation */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Photo Documentation</h2>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Upload Photos
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3].map((photo) => (
                                <div key={photo} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Camera className="w-8 h-8 text-gray-400" />
                                </div>
                            ))}
                            <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400">
                                <div className="text-center">
                                    <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <span className="text-sm text-gray-500">Add Photo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-80 p-6 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Customer Info</h3>
                            <button className="text-gray-400 hover:text-gray-600">
                                <Edit className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">{jobData.customer.name}</h4>
                            <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-4 h-4 mr-2" />
                                {jobData.customer.phone}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Mail className="w-4 h-4 mr-2" />
                                {jobData.customer.email}
                            </div>
                            <div className="flex items-start text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                                {jobData.customer.address}
                            </div>

                            {jobData.customer.isVIP && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                                    <span className="text-xs font-medium text-yellow-800">⭐ VIP Customer</span>
                                    <p className="text-xs text-yellow-700">Customer since 2019 • ${jobData.customer.totalSpent.toLocaleString()} total spent</p>
                                </div>
                            )}

                            <div className="text-xs text-gray-500">
                                <p>Communication Preferences</p>
                                <p>📱 Text updates preferred</p>
                                <p>🕘 Available weekdays 9 AM - 6 PM</p>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Vehicle Details</h3>
                            <button className="text-gray-400 hover:text-gray-600">
                                <Edit className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">
                                {jobData.vehicle.year} {jobData.vehicle.make} {jobData.vehicle.model}
                            </h4>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>VIN:</strong> {jobData.vehicle.vin}</p>
                                <p><strong>Mileage:</strong> {jobData.vehicle.mileage}</p>
                                <p><strong>Color:</strong> {jobData.vehicle.color}</p>
                                <p><strong>Engine:</strong> {jobData.vehicle.engine}</p>
                                <p><strong>Transmission:</strong> {jobData.vehicle.transmission}</p>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded p-3">
                                <h5 className="text-sm font-medium text-gray-900 mb-2">Previous Work</h5>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li>• Cold Air Intake (March 2024)</li>
                                    <li>• Performance Exhaust (June 2023)</li>
                                    <li>• Brake Upgrade (April 2022)</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Cost Summary */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Cost Summary</h3>
                            <button className="text-gray-400 hover:text-gray-600">
                                Update
                            </button>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Parts & Materials:</span>
                                <span>${costSummary.partsAndMaterials.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Labor (15.5 hrs @ $125/hr):</span>
                                <span>${costSummary.labor.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Machine Shop:</span>
                                <span>${costSummary.machineShop.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shop Supplies:</span>
                                <span>${costSummary.shopSupplies.toLocaleString()}</span>
                            </div>
                            <hr className="my-2" />
                            <div className="flex justify-between font-medium">
                                <span>Subtotal:</span>
                                <span>${costSummary.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (8.5%):</span>
                                <span>${costSummary.tax.toLocaleString()}</span>
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

                    {/* Notes & Communications */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="font-semibold mb-4">Notes & Communications</h3>

                        <div className="space-y-4 max-h-60 overflow-y-auto">
                            {communications.map((comm) => (
                                <div key={comm.id} className="border-l-4 border-orange-400 pl-3">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-sm">{comm.author}</h4>
                                        <span className="text-xs text-gray-500">{comm.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{comm.message}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a new note or communication..."
                                className="w-full border border-gray-300 rounded p-2 text-sm"
                                rows={3}
                            />
                            <button className="w-full mt-2 bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
                                Add Note
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showCustomerModal && <CustomerModal />}
            {showVehicleModal && <VehicleModal />}
            {showAddProgressModal && <AddProgressModal />}
        </div>
    );
};

export default JobDetailsPage;