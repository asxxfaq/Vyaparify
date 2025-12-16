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

  const [errors, setErrors] = useState({});

  /* ---------- ITEM HANDLERS ---------- */
  const addItem = () => setItems(prev => [...prev, getDefaultItem()]);

  const removeItem = tempId =>
    setItems(prev => prev.filter(i => i.tempId !== tempId));

  const updateItem = updated =>
    setItems(prev =>
      prev.map(i => (i.tempId === updated.tempId ? updated : i))
    );

  /* ---------- VALIDATION ---------- */
  const isFormValid = () => {
    if (!nameRegex.test(customer.name)) return false;
    if (!phoneRegex.test(customer.phone)) return false;
    if (!items.length) return false;

    return items.every(
      i =>
        i.productId &&
        i.qty > 0 &&
        i.price >= 0 &&
        i.gst >= 0 &&
        i.gst <= 28
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!nameRegex.test(customer.name))
      newErrors.name = "Enter valid name";

    if (!phoneRegex.test(customer.phone))
      newErrors.phone = "Enter valid phone number";

    items.forEach((item, index) => {
      if (!item.productId) newErrors[`product-${index}`] = "Select product";
      if (item.qty <= 0) newErrors[`qty-${index}`] = "Invalid qty";
      if (item.price < 0) newErrors[`price-${index}`] = "Invalid price";
      if (item.gst < 0 || item.gst > 28)
        newErrors[`gst-${index}`] = "GST 0–28%";
    });

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
    const win = window.open("", "_blank");
    if (!win) return;

    const rows = bill.items
      .map(
        i => `
        <tr>
          <td>${i.name}</td>
          <td>${i.qty}</td>
          <td>₹${i.price.toFixed(2)}</td>
          <td>₹${i.discount.toFixed(2)}</td>
          <td>${i.gst}%</td>
          <td>₹${(
            (i.price * i.qty - i.discount) *
            (1 + i.gst / 100)
          ).toFixed(2)}</td>
        </tr>`
      )
      .join("");

    win.document.write(`
      <html>
        <head>
          <title>ELARIA Invoice</title>
          <style>
            body { font-family: Arial; padding: 24px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #333; padding: 8px; }
            th { background: #f4f4f4; }
          </style>
        </head>
        <body>
          <h1>ELARIA</h1>
          <p><b>Invoice No:</b> ${invoiceNo}</p>
          <p><b>Date:</b> ${date}</p>
          <p><b>Customer:</b> ${bill.customer.name}</p>
          <p><b>Phone:</b> ${bill.customer.phone}</p>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Discount</th>
                <th>GST%</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr>
                <td colspan="5"><b>Grand Total</b></td>
                <td><b>₹${bill.summary.total.toFixed(2)}</b></td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `);

    win.document.close();
    win.print();
  };

  /* ---------- SAVE ---------- */
  const handleSave = () => {
    if (!validateForm()) return;

    const summary = calculateBill(items);
    const bill = {
      customer,
      items,
      summary,
      createdAt: new Date(),
      type: isReturn ? "RETURN" : "SALE"
    };
    
    addBill(bill);
    printInvoice(bill);

    setCustomer({ name: "", phone: "" });
    setItems([getDefaultItem()]);
    setErrors({});
  };

  /* ---------- UI ---------- */
  return (
    <div className="create-bill">
      <h2>{isReturn ? "Return Bill" : "Create Bill"}</h2>

      {isReturn && (
        <div className="return-banner">
          <TbTruckReturn /> <br />
               Return bill – modify items and save
        </div>
      )}

      <section className="card small">
        <label>Customer Name</label>
        <input
          value={customer.name}
          onChange={e => setCustomer({ ...customer, name: e.target.value })}
        />

        <label>Phone</label>
        <input
          value={customer.phone}
          onChange={e => setCustomer({ ...customer, phone: e.target.value })}
        />
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
