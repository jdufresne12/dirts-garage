export const generateUniqueID = (): string => {
    return "Cust00001"
}

export const checkNoActiveJobs = (customer: Customer) => {
    return customer.status.type === "none" || customer.status.type === "Completed" || customer.status.type === "Waiting" ? true : false;
}

export const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    let digits = value.replace(/\D/g, '');

    digits = digits.slice(0, 10);

    // Apply formatting
    const match = digits.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

    if (!match) return value;

    const [, area, middle, last] = match;
    if (digits.length === 0) return ``;
    if (digits.length <= 3) return `(${area}`;
    if (digits.length <= 6) return `(${area}) ${middle}`;
    return `(${area}) ${middle}-${last}`;
};

export const US_STATES = [
    { name: 'Alabama', abbreviation: 'AL' },
    { name: 'Alaska', abbreviation: 'AK' },
    { name: 'Arizona', abbreviation: 'AZ' },
    { name: 'Arkansas', abbreviation: 'AR' },
    { name: 'California', abbreviation: 'CA' },
    { name: 'Colorado', abbreviation: 'CO' },
    { name: 'Connecticut', abbreviation: 'CT' },
    { name: 'Delaware', abbreviation: 'DE' },
    { name: 'Florida', abbreviation: 'FL' },
    { name: 'Georgia', abbreviation: 'GA' },
    { name: 'Hawaii', abbreviation: 'HI' },
    { name: 'Idaho', abbreviation: 'ID' },
    { name: 'Illinois', abbreviation: 'IL' },
    { name: 'Indiana', abbreviation: 'IN' },
    { name: 'Iowa', abbreviation: 'IA' },
    { name: 'Kansas', abbreviation: 'KS' },
    { name: 'Kentucky', abbreviation: 'KY' },
    { name: 'Louisiana', abbreviation: 'LA' },
    { name: 'Maine', abbreviation: 'ME' },
    { name: 'Maryland', abbreviation: 'MD' },
    { name: 'Massachusetts', abbreviation: 'MA' },
    { name: 'Michigan', abbreviation: 'MI' },
    { name: 'Minnesota', abbreviation: 'MN' },
    { name: 'Mississippi', abbreviation: 'MS' },
    { name: 'Missouri', abbreviation: 'MO' },
    { name: 'Montana', abbreviation: 'MT' },
    { name: 'Nebraska', abbreviation: 'NE' },
    { name: 'Nevada', abbreviation: 'NV' },
    { name: 'New Hampshire', abbreviation: 'NH' },
    { name: 'New Jersey', abbreviation: 'NJ' },
    { name: 'New Mexico', abbreviation: 'NM' },
    { name: 'New York', abbreviation: 'NY' },
    { name: 'North Carolina', abbreviation: 'NC' },
    { name: 'North Dakota', abbreviation: 'ND' },
    { name: 'Ohio', abbreviation: 'OH' },
    { name: 'Oklahoma', abbreviation: 'OK' },
    { name: 'Oregon', abbreviation: 'OR' },
    { name: 'Pennsylvania', abbreviation: 'PA' },
    { name: 'Rhode Island', abbreviation: 'RI' },
    { name: 'South Carolina', abbreviation: 'SC' },
    { name: 'South Dakota', abbreviation: 'SD' },
    { name: 'Tennessee', abbreviation: 'TN' },
    { name: 'Texas', abbreviation: 'TX' },
    { name: 'Utah', abbreviation: 'UT' },
    { name: 'Vermont', abbreviation: 'VT' },
    { name: 'Virginia', abbreviation: 'VA' },
    { name: 'Washington', abbreviation: 'WA' },
    { name: 'West Virginia', abbreviation: 'WV' },
    { name: 'Wisconsin', abbreviation: 'WI' },
    { name: 'Wyoming', abbreviation: 'WY' }
];


export const STATUSES = {
    ACTIVE: { type: "Active" as const, color: "bg-blue-100 text-blue-800", message: "Work in progress" },
    WAITING: { type: "Waiting" as const, color: "bg-yellow-100 text-yellow-800", message: "Waiting for parts/approval" },
    COMPLETED: { type: "Completed" as const, color: "bg-green-100 text-green-800", message: "Work completed" },
    ON_HOLD: { type: "On Hold" as const, color: "bg-gray-100 text-gray-800", message: "Temporarily paused" },
    PAYMENT: { type: "Payment" as const, color: "bg-red-100 text-red-800", message: "Payment required" },
    NONE: { type: "none" as const, color: "bg-gray-100 text-gray-600", message: "No active status" }
};

export default {
    generateUniqueID,
    checkNoActiveJobs,
    formatPhoneNumber,
    US_STATES,
    STATUSES
}