'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Phone, Mail, MapPin, Car, FileText } from 'lucide-react';

export default function AddCustomerPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });

    const [vehicles, setVehicles] = useState([
        {
            id: 1,
            year: '',
            make: '',
            model: '',
            vin: '',
            mileage: '',
            color: ''
        }
    ]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addVehicle = () => {
        const newVehicle = {
            id: vehicles.length + 1,
            year: '',
            make: '',
            model: '',
            vin: '',
            mileage: '',
            color: ''
        };
        setVehicles([...vehicles, newVehicle]);
    };

    const removeVehicle = (id) => {
        if (vehicles.length > 1) {
            setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
        }
    };

    const updateVehicle = (id, field, value) => {
        setVehicles(vehicles.map(vehicle =>
            vehicle.id === id ? { ...vehicle, [field]: value } : vehicle
        ));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Customer Data:', { ...formData, vehicles });
        // Handle form submission here
    };

    return (
        <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header - Same style as Customers page */}
                <div className="flex flex-col gap-4 p-4 rounded-lg lg:flex-row lg:items-center lg:justify-between lg:mb-8 lg:bg-white lg:p-6 lg:shadow-lg">
                    <div className="flex items-center space-x-4">
                        <Link href="/customers" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="size-6" />
                        </Link>
                        <h1 className="text-2xl p-4 min-w-0 text-center font-bold bg-white rounded-lg shadow-md text-gray-900 lg:p-0 lg:bg-none lg:rounded-none lg:shadow-none lg:text-3xl">Add New Customer</h1>
                    </div>
                    {/* Action Container */}
                    <div className="flex flex-row justify-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <Link
                            href="/customers"
                            className="px-3 py-2 text-sm font-medium shadow-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-center whitespace-nowrap lg:shadow-none"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            form="customer-form"
                            className="px-3 py-2 text-sm font-medium shadow-sm bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors text-center whitespace-nowrap lg:shadow-none"
                        >
                            Save Customer
                        </button>
                    </div>
                </div>

                <form id="customer-form" onSubmit={handleSubmit}>
                    {/* Customer Information Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                        {/* Customer Header */}
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
                        </div>

                        {/* Basic Contact Info */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="Enter customer name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Phone className="size-4 inline mr-1" />
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Mail className="size-4 inline mr-1" />
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="customer@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <MapPin className="size-4 inline mr-1" />
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="123 Main St, City, State 12345"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vehicles Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                        {/* Vehicles Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Car className="size-5 mr-2 text-gray-600" />
                                Vehicles
                            </h2>
                            <button
                                type="button"
                                onClick={addVehicle}
                                className="flex items-center px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                <Plus className="size-4 mr-1" />
                                Add Vehicle
                            </button>
                        </div>

                        {/* Vehicles List */}
                        <div className="p-6 space-y-6">
                            {vehicles.map((vehicle, index) => (
                                <div key={vehicle.id} className="border-l-4 border-orange-400 bg-orange-50 p-4 rounded">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium text-gray-900">Vehicle {index + 1}</h3>
                                        {vehicles.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeVehicle(vehicle.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Year
                                            </label>
                                            <input
                                                type="number"
                                                value={vehicle.year}
                                                onChange={(e) => updateVehicle(vehicle.id, 'year', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                placeholder="2023"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Make
                                            </label>
                                            <input
                                                type="text"
                                                value={vehicle.make}
                                                onChange={(e) => updateVehicle(vehicle.id, 'make', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                placeholder="Chevrolet"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Model
                                            </label>
                                            <input
                                                type="text"
                                                value={vehicle.model}
                                                onChange={(e) => updateVehicle(vehicle.id, 'model', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                placeholder="Camaro"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                VIN
                                            </label>
                                            <input
                                                type="text"
                                                value={vehicle.vin}
                                                onChange={(e) => updateVehicle(vehicle.id, 'vin', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                placeholder="1G1FE1R7XJ0123456"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Mileage
                                            </label>
                                            <input
                                                type="text"
                                                value={vehicle.mileage}
                                                onChange={(e) => updateVehicle(vehicle.id, 'mileage', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                placeholder="45,200"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Color
                                            </label>
                                            <input
                                                type="text"
                                                value={vehicle.color}
                                                onChange={(e) => updateVehicle(vehicle.id, 'color', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                placeholder="Summit White"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 ">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FileText className="size-5 mr-2 text-gray-600" />
                            Notes
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Public notes about the customer (visible to customer)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Internal Notes
                                </label>
                                <textarea
                                    value={formData.internalNotes}
                                    onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Internal notes about the customer (not visible to customer)"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}