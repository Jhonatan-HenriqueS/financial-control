"use client";

import { Folder, X } from "lucide-react";
import type { ExpenseCategory } from "@/types/category";

interface ExpenseCategoryModalProps {
  categories: ExpenseCategory[];
  isOpen: boolean;
  selectedCategoryId?: string;
  onClose: () => void;
  onSelectCategory: (category: ExpenseCategory) => void;
}

// Modal que mostra todas as categorias criadas pelo usuário.
// O clique em uma categoria escolhe ela para o gasto e fecha esta janela.
export function ExpenseCategoryModal({
  categories,
  isOpen,
  selectedCategoryId,
  onClose,
  onSelectCategory,
}: ExpenseCategoryModalProps) {
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-[95] flex h-dvh w-dvw items-center justify-center overflow-hidden bg-slate-950/42 px-4 backdrop-blur-md transition-opacity duration-[180ms] ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        // Mantém o modal aberto quando o usuário clica dentro da lista.
        onClick={(event) => event.stopPropagation()}
        className={`relative w-full max-w-md overflow-hidden rounded-[30px] bg-white/82 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.24),0_18px_54px_rgba(255,136,0,0.12)] backdrop-blur-[30px] ${
          isOpen
            ? "animate-category-modal-enter"
            : "animate-category-modal-exit"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,153,45,0.2),transparent_38%),linear-gradient(145deg,rgba(255,255,255,0.86),rgba(255,248,238,0.62))]" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#ff7300]">
                Categoria
              </p>
              <h3 className="mt-2 text-xl font-bold text-slate-950">
                Escolha um setor
              </h3>
            </div>

            <button
              type="button"
              aria-label="Fechar categorias"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-slate-950 transition hover:bg-white/55 focus:outline-none focus:shadow-[0_0_0_5px_rgba(255,154,42,0.15)]"
            >
              <X size={18} strokeWidth={2.1} />
            </button>
          </div>

          {categories.length > 0 ? (
            <div className="mt-6 grid max-h-[54dvh] gap-3 overflow-auto pr-1">
              {categories.map((category) => {
                const isSelected = category.id === selectedCategoryId;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onSelectCategory(category)}
                    className={`flex items-center gap-3 rounded-2xl bg-white/62 p-3 text-left transition hover:bg-white/82 focus:outline-none focus:shadow-[0_0_0_5px_rgba(255,154,42,0.15)] ${
                      isSelected
                        ? "shadow-[0_12px_30px_rgba(255,136,0,0.18)]"
                        : "shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                    }`}
                  >
                    <span
                      className="h-7 w-7 shrink-0 rounded-full shadow-[0_5px_12px_rgba(15,23,42,0.12)]"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-950">
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 flex min-h-36 flex-col items-center justify-center rounded-3xl bg-white/62 px-4 text-center shadow-[0_10px_24px_rgba(255,136,0,0.1)]">
              <Folder size={28} strokeWidth={2.1} className="text-[#ff7300]" />
              <p className="mt-3 text-sm font-bold text-slate-950">
                Nenhuma categoria criada.
              </p>
              <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
                Crie uma categoria antes de registrar um gasto.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
