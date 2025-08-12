'use client';
import React, { useState, useEffect } from 'react';

interface PendingInvoice {
  id: string;
  customer: string;
  amount: number;
  jobTitle: string;
  completedDate: string;
  daysOverdue: number;
}

export default function PendingInvoicesTable() {
  const [invoices, setInvoices] = useState<PendingInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingInvoices();
  }, []);

  const fetchPendingInvoices = async () => {
    try {
      const response = await fetch('/api/dashboard/pending-invoices');
      if (!response.ok) throw new Error('Failed to fetch pending invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching pending invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Pending Invoices</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse">Loading invoices...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Pending Invoices</h3>

      {invoices.length > 0 ? (
        <div className="overflow-hidden">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{invoice.customer}</h4>
                    <p className="text-sm text-gray-600">{invoice.jobTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(invoice.amount)}</p>
                    {invoice.daysOverdue > 0 && (
                      <p className="text-xs text-red-600">{invoice.daysOverdue} days overdue</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Completed: {new Date(invoice.completedDate).toLocaleDateString()}
                  </p>
                  <button className="text-xs bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600">
                    Generate Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-sm italic">No pending invoices</p>
          </div>
        </div>
      )}
    </div>
  );
}