"use client";

import { CalendarDays, Clock3, RefreshCcw, X } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  renewBalanceNow,
  setBalanceResetByMonthDay,
  setBalanceResetByPeriod,
} from "@/lib/balance";

interface BalanceResetModalProps {
  currentLabel?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface BalanceResetPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (days: number) => void;
}

interface BalanceResetDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDay: (day: number) => void;
}

// Tempo usado para manter o modal montado enquanto a animação de saída termina.
const CHILD_MODAL_ANIMATION_MS = 180;

// Modal principal que permite escolher como o saldo será renovado.
// A renovação define o início do ciclo; gastos anteriores a esse ciclo deixam
// de reduzir o limite disponível no dashboard.
export function BalanceResetModal({
  currentLabel,
  isOpen,
  onClose,
}: BalanceResetModalProps) {
  const periodCloseTimerRef = useRef<number | null>(null);
  const dayCloseTimerRef = useRef<number | null>(null);
  const [isPeriodModalMounted, setIsPeriodModalMounted] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isDayModalMounted, setIsDayModalMounted] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  // Abre o modal que pede a quantidade de dias.
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

  // Abre o seletor com os dias do mês.
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

  // Salva uma renovação por período fixo.
  function handleSelectPeriod(days: number) {
    setBalanceResetByPeriod(days);
    toast.success("Renovação do saldo definida com sucesso.");
    closePeriodModal();
    onClose();
  }

  // Salva uma renovação para um dia específico de cada mês.
  function handleSelectMonthDay(day: number) {
    setBalanceResetByMonthDay(day);
    toast.success("Renovação do saldo definida com sucesso.");
    closeDayModal();
    onClose();
  }

  // Reinicia o ciclo no momento do clique.
  // Isso faz o saldo disponível ignorar os gastos anteriores imediatamente.
  function handleRenewNow() {
    renewBalanceNow();
    toast.success("Saldo renovado com sucesso.");
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
          // Impede que um clique dentro do card feche o modal.
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
                  Renovação
                </p>
                <h3 className="mt-3 text-2xl font-bold text-slate-950">
                  Redefina seu saldo
                </h3>
                <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-slate-600">
                  Escolha quando os gastos antigos deixam de abater o limite
                  disponível e o saldo volta ao valor inicial.
                </p>
              </div>

              <Button
                type="button"
                aria-label="Fechar modal de renovação do saldo"
                onClick={onClose}
                variant="ghost"
                className="h-11 w-11 rounded-2xl text-slate-950 hover:bg-white/55 focus-visible:ring-0 focus-visible:shadow-[0_0_0_5px_rgba(255,154,42,0.15)]"
              >
                <X size={19} strokeWidth={2.1} />
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                onClick={openPeriodModal}
                variant="translucentAction"
                className="h-14 gap-2 text-sm"
              >
                <Clock3 size={18} strokeWidth={2.1} />A cada período
              </Button>
              <Button
                type="button"
                onClick={openDayModal}
                variant="translucentAction"
                className="h-14 gap-2 text-sm"
              >
                <CalendarDays size={18} strokeWidth={2.1} />
                Dia do mês
              </Button>
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-500">
              {currentLabel ?? "Nenhuma renovação configurada."}
            </p>

            <Button
              type="button"
              onClick={handleRenewNow}
              variant="sun"
              size="form"
              className="mt-7 gap-2"
            >
              <RefreshCcw size={18} strokeWidth={2.1} />
              Renovar agora
            </Button>
          </div>
        </div>
      </div>

      {isPeriodModalMounted ? (
        <BalanceResetPeriodModal
          isOpen={isPeriodModalOpen}
          onClose={closePeriodModal}
          onSubmit={handleSelectPeriod}
        />
      ) : null}

      {isDayModalMounted ? (
        <BalanceResetDayModal
          isOpen={isDayModalOpen}
          onClose={closeDayModal}
          onSelectDay={handleSelectMonthDay}
        />
      ) : null}
    </>
  );
}

// Modal pequeno para o usuário informar a cada quantos dias o saldo renova.
function BalanceResetPeriodModal({
  isOpen,
  onClose,
  onSubmit,
}: BalanceResetPeriodModalProps) {
  const [days, setDays] = useState("");
  const [message, setMessage] = useState("");

  // Valida o campo antes de salvar a regra.
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
            Salvar renovação
          </Button>
        </div>
      </form>
    </div>
  );
}

// Modal de seleção de dia do mês.
// Ele mostra somente os dias, sem calendário completo, igual ao fluxo de gasto fixo.
function BalanceResetDayModal({
  isOpen,
  onClose,
  onSelectDay,
}: BalanceResetDayModalProps) {
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
