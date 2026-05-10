"use client";

import { ptBR } from "date-fns/locale/pt-BR";
import { Calendar } from "@/components/ui/calendar";

interface ExpenseDateModalProps {
  isOpen: boolean;
  selectedDate: Date;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
}

// Modal exclusivo para escolher a data do gasto.
// Ele mostra apenas o Calendar do shadcn, sem textos extras.
export function ExpenseDateModal({
  isOpen,
  selectedDate,
  onClose,
  onSelectDate,
}: ExpenseDateModalProps) {
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-[95] flex h-dvh w-dvw items-center justify-center overflow-hidden bg-slate-950/42 px-4 backdrop-blur-md transition-opacity duration-[180ms] ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        // O clique dentro do card não fecha o modal.
        // Assim o usuário seleciona a data sem disparar o fechamento pelo fundo.
        onClick={(event) => event.stopPropagation()}
        className={`relative w-fit max-w-[calc(100dvw-2rem)] overflow-hidden rounded-[30px] bg-white/82 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.24),0_18px_54px_rgba(255,136,0,0.12)] backdrop-blur-[30px] ${
          isOpen
            ? "animate-category-modal-enter"
            : "animate-category-modal-exit"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,153,45,0.2),transparent_38%),linear-gradient(145deg,rgba(255,255,255,0.86),rgba(255,248,238,0.62))]" />

        <div className="relative z-10 flex justify-center rounded-[24px] bg-white/70 p-3 shadow-[0_14px_34px_rgba(255,136,0,0.1)]">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onSelectDate(date);
              }
            }}
            locale={ptBR}
            className="bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}
