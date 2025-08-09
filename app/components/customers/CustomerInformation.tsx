import React from 'react';
import { User, Phone, MapPin, Edit3, Save, X, Mail } from 'lucide-react';
import helpers from '@/app/utils/helpers';

interface CustomerInformationProps {
    customerData: Customer;
    setCustomerData: React.Dispatch<React.SetStateAction<Customer | undefined>>;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    handleSave: () => void;
    handleCancel: () => void;
}

const CustomerInformation: React.FC<CustomerInformationProps> = ({
    customerData,
    setCustomerData,
    isEditing,
    setIsEditing,
    handleSave,
    handleCancel
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Edit3 className="size-4" />
                        Edit
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Save className="size-4" />
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                        >
                            <X className="size-4" />
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-5">
                {/* Name Section */}
                <div>
                    {isEditing ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center text-xs font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <input
                                    value={customerData.first_name}
                                    onChange={(e) => setCustomerData({
                                        ...customerData,
                                        first_name: e.target.value
                                    })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="flex items-center text-xs font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <input
                                    value={customerData.last_name}
                                    onChange={(e) => setCustomerData({
                                        ...customerData,
                                        last_name: e.target.value
                                    })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <label className="flex items-center text-xs font-medium text-gray-700 mb-2">
                                <User className="size-3 mr-2" />
                                Name
                            </label>
                            <p className="text-gray-900">{customerData.first_name} {customerData.last_name}</p>
                        </>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label className="flex items-center text-xs font-medium text-gray-700 mb-2">
                        <Phone className="size-3 mr-2" />
                        Phone
                    </label>
                    {isEditing ? (
                        <input
                            value={customerData.phone}
                            onChange={(e) => setCustomerData({
                                ...customerData,
                                phone: helpers.formatPhoneNumber(e.target.value)
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                    ) : (
                        <p className="text-gray-900">{customerData.phone}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="flex items-center text-xs font-medium text-gray-700 mb-2">
                        <Mail className="size-3 mr-2" />
                        Email
                    </label>
                    {isEditing ? (
                        <input
                            value={customerData.email}
                            onChange={(e) => setCustomerData({
                                ...customerData,
                                email: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                    ) : (
                        <p className="text-gray-900">{customerData.email}</p>
                    )}
                </div>

                {/* Address */}
                <div>
                    <label className="flex items-center text-xs font-medium text-gray-700 mb-2">
                        <MapPin className="size-3 mr-2" />
                        Address
                    </label>

                    {isEditing ? (
                        <div className="space-y-2">
                            <textarea
                                placeholder="Street Address"
                                value={customerData.address || ''}
                                onChange={(e) =>
                                    setCustomerData({ ...customerData, address: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                rows={2}
                            />
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={customerData.city || ''}
                                    onChange={(e) =>
                                        setCustomerData({ ...customerData, city: e.target.value })
                                    }
                                    className="border border-gray-300 rounded-lg px-3 py-2"
                                />
                                <select
                                    value={customerData.state || ''}
                                    onChange={(e) =>
                                        setCustomerData({ ...customerData, state: e.target.value })
                                    }
                                    className="border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="">Select State</option>
                                    {helpers.US_STATES.map((state) => (
                                        <option key={state.abbreviation} value={state.abbreviation}>
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="ZIP Code"
                                    value={customerData.zipcode || ''}
                                    onChange={(e) =>
                                        setCustomerData({ ...customerData, zipcode: e.target.value })
                                    }
                                    className="border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-900">
                            {customerData.address || 'No address provided'}
                            {customerData.city || customerData.state || customerData.zipcode ? (
                                <>
                                    {customerData.city ? `, ${customerData.city}` : ''}
                                    {customerData.state ? `, ${customerData.state}` : ''}
                                    {customerData.zipcode ? ` ${customerData.zipcode}` : ''}
                                </>
                            ) : null}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerInformation;