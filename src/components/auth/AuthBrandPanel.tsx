import { CheckCircle, Lock, Shield } from "lucide-react";

const trustPoints = [
  { icon: Shield, label: "100% Verified Listings" },
  { icon: CheckCircle, label: "CA-Reviewed Financials" },
  { icon: Lock, label: "NDA-Protected Deals" },
] as const;

export function AuthBrandPanel() {
  return (
    <div className="relative hidden min-h-0 flex-1 flex-col justify-center overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 px-10 py-14 md:flex lg:px-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />
      <div className="relative max-w-md">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          TheBuzSale
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-emerald-100/95">
          India&apos;s most trusted MSME M&amp;A marketplace
        </p>
        <ul className="mt-12 space-y-6">
          {trustPoints.map(({ icon: Icon, label }) => (
            <li key={label} className="flex gap-4 text-emerald-50">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <Icon className="size-5 text-emerald-200" aria-hidden />
              </span>
              <span className="pt-2 text-base font-medium leading-snug">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
