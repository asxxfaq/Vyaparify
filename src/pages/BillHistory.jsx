import React from "react";
import { useNavigate } from "react-router-dom";
import { useBill } from "../context/BillContext";
import "./BillHistory.css";

export default function BillHistory() {
  const { bills, removeBill } = useBill();
  const navigate = useNavigate();

  const isReturnAllowed = createdAt => {
    const billDate = new Date(createdAt);
    const today = new Date();
    const diffDays = (today - billDate) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  const handleReturn = bill => {
    navigate("/create", {
      state: {
        bill,
        returnBill: true
      }
    });
  };

  return (
    <div>
      <h2>Bill History</h2>

      {bills.length === 0 ? (
        <p>No bills yet.</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {bills.map((b, idx) => (
              <React.Fragment key={b.id}>
                {/* ================= MAIN BILL ROW ================= */}
                <tr className={b.type === "RETURN" ? "returned-bill-row" : ""}>
                  <td>{idx + 1}</td>
                  <td>{b.customer?.name || "Walk-in"}</td>
                  <td>{new Date(b.createdAt).toLocaleString()}</td>
                  <td>
                    ₹{b.summary.total.toFixed(2)}
                    {b.type === "RETURN" && (
                      <span className="return-badge">RETURNED</span>
                    )}
                  </td>

                  <td>
                    {b.type !== "RETURN" &&
                      isReturnAllowed(b.createdAt) && (
                        <button
                          className="btn small warning"
                          onClick={() => handleReturn(b)}
                        >
                          Return
                        </button>
                      )}

                    <button
                      className="btn small danger"
                      onClick={() => removeBill(b.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>

                {/* ================= PRODUCT DETAILS ================= */}
                <tr className="bill-products-row">
                  <td colSpan="5">
                    <table className="inner-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>GST</th>
                        </tr>
                      </thead>

                      <tbody>
                        {b.items.map((item, i) => (
                          <tr
                            key={i}
                            className={
                              b.type === "RETURN"
                                ? "returned-product-row"
                                : ""
                            }
                          >
                            <td>{item.productCode}</td>
                            <td>
                              {item.name}
                              {b.type === "RETURN" && (
                                <span className="returned-text">
                                  {" "}
                                  (Returned)
                                </span>
                              )}
                            </td>
                            <td>{item.qty}</td>
                            <td>₹{item.price}</td>
                            <td>{item.gst}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
