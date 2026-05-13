"use client";

import { CalendarDays, Clock3, Tags, X } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { ExpenseCategoryModal } from "@/components/dashboard/ExpenseCategoryModal";
import { Button } from "@/components/ui/button";
import { parseCurrencyToCents } from "@/lib/currency";
import { createMonthlyExpense } from "@/lib/expenses";
import type { ExpenseCategory } from "@/types/category";

interface MonthlyExpenseModalProps {
  categories: ExpenseCategory[];
  isOpen: boolean;
  onClose: () => void;
}

const CHILD_MODAL_ANIMATION_MS = 180;

// Modal inicial para criação de gasto mensal.
// A recorrência ainda não executa automações; ela apenas aparece no card criado.
export function MonthlyExpenseModal({
  categories,
  isOpen,
  onClose,
}: MonthlyExpenseModalProps) {
  const periodCloseTimerRef = useRef<number | null>(null);
  const dayCloseTimerRef = useRef<number | null>(null);
  const categoryCloseTimerRef = useRef<number | null>(null);
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [recurrenceLabel, setRecurrenceLabel] = useState("");
  const [recurrenceMode, setRecurrenceMode] = useState<
    "period" | "monthDay" | null
  >(null);
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory | null>(null);
  const [message, setMessage] = useState("");
  const [isPeriodModalMounted, setIsPeriodModalMounted] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isDayModalMounted, setIsDayModalMounted] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isCategoryModalMounted, setIsCategoryModalMounted] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Abre o modal que pede a quantidade de dias para renovação.
  function openPeriodModal() {
    if (periodCloseTimerRef.current) {
      window.clearTimeout(periodCloseTimerRef.current);
    }

    setIsPeriodModalMounted(true);
    setIsPeriodModalOpen(true);
  }

  // Fecha o modal de período mantendo a animação.
  function closePeriodModal() {
    setIsPeriodModalOpen(false);

    periodCloseTimerRef.current = window.setTimeout(() => {
      setIsPeriodModalMounted(false);
    }, CHILD_MODAL_ANIMATION_MS);
  }

  // Abre o modal com os dias do mês, sem mês ou ano.
  function openDayModal() {
    if (dayCloseTimerRef.current) {
      window.clearTimeout(dayCloseTimerRef.current);
    }

    setIsDayModalMounted(true);
    setIsDayModalOpen(true);
  }

  // Fecha o seletor de dia mantendo a animação.
  function closeDayModal() {
    setIsDayModalOpen(false);

    dayCloseTimerRef.current = window.setTimeout(() => {
      setIsDayModalMounted(false);
    }, CHILD_MODAL_ANIMATION_MS);
  }

  // Abre o mesmo modal de categorias usado no gasto normal.
  function openCategoryModal() {
    if (categoryCloseTimerRef.current) {
      window.clearTimeout(categoryCloseTimerRef.current);
    }

    setIsCategoryModalMounted(true);
    setIsCategoryModalOpen(true);
  }

  // Fecha o modal de categoria respeitando a animação.
  function closeCategoryModal() {
    setIsCategoryModalOpen(false);

    categoryCloseTimerRef.current = window.setTimeout(() => {
      setIsCategoryModalMounted(false);
    }, CHILD_MODAL_ANIMATION_MS);
  }

  // Salva a opção "a cada X dias" como texto informativo.
  function handleSelectPeriod(days: number) {
    setRecurrenceLabel(`Renova a cada ${days} dias`);
    setRecurrenceMode("period");
    setMessage("");
    closePeriodModal();
  }

  // Salva a opção "todo dia X do mês" como texto informativo.
  function handleSelectMonthDay(day: number) {
    setRecurrenceLabel(`Renova todo dia ${day} de cada mês`);
    setRecurrenceMode("monthDay");
    setMessage("");
    closeDayModal();
  }

  // Salva a categoria escolhida e fecha a lista.
  function handleSelectCategory(category: ExpenseCategory) {
    setSelectedCategory(category);
    setMessage("");
    closeCategoryModal();
  }

  // Valida e cria o gasto mensal na mesma lista de gastos.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = createMonthlyExpense({
      name: expenseName,
      amountCents: parseCurrencyToCents(amount),
      recurrenceLabel,
      categoryId: selectedCategory?.id ?? "",
      categoryName: selectedCategory?.name ?? "",
      categoryColor: selectedCategory?.color ?? "",
    });

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    toast.success("Gasto mensal criado com sucesso.");
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
          // Mantém o modal aberto quando o usuário clica dentro do card.
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
                  Gasto fixo
                </p>
                <h3 className="mt-3 text-2xl font-bold text-slate-950">
                  Crie um gasto fixo
                </h3>
              </div>

              <Button
                type="button"
                aria-label="Fechar modal de gasto fixo"
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
                  htmlFor="monthly-expense-name"
                  className="text-sm font-bold text-slate-950"
                >
                  Nome do gasto
                </label>
                <input
                  id="monthly-expense-name"
                  type="text"
                  value={expenseName}
                  onChange={(event) => {
                    setExpenseName(event.target.value);
                    setMessage("");
                  }}
                  placeholder="Ex: Netflix"
                  className="h-13 w-full rounded-2xl bg-white/78 px-5 text-sm font-medium text-slate-950 shadow-[0_10px_26px_rgba(255,136,0,0.08)] outline-none transition-all duration-200 placeholder:text-slate-400 focus:shadow-[0_0_0_5px_rgba(255,154,42,0.18),0_14px_34px_rgba(255,112,0,0.2)]"
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="monthly-expense-amount"
                  className="text-sm font-bold text-slate-950"
                >
                  Valor
                </label>
                <div className="flex h-13 items-center rounded-2xl bg-white/78 px-5 shadow-[0_10px_26px_rgba(255,136,0,0.08)] transition-all duration-200 focus-within:shadow-[0_0_0_5px_rgba(255,154,42,0.18),0_14px_34px_rgba(255,112,0,0.2)]">
                  <span className="mr-2 text-sm font-bold text-slate-950">
                    R$
                  </span>
                  <input
                    id="monthly-expense-amount"
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      setMessage("");
                    }}
                    placeholder="49,90"
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-950">Renovação</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={openPeriodModal}
                    variant={
                      recurrenceMode === "period" ? "sun" : "translucentAction"
                    }
                    className="h-12 gap-2 text-sm"
                  >
                    <Clock3 size={17} strokeWidth={2.1} />A cada período
                  </Button>
                  <Button
                    type="button"
                    onClick={openDayModal}
                    variant={
                      recurrenceMode === "monthDay"
                        ? "sun"
                        : "translucentAction"
                    }
                    className="h-12 gap-2 text-sm"
                  >
                    <CalendarDays size={17} strokeWidth={2.1} />
                    Dia do mês
                  </Button>
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  {recurrenceLabel || "Nenhuma renovação selecionada."}
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
                Criar gasto mensal
              </Button>
            </form>
          </div>
        </div>
      </div>

      {isPeriodModalMounted ? (
        <MonthlyExpensePeriodModal
          isOpen={isPeriodModalOpen}
          onClose={closePeriodModal}
          onSubmit={handleSelectPeriod}
        />
      ) : null}

      {isDayModalMounted ? (
        <MonthlyExpenseDayModal
          isOpen={isDayModalOpen}
          onClose={closeDayModal}
          onSelectDay={handleSelectMonthDay}
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

interface MonthlyExpensePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (days: number) => void;
}

// Modal pequeno para informar a cada quantos dias o gasto será renovado.
function MonthlyExpensePeriodModal({
  isOpen,
  onClose,
  onSubmit,
}: MonthlyExpensePeriodModalProps) {
  const [days, setDays] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedDays = Number(days);

    if (!Number.isInteger(parsedDays) || parsedDays <= 0) {
      setMessage("Informe uma quantidade de dias válida.");
      return;
    }

    onSubmit(parsedDays);
  }

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-[90] flex h-dvh w-dvw items-center justify-center overflow-hidden bg-slate-950/42 px-4 backdrop-blur-md transition-opacity duration-[180ms] ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        noValidate
        className={`relative w-full max-w-sm overflow-hidden rounded-[30px] bg-white/82 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22),0_18px_54px_rgba(255,136,0,0.12)] backdrop-blur-[30px] ${
          isOpen
            ? "animate-category-modal-enter"
            : "animate-category-modal-exit"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,153,45,0.2),transparent_38%),linear-gradient(145deg,rgba(255,255,255,0.86),rgba(255,248,238,0.62))]" />
        <div className="relative z-10">
          <h4 className="text-xl font-bold text-slate-950">
            Renovar a cada quantos dias?
          </h4>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            value={days}
            onChange={(event) => {
              setDays(event.target.value);
              setMessage("");
            }}
            placeholder="Ex: 30"
            className="mt-5 h-13 w-full rounded-2xl bg-white/78 px-5 text-sm font-medium text-slate-950 shadow-[0_10px_26px_rgba(255,136,0,0.08)] outline-none transition-all duration-200 placeholder:text-slate-400 focus:shadow-[0_0_0_5px_rgba(255,154,42,0.18),0_14px_34px_rgba(255,112,0,0.2)]"
          />
          {message ? (
            <p className="mt-3 text-sm font-semibold text-red-600">{message}</p>
          ) : null}
          <Button type="submit" variant="sun" size="form" className="mt-5">
            Salvar período
          </Button>
        </div>
      </form>
    </div>
  );
}

interface MonthlyExpenseDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDay: (day: number) => void;
}

// Modal de seleção de dia do mês.
// Ele mostra apenas números de 1 a 31, sem mês ou ano.
function MonthlyExpenseDayModal({
  isOpen,
  onClose,
  onSelectDay,
}: MonthlyExpenseDayModalProps) {
  const days = Array.from({ length: 31 }, (_, index) => index + 1);

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-[90] flex h-dvh w-dvw items-center justify-center overflow-hidden bg-slate-950/42 px-4 backdrop-blur-md transition-opacity duration-[180ms] ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`relative w-full max-w-sm overflow-hidden rounded-[30px] bg-white/82 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22),0_18px_54px_rgba(255,136,0,0.12)] backdrop-blur-[30px] ${
          isOpen
            ? "animate-category-modal-enter"
            : "animate-category-modal-exit"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,153,45,0.2),transparent_38%),linear-gradient(145deg,rgba(255,255,255,0.86),rgba(255,248,238,0.62))]" />
        <div className="relative z-10">
          <h4 className="text-xl font-bold text-slate-950">
            Escolha o dia do mês
          </h4>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {days.map((day) => (
              <Button
                key={day}
                type="button"
                variant="translucentAction"
                className="h-10 rounded-xl text-sm font-bold"
                onClick={() => onSelectDay(day)}
              >
                {day}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
