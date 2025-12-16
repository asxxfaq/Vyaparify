import React, { useRef } from 'react';

export default function InvoiceView({ bill, handlePrint }) {
  return (
    <div className="invoice-card">
      <header className="invoice-header">
        <h2>Vyaparify</h2>
        <div>Bill #: {bill.id}</div>
        <div>Date: {new Date(bill.createdAt).toLocaleString()}</div>
      </header>

      <section>
        <h4>Customer</h4>
        <p>{bill.customer?.name || '—'}</p>
        <p>{bill.customer?.phone || '—'}</p>
      </section>

      <section>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((it, idx) => (
              <tr key={idx}>
                <td>{it.name}</td>
                <td>{it.qty}</td>
                <td>₹{Number(it.price).toFixed(2)}</td>
                <td>
                  ₹
                  {(
                    (Number(it.price) * Number(it.qty) - Number(it.discount || 0)) +
                    ((Number(it.gst) || 0) / 100 * (Number(it.price) * Number(it.qty) - Number(it.discount || 0)))
                  ).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="invoice-summary">
        <p>Subtotal: ₹{(bill.summary?.subtotal || 0).toFixed(2)}</p>
        <p>Discount: ₹{(bill.summary?.discount || 0).toFixed(2)}</p>
        <p>Tax: ₹{(bill.summary?.tax || 0).toFixed(2)}</p>
        <h3>Total: ₹{(bill.summary?.total || 0).toFixed(2)}</h3>
      </section>

      <div className="invoice-actions">
        <button className="btn" onClick={handlePrint}>Print / Save as PDF</button>
      </div>
    </div>
  );
}
