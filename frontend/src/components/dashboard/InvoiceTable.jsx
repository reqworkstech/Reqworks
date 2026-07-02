import React from 'react';

export default function InvoiceTable({ invoices, onPay }) {
  
  const handleDownload = (invNum, desc, amount, date) => {
    // Basic dynamic receipt download simulation
    const content = `=========================================
          REQWORKS SOFTWARE STUDIO RECEIPTS
=========================================
Invoice Reference: ${invNum}
Description:       ${desc}
Amount Paid:       $${amount.toLocaleString()} USD
Payment Date:      ${date ? new Date(date).toLocaleString() : new Date().toLocaleString()}
Gateway Provider:  Razorpay Secure Sandbox
Status:            CLEARED / PAID
=========================================
Thank you for building with Reqworks Studio!
=========================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${invNum}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="invoice-table-wrap" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Invoice Ledger</h3>
      </div>
      
      {invoices.length === 0 ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-card)' }}>
          No billing transactions found.
        </div>
      ) : (
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Payment Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="inv-id">{inv.invoiceNumber}</td>
                <td>{inv.description}</td>
                <td className="inv-amount">${inv.amount.toLocaleString()}</td>
                <td>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: inv.status === 'paid' ? 'rgba(72,187,120,0.12)' : 'rgba(244,63,94,0.12)',
                    color: inv.status === 'paid' ? 'var(--accent-green)' : 'var(--accent-rose)',
                    textTransform: 'uppercase'
                  }}>
                    {inv.status}
                  </span>
                </td>
                <td>
                  {inv.status === 'paid' ? (
                    <button 
                      onClick={() => handleDownload(inv.invoiceNumber, inv.description, inv.amount, inv.paidAt)} 
                      className="btn-download"
                      type="button"
                    >
                      ↓ Receipt
                    </button>
                  ) : (
                    <button 
                      onClick={onPay} 
                      className="btn-outline-sm"
                      type="button"
                    >
                      Pay Now
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
