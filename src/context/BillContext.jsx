import React, { createContext, useContext, useEffect, useState } from "react";
import { sampleProducts } from "../utils/sampleData";

const BillContext = createContext(null);

export function BillProvider({ children }) {
  /* -------------------- PRODUCTS -------------------- */
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("vy_products");
    return saved ? JSON.parse(saved) : sampleProducts;
  });

  // Persist only custom products (not sampleProducts) in localStorage
  useEffect(() => {
    const customProducts = products.filter(p => !sampleProducts.find(sp => sp.id === p.id));
    localStorage.setItem("vy_products", JSON.stringify(customProducts));
  }, [products]);

  function addProduct(product) {
    setProducts(prev => [
      ...prev,
      { ...product, id: Date.now().toString() } // unique id
    ]);
  }

  function updateProduct(updated) {
    setProducts(prev =>
      prev.map(p => (p.id === updated.id ? updated : p))
    );
  }

  function removeProduct(id) {
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  /* -------------------- BILLS -------------------- */
  const [bills, setBills] = useState(() => {
    const saved = localStorage.getItem("vy_bills");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("vy_bills", JSON.stringify(bills));
  }, [bills]);

  function addBill(bill) {
    const newBill = {
      ...bill,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setBills(prev => [newBill, ...prev]);
  }

  function removeBill(id) {
    setBills(prev => prev.filter(b => b.id !== id));
  }

  function clearBills() {
    setBills([]);
  }

  /* -------------------- CONTEXT VALUE -------------------- */
  const value = {
    // products
    products,
    addProduct,
    updateProduct,
    removeProduct,

    // bills
    bills,
    addBill,
    removeBill,
    clearBills
  };

  return (
    <BillContext.Provider value={value}>
      {children}
    </BillContext.Provider>
  );
}

export function useBill() {
  const context = useContext(BillContext);
  if (!context) {
    throw new Error("useBill must be used inside BillProvider");
  }
  return context;
}
