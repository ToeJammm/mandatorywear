"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import EmailSignup from "./EmailSignup";

interface Props {
  dropDate: Date | null;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function DropCountdown({ dropDate }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!dropDate) return;
    const target = new Date(dropDate);
    setTimeLeft(getTimeLeft(target));
    const id = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [dropDate]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16 relative overflow-hidden">
      {/* subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-12 max-w-lg w-full">
        {/* Logo */}
        <div className="w-[26rem] sm:w-[32rem]">
          <Image
            src="/logo.jpg"
            alt="Mandatory Wear"
            width={400}
            height={400}
            className="w-full h-auto invert"
            priority
          />
        </div>

        {/* Countdown */}
        {dropDate && timeLeft && (
          <div className="w-full border border-[#4b5320] p-px">
            <div className="border border-[#4b5320]/40 p-8">
              <p
                className="text-center text-[#4b5320] text-xs tracking-[0.4em] mb-8 uppercase"
                style={{ fontFamily: "var(--font-barlow)" }}
              >
                Next Drop
              </p>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "DAYS", value: timeLeft.days },
                  { label: "HRS", value: timeLeft.hours },
                  { label: "MIN", value: timeLeft.minutes },
                  { label: "SEC", value: timeLeft.seconds },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <span
                      className="text-4xl sm:text-5xl text-[#f4f1eb] tabular-nums"
                      style={{ fontFamily: "var(--font-black-ops)" }}
                    >
                      {pad(value)}
                    </span>
                    <span
                      className="text-[10px] tracking-[0.3em] text-[#4b5320]"
                      style={{ fontFamily: "var(--font-barlow)" }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!dropDate && (
          <p
            className="text-[#4b5320] text-sm tracking-[0.3em] uppercase"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            Coming Soon
          </p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1 h-px bg-[#4b5320]/40" />
          <span
            className="text-[#4b5320] text-xs tracking-[0.3em]"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            ★
          </span>
          <div className="flex-1 h-px bg-[#4b5320]/40" />
        </div>

        {/* Phone signup */}
        <div className="w-full">
          <p
            className="text-center text-[#f4f1eb]/60 text-xs tracking-[0.3em] uppercase mb-6"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            Get notified when we drop
          </p>
          <EmailSignup />
        </div>
      </div>
    </main>
  );
}
