/**
 * Provider-agnostic payment port for tutor sessions.
 * No Easypaisa/JazzCash (or other) integration yet — adapters plug in later.
 * Never returns a fake "payment succeeded".
 */

function getProviderName() {
  const raw = String(process.env.PAYMENT_PROVIDER || "none").trim();
  return raw || "none";
}

function isProviderConfigured() {
  const name = getProviderName();
  if (!name || name === "none") {
    return false;
  }
  // A named provider still needs secrets before checkout/verify can work.
  const hasSecret = !!(
    process.env.PAYMENT_API_SECRET ||
    process.env.PAYMENT_WEBHOOK_SECRET ||
    process.env.PAYMENT_API_KEY
  );
  return hasSecret;
}

/**
 * @param {{ orderId: string, amount: number, currency: string, customerRef: string, returnUrl?: string }} _input
 */
async function createCheckout(_input) {
  if (!isProviderConfigured()) {
    return {
      configured: false,
      checkoutUrl: null,
      providerRef: "",
      message:
        "Payment provider is not configured yet. Session stays unpaid until a real provider verifies payment.",
    };
  }

  // Future: dispatch to easypaisa/jazzcash adapters by PAYMENT_PROVIDER.
  return {
    configured: false,
    checkoutUrl: null,
    providerRef: "",
    message:
      "Payment provider adapter is not implemented yet. No checkout URL available.",
  };
}

/**
 * Client return / poll verify. Must not mark paid without a real provider check.
 * @param {object} _payload
 */
async function verifyClientReturn(_payload) {
  return {
    verified: false,
    providerRef: "",
    meta: null,
    reason:
      "Payment provider is not configured. Cannot verify payment on the server.",
  };
}

/**
 * Webhook verify. Structure only — no fake success.
 * @param {import('express').Request} _req
 */
async function verifyWebhook(_req) {
  return {
    verified: false,
    providerRef: "",
    orderId: null,
    meta: null,
    reason:
      "Payment webhook provider is not configured. Ignoring unverified callback.",
  };
}

/**
 * @param {{ providerRef: string, amount: number }} _input
 */
async function refund(_input) {
  return {
    ok: false,
    reason: "Payment provider refund is not configured.",
  };
}

module.exports = {
  getProviderName,
  isProviderConfigured,
  createCheckout,
  verifyClientReturn,
  verifyWebhook,
  refund,
};
