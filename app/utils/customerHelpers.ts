import helpers from "./helpers"

export function newCustomer(customer: Customer): Customer {
    return {
        id: customer.id || helpers.generateUniqueID(),
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address || undefined,
        notes: customer.notes || undefined,
        status: customer.status || "None",
        vehicles: undefined,
        jobs: undefined,
        invoices: undefined,
    }
}
export default {
    newCustomer
}