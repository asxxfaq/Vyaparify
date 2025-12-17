import React, { useMemo } from "react";
import { useBill } from "../context/BillContext";
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiBarChart2, 
  FiClock, 
  FiPackage, 
  FiCreditCard, 
  FiAlertCircle, 
  FiShoppingCart 
} from "react-icons/fi";
import "./Dashboard.css";

export default function Dashboard() {
  const { bills, products } = useBill();
  const today = new Date();

  const isToday = d => {
    const x = new Date(d);
    return (
      x.getFullYear() === today.getFullYear() &&
      x.getMonth() === today.getMonth() &&
      x.getDate() === today.getDate()
    );
  };

  const isThisMonth = d => {
    const x = new Date(d);
    return (
      x.getFullYear() === today.getFullYear() &&
      x.getMonth() === today.getMonth()
    );
  };

  const todaysBills = useMemo(
    () => bills.filter(b => isToday(b.createdAt)),
    [bills]
  );

  const monthBills = useMemo(
    () => bills.filter(b => isThisMonth(b.createdAt)),
    [bills]
  );

  const calcTotals = arr =>
    arr.reduce(
      (a, b) => {
        const amt = b.summary?.total || 0;
        b.type === "RETURN" ? (a.returns += amt) : (a.sales += amt);
        return a;
      },
      { sales: 0, returns: 0 }
    );

  const todayTotals = calcTotals(todaysBills);
  const monthTotals = calcTotals(monthBills);

  const netToday = todayTotals.sales - todayTotals.returns;
  const netMonth = monthTotals.sales - monthTotals.returns;

  const returnRate = monthTotals.sales
    ? ((monthTotals.returns / monthTotals.sales) * 100).toFixed(2)
    : 0;

  const avgBill = monthBills.length ? netMonth / monthBills.length : 0;

  const peakHour = useMemo(() => {
    const hours = {};
    todaysBills.forEach(b => {
      if (b.type === "RETURN") return;
      const h = new Date(b.createdAt).getHours();
      hours[h] = (hours[h] || 0) + b.summary.total;
    });
    return Object.entries(hours).sort((a, b) => b[1] - a[1])[0]?.[0];
  }, [todaysBills]);

  const topProducts = useMemo(() => {
    const map = {};
    monthBills.forEach(b =>
      b.items.forEach(i => {
        map[i.productCode] ??= { name: i.name, qty: 0, value: 0 };
        map[i.productCode].qty += i.qty;
        map[i.productCode].value += i.qty * i.price;
      })
    );
    return Object.entries(map)
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 5);
  }, [monthBills]);

  //  PAYMENT SPLIT
  const paymentSplit = useMemo(() => {
    const map = { CASH: 0, BANK: 0 };
  
    monthBills.forEach(b => {
      if (!b.payment) return;
  
      const sign = b.type === "RETURN" ? -1 : 1;
      const total = b.summary?.total || 0;
  
      const method = b.payment.method;
      const cash = Number(b.payment.cash || 0);
      const bank = Number(b.payment.bank || 0);
  
      // ✅ SPLIT payment
      if (method === "SPLIT") {
        map.CASH += sign * cash;
        map.BANK += sign * bank;
      }
      // ✅ CASH only (amount is TOTAL)
      else if (method === "CASH") {
        map.CASH += sign * total;
      }
      // ✅ BANK only (amount is TOTAL)
      else if (method === "BANK") {
        map.BANK += sign * total;
      }
    });
  
    return map;
  }, [monthBills]);
  
  
  

  const mostReturnedProduct = useMemo(() => {
    const map = {};
    bills
      .filter(b => b.type === "RETURN")
      .forEach(b =>
        b.items.forEach(i => {
          map[i.productCode] = (map[i.productCode] || 0) + i.qty;
        })
      );
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0];
  }, [bills]);

  const profit = useMemo(() => {
    return monthBills.reduce((sum, b) => {
      return (
        sum +
        b.items.reduce((s, i) => {
          const p = products.find(x => x.id === i.productId);
          if (!p?.costPrice) return s;
          return s + (i.price - p.costPrice) * i.qty;
        }, 0)
      );
    }, 0);
  }, [monthBills, products]);

  const lowStock = products.filter(p => p.stock <= 5);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="cards">
        <Card icon={<FiDollarSign />} title="Today Sales" value={`₹${todayTotals.sales.toFixed(2)}`} />
        <Card icon={<FiTrendingUp />} title="Today Returns" value={`₹${todayTotals.returns.toFixed(2)}`} />
        <Card icon={<FiBarChart2 />} title="Net Today" value={`₹${netToday.toFixed(2)}`} />
        <Card icon={<FiDollarSign />} title="Month Net Sales" value={`₹${netMonth.toFixed(2)}`} />
        <Card icon={<FiAlertCircle />} title="Return Rate" value={`${returnRate}%`} />
        <Card icon={<FiClock />} title="Peak Hour" value={peakHour ? `${peakHour}:00` : "-"} />
        <Card icon={<FiDollarSign />} title="Cash Collected" value={`₹${paymentSplit.CASH.toFixed(2)}`} />
        <Card icon={<FiCreditCard />} title="Bank Collected" value={`₹${paymentSplit.BANK.toFixed(2)}`} />
      </div>

      
<section className="card">
  <h3>Top Products (Month)</h3>
  {topProducts.length ? (
    topProducts.map(([code, p]) => (
      <p key={code}>
        <strong>{p.name}</strong> — {p.qty} sold 
      </p>
    ))
  ) : (
    <p>No sales data</p>
  )}
</section>


<section className="card">
  <h3>Most Returned Product</h3>
  {mostReturnedProduct ? (
    <p>
      <strong>{products.find(p => p.id === mostReturnedProduct)?.name || mostReturnedProduct}</strong> —{" "}
      {bills
        .filter(b => b.type === "RETURN")
        .flatMap(b => b.items)
        .filter(i => i.productId === mostReturnedProduct)
        .reduce((sum, i) => sum + i.qty, 0)} returned
    </p>
  ) : (
    <p>None</p>
  )}
</section>

      <section className="card">
        <h3>Payment Modes (Month)</h3>
        {Object.entries(paymentSplit).map(([m, v]) => (
          <p key={m}>
            {m}: ₹{v.toFixed(2)}
          </p>
        ))}
      </section>

      <section className="card">
        <h3>Alerts</h3>
        <p>Most Returned Product: {mostReturnedProduct || "None"}</p>
        <p>Low Stock Items: {lowStock.length}</p>
      </section>
    </div>
  );
}

function Card({ icon, title, value }) {
  return (
    <div className="card">
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h4>{title}</h4>
        <p>{value}</p>
      </div>
    </div>
  );
}
