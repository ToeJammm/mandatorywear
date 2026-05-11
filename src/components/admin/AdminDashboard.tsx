"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Order, Product, Settings } from "@prisma/client";
import ProductForm from "./ProductForm";

type OrderWithProduct = Order & { product: { name: string } };

interface Props {
  settings: Settings | null;
  products: Product[];
  signupCount: number;
  orders: OrderWithProduct[];
}

export default function AdminDashboard({ settings, products, signupCount, orders }: Props) {
  const router = useRouter();
  const [dropDate, setDropDate] = useState(
    settings?.dropDate ? new Date(settings.dropDate).toISOString().slice(0, 16) : ""
  );
  const [dropActive, setDropActive] = useState(settings?.dropActive ?? false);
  const [emailSubject, setEmailSubject] = useState(settings?.emailSubject ?? "");
  const [emailBody, setEmailBody] = useState(settings?.emailBody ?? "");
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  async function generateLabel(orderId: string) {
    const res = await fetch(`/api/admin/orders/${orderId}/label`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      window.open(data.labelUrl, "_blank");
      router.refresh();
    } else {
      alert(data.error ?? "Failed to generate label.");
    }
  }

  async function sendNotification() {
    if (!confirm(`Send drop notification to ${signupCount} subscribers?`)) return;
    setNotifying(true);
    const res = await fetch("/api/notify", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      alert(`Sent to ${data.sent} subscribers.`);
    } else {
      alert(data.error ?? "Failed to send.");
    }
    setNotifying(false);
  }

  async function saveSettings() {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dropDate: dropDate || null,
        dropActive,
        emailSubject,
        emailBody,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(`Failed to save: ${data.error ?? res.status}`);
      return;
    }
    router.refresh();
  }

  async function toggleProductActive(product: Product) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !product.active }),
    });
    router.refresh();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Remove this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const label = (text: string) => (
    <span
      className="text-[10px] tracking-[0.35em] text-[#4b5320] uppercase"
      style={{ fontFamily: "var(--font-oswald)" }}
    >
      {text}
    </span>
  );

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#4b5320]/20">
        <div className="flex items-center gap-4">
          <Image src="/logo.jpg" alt="Mandatory Wear" width={80} height={80} className="w-16 h-auto invert" />
          <span
            className="text-xs tracking-[0.3em] text-[#4b5320] uppercase"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Admin
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="/"
            target="_blank"
            className="text-[10px] tracking-[0.3em] text-[#f4f1eb]/30 hover:text-[#f4f1eb]/60 uppercase transition-colors"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            View Site ↗
          </a>
          <button
            onClick={logout}
            className="text-[10px] tracking-[0.3em] text-[#f4f1eb]/30 hover:text-red-400 uppercase transition-colors cursor-pointer"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-12">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-[#4b5320]/20">
          {[
            { label: "Subscribers", value: signupCount },
            { label: "Products", value: products.filter((p) => p.active).length },
            { label: "Sold", value: products.filter((p) => p.sold).length },
          ].map(({ label: l, value }) => (
            <div key={l} className="bg-[#0a0a0a] p-6 flex flex-col gap-1">
              <span
                className="text-3xl text-[#f4f1eb]"
                style={{ fontFamily: "var(--font-black-ops)" }}
              >
                {value}
              </span>
              {label(l)}
            </div>
          ))}
        </div>

        {/* Notify */}
        {signupCount > 0 && (
          <div className="flex items-center justify-between border border-[#4b5320]/20 px-6 py-4">
            <div>
              {label("Drop Notification")}
              <p className="text-[#f4f1eb]/30 text-xs mt-1" style={{ fontFamily: "var(--font-oswald)" }}>
                Send a live email to all {signupCount} subscriber{signupCount !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={sendNotification}
              disabled={notifying}
              className="bg-[#4b5320] px-6 py-2.5 text-xs tracking-[0.2em] uppercase text-[#f4f1eb] hover:bg-[#5c6628] transition-colors disabled:opacity-50 cursor-pointer"
              style={{ fontFamily: "var(--font-black-ops)" }}
            >
              {notifying ? "Sending..." : "Send Now"}
            </button>
          </div>
        )}

        {/* Drop Settings */}
        <div className="border border-[#4b5320]/20 p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            {label("Drop Settings")}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              {label("Countdown Date")}
              <input
                type="datetime-local"
                value={dropDate}
                onChange={(e) => setDropDate(e.target.value)}
                className="bg-transparent border border-[#4b5320]/40 px-4 py-2.5 text-sm text-[#f4f1eb] outline-none focus:border-[#4b5320] transition-colors"
                style={{ fontFamily: "var(--font-oswald)", colorScheme: "dark" }}
              />
            </div>

            <div className="flex flex-col gap-2">
              {label("Drop Status")}
              <button
                onClick={() => setDropActive((v) => !v)}
                className={`flex items-center gap-3 border px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                  dropActive
                    ? "border-[#4b5320] bg-[#4b5320]/10 text-[#4b5320]"
                    : "border-[#4b5320]/30 text-[#f4f1eb]/40"
                }`}
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                <div
                  className={`w-3 h-3 rounded-full transition-colors ${
                    dropActive ? "bg-[#4b5320]" : "bg-[#f4f1eb]/20"
                  }`}
                />
                {dropActive ? "Shop is LIVE" : "Countdown Mode"}
              </button>
            </div>
          </div>

          {/* Email content */}
          <div className="flex flex-col gap-4 pt-2 border-t border-[#4b5320]/20">
            {label("Drop Email")}
            <div className="flex flex-col gap-2">
              {label("Subject")}
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="THE DROP IS LIVE"
                className="bg-transparent border border-[#4b5320]/40 px-4 py-2.5 text-sm text-[#f4f1eb] outline-none focus:border-[#4b5320] transition-colors placeholder-[#f4f1eb]/20"
                style={{ fontFamily: "var(--font-oswald)" }}
              />
            </div>
            <div className="flex flex-col gap-2">
              {label("Body")}
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Limited quantity. First come, first served."
                rows={4}
                className="bg-transparent border border-[#4b5320]/40 px-4 py-2.5 text-sm text-[#f4f1eb] outline-none focus:border-[#4b5320] transition-colors placeholder-[#f4f1eb]/20 resize-none"
                style={{ fontFamily: "var(--font-oswald)" }}
              />
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="self-start bg-[#4b5320] px-8 py-2.5 text-sm tracking-[0.2em] uppercase text-[#f4f1eb] hover:bg-[#5c6628] transition-colors disabled:opacity-50 cursor-pointer"
            style={{ fontFamily: "var(--font-black-ops)" }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Products */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {label("Products")}
            <button
              onClick={() => { setEditProduct(null); setShowForm(true); }}
              className="text-[10px] tracking-[0.3em] uppercase text-[#4b5320] hover:text-[#5c6628] transition-colors cursor-pointer"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              + Add Product
            </button>
          </div>

          {products.length === 0 && (
            <p
              className="text-[#f4f1eb]/30 text-sm tracking-wide"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              No products yet.
            </p>
          )}

          <div className="flex flex-col gap-px bg-[#4b5320]/10">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-[#0a0a0a] flex items-center gap-4 p-4"
              >
                {/* Thumb */}
                <div className="w-12 h-14 relative flex-shrink-0 bg-[#111]">
                  {product.images[0] && (
                    <Image src={product.images[0]} alt="" fill className="object-cover" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm tracking-[0.1em] uppercase text-[#f4f1eb] truncate"
                    style={{ fontFamily: "var(--font-black-ops)" }}
                  >
                    {product.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className="text-xs text-[#4b5320]"
                      style={{ fontFamily: "var(--font-oswald)" }}
                    >
                      ${(product.price / 100).toFixed(2)}
                    </span>
                    {product.isOneOfOne && (
                      <span
                        className="text-[9px] tracking-widest text-[#4b5320] uppercase border border-[#4b5320]/50 px-1.5 py-px"
                        style={{ fontFamily: "var(--font-oswald)" }}
                      >
                        1 of 1
                      </span>
                    )}
                    {product.sold && (
                      <span
                        className="text-[9px] tracking-widest text-[#f4f1eb]/30 uppercase"
                        style={{ fontFamily: "var(--font-oswald)" }}
                      >
                        Sold
                      </span>
                    )}
                    {!product.active && (
                      <span
                        className="text-[9px] tracking-widest text-[#f4f1eb]/20 uppercase"
                        style={{ fontFamily: "var(--font-oswald)" }}
                      >
                        Hidden
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setEditProduct(product); setShowForm(true); }}
                    className="text-[10px] tracking-widest text-[#f4f1eb]/30 hover:text-[#f4f1eb] uppercase transition-colors cursor-pointer"
                    style={{ fontFamily: "var(--font-oswald)" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleProductActive(product)}
                    className="text-[10px] tracking-widest text-[#f4f1eb]/30 hover:text-[#4b5320] uppercase transition-colors cursor-pointer"
                    style={{ fontFamily: "var(--font-oswald)" }}
                  >
                    {product.active ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-[10px] tracking-widest text-[#f4f1eb]/20 hover:text-red-400 uppercase transition-colors cursor-pointer"
                    style={{ fontFamily: "var(--font-oswald)" }}
                  >
                    Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

        {/* Orders */}
        {orders.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              {label("Orders")}
            </div>
            <div className="flex flex-col gap-px bg-[#4b5320]/10">
              {orders.map((order) => (
                <div key={order.id} className="bg-[#0a0a0a] p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm text-[#f4f1eb] tracking-wide" style={{ fontFamily: "var(--font-black-ops)" }}>
                        {order.product.name}
                      </p>
                      <p className="text-xs text-[#f4f1eb]/40" style={{ fontFamily: "var(--font-oswald)" }}>
                        {order.customerName || order.customerEmail} — ${(order.total / 100).toFixed(2)}
                      </p>
                      {order.shippingLine1 && (
                        <p className="text-xs text-[#f4f1eb]/30 mt-1" style={{ fontFamily: "var(--font-oswald)" }}>
                          {order.shippingName} · {order.shippingLine1}{order.shippingLine2 ? `, ${order.shippingLine2}` : ""}, {order.shippingCity}, {order.shippingState} {order.shippingZip}
                        </p>
                      )}
                      {order.trackingNumber && (
                        <p className="text-xs text-[#4b5320] mt-1" style={{ fontFamily: "var(--font-oswald)" }}>
                          Tracking: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {order.labelUrl ? (
                        <a
                          href={order.labelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] tracking-[0.2em] uppercase text-[#4b5320] hover:text-[#5c6628] transition-colors"
                          style={{ fontFamily: "var(--font-oswald)" }}
                        >
                          Download Label
                        </a>
                      ) : order.shippingLine1 ? (
                        <button
                          onClick={() => generateLabel(order.id)}
                          className="text-[10px] tracking-[0.2em] uppercase bg-[#4b5320] text-[#f4f1eb] px-3 py-1.5 hover:bg-[#5c6628] transition-colors cursor-pointer"
                          style={{ fontFamily: "var(--font-oswald)" }}
                        >
                          Generate Label
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#f4f1eb]/20 uppercase" style={{ fontFamily: "var(--font-oswald)" }}>
                          No address
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editProduct}
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); router.refresh(); }}
        />
      )}
    </div>
  );
}
