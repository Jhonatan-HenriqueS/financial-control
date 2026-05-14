"use client";

import {
  Check,
  ChevronDown,
  FolderOpen,
  ReceiptText,
  Repeat,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ExpenseCategory } from "@/types/category";
import type { Expense } from "@/types/expense";

export type ExpenseKindFilter = "all" | "normal" | "fixed";

interface ExpenseCategoryFilterProps {
  categories: ExpenseCategory[];
  expenses: Expense[];
  expenseKindScope: Expense[];
  selectedExpenseKind: ExpenseKindFilter;
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectExpenseKind: (expenseKind: ExpenseKindFilter) => void;
}

interface ExpenseKindOption {
  id: ExpenseKindFilter;
  label: string;
  description: string;
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

// Opções do filtro por tipo de gasto.
// "Gastos fixos" usa a marca isMonthly criada no fluxo de gasto fixo.
const expenseKindOptions: ExpenseKindOption[] = [
  {
    id: "all",
    label: "Todos",
    description: "Mostra gastos comuns e fixos.",
  },
  {
    id: "normal",
    label: "Gastos",
    description: "Mostra somente gastos comuns.",
  },
  {
    id: "fixed",
    label: "Gastos fixos",
    description: "Mostra somente gastos fixos.",
  },
];

// Ordena as categorias em ordem alfabética.
// Se uma categoria estiver selecionada, ela fica logo abaixo da opção "Todas".
function sortCategoriesForFilter(
  categories: ExpenseCategory[],
  selectedCategoryId: string | null,
) {
  const sortedCategories = [...categories].sort(
    (firstCategory, secondCategory) =>
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
    ...sortedCategories.filter(
      (category) => category.id !== selectedCategoryId,
    ),
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
  expenseKindScope,
  selectedExpenseKind,
  selectedCategoryId,
  onSelectCategory,
  onSelectExpenseKind,
}: ExpenseCategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"menu" | "category" | "kind">(
    "menu",
  );
  const [isFilterInHeaderRow, setIsFilterInHeaderRow] = useState(false);
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
  const selectedExpenseKindOption = expenseKindOptions.find(
    (option) => option.id === selectedExpenseKind,
  );

  // Conta quantos gastos existem para cada tipo dentro do escopo atual.
  // Esse escopo já respeita a categoria selecionada em GastosContent.
  function getExpenseKindCount(expenseKind: ExpenseKindFilter) {
    if (expenseKind === "normal") {
      return expenseKindScope.filter((expense) => !expense.isMonthly).length;
    }

    if (expenseKind === "fixed") {
      return expenseKindScope.filter((expense) => expense.isMonthly).length;
    }

    return expenseKindScope.length;
  }

  // O layout coloca o botão na mesma linha do titulo a partir de 640px.
  // Nesse caso o popover precisa alinhar pela direita; no mobile ele fica centralizado.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");

    function updateFilterPosition() {
      setIsFilterInHeaderRow(mediaQuery.matches);
    }

    updateFilterPosition();
    mediaQuery.addEventListener("change", updateFilterPosition);

    return () => {
      mediaQuery.removeEventListener("change", updateFilterPosition);
    };
  }, []);

  // Seleciona a categoria e fecha o popover para dar retorno imediato ao usuário.
  function handleSelectCategory(categoryId: string | null) {
    onSelectCategory(categoryId);
    setIsOpen(false);
    setActivePanel("menu");
  }

  // Seleciona o tipo de gasto e fecha o popover.
  function handleSelectExpenseKind(expenseKind: ExpenseKindFilter) {
    onSelectExpenseKind(expenseKind);
    setIsOpen(false);
    setActivePanel("menu");
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);

        if (!open) {
          setActivePanel("menu");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="translucentAction"
          className="h-12 w-full justify-between gap-3 px-4 text-sm font-bold sm:w-auto sm:min-w-40 "
        >
          <span className="flex min-w-0 items-center gap-2">
            <SlidersHorizontal size={16} strokeWidth={2.1} />
            <span className="truncate">
              {selectedCategory?.name ??
                (selectedExpenseKind === "all"
                  ? "Filtrar"
                  : selectedExpenseKindOption?.label)}
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
        avoidCollisions
        align={isFilterInHeaderRow ? "end" : "center"}
        sideOffset={12}
        className="max-w-[calc(100dvw-2rem)] rounded-[28px] bg-white/90 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.16),0_16px_42px_rgba(255,132,0,0.1)] ring-0 backdrop-blur-xl sm:w-[380px]"
        style={{ width: "min(calc(100dvw - 2rem), 380px)" }}
      >
        {activePanel === "menu" ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-500">
              Filtros
            </p>
            <h3 className="mt-3 text-lg font-bold leading-7 text-slate-950">
              Escolha como filtrar
            </h3>

            <div className="mt-5 grid gap-2">
              <Button
                type="button"
                onClick={() => setActivePanel("category")}
                variant="whiteAction"
                className="h-auto w-full justify-between gap-3 rounded-2xl px-4 py-4 text-left hover:scale-[1.01]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <FolderOpen
                    size={18}
                    strokeWidth={2.1}
                    className="shrink-0 text-[#ff7300]"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-950">
                      Categoria
                    </span>
                    <span className="mt-1 block truncate text-xs font-semibold text-slate-500">
                      Filtre por setor do gasto.
                    </span>
                  </span>
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={2.2}
                  className="-rotate-90 text-slate-500"
                />
              </Button>

              <Button
                type="button"
                onClick={() => setActivePanel("kind")}
                variant="whiteAction"
                className="h-auto w-full justify-between gap-3 rounded-2xl px-4 py-4 text-left hover:scale-[1.01]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <ReceiptText
                    size={18}
                    strokeWidth={2.1}
                    className="shrink-0 text-[#ff7300]"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-950">
                      Gastos
                    </span>
                    <span className="mt-1 block truncate text-xs font-semibold text-slate-500">
                      Separe comuns e fixos.
                    </span>
                  </span>
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={2.2}
                  className="-rotate-90 text-slate-500"
                />
              </Button>
            </div>
          </div>
        ) : null}

        {activePanel === "category" ? (
          <>
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-500">
                  Filtrar gastos
                </p>
                <h3 className="mt-3 text-lg font-bold leading-7 text-slate-950">
                  Escolha uma categoria
                </h3>
              </div>

              <div className="shrink-0 whitespace-nowrap rounded-2xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-500 shadow-[0_8px_20px_rgba(255,132,0,0.08)]">
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
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${
                      selectedCategoryId === null
                        ? "bg-[#ff7300]/16"
                        : "bg-slate-950/5"
                    }`}
                  >
                    <Check size={16} strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0 truncate text-sm font-bold">
                    Todas
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-500">
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
                      <span className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-500">
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
          </>
        ) : null}

        {activePanel === "kind" ? (
          <>
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-500">
                  Filtrar gastos
                </p>
                <h3 className="mt-3 text-lg font-bold leading-7 text-slate-950">
                  Escolha um tipo
                </h3>
              </div>

              <div className="shrink-0 whitespace-nowrap rounded-2xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-500 shadow-[0_8px_20px_rgba(255,132,0,0.08)]">
                {formatResultCount(getExpenseKindCount(selectedExpenseKind))}
              </div>
            </div>

            <div className="mt-5 grid gap-2">
              {expenseKindOptions.map((option) => {
                const isSelected = option.id === selectedExpenseKind;

                return (
                  <Button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectExpenseKind(option.id)}
                    variant="ghost"
                    className={`h-auto w-full justify-between gap-3 rounded-2xl px-4 py-3 text-left hover:scale-100 ${
                      isSelected
                        ? "bg-[linear-gradient(135deg,rgba(255,150,36,0.18),rgba(255,183,64,0.12))] text-[#d95f00] shadow-[0_10px_28px_rgba(255,132,0,0.12)]"
                        : "bg-white/52 text-slate-600 hover:bg-white/75"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${
                          isSelected ? "bg-[#ff7300]/16" : "bg-slate-950/5"
                        }`}
                      >
                        {option.id === "fixed" ? (
                          <Repeat size={16} strokeWidth={2.2} />
                        ) : (
                          <Check size={16} strokeWidth={2.2} />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold">
                          {option.label}
                        </span>
                        <span className="mt-1 block truncate text-xs font-semibold opacity-75">
                          {option.description}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-500">
                      {getExpenseKindCount(option.id)}
                    </span>
                  </Button>
                );
              })}
            </div>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
