import { Wallet } from "lucide-react";

interface ExpenseSummaryCardProps {
  totalAmountCents: number;
  selectedCategoryName?: string;
}

// Mostra centavos como moeda brasileira.
// O armazenamento usa centavos para evitar erro de arredondamento com dinheiro.
function formatCurrency(amountCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountCents / 100);
}

// Card de resumo dos gastos.
// Ele replica o visual do card de saldo da referencia, mas calcula o total
// conforme a categoria filtrada na pagina de gastos.
export function ExpenseSummaryCard({
  totalAmountCents,
  selectedCategoryName,
}: ExpenseSummaryCardProps) {
  const categoryLabel = selectedCategoryName ?? "Todas";

  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#ff9b5c_0%,#ff8a3d_48%,#ffb447_100%)] p-6 text-white shadow-[0_18px_48px_rgba(255,132,0,0.18),0_18px_54px_rgba(45,35,24,0.08)] sm:p-8">
      {/* Brilhos suaves para deixar o laranja com profundidade sem parecer bloco chapado. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.26),transparent_32%),radial-gradient(circle_at_90%_100%,rgba(255,255,255,0.18),transparent_38%)]" />

      <div className="relative z-10 flex items-center justify-between gap-5">
        <div className="min-w-0">
          <p className="text-base font-bold text-white/90 sm:text-xl">
            Soma em {categoryLabel}
          </p>

          <p className="mt-4 truncate text-4xl font-extrabold tracking-normal text-white sm:text-4xl lg:text-5xl">
            {formatCurrency(totalAmountCents)}
          </p>

          <div className="mt-6 inline-flex h-12 items-center rounded-2xl bg-white/38 px-6 text-sm font-bold text-[#ff6500] shadow-[0_10px_24px_rgba(255,255,255,0.14)] backdrop-blur-sm sm:text-base">
            Em breve...
          </div>
        </div>

        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[28px] text-white sm:h-28 sm:w-28">
          <Wallet className="h-13 w-13 sm:h-19 sm:w-19" strokeWidth={1.8} />
        </div>
      </div>
    </section>
  );
}
