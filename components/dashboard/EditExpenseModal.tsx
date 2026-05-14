"use client";

import { CalendarDays, Clock3, X } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { parseCurrencyToCents } from "@/lib/currency";
import { updateExpense } from "@/lib/expenses";
import type { Expense } from "@/types/expense";

interface EditExpenseModalProps {
  expense: Expense;
  isOpen: boolean;
  onClose: () => void;
}

interface RecurrencePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (days: number) => void;
}

interface RecurrenceDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDay: (day: number) => void;
}

const CHILD_MODAL_ANIMATION_MS = 180;

// Converte centavos para o formato que o input financeiro usa.
function formatAmountForInput(amountCents: number) {
  return (amountCents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Descobre o tipo inicial de recorrência a partir do texto salvo.
function getInitialRecurrenceMode(recurrenceLabel?: string) {
  if (recurrenceLabel?.includes("a cada")) {
    return "period";
  }

  if (recurrenceLabel?.includes("todo dia")) {
    return "monthDay";
  }

  return null;
}

// Modal de edição de gasto.
// Gasto comum edita nome e valor; gasto fixo também edita a renovação exibida no card.
export function EditExpenseModal({
  expense,
  isOpen,
  onClose,
}: EditExpenseModalProps) {
  const periodCloseTimerRef = useRef<number | null>(null);
  const dayCloseTimerRef = useRef<number | null>(null);
  const [expenseName, setExpenseName] = useState(expense.name);
  const [amount, setAmount] = useState(formatAmountForInput(expense.amountCents));
  const [recurrenceLabel, setRecurrenceLabel] = useState(
    expense.recurrenceLabel ?? "",
  );
  const [recurrenceMode, setRecurrenceMode] = useState<
    "period" | "monthDay" | null
  >(getInitialRecurrenceMode(expense.recurrenceLabel));
  const [message, setMessage] = useState("");
  const [isPeriodModalMounted, setIsPeriodModalMounted] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isDayModalMounted, setIsDayModalMounted] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  // Abre o modal para informar a quantidade de dias da renovação.
  function openPeriodModal() {
    if (periodCloseTimerRef.current) {
      window.clearTimeout(periodCloseTimerRef.current);
    }

    setIsPeriodModalMounted(true);
    setIsPeriodModalOpen(true);
  }

  // Fecha o modal de período sem cortar a animação.
  function closePeriodModal() {
    setIsPeriodModalOpen(false);

    periodCloseTimerRef.current = window.setTimeout(() => {
      setIsPeriodModalMounted(false);
    }, CHILD_MODAL_ANIMATION_MS);
  }

  // Abre o seletor de dia do mês.
  function openDayModal() {
    if (dayCloseTimerRef.current) {
      window.clearTimeout(dayCloseTimerRef.current);
    }

    setIsDayModalMounted(true);
    setIsDayModalOpen(true);
  }

  // Fecha o seletor de dia do mês sem cortar a animação.
  function closeDayModal() {
    setIsDayModalOpen(false);

    dayCloseTimerRef.current = window.setTimeout(() => {
      setIsDayModalMounted(false);
    }, CHILD_MODAL_ANIMATION_MS);
  }

  // Atualiza o texto de renovação por período.
  function handleSelectPeriod(days: number) {
    setRecurrenceLabel(`Renova a cada ${days} dias`);
    setRecurrenceMode("period");
    setMessage("");
    closePeriodModal();
  }

  // Atualiza o texto de renovação por dia fixo do mês.
  function handleSelectMonthDay(day: number) {
    setRecurrenceLabel(`Renova todo dia ${day} de cada mês`);
    setRecurrenceMode("monthDay");
    setMessage("");
    closeDayModal();
  }

  // Valida e salva a edição no localStorage.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = updateExpense({
      id: expense.id,
      name: expenseName,
      amountCents: parseCurrencyToCents(amount),
      recurrenceLabel,
    });

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    toast.success("Gasto editado com sucesso.");
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
          // Mantém o formulário aberto quando o usuário clica dentro do card.
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
                  Editar gasto
                </p>
                <h3 className="mt-3 text-2xl font-bold text-slate-950">
                  Atualize sua despesa
                </h3>
              </div>

              <Button
                type="button"
                aria-label="Fechar edição de gasto"
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
                  htmlFor={`edit-expense-name-${expense.id}`}
                  className="text-sm font-bold text-slate-950"
                >
                  Nome do gasto
                </label>
                <input
                  id={`edit-expense-name-${expense.id}`}
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
                  htmlFor={`edit-expense-amount-${expense.id}`}
                  className="text-sm font-bold text-slate-950"
                >
                  Valor
                </label>
                <div className="flex h-13 items-center rounded-2xl bg-white/78 px-5 shadow-[0_10px_26px_rgba(255,136,0,0.08)] transition-all duration-200 focus-within:shadow-[0_0_0_5px_rgba(255,154,42,0.18),0_14px_34px_rgba(255,112,0,0.2)]">
                  <span className="mr-2 text-sm font-bold text-slate-950">
                    R$
                  </span>
                  <input
                    id={`edit-expense-amount-${expense.id}`}
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

              {expense.isMonthly ? (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-950">Renovação</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                      type="button"
                      onClick={openPeriodModal}
                      variant={
                        recurrenceMode === "period"
                          ? "sun"
                          : "translucentAction"
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
              ) : null}

              {message ? (
                <p className="text-sm font-semibold text-red-600">{message}</p>
              ) : null}

              <Button type="submit" variant="sun" size="form">
                Salvar alterações
              </Button>
            </form>
          </div>
        </div>
      </div>

      {isPeriodModalMounted ? (
        <RecurrencePeriodModal
          isOpen={isPeriodModalOpen}
          onClose={closePeriodModal}
          onSubmit={handleSelectPeriod}
        />
      ) : null}

      {isDayModalMounted ? (
        <RecurrenceDayModal
          isOpen={isDayModalOpen}
          onClose={closeDayModal}
          onSelectDay={handleSelectMonthDay}
        />
      ) : null}
    </>
  );
}

// Modal pequeno para definir renovação a cada X dias.
function RecurrencePeriodModal({
  isOpen,
  onClose,
  onSubmit,
}: RecurrencePeriodModalProps) {
  const [days, setDays] = useState("");
  const [message, setMessage] = useState("");

  // Salva somente se a quantidade de dias for válida.
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

// Modal de seleção de dia do mês sem mês ou ano.
function RecurrenceDayModal({
  isOpen,
  onClose,
  onSelectDay,
}: RecurrenceDayModalProps) {
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
