export const generateUniqueID = (): string => {
    const uuid = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
    return `${uuid}`;
}

export const checkNoActiveJobs = (customer: Customer) => {
    return customer.status === "none" || customer.status === "Completed" || customer.status === "Waiting" ? true : false;
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

export const displayDateAndTimeShort = (dateString: string): string => {
    if (!dateString) return '';

    try {
        let date: Date;

        // Check if the dateString has timezone info (ends with Z or has timezone offset)
        if (dateString.includes('Z') || dateString.match(/[+-]\d{2}:\d{2}$/)) {
            // It's a full ISO string with timezone - convert to local time
            date = new Date(dateString);
        } else {
            // It's a local datetime string (like "2025-08-01T15:20") - treat as local time
            // Don't let JavaScript interpret it as UTC
            const [datePart, timePart] = dateString.split("T");
            const [year, month, day] = datePart.split("-");
            const [hours, minutes] = (timePart || "00:00").split(":");

            // Create date in local timezone
            date = new Date(
                parseInt(year),
                parseInt(month) - 1, // months are 0-indexed
                parseInt(day),
                parseInt(hours),
                parseInt(minutes || "0")
            );
        }

        // Format the date
        const month = (date.getMonth() + 1).toString();
        const day = date.getDate().toString();
        const year = date.getFullYear().toString();
        let hours = date.getHours();
        const minutes = date.getMinutes();

        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        return `${month}/${day}/${year}, ${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    } catch (error) {
        console.warn('Error formatting date:', dateString, error);
        return dateString; // fallback to original string
    }
};

export const displayDateAndTimeLong = (dateString: string): string => {
    if (!dateString) return '';

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    try {
        let date: Date;

        // Handle timezone the same way as the short format
        if (dateString.includes('Z') || dateString.match(/[+-]\d{2}:\d{2}$/)) {
            date = new Date(dateString);
        } else {
            const [datePart, timePart] = dateString.split("T");
            const [year, month, day] = datePart.split("-");
            const [hours, minutes] = (timePart || "00:00").split(":");

            date = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                parseInt(hours),
                parseInt(minutes || "0")
            );
        }

        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = date.getMinutes();

        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;

        return `${month} ${day}, ${year} at ${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    } catch (error) {
        console.warn('Error formatting date:', dateString, error);
        return dateString;
    }
};

export const getLocalDateTimeString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

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
    displayDateAndTimeLong,
    displayDateAndTimeShort,
    getLocalDateTimeString,
    US_STATES,
    STATUSES
}