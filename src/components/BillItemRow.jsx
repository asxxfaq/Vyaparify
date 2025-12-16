import { MdDelete } from "react-icons/md";

export default function BillItemRow({
  item,
  onChange,
  onRemove,
  productOptions,
  error
}) {
  const selectedProduct = productOptions.find(
    p => p.id === item.productId
  );

  /* ---------- PRODUCT CHANGE ---------- */
  const handleProductChange = (e) => {
    const productId = e.target.value;
    const product = productOptions.find(p => p.id === productId);

    if (!product) {
      onChange({
        ...item,
        productId: "",
        productCode: "",
        name: "",
        price: 0,
        gst: 0
      });
      return;
    }

    onChange({
      ...item,
      productId: product.id,
      productCode: product.productCode,
      name: product.name,
      price: Number(product.price),
      gst: Number(product.gst || 0)
    });
  };

  /* ---------- INPUT HELPERS ---------- */
  const numberValue = (val, fallback = 0) =>
    isNaN(val) ? fallback : Number(val);

  return (
    <tr className={error[`product-${item.tempId}`] ? "row-error" : ""}>
      {/* PRODUCT */}
      <td>
        <div className="product-select">
          {selectedProduct?.image && (
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="product-thumb"
            />
          )}

          <select
            value={item.productId}
            onChange={handleProductChange}
            className={error[`product-${item.tempId}`] ? "input-error" : ""}
          >
            <option value="">Select product</option>
            {productOptions.map(p => (
              <option key={p.id} value={p.id}>
                {p.productCode} — {p.name}
              </option>
            ))}
          </select>
        </div>

        {item.productCode && (
          <small className="muted-text">
            Code: {item.productCode}
          </small>
        )}

        {error[`product-${item.tempId}`] && (
          <small className="error-text">
            {error[`product-${item.tempId}`]}
          </small>
        )}
      </td>

      {/* QTY */}
      <td>
        <input
          type="number"
          min="1"
          value={item.qty}
          onChange={e =>
            onChange({
              ...item,
              qty: Math.max(1, numberValue(e.target.value, 1))
            })
          }
          className={error[`qty-${item.tempId}`] ? "input-error" : ""}
        />
        {error[`qty-${item.tempId}`] && (
          <small className="error-text">
            {error[`qty-${item.tempId}`]}
          </small>
        )}
      </td>

      {/* PRICE */}
      <td>
        <input
          type="number"
          min="0"
          step="0.01"
          value={item.price}
          onChange={e =>
            onChange({
              ...item,
              price: Math.max(0, numberValue(e.target.value))
            })
          }
          className={error[`price-${item.tempId}`] ? "input-error" : ""}
        />
        {error[`price-${item.tempId}`] && (
          <small className="error-text">
            {error[`price-${item.tempId}`]}
          </small>
        )}
      </td>

      {/* DISCOUNT */}
      <td>
        <input
          type="number"
          min="0"
          step="0.01"
          value={item.discount}
          onChange={e =>
            onChange({
              ...item,
              discount: Math.max(0, numberValue(e.target.value))
            })
          }
        />
      </td>

      {/* GST */}
      <td>
        <input
          type="number"
          min="0"
          max="28"
          value={item.gst}
          onChange={e =>
            onChange({
              ...item,
              gst: Math.min(
                28,
                Math.max(0, numberValue(e.target.value))
              )
            })
          }
          className={error[`gst-${item.tempId}`] ? "input-error" : ""}
        />
        {error[`gst-${item.tempId}`] && (
          <small className="error-text">
            {error[`gst-${item.tempId}`]}
          </small>
        )}
      </td>

      {/* DELETE */}
      <td>
        <button
          type="button"
          className="icon-btn"
          onClick={() => onRemove(item.tempId)}
        >
          <MdDelete />
        </button>
      </td>
    </tr>
  );
}
