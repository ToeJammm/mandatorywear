"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import type { Product } from "@prisma/client";

interface Props {
  product: Product | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ProductForm({ product, onClose, onSave }: Props) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price / 100) : "");
  const [quantity, setQuantity] = useState(product ? String(product.quantity) : "1");
  const [isOneOfOne, setIsOneOfOne] = useState(product?.isOneOfOne ?? false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList) {
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    setImages((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const body = {
      name,
      description,
      price: Math.round(parseFloat(price) * 100),
      quantity: isOneOfOne ? 1 : parseInt(quantity, 10),
      isOneOfOne,
      images,
      active: true,
    };

    const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
    const method = product ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      onSave();
    } else {
      const data = await res.json();
      setError(data.error ? JSON.stringify(data.error) : "Failed to save.");
      setSaving(false);
    }
  }

  const label = (text: string) => (
    <span
      className="text-[10px] tracking-[0.35em] text-[#4b5320] uppercase"
      style={{ fontFamily: "var(--font-oswald)" }}
    >
      {text}
    </span>
  );

  const inputClass =
    "bg-transparent border border-[#4b5320]/40 px-4 py-2.5 text-sm text-[#f4f1eb] outline-none focus:border-[#4b5320] transition-colors placeholder-[#f4f1eb]/20 w-full";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#4b5320]/40 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#4b5320]/20">
          <span
            className="text-xs tracking-[0.3em] uppercase text-[#f4f1eb]"
            style={{ fontFamily: "var(--font-black-ops)" }}
          >
            {product ? "Edit Product" : "New Product"}
          </span>
          <button
            onClick={onClose}
            className="text-[#f4f1eb]/30 hover:text-[#f4f1eb] transition-colors cursor-pointer text-lg leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            {label("Name")}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
              style={{ fontFamily: "var(--font-oswald)" }}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            {label("Description")}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className={`${inputClass} resize-none`}
              style={{ fontFamily: "var(--font-oswald)" }}
            />
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1.5">
            {label("Price (USD)")}
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className={inputClass}
              style={{ fontFamily: "var(--font-oswald)" }}
            />
          </div>

          {/* 1 of 1 toggle */}
          <div className="flex flex-col gap-1.5">
            {label("Item Type")}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsOneOfOne(false)}
                className={`flex-1 py-2.5 text-xs tracking-[0.2em] uppercase border transition-colors cursor-pointer ${
                  !isOneOfOne
                    ? "bg-[#4b5320] border-[#4b5320] text-[#f4f1eb]"
                    : "border-[#4b5320]/30 text-[#f4f1eb]/40"
                }`}
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                Limited Qty
              </button>
              <button
                type="button"
                onClick={() => setIsOneOfOne(true)}
                className={`flex-1 py-2.5 text-xs tracking-[0.2em] uppercase border transition-colors cursor-pointer ${
                  isOneOfOne
                    ? "bg-[#4b5320] border-[#4b5320] text-[#f4f1eb]"
                    : "border-[#4b5320]/30 text-[#f4f1eb]/40"
                }`}
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                1 of 1
              </button>
            </div>
          </div>

          {/* Quantity (hidden for 1 of 1) */}
          {!isOneOfOne && (
            <div className="flex flex-col gap-1.5">
              {label("Quantity")}
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                required
                className={inputClass}
                style={{ fontFamily: "var(--font-oswald)" }}
              />
            </div>
          )}

          {/* Images */}
          <div className="flex flex-col gap-2">
            {label("Photos")}
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && uploadFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="border border-dashed border-[#4b5320]/40 py-6 text-[10px] tracking-[0.3em] uppercase text-[#4b5320]/60 hover:border-[#4b5320] hover:text-[#4b5320] transition-colors disabled:opacity-50 cursor-pointer"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {uploading ? "Uploading..." : "+ Upload Photos"}
            </button>

            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((url, i) => (
                  <div key={i} className="relative w-16 h-20 group">
                    <Image src={url} alt="" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-xs" style={{ fontFamily: "var(--font-oswald)" }}>
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#4b5320]/30 py-3 text-xs tracking-[0.2em] uppercase text-[#f4f1eb]/40 hover:text-[#f4f1eb] transition-colors cursor-pointer"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 bg-[#4b5320] py-3 text-xs tracking-[0.2em] uppercase text-[#f4f1eb] hover:bg-[#5c6628] transition-colors disabled:opacity-50 cursor-pointer"
              style={{ fontFamily: "var(--font-black-ops)" }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
