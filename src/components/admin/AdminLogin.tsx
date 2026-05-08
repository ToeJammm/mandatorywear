"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.error ?? "Invalid password.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex justify-center">
          <Image src="/logo.jpg" alt="Mandatory Wear" width={160} height={160} className="w-40 h-auto invert" />
        </div>

        <div className="border border-[#4b5320]/40 p-8">
          <p
            className="text-xs tracking-[0.4em] text-[#4b5320] uppercase mb-6 text-center"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Admin Access
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="bg-transparent border border-[#4b5320]/40 px-4 py-3 text-sm text-[#f4f1eb] placeholder-[#f4f1eb]/20 outline-none focus:border-[#4b5320] transition-colors"
              style={{ fontFamily: "var(--font-oswald)" }}
            />
            {error && (
              <p className="text-red-400 text-xs text-center" style={{ fontFamily: "var(--font-oswald)" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-[#4b5320] py-3 text-sm tracking-[0.3em] uppercase text-[#f4f1eb] hover:bg-[#5c6628] transition-colors disabled:opacity-50 cursor-pointer"
              style={{ fontFamily: "var(--font-black-ops)" }}
            >
              {loading ? "..." : "Enter"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
