"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@prisma/client";

interface Props {
  product: Product;
}

export default function ProductDetail({ product }: Props) {
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const isSoldOut = product.sold || (!product.isOneOfOne && product.quantity === 0);
  const maxQty = product.isOneOfOne ? 1 : product.quantity;

  async function handleCheckout() {
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity: qty }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error ?? "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-[#4b5320]/20">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="Mandatory Wear" width={80} height={80} className="w-20 h-auto invert" />
        </Link>
        <Link
          href="/"
          className="text-[10px] tracking-[0.3em] text-[#f4f1eb]/40 hover:text-[#4b5320] transition-colors uppercase"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          ← Back
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="flex flex-col gap-3">
          <div className="aspect-[3/4] relative bg-[#111] overflow-hidden">
            {product.images[activeImage] ? (
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[#4b5320]/30 text-xs tracking-widest uppercase" style={{ fontFamily: "var(--font-oswald)" }}>
                  No image
                </span>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-20 flex-shrink-0 overflow-hidden border transition-colors cursor-pointer ${
                    i === activeImage ? "border-[#4b5320]" : "border-[#4b5320]/20"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-8 pt-2">
          {/* Badges */}
          <div className="flex gap-2">
            {product.isOneOfOne && (
              <span
                className="bg-[#4b5320] text-[#f4f1eb] text-[10px] tracking-[0.25em] px-3 py-1 uppercase"
                style={{ fontFamily: "var(--font-black-ops)" }}
              >
                1 of 1
              </span>
            )}
            {isSoldOut && (
              <span
                className="border border-[#f4f1eb]/20 text-[#f4f1eb]/40 text-[10px] tracking-[0.25em] px-3 py-1 uppercase"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                Sold Out
              </span>
            )}
          </div>

          <div>
            <h1
              className="text-2xl sm:text-3xl tracking-[0.1em] uppercase text-[#f4f1eb] mb-3"
              style={{ fontFamily: "var(--font-black-ops)" }}
            >
              {product.name}
            </h1>
            <p
              className="text-2xl text-[#4b5320]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              ${(product.price / 100).toFixed(2)}
            </p>
          </div>

          <div className="h-px bg-[#4b5320]/20" />

          <p
            className="text-[#f4f1eb]/60 text-sm leading-7 tracking-wide"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            {product.description}
          </p>

          {!product.isOneOfOne && !isSoldOut && (
            <p
              className="text-[#f4f1eb]/30 text-xs tracking-[0.3em] uppercase"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {product.quantity} remaining
            </p>
          )}

          {/* Qty + CTA */}
          {!isSoldOut && (
            <div className="flex flex-col gap-4">
              {!product.isOneOfOne && maxQty > 1 && (
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs tracking-[0.3em] text-[#f4f1eb]/40 uppercase"
                    style={{ fontFamily: "var(--font-oswald)" }}
                  >
                    Qty
                  </span>
                  <div className="flex border border-[#4b5320]/40">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-[#f4f1eb]/60 hover:text-[#f4f1eb] transition-colors cursor-pointer"
                    >
                      −
                    </button>
                    <span
                      className="px-4 py-2 text-sm text-[#f4f1eb] border-x border-[#4b5320]/40 min-w-[3rem] text-center"
                      style={{ fontFamily: "var(--font-oswald)" }}
                    >
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                      className="px-3 py-2 text-[#f4f1eb]/60 hover:text-[#f4f1eb] transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-[#4b5320] text-[#f4f1eb] py-4 text-sm tracking-[0.3em] uppercase hover:bg-[#5c6628] transition-colors disabled:opacity-50 cursor-pointer"
                style={{ fontFamily: "var(--font-black-ops)" }}
              >
                {loading ? "Loading..." : "Purchase"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
