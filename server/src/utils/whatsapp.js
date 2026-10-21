export function buildWhatsAppMessage(order) {
  const isPickup = order.customer?.orderType === 'pickup';
  const lines = [
    'NEW ORDER — HEALY BITE',
    `Order ID: ${order.code}`,
    '',
    `Customer: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    order.customer.whatsappNumber && order.customer.whatsappNumber !== order.customer.phone ? `WhatsApp: ${order.customer.whatsappNumber}` : null,
    `Order Type: ${isPickup ? 'Pickup' : 'Delivery'}`,
    isPickup ? 'Pickup Location: Healy Bite Hub, Colombo 03' : `Delivery Address: ${order.customer.address}`,
    order.customer.deliveryTime ? `Preferred Time: ${order.customer.deliveryTime}` : null,
    '',
    'ORDER ITEMS'
  ].filter(Boolean);

  // Group items by delivery date
  const dateGroups = {};
  for (const item of order.items) {
    if (!dateGroups[item.deliveryDate]) {
      dateGroups[item.deliveryDate] = [];
    }
    dateGroups[item.deliveryDate].push(item);
  }

  for (const [date, items] of Object.entries(dateGroups)) {
    let formattedDate = date;
    try {
      formattedDate = new Intl.DateTimeFormat('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
      }).format(new Date(`${date}T00:00:00Z`));
    } catch {
      formattedDate = date;
    }

    lines.push(`📅 ${formattedDate}`);
    for (const item of items) {
      const itemSubtotal = item.quantity * item.price;
      lines.push(`${item.quantity} × ${item.name}`);
      lines.push(`Unit Price: Rs. ${item.price.toLocaleString('en-LK')}`);
      lines.push(`Subtotal: Rs. ${itemSubtotal.toLocaleString('en-LK')}`);
    }
    lines.push('');
  }

  if (order.subtotal !== undefined) {
    lines.push(`Subtotal: Rs. ${order.subtotal.toLocaleString('en-LK')}`);
  }
  if (order.deliveryFee !== undefined && order.deliveryFee > 0) {
    lines.push(`Delivery Fee: Rs. ${order.deliveryFee.toLocaleString('en-LK')}`);
  }
  lines.push(`TOTAL: Rs. ${order.total.toLocaleString('en-LK')}`);

  if (order.notes) {
    lines.push(`Special Instructions: ${order.notes}`);
  }

  lines.push('', 'Thank you for choosing Healy Bite! Please confirm my order.');
  return lines.join('\n');
}
