import helpers from "./helpers"

export function newCustomer(customer: Customer): Customer {
    return {
        id: customer.id || helpers.generateUniqueID(),
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email,
        address: customer.address || undefined,
        notes: customer.notes || undefined,
        status: customer.status || helpers.STATUSES.NONE,
        vehicleCount: 0,
        jobCount: 0,
        vehicles: undefined,
        jobs: undefined,
        invoices: undefined,
        totalSpent: 0,
        amountOwed: 0
    }
}
export default {
    newCustomer
}