const generateUniqueID = (): string => {
    return "Cust00001"
}

const checkNoActiveJobs = (customer: Customer) => {
    return customer.status.type === "none" || customer.status.type === "Completed" || customer.status.type === "Waiting" ? true : false;
}

const STATUSES = {
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
    STATUSES
}