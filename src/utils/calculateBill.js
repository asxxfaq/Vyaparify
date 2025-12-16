export function calculateLineItem({ price = 0, qty = 1, discount = 0, gst = 0 }) {
    const amount = Number(price) * Number(qty);
    const afterDiscount = amount - (Number(discount) || 0);
    const tax = (Number(gst) || 0) / 100 * afterDiscount;
    const total = afterDiscount + tax;
    return { amount, afterDiscount, tax, total };
    }
    
    
    export function calculateBill(items = []) {
    const summary = items.reduce(
    (acc, it) => {
    const { amount, afterDiscount, tax, total } = calculateLineItem(it);
    acc.subtotal += amount;
    acc.discount += amount - afterDiscount;
    acc.tax += tax;
    acc.total += total;
    return acc;
    },
    { subtotal: 0, discount: 0, tax: 0, total: 0 }
    );
    return summary;
    }