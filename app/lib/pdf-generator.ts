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

interface Payment {
    id: string;
    invoice_id: string;
    amount: number;
    payment_date: string;
    payment_method: 'cash' | 'check' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'other';
    reference_number?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
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
        vehicle?: Vehicle,
        payments?: Payment[]
    ): Promise<Blob> {
        // Reset document
        this.doc = new jsPDF();
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();

        let yPosition = this.margin;

        // Header - Business Info & Invoice Title
        yPosition = this.addHeader(businessInfo, invoice, yPosition);

        // Customer Info & Vehicle Info
        // if(customer){
        //     yPosition = this.addCustomerInfo(customer, vehicle, yPosition);
        // }

        yPosition = this.addCustomerInfo(customer, vehicle, yPosition);

        const lineItemsCount = invoice.line_items?.length || 0;

        // For 7 items or fewer, force everything on one page
        if (lineItemsCount <= 7) {
            // Add line items table
            yPosition = await this.addLineItemsTable(invoice.line_items || [], yPosition);

            // Add small spacing and keep totals on same page
            yPosition += 5;
        } else {
            // For more than 7 items, use the splitting logic (TODO)
            // const paymentsCount = payments?.length || 0;
            // const notesLines = invoice.notes ? Math.ceil(invoice.notes.length / 80) : 1;
            // const totalsSpaceNeeded = 100 + (paymentsCount * 8) + (notesLines * 15);

            // let shouldSplitTable = true;
            const itemsForPage1 = lineItemsCount - Math.min(3, Math.floor(lineItemsCount * 0.3));

            const page1Items = invoice.line_items?.slice(0, itemsForPage1) || [];
            const page2Items = invoice.line_items?.slice(itemsForPage1) || [];

            // Page 1 - Header + partial table
            if (page1Items.length > 0) {
                yPosition = await this.addLineItemsTable(page1Items, yPosition, {
                    showBottomBorder: false,
                    isContinuation: false
                });
            }

            // Page 2 - Continuation of table + totals
            this.doc.addPage();
            yPosition = this.margin + 20;

            if (page2Items.length > 0) {
                yPosition = await this.addLineItemsTable(page2Items, yPosition, {
                    showBottomBorder: true,
                    isContinuation: true
                });
            }
        }

        // Totals (including payment information)
        yPosition = this.addTotals(invoice, payments || [], yPosition);
        console.log(yPosition)

        // Footer Notes
        this.addFooter(invoice.notes || '');

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
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(invoice.id, rightMargin, rightYPosition, { align: 'right' });

        rightYPosition += 6;

        // Revision number (if > 1)
        if (invoice.revision_number && invoice.revision_number > 1) {
            this.doc.setFontSize(8);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(`Revision ${invoice.revision_number}`, rightMargin, rightYPosition, { align: 'right' });
            rightYPosition += 5;
        }

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

        return Math.max(yPosition, rightYPosition) + 15;
    }

    private addCustomerInfo(customer: Customer, vehicle: Vehicle | undefined, yPosition: number): number {
        const leftColumn = this.margin;
        const rightColumn = this.pageWidth / 2 + 10;

        // Bill To section
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 0, 0);
        this.doc.text('Bill To:', leftColumn, yPosition);

        let leftY = yPosition + (customer ? 8 : 20);
        if (customer) {
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
        }

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

        return Math.max(leftY, rightY) + 5;
    }

    private async addLineItemsTable(
        lineItems: InvoiceLineItem[],
        yPosition: number,
        options: { showBottomBorder?: boolean; isContinuation?: boolean } = {}
    ): Promise<number> {
        const { showBottomBorder = true, isContinuation = false } = options;

        if (!lineItems || lineItems.length === 0) {
            this.doc.setFontSize(10);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text('No line items', this.margin, yPosition + 20);
            return yPosition + 40;
        }

        const tableData = lineItems.map(item => [
            item.description,
            item.quantity % 1 === 0 ? item.quantity.toString() : item.quantity.toFixed(3),
            `${item.rate.toFixed(2)}`,
            `${item.amount.toFixed(2)}`
        ]);

        // Calculate column widths for better alignment
        const availableWidth = this.pageWidth - (this.margin * 2);
        const descriptionWidth = availableWidth * 0.50;  // 50% for description
        const qtyWidth = availableWidth * 0.15;         // 15% for quantity
        const rateWidth = availableWidth * 0.175;       // 17.5% for rate
        const amountWidth = availableWidth * 0.175;     // 17.5% for amount

        // Determine if we should show header (don't show on continuation)
        const showHeader = !isContinuation;
        const headData = showHeader ? [['Description', '        Qty', '                  Rate', '            Amount']] : undefined;

        // Clean table styling with proper alignment
        autoTable(this.doc, {
            head: headData,
            body: tableData,
            startY: yPosition,
            theme: 'plain',
            headStyles: showHeader ? {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                fontSize: 10,
                cellPadding: { top: 6, bottom: 6, left: 2, right: 2 }
            } : undefined,
            bodyStyles: {
                textColor: [0, 0, 0],
                fontSize: 10,
                cellPadding: { top: 6, bottom: 4, left: 2, right: 2 },
                lineWidth: 0,
                lineColor: [255, 255, 255]
            },
            columnStyles: {
                0: { cellWidth: descriptionWidth, halign: 'left' },
                1: { cellWidth: qtyWidth, halign: 'center' },   // Center align quantity
                2: { cellWidth: rateWidth, halign: 'right' },   // Right align rate
                3: { cellWidth: amountWidth, halign: 'right' }  // Right align amount
            },
            margin: { left: this.margin, right: this.margin },
            alternateRowStyles: {
                fillColor: [249, 249, 249] // Very light gray for alternating rows
            },
            didDrawPage: (data) => {
                this.lastTableY = data.cursor?.y || yPosition + 50;

                // Draw header underline only if showing header
                if (showHeader) {
                    const headerY = yPosition + 16;
                    this.doc.setDrawColor(0, 0, 0);
                    this.doc.setLineWidth(1);
                    this.doc.line(this.margin, headerY, this.pageWidth - this.margin, headerY);
                }

                // Draw top border for continuation tables
                if (isContinuation) {
                    this.doc.setDrawColor(0, 0, 0);
                    this.doc.setLineWidth(1);
                    this.doc.line(this.margin, yPosition, this.pageWidth - this.margin, yPosition);
                }

                // Draw bottom border if requested
                if (showBottomBorder && this.lastTableY) {
                    this.doc.setLineWidth(1);
                    this.doc.line(this.margin, this.lastTableY, this.pageWidth - this.margin, this.lastTableY);
                }
            }
        });

        return this.lastTableY + 10; // Reduced spacing
    }

    private addTotals(invoice: Invoice, payments: Payment[], yPosition: number): number {
        const rightAlign = this.pageWidth - this.margin;
        const labelX = rightAlign - 60; // Better alignment to match your image
        const amountX = rightAlign;

        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(0, 0, 0);

        // Subtotal
        this.doc.text('Subtotal:', labelX, yPosition);
        this.doc.text(`${invoice.subtotal.toFixed(2)}`, amountX, yPosition, { align: 'right' });
        yPosition += 6;

        // Tax
        this.doc.text(`Tax (${invoice.tax_rate}%):`, labelX, yPosition);
        this.doc.text(`${invoice.tax_amount.toFixed(2)}`, amountX, yPosition, { align: 'right' });
        yPosition += 8;

        // Invoice Total - Bold and larger
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Total:', labelX, yPosition);
        this.doc.text(`${invoice.amount.toFixed(2)}`, amountX, yPosition, { align: 'right' });
        yPosition += 8;

        // Separator line after first total
        this.doc.setDrawColor(128, 128, 128);
        this.doc.setLineWidth(0.5);
        this.doc.line(labelX - 5, yPosition, rightAlign, yPosition);
        yPosition += 10;

        // Payment Information Section (like in your image)
        if (payments && payments.length > 0) {
            // Sort payments by date
            const sortedPayments = [...payments].sort((a, b) =>
                new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
            );

            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            this.doc.setTextColor(255, 0, 0); // Red color for payments like in image

            sortedPayments.forEach(payment => {
                const paymentMethodDisplay = payment.payment_method.replace('_', ' ');
                const paymentText = `${paymentMethodDisplay} - ${this.formatDate(payment.payment_date)}`;

                this.doc.text(paymentText, labelX, yPosition);
                this.doc.text(`-${payment.amount.toFixed(2)}`, amountX, yPosition, { align: 'right' });
                yPosition += 6;
            });

            // Separator line after payments
            this.doc.setDrawColor(128, 128, 128);
            this.doc.setLineWidth(0.5);
            this.doc.line(labelX - 5, yPosition + 2, rightAlign, yPosition + 2);
            yPosition += 8;
        }

        // Final Balance Due - this is the ONLY final total line
        const balanceDue = invoice.amount - invoice.amount_paid;
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 0, 0); // Black for final total

        this.doc.text('Total:', labelX, yPosition);
        this.doc.text(`${balanceDue.toFixed(2)}`, amountX, yPosition, { align: 'right' });
        yPosition += 8;

        return yPosition + 10;
    }

    private addFooter(notes: string): void {
        const footerStartY = this.pageHeight - 35; // More space from bottom

        // Notes section - positioned better
        if (notes) {
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'bold');
            this.doc.setTextColor(0, 0, 0);
            this.doc.text('Notes:', this.margin, footerStartY - 25);

            this.doc.setFont('helvetica', 'normal');
            // Split long notes into multiple lines
            const maxWidth = this.pageWidth - (this.margin * 2);
            const noteLines = this.doc.splitTextToSize(notes, maxWidth);
            this.doc.text(noteLines, this.margin, footerStartY - 17);
        }

        // Add invoice creation date
        const creationDate = new Date().toLocaleDateString();
        this.doc.text(`Invoice created on ${creationDate}`, this.pageWidth / 2, footerStartY + 15, { align: 'center' });
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

// Updated usage function for new schema with payments
export async function handlePDFGeneration(
    invoice: Invoice,
    customer: Customer,
    vehicle?: Vehicle,
    payments?: Payment[],
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
            vehicle,
            payments
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