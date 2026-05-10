"use client";

import { X } from "lucide-react";
import { FormEvent, useState } from "react";
import type { ExpenseCategory } from "@/types/category";

interface CategoryModalProps {
  category?: ExpenseCategory | null;
  errorMessage?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryName: string) => void;
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

  // Envia apenas o nome digitado para a tela pai.
  // A tela pai decide se deve criar ou editar a categoria.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(categoryName);
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
                {category ? "Editar categoria" : "Nova categoria"}
              </p>
              <h3 className="mt-4 text-2xl font-bold text-slate-950 sm:text-3xl">
                Crie o setor de seu gasto
              </h3>
            </div>

            <button
              type="button"
              aria-label="Fechar modal"
              onClick={onClose}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-slate-950 transition hover:bg-white/55 focus:outline-none focus:shadow-[0_0_0_5px_rgba(255,154,42,0.15)]"
            >
              <X size={20} strokeWidth={2.1} />
            </button>
          </div>

          <p className="mt-6 text-base font-medium leading-8 text-slate-600">
            Crie esta categoria para organizar para em qual setor o seu dinheiro
            está indo.
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

            <button
              type="submit"
              className="h-14 w-full rounded-2xl bg-[linear-gradient(135deg,#ff6500,#ffb51b)] text-base font-bold text-white shadow-[0_14px_32px_rgba(255,112,0,0.24)] transition hover:brightness-105 focus:outline-none focus:shadow-[0_0_0_5px_rgba(255,154,42,0.18),0_14px_32px_rgba(255,112,0,0.24)]"
            >
              {category ? "Salvar categoria" : "Criar categoria"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
