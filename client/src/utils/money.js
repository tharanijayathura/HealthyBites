export const money = value => `Rs. ${Number(value || 0).toLocaleString('en-LK')}`;
