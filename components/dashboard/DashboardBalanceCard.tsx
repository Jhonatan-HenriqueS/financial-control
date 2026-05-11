"use client";

import { Plus, RefreshCcw } from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";
import { BalanceAmountModal } from "@/components/dashboard/BalanceAmountModal";
import { ExpenseSummaryCard } from "@/components/dashboard/ExpenseSummaryCard";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  addBalanceCents,
  getBalanceCents,
  setBalanceCents,
  subscribeToBalance,
} from "@/lib/balance";
import { formatCurrency } from "@/lib/currency";
import { getExpenses, subscribeToExpenses } from "@/lib/expenses";
import type { Expense } from "@/types/expense";

type BalanceModalMode = "define" | "add" | "update";

// Snapshot usado no servidor.
// Como localStorage só existe no navegador, o saldo começa como null.
const getServerBalanceSnapshot = () => null;

// Lista vazia fixa para os gastos durante a renderização no servidor.
const EMPTY_EXPENSES: Expense[] = [];

// Snapshot usado antes de o navegador ler o localStorage dos gastos.
const getServerExpensesSnapshot = () => EMPTY_EXPENSES;

// Tempo da animação do modal de saldo.
const BALANCE_MODAL_ANIMATION_MS = 180;

// Card principal da página Dashboard.
// Ele mostra o limite disponível e permite definir, adicionar ou alterar saldo.
export function DashboardBalanceCard() {
  const balanceCents = useSyncExternalStore(
    subscribeToBalance,
    getBalanceCents,
    getServerBalanceSnapshot,
  );
  const expenses = useSyncExternalStore(
    subscribeToExpenses,
    getExpenses,
    getServerExpensesSnapshot,
  );
  const closeTimerRef = useRef<number | null>(null);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<BalanceModalMode>("define");
  const hasBalance = balanceCents !== null;
  const totalExpensesCents = expenses.reduce(
    (total, expense) => total + expense.amountCents,
    0,
  );
  const availableBalanceCents = (balanceCents ?? 0) - totalExpensesCents;

  // Abre o modal na ação pedida.
  // O mesmo formulário recebe o valor e a função de salvar decide o que fazer.
  function openAmountModal(mode: BalanceModalMode) {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    setModalMode(mode);
    setIsActionsOpen(false);
    setIsModalMounted(true);
    setIsModalOpen(true);
  }

  // Fecha o modal depois que a animação de saída termina.
  function closeAmountModal() {
    setIsModalOpen(false);

    closeTimerRef.current = window.setTimeout(() => {
      setIsModalMounted(false);
    }, BALANCE_MODAL_ANIMATION_MS);
  }

  // Salva o valor conforme a ação escolhida pelo usuário.
  function handleSaveBalance(amountCents: number) {
    if (modalMode === "add") {
      addBalanceCents(amountCents);
    } else {
      setBalanceCents(amountCents);
    }

    closeAmountModal();
  }

  return (
    <>
      <ExpenseSummaryCard
        title="Limite disponível"
        totalAmountCents={availableBalanceCents}
        subtitle={`Saldo total: ${formatCurrency(balanceCents ?? 0)}`}
        isAmountNegative={availableBalanceCents < 0}
        actionSlot={
          hasBalance ? (
            <Popover open={isActionsOpen} onOpenChange={setIsActionsOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  className="mt-6 h-12 rounded-2xl bg-white/38 px-6 text-sm font-bold text-[#ff6500] shadow-[0_10px_24px_rgba(255,255,255,0.14)] backdrop-blur-sm hover:scale-[1.02] hover:bg-white/48 hover:shadow-[0_12px_28px_rgba(255,255,255,0.18)] sm:text-base"
                >
                  Atualizar saldo
                </Button>
              </PopoverTrigger>

              <PopoverContent
                side="top"
                align="start"
                sideOffset={10}
                className="w-52 rounded-2xl bg-white/88 p-2 shadow-[0_18px_48px_rgba(15,23,42,0.16),0_14px_34px_rgba(255,136,0,0.1)] ring-0 backdrop-blur-xl"
              >
                <Button
                  type="button"
                  variant="whiteAction"
                  size="actionRow"
                  onClick={() => openAmountModal("add")}
                >
                  <Plus size={15} strokeWidth={2.1} />
                  Adicionar saldo
                </Button>
                <Button
                  type="button"
                  variant="whiteAction"
                  size="actionRow"
                  onClick={() => openAmountModal("update")}
                >
                  <RefreshCcw size={15} strokeWidth={2.1} />
                  Alterar saldo
                </Button>
              </PopoverContent>
            </Popover>
          ) : (
            <Button
              type="button"
              onClick={() => openAmountModal("define")}
              className="mt-6 h-12 rounded-2xl bg-white/38 px-6 text-sm font-bold text-[#ff6500] shadow-[0_10px_24px_rgba(255,255,255,0.14)] backdrop-blur-sm hover:scale-[1.02] hover:bg-white/48 hover:shadow-[0_12px_28px_rgba(255,255,255,0.18)] sm:text-base"
            >
              Definir saldo
            </Button>
          )
        }
      />

      {isModalMounted ? (
        <BalanceAmountModal
          isOpen={isModalOpen}
          mode={modalMode}
          onClose={closeAmountModal}
          onSubmit={handleSaveBalance}
        />
      ) : null}
    </>
  );
}
