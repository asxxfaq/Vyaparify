import { MdDelete } from "react-icons/md";

export default function BillItemRow({
  item,
  index,
  onChange,
  onRemove,
  productOptions,
  error
}) {
  const selectedProduct = productOptions.find(
    p => p.id === item.productId
  );

  const handleProductChange = (e) => {
    const productId = e.target.value;
    const product = productOptions.find(p => p.id === productId);

    if (!product) {
      onChange({ ...item, productId: "", productCode: "" });
      return;
    }

    onChange({
      ...item,
      productId: product.id,
      productCode: product.productCode, // ✅ ADD CODE
      name: product.name,
      price: product.price,
      gst: product.gst || 0
    });
  };

  return (
    <tr>
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

          <select value={item.productId} onChange={handleProductChange}>
            <option value="">Select product</option>
            {productOptions.map(p => (
              <option key={p.id} value={p.id}>
                {p.productCode} — {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* PRODUCT CODE DISPLAY */}
        {item.productCode && (
          <small className="muted-text">
            Code: {item.productCode}
          </small>
        )}

        {error[`product-${index}`] && (
          <p className="error-text">{error[`product-${index}`]}</p>
        )}
      </td>

      {/* QTY */}
      <td>
        <input
          type="number"
          min="1"
          value={item.qty}
          onChange={e =>
            onChange({ ...item, qty: Number(e.target.value) })
          }
        />
        {error[`qty-${index}`] && (
          <p className="error-text">{error[`qty-${index}`]}</p>
        )}
      </td>

      {/* PRICE */}
      <td>
        <input
          type="number"
          value={item.price}
          onChange={e =>
            onChange({ ...item, price: Number(e.target.value) })
          }
        />
        {error[`price-${index}`] && (
          <p className="error-text">{error[`price-${index}`]}</p>
        )}
      </td>

      {/* DISCOUNT */}
      <td>
        <input
          type="number"
          value={item.discount}
          onChange={e =>
            onChange({ ...item, discount: Number(e.target.value) })
          }
        />
      </td>

      {/* GST */}
      <td>
        <input
          type="number"
          value={item.gst}
          onChange={e =>
            onChange({ ...item, gst: Number(e.target.value) })
          }
        />
        {error[`gst-${index}`] && (
          <p className="error-text">{error[`gst-${index}`]}</p>
        )}
      </td>

      {/* DELETE */}
      <td>
        <button className="icon-btn" onClick={() => onRemove(item.tempId)}>
          <MdDelete />
        </button>
      </td>
    </tr>
  );
}
