import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useBill } from "../context/BillContext";
import { calculateBill } from "../utils/calculateBill";
import BillItemRow from "../components/BillItemRow";
import { TbTruckReturn } from "react-icons/tb";
import "./CreateBill.css";

/* ---------- REGEX ---------- */
const nameRegex = /^[A-Za-z ]{3,}$/;
const phoneRegex = /^[6-9]\d{9}$/;

/* ---------- HELPERS ---------- */
const getDefaultItem = () => ({
  tempId: Date.now().toString() + Math.random(),
  productId: "",
  name: "",
  qty: 1,
  price: 0,
  discount: 0,
  gst: 0
});

export default function CreateBill() {
  const { products, addBill } = useBill();
  const location = useLocation();

  const returnData = location.state?.bill || null;
  const isReturn = location.state?.returnBill || false;

  /* ---------- STATE ---------- */
  const [customer, setCustomer] = useState(
    returnData?.customer || { name: "", phone: "" }
  );

  const [items, setItems] = useState(
    returnData?.items
      ? returnData.items.map(i => ({ ...i, tempId: getDefaultItem().tempId }))
      : [getDefaultItem()]
  );

  const [payment, setPayment] = useState({
    method: "CASH",
    cash: calculateBill(items).total,
    bank: 0
  });

  const [errors, setErrors] = useState({});

  /* ---------- ITEM HANDLERS ---------- */
  const addItem = () => setItems(prev => [...prev, getDefaultItem()]);

  const removeItem = tempId =>
    setItems(prev => prev.filter(i => i.tempId !== tempId));

  const updateItem = updated => {
    setItems(prev =>
      prev.map(i => (i.tempId === updated.tempId ? updated : i))
    );
    setErrors(prev => {
      const copy = { ...prev };
      Object.keys(copy).forEach(k => {
        if (k.includes(updated.tempId)) delete copy[k];
      });
      return copy;
    });
    const total = calculateBill(items).total;
    if (payment.method === "CASH") setPayment({ method: "CASH", cash: total, bank: 0 });
    if (payment.method === "BANK") setPayment({ method: "BANK", cash: 0, bank: total });
  };

  /* ---------- PAYMENT HANDLERS ---------- */
  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    const total = calculateBill(items).total;
    if (method === "CASH") setPayment({ method, cash: total, bank: 0 });
    else if (method === "BANK") setPayment({ method, cash: 0, bank: total });
    else setPayment({ method, cash: 0, bank: 0 });
  };

  const handlePaymentChange = (field, value) => {
    setPayment(prev => ({ ...prev, [field]: Number(value) }));
  };

  /* ---------- VALIDATION ---------- */
  const isFormValid = () => {
    if (!nameRegex.test(customer.name)) return false;
    if (!phoneRegex.test(customer.phone)) return false;
    if (!items.length) return false;
    if (!items.every(
      i =>
        i.productId &&
        i.qty > 0 &&
        i.price >= 0 &&
        i.gst >= 0 &&
        i.gst <= 28
    )) return false;

    if (payment.method === "SPLIT") {
      const total = calculateBill(items).total;
      if (payment.cash + payment.bank !== total) return false;
    }

    return true;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!nameRegex.test(customer.name))
      newErrors.customerName = "Name must be at least 3 letters";

    if (!phoneRegex.test(customer.phone))
      newErrors.customerPhone = "Enter valid 10-digit phone number";

    items.forEach((item, index) => {
      if (!item.productId)
        newErrors[`product-${index}`] = "Select product";
      if (item.qty <= 0)
        newErrors[`qty-${index}`] = "Quantity must be greater than 0";
      if (item.price < 0)
        newErrors[`price-${index}`] = "Invalid price";
      if (item.gst < 0 || item.gst > 28)
        newErrors[`gst-${index}`] = "GST must be 0–28%";
    });

    if (payment.method === "SPLIT") {
      const total = calculateBill(items).total;
      if (payment.cash + payment.bank !== total) {
        newErrors.payment = `Split payment must equal ₹${total.toFixed(2)}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- INVOICE ---------- */
  const getNextInvoiceNumber = () => {
    const last = Number(localStorage.getItem("invoice_no") || 1000);
    const next = last + 1;
    localStorage.setItem("invoice_no", next);
    return next;
  };

  const printInvoice = bill => {
    const invoiceNo = getNextInvoiceNumber();
    const date = new Date().toLocaleDateString("en-IN");

    const rows = bill.items
      .map(
        (i, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${i.name}</td>
          <td>${i.qty}</td>
          <td>₹${i.price.toFixed(2)}</td>
          <td>₹${i.discount.toFixed(2)}</td>
          <td>${i.gst}%</td>
          <td class="right">
            ₹${(
              (i.price * i.qty - i.discount) *
              (1 + i.gst / 100)
            ).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join("");

    const paymentHtml =
      bill.payment.method === "SPLIT"
        ? `<p>Cash: ₹${bill.payment.cash.toFixed(
            2
          )}, Bank: ₹${bill.payment.bank.toFixed(2)}</p>`
        : `<p>${bill.payment.method}: ₹${(
            bill.payment.method === "CASH" ? bill.payment.cash : bill.payment.bank
          ).toFixed(2)}</p>`;

    const total = calculateBill(bill.items).total;

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
    <html>
      <head>
        <title>Invoice #${invoiceNo}</title>
        <style>
          * { box-sizing: border-box; font-family: "Segoe UI", Arial, sans-serif; }
          body { padding: 30px; color: #111; }
          .invoice { max-width: 900px; margin: auto; border: 1px solid #ddd; padding: 24px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 16px; }
          .company h1 { margin: 0; font-size: 28px; }
          .company p { margin: 4px 0; font-size: 13px; }
          .invoice-info { text-align: right; font-size: 14px; }
          .customer { margin-top: 20px; font-size: 14px; }
          .customer strong { display: inline-block; width: 80px; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th { background: #f5f5f5; border-bottom: 2px solid #333; padding: 10px; font-size: 14px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; font-size: 14px; }
          .right { text-align: right; }
          .summary { margin-top: 20px; width: 100%; display: flex; justify-content: flex-end; }
          .summary table { width: 300px; }
          .summary td { padding: 8px; }
          .summary tr:last-child td { font-weight: bold; font-size: 16px; border-top: 2px solid #111; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #555; }
          @media print { body { padding: 0; } .invoice { border: none; } }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="company">
              <h1>ELARIA</h1>
              <p>Fashion & Lifestyle</p>
              <p>Phone: +91 9876543210</p>
            </div>
            <div class="invoice-info">
              <p><strong>Invoice #</strong> ${invoiceNo}</p>
              <p><strong>Date</strong> ${date}</p>
              <p><strong>Type</strong> ${bill.type}</p>
            </div>
          </div>
          <div class="customer">
            <p><strong>Name:</strong> ${bill.customer.name}</p>
            <p><strong>Phone:</strong> ${bill.customer.phone}</p>
            <p><strong>Payment:</strong> ${bill.payment.method}</p>
            ${paymentHtml}
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Discount</th>
                <th>GST</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="summary">
            <table>
              <tr>
                <td>Total Items</td>
                <td class="right">${bill.items.length}</td>
              </tr>
              <tr>
                <td>Grand Total</td>
                <td class="right">₹${total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          <div class="footer">
            <p>Thank you for shopping with ELARIA</p>
            <p> NO REFUND </p>
            <p>please return before 7 days </p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
    </html>
    `);

    win.document.close();
  };

  /* ---------- SAVE ---------- */
  const handleSave = () => {
    if (!validateForm()) return;

    const summary = calculateBill(items);
    const bill = {
      customer,
      items,
      summary,
      payment,
      createdAt: new Date(),
      type: isReturn ? "RETURN" : "SALE"
    };

    addBill(bill);
    printInvoice(bill);

    setCustomer({ name: "", phone: "" });
    setItems([getDefaultItem()]);
    setPayment({ method: "CASH", cash: 0, bank: 0 });
    setErrors({});
  };

  /* ---------- UI ---------- */
  const totalAmount = calculateBill(items).total;

  return (
    <div className="create-bill">
      <h2>{isReturn ? "Return Bill" : "Create Bill"}</h2>

      {isReturn && (
        <div className="return-banner">
          <TbTruckReturn />
          <br />
          Return bill – modify items and save
        </div>
      )}

      <section className="card small">
        <label>Customer Name</label>
        <input
          value={customer.name}
          onChange={e =>
            setCustomer({ ...customer, name: e.target.value })
          }
        />
        {errors.customerName && (
          <small className="error">{errors.customerName}</small>
        )}

        <label>Phone</label>
        <input
          value={customer.phone}
          onChange={e =>
            setCustomer({ ...customer, phone: e.target.value })
          }
        />
        {errors.customerPhone && (
          <small className="error">{errors.customerPhone}</small>
        )}
      </section>

      <section className="card">
        <table className="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Discount</th>
              <th>GST%</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <BillItemRow
                key={item.tempId}
                item={item}
                index={index}
                onChange={updateItem}
                onRemove={removeItem}
                productOptions={products}
                error={errors}
              />
            ))}
          </tbody>
        </table>

        <button className="btn" onClick={addItem}>
          Add Item
        </button>
      </section>

      {/* Payment Section */}
      <section className="card small">
        <label>Payment Method</label>
        <select value={payment.method} onChange={handlePaymentMethodChange}>
          <option value="CASH">Cash</option>
          <option value="BANK">Bank</option>
          <option value="SPLIT">Split (Cash + Bank)</option>
        </select>

        {payment.method === "SPLIT" && (
          <div className="split-payment">
            <label>Cash</label>
            <input
              type="number"
              value={payment.cash}
              max={totalAmount}
              onChange={e => handlePaymentChange("cash", e.target.value)}
            />
            <label>Bank</label>
            <input
              type="number"
              value={payment.bank}
              max={totalAmount}
              onChange={e => handlePaymentChange("bank", e.target.value)}
            />
            {errors.payment && <small className="error">{errors.payment}</small>}
            <small>Total must equal ₹{totalAmount.toFixed(2)}</small>
          </div>
        )}
      </section>

      <button
        className="btn primary"
        disabled={!isFormValid()}
        onClick={handleSave}
      >
        {isReturn ? "Process Return" : "Save & Print"}
      </button>
    </div>
  );
}
