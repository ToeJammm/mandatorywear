"use client";

import { useState } from "react";

export default function PhoneSignup() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("done");
      setMessage("You're on the list.");
    } else {
      setStatus("error");
      setMessage(data.error ?? "Something went wrong.");
    }
  }

  if (status === "done") {
    return (
      <p
        className="text-center text-[#4b5320] text-sm tracking-[0.2em] uppercase"
        style={{ fontFamily: "var(--font-black-ops)" }}
      >
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex border border-[#4b5320]/60 focus-within:border-[#4b5320] transition-colors">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(000) 000-0000"
          required
          className="flex-1 bg-transparent px-4 py-3 text-sm text-[#f4f1eb] placeholder-[#f4f1eb]/20 outline-none"
          style={{ fontFamily: "var(--font-oswald)" }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-[#4b5320] px-5 py-3 text-xs tracking-[0.2em] text-[#f4f1eb] uppercase hover:bg-[#5c6628] transition-colors disabled:opacity-50 cursor-pointer"
          style={{ fontFamily: "var(--font-black-ops)" }}
        >
          {status === "loading" ? "..." : "Notify"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-red-400 text-xs text-center" style={{ fontFamily: "var(--font-oswald)" }}>
          {message}
        </p>
      )}
    </form>
  );
}
