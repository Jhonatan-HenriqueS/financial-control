"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseCurrencyToCents } from "@/lib/currency";

type BalanceModalMode = "define" | "add" | "update";

interface BalanceAmountModalProps {
  isOpen: boolean;
  mode: BalanceModalMode;
  onClose: () => void;
  onSubmit: (amountCents: number) => void;
}

// Textos do modal para cada ação possível.
// Assim o mesmo formulário serve para definir, adicionar ou alterar o saldo.
const modalCopy: Record<BalanceModalMode, { eyebrow: string; title: string; button: string }> = {
  define: {
    eyebrow: "Saldo inicial",
    title: "Defina seu saldo atual",
    button: "Definir saldo",
  },
  add: {
    eyebrow: "Adicionar saldo",
    title: "Some um valor ao saldo",
    button: "Adicionar saldo",
  },
  update: {
    eyebrow: "Alterar saldo",
    title: "Substitua o saldo atual",
    button: "Alterar saldo",
  },
};

// Modal que recebe um valor em reais e devolve esse valor em centavos.
// A tela pai decide se vai definir, somar ou substituir o saldo salvo.
export function BalanceAmountModal({
  isOpen,
  mode,
  onClose,
  onSubmit,
}: BalanceAmountModalProps) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const copy = modalCopy[mode];

  // Valida o valor digitado antes de enviar para o armazenamento.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amountCents = parseCurrencyToCents(amount);

    if (amountCents <= 0) {
      setMessage("Informe um valor maior que zero.");
      return;
    }

    onSubmit(amountCents);
  }

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-[85] flex h-dvh w-dvw items-center justify-center overflow-hidden bg-slate-950/42 px-4 backdrop-blur-md transition-opacity duration-[180ms] ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        // Cliques dentro do card não fecham o modal.
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
                {copy.eyebrow}
              </p>
              <h3 className="mt-3 text-2xl font-bold text-slate-950">
                {copy.title}
              </h3>
            </div>

            <Button
              type="button"
              aria-label="Fechar modal de saldo"
              onClick={onClose}
              variant="ghost"
              className="h-11 w-11 rounded-2xl text-slate-950 hover:bg-white/55 focus-visible:ring-0 focus-visible:shadow-[0_0_0_5px_rgba(255,154,42,0.15)]"
            >
              <X size={19} strokeWidth={2.1} />
            </Button>
          </div>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-3">
              <label
                htmlFor="balance-amount"
                className="text-sm font-bold text-slate-950"
              >
                Valor do saldo
              </label>
              <div className="flex h-13 items-center rounded-2xl bg-white/78 px-5 shadow-[0_10px_26px_rgba(255,136,0,0.08)] transition-all duration-200 focus-within:shadow-[0_0_0_5px_rgba(255,154,42,0.18),0_14px_34px_rgba(255,112,0,0.2)]">
                <span className="mr-2 text-sm font-bold text-slate-950">R$</span>
                <input
                  id="balance-amount"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setMessage("");
                  }}
                  placeholder="100,00"
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {message ? (
              <p className="text-sm font-semibold text-red-600">{message}</p>
            ) : null}

            <Button type="submit" variant="sun" size="form">
              {copy.button}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
