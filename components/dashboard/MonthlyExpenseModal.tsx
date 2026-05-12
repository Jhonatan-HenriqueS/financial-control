"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthlyExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Modal inicial para criação de gasto mensal.
// Por enquanto ele prepara a interface visual; o botão ainda não executa nenhuma ação.
export function MonthlyExpenseModal({
  isOpen,
  onClose,
}: MonthlyExpenseModalProps) {
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-[85] flex h-dvh w-dvw items-center justify-center overflow-hidden bg-slate-950/42 px-4 backdrop-blur-md transition-opacity duration-[180ms] ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        // Mantém o modal aberto quando o usuário clica dentro do card.
        onClick={(event) => event.stopPropagation()}
        className={`relative w-full max-w-md overflow-hidden rounded-[34px] bg-white/76 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.26),0_18px_54px_rgba(255,136,0,0.12)] backdrop-blur-[30px] sm:p-8 ${
          isOpen ? "animate-category-modal-enter" : "animate-category-modal-exit"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,153,45,0.22),transparent_38%),linear-gradient(145deg,rgba(255,255,255,0.84),rgba(255,248,238,0.6))]" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#ff7300]">
                Gasto mensal
              </p>
              <h3 className="mt-3 text-2xl font-bold text-slate-950">
                Crie um gasto mensal
              </h3>
            </div>

            <Button
              type="button"
              aria-label="Fechar modal de gasto mensal"
              onClick={onClose}
              variant="ghost"
              className="h-11 w-11 rounded-2xl text-slate-950 hover:bg-white/55 focus-visible:ring-0 focus-visible:shadow-[0_0_0_5px_rgba(255,154,42,0.15)]"
            >
              <X size={19} strokeWidth={2.1} />
            </Button>
          </div>

          <Button type="button" variant="sun" size="form" className="mt-8">
            Criar gasto mensal
          </Button>
        </div>
      </div>
    </div>
  );
}
