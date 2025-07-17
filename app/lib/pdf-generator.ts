// app/lib/pdf-generator.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Invoice data interfaces (keeping the same as before)
interface InvoiceData {
    invoiceNumber: string;
    date: string;
    dueDate: string;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    lineItems: InvoiceLineItem[];
    notes: string;
    terms: string;
}

interface InvoiceLineItem {
    id: string;
    type: 'labor' | 'part' | 'fee' | 'discount' | 'custom';
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    taxable: boolean;
}

interface Customer {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
}

interface Vehicle {
    year: number;
    make: string;
    model: string;
    vin: string;
}

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

// Updated PDF Generator Class - same functionality, new styling
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
        invoiceData: InvoiceData,
        customer: Customer,
        vehicle: Vehicle,
        businessInfo: BusinessInfo,
        jobTitle: string
    ): Promise<Blob> {
        // Reset document
        this.doc = new jsPDF();
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();

        let yPosition = this.margin;

        // Header - Business Info & Invoice Title
        yPosition = this.addHeader(businessInfo, invoiceData, yPosition);

        // Customer and Vehicle Info
        yPosition = this.addCustomerInfo(customer, vehicle, jobTitle, yPosition);

        // Line Items Table
        yPosition = await this.addLineItemsTable(invoiceData.lineItems, yPosition);

        // Totals
        yPosition = this.addTotals(invoiceData, yPosition);

        // Footer Notes
        this.addFooter(invoiceData.notes, businessInfo);

        // Return as blob for download or saving
        return this.doc.output('blob');
    }

    private addHeader(businessInfo: BusinessInfo, invoiceData: InvoiceData, yPosition: number): number {
        const leftMargin = this.margin;
        const rightMargin = this.pageWidth - this.margin;

        // Left side - Business Name (Orange color like in image)
        this.doc.setFontSize(20);
        this.doc.setTextColor(255, 102, 0); // Orange color
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(businessInfo.name, leftMargin, yPosition);

        yPosition += 10;

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

        // INVOICE title
        this.doc.setFontSize(20);
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('INVOICE', rightMargin, rightYPosition, { align: 'right' });

        rightYPosition += 10;

        // Invoice number
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(invoiceData.invoiceNumber, rightMargin, rightYPosition, { align: 'right' });

        rightYPosition += 12;

        // Date info
        this.doc.setFontSize(10);
        this.doc.text(`Date: ${invoiceData.date}`, rightMargin, rightYPosition, { align: 'right' });
        rightYPosition += 5;
        this.doc.text(`Due: ${invoiceData.dueDate}`, rightMargin, rightYPosition, { align: 'right' });

        return Math.max(yPosition, rightYPosition) + 20;
    }

    private addCustomerInfo(customer: Customer, vehicle: Vehicle, jobTitle: string, yPosition: number): number {
        const leftColumn = this.margin;

        // Bill To section
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Bill To:', leftColumn, yPosition);

        yPosition += 8;
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`${customer.firstName} ${customer.lastName}`, leftColumn, yPosition);
        yPosition += 5;
        this.doc.text(customer.address, leftColumn, yPosition);
        yPosition += 5;
        this.doc.text(`${customer.city}, ${customer.state} ${customer.zipcode}`, leftColumn, yPosition);
        yPosition += 5;
        this.doc.text(customer.phone, leftColumn, yPosition);
        yPosition += 5;
        this.doc.text(customer.email, leftColumn, yPosition);

        return yPosition + 20;
    }

    private async addLineItemsTable(lineItems: InvoiceLineItem[], yPosition: number): Promise<number> {
        const tableData = lineItems.map(item => [
            item.description,
            item.quantity.toString(),
            `${item.rate.toFixed(2)}`,
            `${item.amount.toFixed(2)}`
        ]);

        // Clean table styling to match the reference image exactly
        autoTable(this.doc, {
            head: [['Description', '       Qty', '          Rate', '         Amount']],
            body: tableData,
            startY: yPosition,
            theme: 'plain',
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                fontSize: 10,
                cellPadding: { top: 4, bottom: 4, left: 0, right: 0 } // Normal header padding
            },
            bodyStyles: {
                textColor: [0, 0, 0],
                fontSize: 10,
                cellPadding: { top: 8, bottom: 4, left: 0, right: 0 } // More top padding for spacing after line
            },
            columnStyles: {
                0: { cellWidth: 'auto', halign: 'left' },    // Description - left aligned
                1: { cellWidth: 20, halign: 'center' },      // Qty - centered
                2: { cellWidth: 30, halign: 'center' },      // Rate - centered  
                3: { cellWidth: 30, halign: 'center' }       // Amount - centered
            },
            margin: { left: this.margin, right: this.margin },
            didDrawPage: (data) => {
                this.lastTableY = data.cursor?.y || yPosition + 50;

                // Manually draw header underline closer to header text
                const headerY = yPosition + 14; // Closer to header
                this.doc.setDrawColor(0, 0, 0);
                this.doc.setLineWidth(0.5);
                this.doc.line(this.margin, headerY, this.pageWidth - this.margin, headerY);

                // Manually draw bottom border
                if (this.lastTableY) {
                    this.doc.line(this.margin, this.lastTableY, this.pageWidth - this.margin, this.lastTableY);
                }
            }
        });

        return this.lastTableY + 15;
    }

    private addTotals(invoiceData: InvoiceData, yPosition: number): number {
        const rightAlign = this.pageWidth - this.margin;
        const labelX = rightAlign - 60;
        const amountX = rightAlign;

        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(0, 0, 0);

        // Subtotal
        this.doc.text('Subtotal:', labelX, yPosition);
        this.doc.text(`${invoiceData.subtotal.toFixed(2)}`, amountX, yPosition, { align: 'right' });
        yPosition += 8;

        // Discount (if any)
        if (invoiceData.discountAmount > 0) {
            this.doc.text('Discount:', labelX, yPosition);
            this.doc.text(`-${invoiceData.discountAmount.toFixed(2)}`, amountX, yPosition, { align: 'right' });
            yPosition += 8;
        }

        // Tax
        this.doc.text(`Tax (${invoiceData.taxRate}%):`, labelX, yPosition);
        this.doc.text(`${invoiceData.taxAmount.toFixed(2)}`, amountX, yPosition, { align: 'right' });
        yPosition += 12;

        // Total - Bold and larger
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Total:', labelX, yPosition);
        this.doc.text(`${invoiceData.totalAmount.toFixed(2)}`, amountX, yPosition, { align: 'right' });

        return yPosition + 20;
    }

    private addFooter(notes: string, businessInfo: BusinessInfo): void {
        const footerY = this.pageHeight - 30;

        // Notes section
        if (notes) {
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            this.doc.setTextColor(0, 0, 0);
            this.doc.text(notes, this.margin, footerY);
        }
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

// Keep the same usage function as before
export async function handlePDFGeneration(
    invoiceData: InvoiceData,
    customer: Customer,
    vehicle: Vehicle,
    jobTitle: string,
    action: 'download' | 'preview' | 'email'
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
            invoiceData,
            customer,
            vehicle,
            businessInfo,
            jobTitle
        );

        // Handle the action
        switch (action) {
            case 'download':
                pdfGenerator.downloadPDF(`invoice-${invoiceData.invoiceNumber}.pdf`);
                break;
            case 'preview':
                pdfGenerator.openInNewTab();
                break;
            case 'email':
                // Future: implement email functionality
                console.log('Email functionality to be implemented');
                pdfGenerator.downloadPDF(`invoice-${invoiceData.invoiceNumber}.pdf`);
                break;
        }
    } catch (error) {
        console.error('PDF generation error:', error);
        throw new Error('Failed to generate PDF');
    }
}