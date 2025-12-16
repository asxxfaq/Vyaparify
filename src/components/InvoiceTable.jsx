import React from 'react';
import { calculateLineItem } from '../utils/calculateBill';


export default function InvoiceTable({ items }) {
return (
<table className="invoice-table">
<thead>
<tr>
<th>Item</th>
<th>Qty</th>
<th>Price</th>
<th>Discount</th>
<th>GST</th>
<th>Line Total</th>
</tr>
</thead>
<tbody>
{items.map((it, idx) => {
const { total } = calculateLineItem(it);
return (
<tr key={it.tempId || idx}>
<td>{it.name || '—'}</td>
<td>{it.qty}</td>
<td>{Number(it.price).toFixed(2)}</td>
<td>{Number(it.discount || 0).toFixed(2)}</td>
<td>{it.gst}%</td>
<td>{Number(total).toFixed(2)}</td>
</tr>
);
})}
</tbody>
</table>
);
}