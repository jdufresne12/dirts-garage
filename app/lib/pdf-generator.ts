import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface BusinessInfo {
    name: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    phone: string;
    email: string;
    website?: string;
}

// Updated PDF Generator Class for new invoice schema
export class InvoicePDFGenerator {
    private doc: jsPDF;
    private pageWidth: number;
    private pageHeight: number;
    private margin: number;
    private lastTableY: number = 0;

    constructor() {
        this.doc = new jsPDF();
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.margin = 20;
    }

    async generateInvoicePDF(
        invoice: Invoice,
        customer: Customer,
        businessInfo: BusinessInfo,
        vehicle?: Vehicle
    ): Promise<Blob> {
        // Reset document
        this.doc = new jsPDF();
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();

        let yPosition = this.margin;

        // Header - Business Info & Invoice Title
        yPosition = this.addHeader(businessInfo, invoice, yPosition);

        // Customer Info & Vehicle Info
        yPosition = this.addCustomerInfo(customer, vehicle, yPosition);

        // Line Items Table
        yPosition = await this.addLineItemsTable(invoice.line_items || [], yPosition);

        // Totals
        yPosition = this.addTotals(invoice, yPosition);

        // Footer Notes
        this.addFooter(invoice.notes || '', businessInfo);

        // Return as blob for download or saving
        return this.doc.output('blob');
    }

    private addHeader(businessInfo: BusinessInfo, invoice: Invoice, yPosition: number): number {
        const leftMargin = this.margin;
        const rightMargin = this.pageWidth - this.margin;

        // Left side - Business Name (Orange color)
        this.doc.setFontSize(20);
        this.doc.setTextColor(255, 102, 0); // Orange color
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(businessInfo.name, leftMargin, yPosition);

        yPosition += 8;

        // Business address info
        this.doc.setFontSize(10);
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(businessInfo.address, leftMargin, yPosition);
        yPosition += 5;
        this.doc.text(`${businessInfo.city}, ${businessInfo.state} ${businessInfo.zipcode}`, leftMargin, yPosition);
        yPosition += 5;
        this.doc.text(businessInfo.phone, leftMargin, yPosition);
        yPosition += 5;
        this.doc.text(businessInfo.email, leftMargin, yPosition);

        // Right side - Invoice info (reset Y position to align with business name)
        let rightYPosition = this.margin;

        // INVOICE title with status badge
        this.doc.setFontSize(20);
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('INVOICE', rightMargin, rightYPosition, { align: 'right' });

        rightYPosition += 6;

        // Invoice number
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(invoice.id, rightMargin, rightYPosition, { align: 'right' });

        rightYPosition += 6;

        // Status
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'bold');
        const statusColor = this.getStatusColor(invoice.status);
        this.doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
        this.doc.text(`Status: ${invoice.status.toUpperCase()}`, rightMargin, rightYPosition, { align: 'right' });

        rightYPosition += 5;

        // Date info
        this.doc.setFontSize(10);
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`Date: ${this.formatDate(invoice.date)}`, rightMargin, rightYPosition, { align: 'right' });
        rightYPosition += 4;

        if (invoice.due_date) {
            this.doc.text(`Due Date: ${this.formatDate(invoice.due_date)}`, rightMargin, rightYPosition, { align: 'right' });
            rightYPosition += 4;
        }

        if (invoice.paid_date) {
            this.doc.text(`Paid Date: ${this.formatDate(invoice.paid_date)}`, rightMargin, rightYPosition, { align: 'right' });
            rightYPosition += 4;
        }

        if (invoice.revision_number > 1) {
            this.doc.setFontSize(8);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(`Revision ${invoice.revision_number}`, rightMargin, rightYPosition, { align: 'right' });
            rightYPosition += 4;
        }

        return Math.max(yPosition, rightYPosition) + 20;
    }

    private addCustomerInfo(customer: Customer, vehicle: Vehicle | undefined, yPosition: number): number {
        const leftColumn = this.margin;
        const rightColumn = this.pageWidth / 2 + 10;

        // Bill To section
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 0, 0);
        this.doc.text('Bill To:', leftColumn, yPosition);

        let leftY = yPosition + 8;
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`${customer.first_name} ${customer.last_name}`, leftColumn, leftY);
        leftY += 5;

        if (customer.address) {
            this.doc.text(customer.address, leftColumn, leftY);
            leftY += 5;
        }

        if (customer.city && customer.state && customer.zipcode) {
            this.doc.text(`${customer.city}, ${customer.state} ${customer.zipcode}`, leftColumn, leftY);
            leftY += 5;
        }

        this.doc.text(customer.phone, leftColumn, leftY);
        leftY += 5;
        this.doc.text(customer.email, leftColumn, leftY);

        // Vehicle section (if exists)
        let rightY = yPosition;
        if (vehicle) {
            this.doc.setFontSize(12);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('Vehicle:', rightColumn, rightY);

            rightY += 8;
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(`${vehicle.year} ${vehicle.make} ${vehicle.model}`, rightColumn, rightY);
            rightY += 5;

            if (vehicle.vin) {
                this.doc.text(`VIN: ${vehicle.vin}`, rightColumn, rightY);
                rightY += 5;
            }

            if (vehicle.license_plate) {
                this.doc.text(`License: ${vehicle.license_plate}`, rightColumn, rightY);
                rightY += 5;
            }

            if (vehicle.mileage) {
                this.doc.text(`Mileage: ${vehicle.mileage.toLocaleString()}`, rightColumn, rightY);
                rightY += 5;
            }
        }

        return Math.max(leftY, rightY) + 15;
    }

    private async addLineItemsTable(lineItems: InvoiceLineItem[], yPosition: number): Promise<number> {
        if (!lineItems || lineItems.length === 0) {
            this.doc.setFontSize(10);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text('No line items', this.margin, yPosition + 20);
            return yPosition + 40;
        }

        const tableData = lineItems.map(item => [
            item.description,
            item.quantity % 1 === 0 ? item.quantity.toString() : item.quantity.toFixed(3),
            `$${item.rate.toFixed(2)}`,
            `$${item.amount.toFixed(2)}`
        ]);

        // Clean table styling
        autoTable(this.doc, {
            head: [['Description', 'Qty', 'Rate', 'Amount']],
            body: tableData,
            startY: yPosition,
            theme: 'plain',
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                fontSize: 10,
                cellPadding: { top: 4, bottom: 4, left: 0, right: 0 }
            },
            bodyStyles: {
                textColor: [0, 0, 0],
                fontSize: 10,
                cellPadding: { top: 6, bottom: 4, left: 0, right: 0 }
            },
            columnStyles: {
                0: { cellWidth: 'auto', halign: 'left' },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 30, halign: 'right' },
                3: { cellWidth: 30, halign: 'right' }
            },
            margin: { left: this.margin, right: this.margin },
            didDrawPage: (data) => {
                this.lastTableY = data.cursor?.y || yPosition + 50;

                // Draw header underline
                const headerY = yPosition + 14;
                this.doc.setDrawColor(0, 0, 0);
                this.doc.setLineWidth(0.5);
                this.doc.line(this.margin, headerY, this.pageWidth - this.margin, headerY);

                // Draw bottom border
                if (this.lastTableY) {
                    this.doc.line(this.margin, this.lastTableY, this.pageWidth - this.margin, this.lastTableY);
                }
            }
        });

        return this.lastTableY + 15;
    }

    private addTotals(invoice: Invoice, yPosition: number): number {
        const rightAlign = this.pageWidth - this.margin;
        const labelX = rightAlign - 60;
        const amountX = rightAlign;

        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(0, 0, 0);

        // Subtotal
        this.doc.text('Subtotal:', labelX, yPosition);
        this.doc.text(`$${invoice.subtotal.toFixed(2)}`, amountX, yPosition, { align: 'right' });
        yPosition += 8;

        // Discount (if any)
        if (invoice.discount_amount > 0) {
            this.doc.setTextColor(0, 150, 0); // Green for discount
            this.doc.text('Discount:', labelX, yPosition);
            this.doc.text(`-$${invoice.discount_amount.toFixed(2)}`, amountX, yPosition, { align: 'right' });
            yPosition += 8;
            this.doc.setTextColor(0, 0, 0); // Reset to black
        }

        // Tax
        this.doc.text(`Tax (${invoice.tax_rate}%):`, labelX, yPosition);
        this.doc.text(`$${invoice.tax_amount.toFixed(2)}`, amountX, yPosition, { align: 'right' });
        yPosition += 12;

        // Total - Bold and larger
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Total:', labelX, yPosition);
        this.doc.text(`$${invoice.amount.toFixed(2)}`, amountX, yPosition, { align: 'right' });
        yPosition += 10;

        // Payment info (if any)
        if (invoice.amount_paid > 0) {
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            this.doc.setTextColor(0, 150, 0); // Green for payments

            this.doc.text('Amount Paid:', labelX, yPosition);
            this.doc.text(`$${invoice.amount_paid.toFixed(2)}`, amountX, yPosition, { align: 'right' });
            yPosition += 8;

            const balance = invoice.amount - invoice.amount_paid;
            if (balance > 0) {
                this.doc.setTextColor(200, 0, 0); // Red for balance due
                this.doc.setFont('helvetica', 'bold');
                this.doc.text('Balance Due:', labelX, yPosition);
                this.doc.text(`$${balance.toFixed(2)}`, amountX, yPosition, { align: 'right' });
            } else {
                this.doc.setTextColor(0, 150, 0); // Green for paid in full
                this.doc.setFont('helvetica', 'bold');
                this.doc.text('PAID IN FULL', labelX, yPosition);
            }
            yPosition += 10;
        }

        return yPosition + 10;
    }

    private addFooter(notes: string, businessInfo: BusinessInfo): void {
        const footerY = this.pageHeight - 40;

        // Notes section
        if (notes) {
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            this.doc.setTextColor(0, 0, 0);

            // Split long notes into multiple lines
            const maxWidth = this.pageWidth - (this.margin * 2);
            const noteLines = this.doc.splitTextToSize(notes, maxWidth);

            this.doc.text('Notes:', this.margin, footerY - 10);
            this.doc.text(noteLines, this.margin, footerY);
        }

        // Footer line
        const footerLineY = this.pageHeight - 20;
        this.doc.setDrawColor(200, 200, 200);
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, footerLineY, this.pageWidth - this.margin, footerLineY);

        // Thank you message
        this.doc.setFontSize(8);
        this.doc.setTextColor(100, 100, 100);
        this.doc.text('Thank you for your business!', this.pageWidth / 2, footerLineY + 8, { align: 'center' });
    }

    private getStatusColor(status: string): { r: number, g: number, b: number } {
        switch (status.toLowerCase()) {
            case 'paid':
                return { r: 0, g: 150, b: 0 }; // Green
            case 'overdue':
                return { r: 200, g: 0, b: 0 }; // Red
            case 'sent':
                return { r: 0, g: 100, b: 200 }; // Blue
            case 'pending':
                return { r: 200, g: 150, b: 0 }; // Orange
            case 'cancelled':
                return { r: 100, g: 100, b: 100 }; // Gray
            default:
                return { r: 0, g: 0, b: 0 }; // Black
        }
    }

    private formatDate(date: string): string {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-US');
    }

    // Method to download PDF
    downloadPDF(filename: string): void {
        this.doc.save(filename);
    }

    // Method to open PDF in new tab
    openInNewTab(): void {
        const pdfUrl = this.doc.output('bloburl');
        window.open(pdfUrl);
    }
}

// Updated usage function for new schema
export async function handlePDFGeneration(
    invoice: Invoice,
    customer: Customer,
    vehicle?: Vehicle,
    action: 'download' | 'preview' | 'email' = 'download'
): Promise<void> {
    const businessInfo = {
        name: "Dirt's Garage",
        address: "154 South Parliman rd",
        city: "Lagrangeville",
        state: "NY",
        zipcode: "12540",
        phone: "(845) 224-7046",
        email: "Johndirt30@gmail.com"
    };

    const pdfGenerator = new InvoicePDFGenerator();

    try {
        // Generate the PDF
        await pdfGenerator.generateInvoicePDF(
            invoice,
            customer,
            businessInfo,
            vehicle
        );

        // Handle the action
        switch (action) {
            case 'download':
                pdfGenerator.downloadPDF(`invoice-${invoice.id}.pdf`);
                break;
            case 'preview':
                pdfGenerator.openInNewTab();
                break;
            case 'email':
                // Future: implement email functionality
                console.log('Email functionality to be implemented');
                pdfGenerator.downloadPDF(`invoice-${invoice.id}.pdf`);
                break;
        }
    } catch (error) {
        console.error('PDF generation error:', error);
        throw new Error('Failed to generate PDF');
    }
}