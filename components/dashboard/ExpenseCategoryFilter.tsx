"use client";

import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ExpenseCategory } from "@/types/category";
import type { Expense } from "@/types/expense";

interface ExpenseCategoryFilterProps {
  categories: ExpenseCategory[];
  expenses: Expense[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

// Collator nativo do JavaScript para ordenar textos em português.
// Ele compara letra por letra e lida melhor com acentos do que comparação manual.
const categoryNameCollator = new Intl.Collator("pt-BR", {
  sensitivity: "base",
  numeric: true,
});

// Conta quantos gastos existem em uma categoria.
// Esse número aparece na lateral do item dentro do filtro.
function getCategoryExpenseCount(expenses: Expense[], categoryId: string) {
  return expenses.filter((expense) => expense.categoryId === categoryId).length;
}

// Ordena as categorias em ordem alfabética.
// Se uma categoria estiver selecionada, ela fica logo abaixo da opção "Todas".
function sortCategoriesForFilter(
  categories: ExpenseCategory[],
  selectedCategoryId: string | null,
) {
  const sortedCategories = [...categories].sort((firstCategory, secondCategory) =>
    categoryNameCollator.compare(firstCategory.name, secondCategory.name),
  );

  if (!selectedCategoryId) {
    return sortedCategories;
  }

  const selectedCategory = sortedCategories.find(
    (category) => category.id === selectedCategoryId,
  );

  if (!selectedCategory) {
    return sortedCategories;
  }

  return [
    selectedCategory,
    ...sortedCategories.filter((category) => category.id !== selectedCategoryId),
  ];
}

// Mostra o texto do contador no singular ou plural.
// Acima de 1, usa "resultados"; 0 e 1 ficam no singular.
function formatResultCount(count: number) {
  return `${count} ${count > 1 ? "resultados" : "resultado"}`;
}

// Botão e popover de filtro por categoria.
// Quando uma categoria é escolhida, a lista de gastos mostra apenas itens daquele setor.
export function ExpenseCategoryFilter({
  categories,
  expenses,
  selectedCategoryId,
  onSelectCategory,
}: ExpenseCategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const totalResults = selectedCategory
    ? getCategoryExpenseCount(expenses, selectedCategory.id)
    : expenses.length;
  const orderedCategories = sortCategoriesForFilter(
    categories,
    selectedCategoryId,
  );

  // Seleciona a categoria e fecha o popover para dar retorno imediato ao usuário.
  function handleSelectCategory(categoryId: string | null) {
    onSelectCategory(categoryId);
    setIsOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="translucentAction"
          className="h-12 w-full justify-between gap-3 px-4 text-sm font-bold sm:w-auto sm:min-w-56"
        >
          <span className="flex min-w-0 items-center gap-2">
            <SlidersHorizontal size={16} strokeWidth={2.1} />
            <span className="truncate">
              {selectedCategory?.name ?? "Filtrar categoria"}
            </span>
          </span>
          <ChevronDown
            size={17}
            strokeWidth={2.2}
            className={`shrink-0 transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        avoidCollisions={false}
        align="end"
        sideOffset={12}
        className="w-[min(calc(100dvw-2rem),380px)] rounded-[28px] bg-white/90 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.16),0_16px_42px_rgba(255,132,0,0.1)] ring-0 backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-500">
              Filtrar gastos
            </p>
            <h3 className="mt-3 text-lg font-bold text-slate-950">
              Escolha uma categoria
            </h3>
          </div>

          <div className="whitespace-nowrap rounded-2xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-500 shadow-[0_8px_20px_rgba(255,132,0,0.08)]">
            {formatResultCount(totalResults)}
          </div>
        </div>

        <div className="scrollbar-invisible mt-5 grid max-h-[292px] gap-2 overflow-y-auto pr-1">
          <Button
            type="button"
            onClick={() => handleSelectCategory(null)}
            variant="ghost"
            className={`h-auto w-full justify-between gap-3 rounded-2xl px-4 py-3 text-left hover:scale-100 ${
              selectedCategoryId === null
                ? "bg-[linear-gradient(135deg,rgba(255,150,36,0.18),rgba(255,183,64,0.12))] text-[#d95f00] shadow-[0_10px_28px_rgba(255,132,0,0.12)]"
                : "bg-white/52 text-slate-600 hover:bg-white/75"
            }`}
          >
            <span className="flex items-center gap-3">
              <span
                className={`grid h-9 w-9 place-items-center rounded-2xl ${
                  selectedCategoryId === null
                    ? "bg-[#ff7300]/16"
                    : "bg-slate-950/5"
                }`}
              >
                <Check size={16} strokeWidth={2.2} />
              </span>
              <span className="text-sm font-bold">Todas</span>
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-500">
              {expenses.length}
            </span>
          </Button>

          {orderedCategories.length > 0 ? (
            orderedCategories.map((category) => {
              const isSelected = category.id === selectedCategoryId;
              const count = getCategoryExpenseCount(expenses, category.id);

              return (
                <Button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelectCategory(category.id)}
                  variant="ghost"
                  className={`h-auto w-full justify-between gap-3 rounded-2xl px-4 py-3 text-left hover:scale-100 ${
                    isSelected
                      ? "bg-[linear-gradient(135deg,rgba(255,150,36,0.18),rgba(255,183,64,0.12))] text-[#d95f00] shadow-[0_10px_28px_rgba(255,132,0,0.12)]"
                      : "bg-white/52 text-slate-600 hover:bg-white/75"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-9 w-9 shrink-0 rounded-2xl shadow-[0_7px_16px_rgba(15,23,42,0.1)]"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 truncate text-sm font-bold">
                      {category.name}
                    </span>
                  </span>
                  <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-500">
                    {count}
                  </span>
                </Button>
              );
            })
          ) : (
            <p className="rounded-2xl bg-white/52 px-4 py-4 text-sm font-medium leading-6 text-slate-500">
              Nenhuma categoria criada até agora.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
