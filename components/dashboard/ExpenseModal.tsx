"use client";

import { CalendarDays, Tags, X } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { ExpenseCategoryModal } from "@/components/dashboard/ExpenseCategoryModal";
import { ExpenseDateModal } from "@/components/dashboard/ExpenseDateModal";
import { Button } from "@/components/ui/button";
import { parseCurrencyToCents } from "@/lib/currency";
import { createExpense } from "@/lib/expenses";
import type { ExpenseCategory } from "@/types/category";

interface ExpenseModalProps {
  categories: ExpenseCategory[];
  isOpen: boolean;
  onClose: () => void;
}

// Tempo de saída dos modais filhos.
// Ele precisa bater com a animação definida no globals.css.
const MODAL_ANIMATION_MS = 180;

// Transforma uma data em texto salvo como yyyy-mm-dd.
// Esse formato é fácil de ordenar e não sofre com tradução do navegador.
function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Transforma yyyy-mm-dd em dd/mm/aaaa para mostrar ao usuário.
function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-");

  return `${day}/${month}/${year}`;
}

// Modal principal de criação de gasto.
// Ele recebe nome, valor, data e categoria antes de salvar no localStorage.
export function ExpenseModal({
  categories,
  isOpen,
  onClose,
}: ExpenseModalProps) {
  const dateCloseTimerRef = useRef<number | null>(null);
  const categoryCloseTimerRef = useRef<number | null>(null);
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [dateMode, setDateMode] = useState<"current" | "custom">("current");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory | null>(null);
  const [message, setMessage] = useState("");
  const [isDateModalMounted, setIsDateModalMounted] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isCategoryModalMounted, setIsCategoryModalMounted] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const selectedDateKey = formatDateKey(selectedDate);

  // Abre o modal de calendário e marca a opção de data personalizada.
  function openDateModal() {
    if (dateCloseTimerRef.current) {
      window.clearTimeout(dateCloseTimerRef.current);
    }

    setDateMode("custom");
    setIsDateModalMounted(true);
    setIsDateModalOpen(true);
  }

  // Fecha o calendário mantendo a animação de saída.
  function closeDateModal() {
    setIsDateModalOpen(false);

    dateCloseTimerRef.current = window.setTimeout(() => {
      setIsDateModalMounted(false);
    }, MODAL_ANIMATION_MS);
  }

  // Abre o modal com as categorias já cadastradas.
  function openCategoryModal() {
    if (categoryCloseTimerRef.current) {
      window.clearTimeout(categoryCloseTimerRef.current);
    }

    setIsCategoryModalMounted(true);
    setIsCategoryModalOpen(true);
  }

  // Fecha a seleção de categorias com animação.
  function closeCategoryModal() {
    setIsCategoryModalOpen(false);

    categoryCloseTimerRef.current = window.setTimeout(() => {
      setIsCategoryModalMounted(false);
    }, MODAL_ANIMATION_MS);
  }

  // Salva a categoria escolhida dentro do modal principal e fecha a lista.
  function handleSelectCategory(category: ExpenseCategory) {
    setSelectedCategory(category);
    setMessage("");
    closeCategoryModal();
  }

  // Seleciona a data atual e desativa a data personalizada.
  function useCurrentDate() {
    setDateMode("current");
    setSelectedDate(new Date());
    setMessage("");
  }

  // Valida e salva o gasto no localStorage.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = createExpense({
      name: expenseName,
      amountCents: parseCurrencyToCents(amount),
      date:
        dateMode === "current" ? formatDateKey(new Date()) : selectedDateKey,
      categoryId: selectedCategory?.id ?? "",
      categoryName: selectedCategory?.name ?? "",
      categoryColor: selectedCategory?.color ?? "",
    });

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    onClose();
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[85] flex h-dvh w-dvw items-center justify-center overflow-hidden bg-slate-950/42 px-4 backdrop-blur-md transition-opacity duration-[180ms] ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          // O formulário fica clicável sem fechar quando o usuário interage dentro dele.
          onClick={(event) => event.stopPropagation()}
          className={`relative w-full max-w-xl overflow-hidden rounded-[34px] bg-white/76 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.26),0_18px_54px_rgba(255,136,0,0.12)] backdrop-blur-[30px] sm:p-8 ${
            isOpen
              ? "animate-category-modal-enter"
              : "animate-category-modal-exit"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,153,45,0.22),transparent_38%),linear-gradient(145deg,rgba(255,255,255,0.84),rgba(255,248,238,0.6))]" />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#ff7300]">
                  Novo gasto
                </p>
                <h3 className="mt-3 text-2xl font-bold text-slate-950">
                  Registre sua despesa
                </h3>
              </div>

              <Button
                type="button"
                aria-label="Fechar gasto"
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
                  htmlFor="expense-name"
                  className="text-sm font-bold text-slate-950"
                >
                  Nome do gasto
                </label>
                <input
                  id="expense-name"
                  type="text"
                  value={expenseName}
                  onChange={(event) => {
                    setExpenseName(event.target.value);
                    setMessage("");
                  }}
                  placeholder="Ex: Mercado"
                  className="h-13 w-full rounded-2xl bg-white/78 px-5 text-sm font-medium text-slate-950 shadow-[0_10px_26px_rgba(255,136,0,0.08)] outline-none transition-all duration-200 placeholder:text-slate-400 focus:shadow-[0_0_0_5px_rgba(255,154,42,0.18),0_14px_34px_rgba(255,112,0,0.2)]"
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="expense-amount"
                  className="text-sm font-bold text-slate-950"
                >
                  Valor
                </label>
                <div className="flex h-13 items-center rounded-2xl bg-white/78 px-5 shadow-[0_10px_26px_rgba(255,136,0,0.08)] transition-all duration-200 focus-within:shadow-[0_0_0_5px_rgba(255,154,42,0.18),0_14px_34px_rgba(255,112,0,0.2)]">
                  <span className="mr-2 text-sm font-bold ">R$</span>
                  <input
                    id="expense-amount"
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

              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-950">Data</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={useCurrentDate}
                    variant={
                      dateMode === "current" ? "sun" : "translucentAction"
                    }
                    className="h-12 text-sm"
                  >
                    Usar data atual
                  </Button>
                  <Button
                    type="button"
                    onClick={openDateModal}
                    variant={
                      dateMode === "custom" ? "sun" : "translucentAction"
                    }
                    className="h-12 gap-2 text-sm"
                  >
                    <CalendarDays size={17} strokeWidth={2.1} />
                    Personalizar
                  </Button>
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  Data selecionada: {formatDateLabel(selectedDateKey)}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-950">Categoria</p>
                <Button
                  type="button"
                  onClick={openCategoryModal}
                  variant="translucentAction"
                  className="h-13 w-full justify-between gap-3 bg-white/68 px-4 text-left hover:bg-white/86"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    {selectedCategory ? (
                      <span
                        className="h-6 w-6 shrink-0 rounded-full shadow-[0_5px_12px_rgba(15,23,42,0.12)]"
                        style={{ backgroundColor: selectedCategory.color }}
                        aria-hidden="true"
                      />
                    ) : (
                      <Tags
                        size={19}
                        strokeWidth={2.1}
                        className="shrink-0 text-[#ff7300]"
                      />
                    )}
                    <span className="truncate text-sm font-bold text-slate-950">
                      {selectedCategory?.name ?? "Selecionar categoria"}
                    </span>
                  </span>
                  <span className="text-xs font-bold text-[#ff7300]">
                    Alterar
                  </span>
                </Button>
              </div>

              {message ? (
                <p className="text-sm font-semibold text-red-600">{message}</p>
              ) : null}

              <Button type="submit" variant="sun" size="form">
                Salvar gasto
              </Button>
            </form>
          </div>
        </div>
      </div>

      {isDateModalMounted ? (
        <ExpenseDateModal
          isOpen={isDateModalOpen}
          selectedDate={selectedDate}
          onClose={closeDateModal}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setDateMode("custom");
            setMessage("");
            closeDateModal();
          }}
        />
      ) : null}

      {isCategoryModalMounted ? (
        <ExpenseCategoryModal
          categories={categories}
          isOpen={isCategoryModalOpen}
          selectedCategoryId={selectedCategory?.id}
          onClose={closeCategoryModal}
          onSelectCategory={handleSelectCategory}
        />
      ) : null}
    </>
  );
}
