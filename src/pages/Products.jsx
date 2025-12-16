import React, { useState } from "react";
import { useBill } from "../context/BillContext";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import "./Products.css";

export default function Products() {
  const { products, addProduct, updateProduct, removeProduct } = useBill();

  const [form, setForm] = useState({
    id: null,
    productCode: "",
    name: "",
    price: "",
    gst: 0,
    image: ""
  });

  const [errors, setErrors] = useState({});
  const [scanOpen, setScanOpen] = useState(false);

  /* ==============================
     AUTO GENERATE PRODUCT CODE
  ============================== */
  const generateProductCode = () => {
    if (!products.length) return "PRD-0001";

    const last = products
      .map(p => p.productCode)
      .filter(Boolean)
      .sort()
      .pop();

    const num = parseInt(last.split("-")[1], 10) + 1;
    return `PRD-${String(num).padStart(4, "0")}`;
  };

  /* ==============================
     IMAGE UPLOAD
  ============================== */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, image: "Only image files allowed" }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, image: reader.result }));
      setErrors(prev => ({ ...prev, image: null }));
    };
    reader.readAsDataURL(file);
  };

  /* ==============================
     FORM VALIDATION
  ============================== */
  const validateForm = () => {
    const newErrors = {};

    if (form.productCode && !/^[A-Z0-9\-]{3,20}$/.test(form.productCode)) {
      newErrors.productCode = "Invalid product code format";
    }

    if (!/^[a-zA-Z0-9\s\-]{3,50}$/.test(form.name)) {
      newErrors.name = "Product name must be at least 3 characters";
    }

    if (!/^\d+(\.\d{1,2})?$/.test(form.price)) {
      newErrors.price = "Enter valid price (up to 2 decimals)";
    }

    if (!/^(0|[1-9]\d?|100)$/.test(form.gst)) {
      newErrors.gst = "GST must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ==============================
     SUBMIT
  ============================== */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...form,
      productCode: form.productCode || generateProductCode(),
      price: Number(form.price),
      gst: Number(form.gst)
    };

    const duplicate = products.find(
      p => p.productCode === payload.productCode && p.id !== form.id
    );

    if (duplicate) {
      alert("Product code already exists!");
      return;
    }

    form.id ? updateProduct(payload) : addProduct(payload);

    setForm({
      id: null,
      productCode: "",
      name: "",
      price: "",
      gst: 0,
      image: ""
    });
    setErrors({});
  };

  const editProduct = (p) => {
    setForm(p);
    setErrors({});
  };

  return (
    <div>
      <h2>Products</h2>

      {/* FORM */}
      <form className="card small" onSubmit={handleSubmit}>
        <label>Product Code</label>
        <input
          value={form.productCode}
          placeholder="Auto-generated"
          readOnly={!form.id}
        />
        {errors.productCode && <small className="error">{errors.productCode}</small>}

        <button
          type="button"
          className="btn small"
          onClick={() => setScanOpen(!scanOpen)}
        >
          {scanOpen ? "Close Scanner" : "Scan Barcode"}
        </button>

        {scanOpen && (
          <div style={{ marginTop: 10 }}>
            <BarcodeScannerComponent
              width={300}
              height={200}
              onUpdate={(err, result) => {
                if (result) {
                  setForm(prev => ({
                    ...prev,
                    productCode: result.text
                  }));
                  setScanOpen(false);
                }
              }}
            />
          </div>
        )}

        <label>Product Name</label>
        <input
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <small className="error">{errors.name}</small>}

        <label>Price</label>
        <input
          type="number"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
        />
        {errors.price && <small className="error">{errors.price}</small>}

        <label>GST %</label>
        <input
          type="number"
          value={form.gst}
          onChange={e => setForm({ ...form, gst: e.target.value })}
        />
        {errors.gst && <small className="error">{errors.gst}</small>}

        <label>Product Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {errors.image && <small className="error">{errors.image}</small>}

        {form.image && (
          <img
            src={form.image}
            alt="preview"
            style={{ width: 80, marginTop: 10, borderRadius: 6 }}
          />
        )}

        <button className="btn">
          {form.id ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* LIST */}
      <section className="card">
        <h3>Existing Products</h3>

        <table className="history-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Code</th>
              <th>Name</th>
              <th>Price</th>
              <th>GST</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ width: 50, height: 50, objectFit: "cover" }}
                    />
                  )}
                </td>
                <td>{p.productCode}</td>
                <td>{p.name}</td>
                <td>₹{p.price}</td>
                <td>{p.gst}%</td>
                <td>
                  <button className="btn small" onClick={() => editProduct(p)}>
                    Edit
                  </button>
                  <button
                    className="btn small danger"
                    onClick={() => removeProduct(p.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
