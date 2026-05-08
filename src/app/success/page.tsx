import Image from "next/image";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 gap-10">
      <div className="w-40">
        <Image src="/logo.jpg" alt="Mandatory Wear" width={300} height={300} className="w-full h-auto invert" />
      </div>

      <div className="text-center flex flex-col gap-4 max-w-sm">
        <h1
          className="text-2xl tracking-[0.15em] text-[#f4f1eb] uppercase"
          style={{ fontFamily: "var(--font-black-ops)" }}
        >
          Order Confirmed
        </h1>
        <p
          className="text-sm text-[#f4f1eb]/50 tracking-wide leading-7"
          style={{ fontFamily: "var(--font-barlow)" }}
        >
          You'll receive a confirmation email shortly. Thank you for your support.
        </p>
      </div>

      <Link
        href="/"
        className="text-[10px] tracking-[0.4em] uppercase text-[#4b5320] hover:text-[#5c6628] transition-colors"
        style={{ fontFamily: "var(--font-barlow)" }}
      >
        ← Back to Shop
      </Link>
    </main>
  );
}
