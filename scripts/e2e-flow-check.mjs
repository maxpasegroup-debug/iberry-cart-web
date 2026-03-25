#!/usr/bin/env node
/**
 * E2E checklist: registration → login → cart → order → Razorpay verify → admin update.
 *
 * Prerequisites:
 *   - `npm run dev` (or `npm start`) running at BASE_URL (default http://localhost:3000)
 *   - MongoDB and server env (JWT_SECRET, ADMIN_BOOTSTRAP_*, RAZORPAY_* on the server)
 *
 * This script loads `.env.local` from the project root so it can sign Razorpay verify
 * using the same RAZORPAY_KEY_SECRET as the API.
 *
 * Usage:
 *   node scripts/e2e-flow-check.mjs
 *   BASE_URL=https://staging.example.com node scripts/e2e-flow-check.mjs
 */

import { createHmac, randomBytes } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

function loadEnvLocal() {
  const p = join(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  const content = readFileSync(p, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvLocal();

/** @type {Record<string, string>} */
function newJar() {
  return Object.create(null);
}

function mergeSetCookie(jar, response) {
  const list = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  for (const line of list) {
    const pair = line.split(";")[0];
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const name = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    jar[name] = value;
  }
}

function cookieHeader(jar) {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

function csrfTokenFromJar(jar) {
  return jar["iberry_csrf_token"] || "";
}

/**
 * @param {string} url
 * @param {Record<string, string>} jar
 * @param {RequestInit & { json?: unknown; skipCsrf?: boolean }} opts
 */
async function request(url, jar, opts = {}) {
  const { json: bodyJson, skipCsrf, headers: extra = {}, ...init } = opts;
  const method = (init.method || "GET").toUpperCase();
  const headers = { ...extra };

  const c = cookieHeader(jar);
  if (c) headers.Cookie = c;

  if (bodyJson !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(bodyJson);
  }

  const needsCsrf = !skipCsrf && ["POST", "PATCH", "DELETE", "PUT"].includes(method);
  if (needsCsrf) {
    const t = csrfTokenFromJar(jar);
    if (!t) throw new Error("Missing CSRF token in jar — call fetchCsrf() first");
    headers["x-csrf-token"] = t;
  }

  const res = await fetch(url, { ...init, method, headers });
  mergeSetCookie(jar, res);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { _raw: text };
  }
  return { res, data };
}

async function fetchCsrf(jar) {
  const { res, data } = await request(`${BASE}/api/auth/csrf`, jar, { method: "GET", skipCsrf: true });
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `CSRF failed (${res.status})`);
  }
  return data.data.csrfToken;
}

function logStep(num, name, status, detail) {
  const icon = status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "—";
  const line = `[${icon}] ${num}. ${name}`;
  if (detail) console.log(line, "—", detail);
  else console.log(line);
}

function signRazorpay(razorpayOrderId, razorpayPaymentId, secret) {
  return createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
}

const address = {
  fullName: "Flow Test User",
  phone: "9876543210",
  line1: "1 Test Street",
  line2: "Near Checklist",
  city: "Bengaluru",
  state: "Karnataka",
  postalCode: "560001",
  country: "India",
};

async function main() {
  console.log("\n=== iBerryCart E2E flow checklist ===\n");
  console.log("BASE_URL:", BASE, "\n");

  const results = { pass: 0, fail: 0 };

  const customerJar = newJar();
  const adminJar = newJar();

  const email = `flow-test-${Date.now()}@example.test`;
  const password = "FlowTest@123456789";
  const name = "Flow Test";

  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  /** @type {string} */
  let orderId;
  /** @type {string} */
  let razorpayOrderId;

  try {
    // 1. Registration
    await fetchCsrf(customerJar);
    const reg = await request(
      `${BASE}/api/auth/register`,
      customerJar,
      {
        method: "POST",
        json: { name, email, password },
      },
    );
    if (!reg.res.ok || !reg.data?.ok) {
      throw new Error(reg.data?.error || `Register HTTP ${reg.res.status}`);
    }
    results.pass++;
    logStep(1, "User registration", "PASS", email);
  } catch (e) {
    results.fail++;
    logStep(1, "User registration", "FAIL", String(e));
    throw e;
  }

  try {
    // 2. Login (logout then login to exercise both paths)
    await request(`${BASE}/api/auth/logout`, customerJar, { method: "POST" });
    await fetchCsrf(customerJar);
    const login = await request(`${BASE}/api/auth/login`, customerJar, {
      method: "POST",
      json: { email, password },
    });
    if (!login.res.ok || !login.data?.ok) {
      throw new Error(login.data?.error || `Login HTTP ${login.res.status}`);
    }
    results.pass++;
    logStep(2, "Login", "PASS", login.data.data?.email || email);
  } catch (e) {
    results.fail++;
    logStep(2, "Login", "FAIL", String(e));
    throw e;
  }

  try {
    // 3. Add to cart
    await fetchCsrf(customerJar);
    const productsRes = await request(`${BASE}/api/products`, customerJar, { method: "GET", skipCsrf: true });
    if (!productsRes.res.ok || !productsRes.data?.ok) {
      throw new Error(productsRes.data?.error || "Failed to list products");
    }
    const products = productsRes.data.data;
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("No products in DB — seed at least one product with stock before running this script.");
    }
    const product = products.find((p) => p.stock >= 1) || products[0];
    if (product.stock < 1) {
      throw new Error("No in-stock product available for this test.");
    }

    const cartAdd = await request(`${BASE}/api/cart`, customerJar, {
      method: "POST",
      json: { productId: product._id, quantity: 1 },
    });
    if (!cartAdd.res.ok || !cartAdd.data?.ok) {
      throw new Error(cartAdd.data?.error || `Add to cart HTTP ${cartAdd.res.status}`);
    }
    results.pass++;
    logStep(3, "Add to cart", "PASS", `product: ${product.name} (${product._id})`);
  } catch (e) {
    results.fail++;
    logStep(3, "Add to cart", "FAIL", String(e));
    throw e;
  }

  try {
    // 4. Checkout — create order
    await fetchCsrf(customerJar);
    const orderRes = await request(`${BASE}/api/orders`, customerJar, {
      method: "POST",
      json: { address },
    });
    if (!orderRes.res.ok || !orderRes.data?.ok) {
      throw new Error(orderRes.data?.error || `Create order HTTP ${orderRes.res.status}`);
    }
    orderId = orderRes.data.data._id;
    const orderNumber = orderRes.data.data.orderNumber;
    results.pass++;
    logStep(4, "Checkout (order created)", "PASS", orderNumber);
  } catch (e) {
    results.fail++;
    logStep(4, "Checkout (order created)", "FAIL", String(e));
    throw e;
  }

  try {
    // 5. Razorpay — create payment order + verify
    if (!razorpaySecret) {
      throw new Error("RAZORPAY_KEY_SECRET not set (load .env.local or export it) — cannot simulate payment verify.");
    }
    await fetchCsrf(customerJar);
    const payCreate = await request(`${BASE}/api/payment/create-order`, customerJar, {
      method: "POST",
      json: { orderId },
    });
    if (!payCreate.res.ok || !payCreate.data?.ok) {
      throw new Error(payCreate.data?.error || `Payment create HTTP ${payCreate.res.status}`);
    }
    razorpayOrderId = payCreate.data.data.razorpayOrderId;
    const paymentId = `pay_${randomBytes(8).toString("hex")}`;
    const signature = signRazorpay(razorpayOrderId, paymentId, razorpaySecret);

    await fetchCsrf(customerJar);
    const verify = await request(`${BASE}/api/payment/verify`, customerJar, {
      method: "POST",
      json: {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      },
    });
    if (!verify.res.ok || !verify.data?.ok) {
      throw new Error(verify.data?.error || `Payment verify HTTP ${verify.res.status}`);
    }
    results.pass++;
    logStep(5, "Razorpay payment (create + verify)", "PASS", razorpayOrderId);
  } catch (e) {
    results.fail++;
    logStep(5, "Razorpay payment (create + verify)", "FAIL", String(e));
    throw e;
  }

  try {
    // 6. Order creation / paid state
    await fetchCsrf(customerJar);
    const ordersList = await request(`${BASE}/api/orders`, customerJar, { method: "GET", skipCsrf: true });
    if (!ordersList.res.ok || !ordersList.data?.ok) {
      throw new Error(ordersList.data?.error || "Failed to list orders");
    }
    const orders = ordersList.data.data;
    const mine = orders.find((o) => String(o._id) === String(orderId));
    if (!mine) {
      throw new Error("Order not found in GET /api/orders");
    }
    if (mine.paymentStatus !== "paid") {
      throw new Error(`Expected paymentStatus paid, got ${mine.paymentStatus}`);
    }
    results.pass++;
    logStep(6, "Order paid (confirmed via API)", "PASS", `status=${mine.status}, paymentStatus=${mine.paymentStatus}`);
  } catch (e) {
    results.fail++;
    logStep(6, "Order paid (confirmed via API)", "FAIL", String(e));
    throw e;
  }

  try {
    // 7. Admin order update
    if (!adminEmail || !adminPassword) {
      throw new Error("ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD must be set for admin step.");
    }
    await fetchCsrf(adminJar);
    const adminLogin = await request(`${BASE}/api/auth/login`, adminJar, {
      method: "POST",
      json: { email: adminEmail, password: adminPassword },
    });
    if (!adminLogin.res.ok || !adminLogin.data?.ok) {
      throw new Error(adminLogin.data?.error || `Admin login HTTP ${adminLogin.res.status}`);
    }
    if (adminLogin.data.data?.role !== "admin") {
      throw new Error("Logged-in user is not admin");
    }

    await fetchCsrf(adminJar);
    const patch = await request(`${BASE}/api/admin/orders`, adminJar, {
      method: "PATCH",
      json: { orderId, status: "packed" },
    });
    if (!patch.res.ok || !patch.data?.ok) {
      throw new Error(patch.data?.error || `Admin PATCH HTTP ${patch.res.status}`);
    }
    if (patch.data.data?.status !== "packed") {
      throw new Error(`Expected status packed, got ${patch.data.data?.status}`);
    }
    results.pass++;
    logStep(7, "Admin order update", "PASS", "status → packed");
  } catch (e) {
    results.fail++;
    logStep(7, "Admin order update", "FAIL", String(e));
    throw e;
  }

  console.log("\n--- Summary ---");
  console.log(`Passed: ${results.pass} / 7`);
  console.log("Full flow OK — no manual debugging required for this path.\n");
  process.exitCode = 0;
}

main().catch((err) => {
  console.error("\n--- Flow aborted ---");
  console.error(err instanceof Error ? err.message : err);
  console.log("\nTip: ensure server is running, DB seeded with products, and .env.local matches the server.\n");
  process.exitCode = 1;
});
