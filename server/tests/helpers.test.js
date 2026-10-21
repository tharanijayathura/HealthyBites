import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { validateDeliveryDate } from '../src/utils/dates.js';
import { buildWhatsAppMessage } from '../src/utils/whatsapp.js';

test('reject a weekday/date mismatch', () => {
  assert.equal(validateDeliveryDate('2026-10-26', 'Tuesday'), false);
});

test('reject malformed dates', () => {
  assert.equal(validateDeliveryDate('2026-02-31', 'Tuesday'), false);
  assert.equal(validateDeliveryDate('tomorrow', 'Monday'), false);
});

test('WhatsApp template includes details and currency totals', () => {
  const message = buildWhatsAppMessage({
    code: 'HB-TEST',
    customer: { name: 'Sample Customer', phone: '0712345678', address: 'Colombo' },
    items: [{ name: 'Chicken Bowl', price: 1250, quantity: 2, deliveryDate: '2026-10-26' }],
    subtotal: 2500,
    deliveryFee: 100,
    total: 2600,
    notes: 'No sauce'
  });
  assert.match(message, /HB-TEST/);
  assert.match(message, /TOTAL: Rs\. 2,600/);
  assert.match(message, /No sauce/);
});

test('WhatsApp message formats pickup orders correctly with zero delivery fee', () => {
  const message = buildWhatsAppMessage({
    code: 'HB-PICKUP99',
    customer: {
      name: 'Amila Fernando',
      phone: '0779876543',
      orderType: 'pickup',
      deliveryTime: 'Lunch Slot (11:30 AM – 1:30 PM)'
    },
    items: [
      { name: 'Prime Seared Beef Steak', price: 1650, quantity: 1, deliveryDate: '2026-10-27' },
      { name: 'Signature Acai Bowl', price: 1150, quantity: 2, deliveryDate: '2026-10-27' }
    ],
    subtotal: 3950,
    deliveryFee: 0,
    total: 3950,
    notes: 'Please pack in eco bag'
  });

  assert.match(message, /HB-PICKUP99/);
  assert.match(message, /Order Type: Pickup/);
  assert.match(message, /Healy Bite Hub/);
  assert.match(message, /TOTAL: Rs\. 3,950/);
  assert.doesNotMatch(message, /Delivery Fee:/);
});

test('cart subtotal calculation logic', () => {
  const items = [
    { price: 1350, quantity: 2 },
    { price: 1850, quantity: 1 },
    { price: 950, quantity: 3 }
  ];
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 250;
  const total = subtotal + deliveryFee;

  assert.equal(subtotal, 7400);
  assert.equal(total, 7650);
});

test('admin JWT signature and verification', () => {
  const secret = 'super-secret-key-that-is-at-least-32-chars-long';
  const token = jwt.sign({ id: '654321654321654321654321', role: 'admin' }, secret, { expiresIn: '1h' });
  const decoded = jwt.verify(token, secret);
  assert.equal(decoded.id, '654321654321654321654321');
  assert.equal(decoded.role, 'admin');
});
