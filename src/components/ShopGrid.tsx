import Image from "next/image";
import Link from "next/link";
import type { Product } from "@prisma/client";

interface Props {
  products: Product[];
}

export default function ShopGrid({ products }: Props) {
  return (
    <main className="min-h-screen px-4 py-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center mb-16 gap-6">
        <div className="w-40">
          <Image
            src="/logo.jpg"
            alt="Mandatory Wear"
            width={300}
            height={300}
            className="w-full h-auto invert"
            priority
          />
        </div>
        <div className="flex items-center gap-4 w-full max-w-xs">
          <div className="flex-1 h-px bg-[#4b5320]/40" />
          <span
            className="text-[#4b5320] text-[10px] tracking-[0.4em] uppercase"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Now Available
          </span>
          <div className="flex-1 h-px bg-[#4b5320]/40" />
        </div>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <p
          className="text-center text-[#f4f1eb]/40 tracking-widest uppercase"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          No items yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#4b5320]/20">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

function ProductCard({ product }: { product: Product }) {
  const isSoldOut = product.sold || (!product.isOneOfOne && product.quantity === 0);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative flex flex-col bg-[#0a0a0a] overflow-hidden hover:bg-[#111] transition-colors"
    >
      {/* Image */}
      <div className="aspect-[3/4] relative overflow-hidden bg-[#111]">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#4b5320]/30 text-xs tracking-widest uppercase" style={{ fontFamily: "var(--font-oswald)" }}>
              No image
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isOneOfOne && (
            <span
              className="bg-[#4b5320] text-[#f4f1eb] text-[10px] tracking-[0.2em] px-2 py-0.5 uppercase"
              style={{ fontFamily: "var(--font-black-ops)" }}
            >
              1 of 1
            </span>
          )}
          {isSoldOut && (
            <span
              className="bg-[#0a0a0a] border border-[#f4f1eb]/20 text-[#f4f1eb]/60 text-[10px] tracking-[0.2em] px-2 py-0.5 uppercase"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Sold
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 border-t border-[#4b5320]/20 flex flex-col gap-1">
        <h2
          className="text-sm tracking-[0.15em] uppercase text-[#f4f1eb]"
          style={{ fontFamily: "var(--font-black-ops)" }}
        >
          {product.name}
        </h2>
        <div className="flex justify-between items-center mt-1">
          <span
            className="text-[#4b5320] text-sm"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            ${(product.price / 100).toFixed(2)}
          </span>
          {!product.isOneOfOne && !isSoldOut && (
            <span
              className="text-[#f4f1eb]/30 text-xs tracking-widest"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {product.quantity} left
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
