"use client";

import { X } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { parseCurrencyToCents } from "@/lib/currency";
import type { ExpenseCategory } from "@/types/category";

interface CategoryModalProps {
  category?: ExpenseCategory | null;
  errorMessage?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryName: string, limitCents: number | null) => void;
}

// Mostra centavos em formato simples de input brasileiro.
// O valor começa legível quando a categoria já possui limite salvo.
function formatInitialLimit(limitCents?: number | null) {
  if (limitCents === null || limitCents === undefined) {
    return "";
  }

  return (limitCents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Modal usado para criar ou editar uma categoria.
// Ele concentra o formulário e deixa a tela de categorias mais organizada.
export function CategoryModal({
  category,
  errorMessage,
  isOpen,
  onClose,
  onSubmit,
}: CategoryModalProps) {
  const [categoryName, setCategoryName] = useState(category?.name ?? "");
  const [categoryLimit, setCategoryLimit] = useState(
    formatInitialLimit(category?.limitCents),
  );
  const isEditing = Boolean(category);
  const modalTitle = isEditing
    ? "Edite o setor de seu gasto"
    : "Crie o setor de seu gasto";
  const modalDescription = isEditing
    ? "Atualize o nome desta categoria para manter seus gastos organizados no setor correto."
    : "Crie esta categoria para organizar para em qual setor o seu dinheiro está indo.";
  const submitLabel = isEditing ? "Salvar categoria" : "Criar categoria";

  // Envia apenas o nome digitado para a tela pai.
  // A tela pai decide se deve criar ou editar a categoria.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const limitCents = categoryLimit.trim()
      ? parseCurrencyToCents(categoryLimit)
      : null;

    onSubmit(categoryName, limitCents);
  }

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-[80] flex h-dvh w-dvw items-center justify-center overflow-hidden bg-slate-950/42 px-4 backdrop-blur-md transition-opacity duration-[180ms] ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        // Impede que cliques dentro do card fechem o modal.
        // Assim, somente o fundo e o botao de fechar encerram a janela.
        onClick={(event) => event.stopPropagation()}
        className={`relative w-full max-w-xl overflow-hidden rounded-[34px] bg-white/72 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.26),0_0_0_1px_rgba(255,255,255,0.72)] backdrop-blur-[30px] sm:p-9 ${
          isOpen
            ? "animate-category-modal-enter"
            : "animate-category-modal-exit"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,153,45,0.22),transparent_38%),linear-gradient(145deg,rgba(255,255,255,0.82),rgba(255,248,238,0.58))]" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.32em] text-[#ff7300]">
                {isEditing ? "Editar categoria" : "Nova categoria"}
              </p>
              <h3 className="mt-4 text-2xl font-bold text-slate-950 sm:text-3xl">
                {modalTitle}
              </h3>
            </div>

            <Button
              type="button"
              aria-label="Fechar modal"
              onClick={onClose}
              variant="ghost"
              size="appIcon"
              className="rounded-2xl text-slate-950 hover:bg-white/55 focus-visible:ring-0 focus-visible:shadow-[0_0_0_5px_rgba(255,154,42,0.15)]"
            >
              <X size={20} strokeWidth={2.1} />
            </Button>
          </div>

          <p className="mt-6 text-base font-medium leading-8 text-slate-600">
            {modalDescription}
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-3">
              <label
                htmlFor="category-name"
                className="text-base font-semibold text-slate-950"
              >
                Nome da categoria
              </label>
              <input
                id="category-name"
                type="text"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="Ex: Alimentação, Lazer..."
                className="mt-3 h-14 w-full rounded-2xl bg-white/78 px-5 text-base font-medium text-slate-950 shadow-[0_10px_26px_rgba(255,136,0,0.08)] outline-none transition-all duration-200 placeholder:text-slate-400 focus:shadow-[0_0_0_5px_rgba(255,154,42,0.18),0_14px_34px_rgba(255,112,0,0.2)]"
              />
              {errorMessage ? (
                <p className="text-sm font-semibold text-red-600">
                  {errorMessage}
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
              <label
                htmlFor="category-limit"
                className="text-base font-semibold text-slate-950"
              >
                Limite da categoria
              </label>
              <div className="mt-3 flex h-14 items-center rounded-2xl bg-white/78 px-5 shadow-[0_10px_26px_rgba(255,136,0,0.08)] transition-all duration-200 focus-within:shadow-[0_0_0_5px_rgba(255,154,42,0.18),0_14px_34px_rgba(255,112,0,0.2)]">
                <span className="mr-2 text-base font-bold text-slate-950">
                  R$
                </span>
                <input
                  id="category-limit"
                  type="text"
                  inputMode="decimal"
                  value={categoryLimit}
                  onChange={(event) => setCategoryLimit(event.target.value)}
                  placeholder="100,00"
                  className="min-w-0 flex-1 bg-transparent text-base font-medium text-slate-950 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <Button type="submit" variant="sun" size="form">
              {submitLabel}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
