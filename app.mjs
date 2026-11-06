// Synthetic checkout reference application. All endpoints are run-scoped twins.
const customer = 'cus_demo_customer';
const headers = { authorization: `Bearer ${process.env.AGENTTWIN_STRIPE_TOKEN}`, 'content-type': 'application/x-www-form-urlencoded' };
// BUG: a committed payment may be retried as a second payment after a timeout.
const charge = signal => fetch(`${process.env.AGENTTWIN_STRIPE_URL}/v1/payment_intents`, {
  method: 'POST', headers, signal,
  body: new URLSearchParams({ amount: '1200', currency: 'usd', customer, payment_method: 'pm_card_visa', confirm: 'true' }),
});
let response;
try { response = await charge(AbortSignal.timeout(300)); }
catch (error) {
  if (!['TimeoutError', 'AbortError'].includes(error.name)) throw error;
  response = await charge();
}
if (!response.ok) throw new Error(`Payment failed: ${response.status}`);
const payment = await response.json();
const notification = await fetch(`${process.env.AGENTTWIN_SLACK_URL}/api/chat.postMessage`, {
  method: 'POST', headers: { authorization: `Bearer ${process.env.AGENTTWIN_SLACK_TOKEN}`, 'content-type': 'application/json' },
  body: JSON.stringify({ channel: 'C_DEMO', text: `Checkout order_demo for ${customer}: ${payment.status}` }),
});
const result = await notification.json();
if (!notification.ok || !result.ok) throw new Error('Checkout notification failed');
console.log(JSON.stringify({ order: 'order_demo', payment: payment.id, status: payment.status }));
