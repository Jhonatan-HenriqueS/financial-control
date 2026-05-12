import { Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { formatCurrency } from "@/lib/currency";

interface ExpenseSummaryCardProps {
  totalAmountCents: number;
  selectedCategoryName?: string;
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  actionSlot?: ReactNode;
  isAmountNegative?: boolean;
}

// Card de resumo dos gastos.
// Ele replica o visual do card de saldo da referencia, mas calcula o total
// conforme a categoria filtrada na pagina de gastos.
export function ExpenseSummaryCard({
  totalAmountCents,
  selectedCategoryName,
  title,
  subtitle,
  actionLabel = "Em breve...",
  actionSlot,
  isAmountNegative = false,
}: ExpenseSummaryCardProps) {
  const categoryLabel = selectedCategoryName ?? "Todas";
  const cardTitle = title ?? `Total em ${categoryLabel}`;

  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#ff9b5c_0%,#ff8a3d_48%,#ffb447_100%)] p-6 text-white shadow-[0_18px_48px_rgba(255,132,0,0.18),0_18px_54px_rgba(45,35,24,0.08)] sm:p-8">
      {/* Brilhos suaves para deixar o laranja com profundidade sem parecer bloco chapado. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.26),transparent_32%),radial-gradient(circle_at_90%_100%,rgba(255,255,255,0.18),transparent_38%)]" />

      <div className="relative z-10 flex items-center justify-between ">
        <div className="min-w-0">
          <p className="text-base font-bold text-white/90 sm:text-xl">
            {cardTitle}
          </p>

          <p
            className={`mt-4 truncate text-3xl font-extrabold tracking-normal sm:text-4xl lg:text-5xl ${
              isAmountNegative ? "text-red-600" : "text-white"
            }`}
          >
            {formatCurrency(totalAmountCents)}
          </p>

          {subtitle ? (
            <p className="mt-3 text-sm font-semibold text-white/68 sm:text-base">
              {subtitle}
            </p>
          ) : null}

          {actionSlot ?? (
            <div className="mt-6 inline-flex h-12 items-center rounded-2xl bg-white/38 px-6 text-sm font-bold text-[#ff6500] shadow-[0_10px_24px_rgba(255,255,255,0.14)] backdrop-blur-sm sm:text-base">
              {actionLabel}
            </div>
          )}
        </div>

        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[28px] text-white sm:h-28 sm:w-28">
          <Wallet className="h-11 w-11 sm:h-19 sm:w-19" strokeWidth={1.8} />
        </div>
      </div>
    </section>
  );
}
