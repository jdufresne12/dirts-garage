# Dirt's Garage - Garage Management System

**Live Demo:** https://dirts-garage.vercel.app/

A comprehensive garage management system designed to streamline automotive repair shop operations. Built for Dirt's Garage to manage customers, track jobs, handle invoicing, and maintain detailed vehicle records.

## 🚗 Features

### Customer Management

- Complete customer profiles with contact information and service history
- Vehicle registration and tracking per customer
- Customer financial summaries and payment history
- Status tracking for active/inactive customers

### Job Management

- Detailed job tracking from start to completion
- Job status management (Active, Waiting, Completed, etc.)
- Parts tracking and cost management per job
- Labor hour tracking and cost calculations
- Priority levels and estimated completion dates
- Comprehensive job search and filtering

### Invoice System

- Professional PDF invoice generation with business branding
- Multiple invoice statuses (Draft, Pending, Sent, Paid, Overdue)
- Payment tracking with multiple payment methods
- Automatic job-to-invoice synchronization
- Tax calculations and discount handling
- Email invoice delivery (planned)

### Vehicle Records

- Complete vehicle information (make, model, year, VIN, etc.)
- Service history tracking per vehicle
- Multiple vehicles per customer support

### Dashboard & Analytics

- Real-time overview of active jobs
- Financial summaries and outstanding invoices
- Quick access to jobs requiring attention
- Business performance metrics

## 🛠 Tech Stack

- **Framework:** Next.js 15 with TypeScript
- **Database:** PostgreSQL with AWS RDS
- **File Storage:** AWS S3 for document storage
- **Styling:** Tailwind CSS
- **PDF Generation:** jsPDF with jsPDF-AutoTable
- **Authentication:** Custom authentication system
- **Deployment:** Vercel

## 🗃 Database Schema

### Core Tables

- **customers** - Customer information and contact details
- **vehicles** - Vehicle records linked to customers
- **jobs** - Service jobs with status tracking
- **job_steps** - Individual work steps within jobs
- **parts** - Parts inventory and job-specific parts
- **invoices** - Invoice records with comprehensive billing info
- **invoice_line_items** - Detailed line items for invoices
- **payments** - Payment tracking for invoices

## 📱 Usage

### Getting Started

1. Create customer profiles with their contact information
2. Add vehicles to customer accounts
3. Create jobs for specific vehicles and customers
4. Track job progress through different statuses
5. Generate professional invoices from completed jobs
6. Record payments and track financial status

### Key Workflows

- **New Job:** Customer → Vehicle → Job Creation → Parts/Labor → Completion → Invoice
- **Invoice Management:** Job → Generate Invoice → Send to Customer → Track Payments
- **Customer Service:** View History → Schedule New Work → Update Records

## 🎯 Roadmap

### Current To-Do

- [ ] Invoices section improvements
- [ ] Engine build specs + build sheet functionality
- [ ] Email invoice delivery system

### Known Issues

- [ ] (MOBILE) Invoice Generation Modal display issues on mobile devices
- [ ] (MOBILE/WEB) Uploading images takes very long/inefficient

### Future Enhancements

- [ ] Appointment scheduling system
- [ ] Inventory management
- [ ] Reporting and analytics dashboard
- [ ] Mobile app development
- [ ] Integration with popular accounting software
- [ ] Multi-location support

## 📝 License

This project is private and proprietary to Dirt's Garage.

## 📞 Contact

For questions or support contact me at 1 (845) 797-5694 or Jdufresne135@gmail.com
