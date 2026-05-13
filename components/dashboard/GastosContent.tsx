"use client";

import { CalendarDays, Plus } from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { ExpenseActionsPopover } from "@/components/dashboard/ExpenseActionsPopover";
import { ExpenseCategoryFilter } from "@/components/dashboard/ExpenseCategoryFilter";
import { ExpenseModal } from "@/components/dashboard/ExpenseModal";
import { ExpenseSummaryCard } from "@/components/dashboard/ExpenseSummaryCard";
import { MonthlyExpenseModal } from "@/components/dashboard/MonthlyExpenseModal";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatCurrency } from "@/lib/currency";
import {
  deleteExpense,
  getExpenses,
  subscribeToExpenses,
} from "@/lib/expenses";
import { getCategories, subscribeToCategories } from "@/lib/categories";
import { getBalanceCents, subscribeToBalance } from "@/lib/balance";
import type { ExpenseCategory } from "@/types/category";
import type { Expense } from "@/types/expense";

// Listas vazias estáveis para o snapshot do servidor.
// O React precisa da mesma referência para não entender que algo mudou em loop.
const EMPTY_EXPENSES: Expense[] = [];
const EMPTY_CATEGORIES: ExpenseCategory[] = [];

// Tempo da animação do modal de criação de gasto.
const EXPENSE_MODAL_ANIMATION_MS = 180;

// Snapshot usado enquanto o servidor renderiza.
const getServerExpensesSnapshot = () => EMPTY_EXPENSES;
const getServerCategoriesSnapshot = () => EMPTY_CATEGORIES;
const getServerBalanceSnapshot = () => null;

// Mostra a data salva como yyyy-mm-dd no formato brasileiro dd/mm/aaaa.
function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-");

  return `${day}/${month}/${year}`;
}

// Conteúdo da página de gastos.
// Aqui o usuário cria, visualiza e exclui despesas sem trocar de rota.
export function GastosContent() {
  const expenses = useSyncExternalStore(
    subscribeToExpenses,
    getExpenses,
    getServerExpensesSnapshot,
  );
  const categories = useSyncExternalStore(
    subscribeToCategories,
    getCategories,
    getServerCategoriesSnapshot,
  );
  const balanceCents = useSyncExternalStore(
    subscribeToBalance,
    getBalanceCents,
    getServerBalanceSnapshot,
  );
  const closeTimerRef = useRef<number | null>(null);
  const monthlyCloseTimerRef = useRef<number | null>(null);
  const [isCreatePopoverOpen, setIsCreatePopoverOpen] = useState(false);
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMonthlyModalMounted, setIsMonthlyModalMounted] = useState(false);
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const filteredExpenses = selectedCategory
    ? expenses.filter((expense) => expense.categoryId === selectedCategory.id)
    : expenses;
  const filteredTotalAmountCents = filteredExpenses.reduce(
    (total, expense) => total + expense.amountCents,
    0,
  );
  const currentLimitCents = selectedCategory
    ? selectedCategory.limitCents
    : balanceCents;
  const summaryLimitText =
    currentLimitCents !== null && currentLimitCents !== undefined
      ? `Limite: ${formatCurrency(currentLimitCents)}`
      : "Limite: não definido";
  const hasExceededLimit =
    currentLimitCents !== null &&
    currentLimitCents !== undefined &&
    filteredTotalAmountCents > currentLimitCents;

  // Abre o modal de criação já no estado visível.
  // Isso evita um pequeno flash antes da animação começar.
  function openCreateExpenseModal() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    setIsCreatePopoverOpen(false);
    setIsModalMounted(true);
    setIsModalOpen(true);
  }

  // Fecha o modal e desmonta depois da animação terminar.
  function closeCreateExpenseModal() {
    setIsModalOpen(false);

    closeTimerRef.current = window.setTimeout(() => {
      setIsModalMounted(false);
    }, EXPENSE_MODAL_ANIMATION_MS);
  }

  // Abre o modal visual de gasto mensal a partir do popover do botão principal.
  function openMonthlyExpenseModal() {
    if (monthlyCloseTimerRef.current) {
      window.clearTimeout(monthlyCloseTimerRef.current);
    }

    setIsCreatePopoverOpen(false);
    setIsMonthlyModalMounted(true);
    setIsMonthlyModalOpen(true);
  }

  // Fecha o modal de gasto mensal respeitando a animação de saída.
  function closeMonthlyExpenseModal() {
    setIsMonthlyModalOpen(false);

    monthlyCloseTimerRef.current = window.setTimeout(() => {
      setIsMonthlyModalMounted(false);
    }, EXPENSE_MODAL_ANIMATION_MS);
  }

  // Exclui o gasto e mostra o toast apenas depois da ação ser concluída.
  function handleDeleteExpense(expenseId: string) {
    deleteExpense(expenseId);
    toast.success("Gasto excluído com sucesso.");
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <ExpenseSummaryCard
        totalAmountCents={filteredTotalAmountCents}
        selectedCategoryName={selectedCategory?.name}
        subtitle={summaryLimitText}
        isAmountNegative={hasExceededLimit}
      />

      <section className="rounded-[30px] bg-white p-5 shadow-[0_18px_54px_rgba(255,136,0,0.12),0_22px_65px_rgba(45,35,24,0.08)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Controle seus gastos
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Registre suas despesas, escolha uma categoria e acompanhe quando
              cada gasto aconteceu.
            </p>
          </div>

          <Popover
            open={isCreatePopoverOpen}
            onOpenChange={setIsCreatePopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button type="button" variant="sun" size="cta">
                Criar gasto
                <Plus size={18} strokeWidth={2.2} />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              side="top"
              align="end"
              sideOffset={10}
              className="w-56 rounded-2xl bg-white/88 p-2 shadow-[0_18px_48px_rgba(15,23,42,0.16),0_14px_34px_rgba(255,136,0,0.1)] ring-0 backdrop-blur-xl"
            >
              <Button
                type="button"
                variant="whiteAction"
                size="actionRow"
                onClick={openCreateExpenseModal}
              >
                <Plus size={15} strokeWidth={2.1} />
                Criar gasto
              </Button>
              <Button
                type="button"
                variant="whiteAction"
                size="actionRow"
                onClick={openMonthlyExpenseModal}
              >
                <CalendarDays size={15} strokeWidth={2.1} />
                Criar gasto fixo
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-4 shadow-[0_16px_50px_rgba(255,136,0,0.1),0_18px_55px_rgba(45,35,24,0.07)] sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-slate-950">
            {selectedCategory
              ? `Gastos em ${selectedCategory.name}`
              : "Todos os gastos"}
          </p>

          <ExpenseCategoryFilter
            categories={categories}
            expenses={expenses}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>

        {filteredExpenses.length > 0 ? (
          <div className="grid gap-3">
            {filteredExpenses.map((expense) => (
              <article
                key={expense.id}
                className="flex gap-3 rounded-2xl bg-orange-50/45 p-4 shadow-[0_10px_26px_rgba(255,136,0,0.1),0_10px_24px_rgba(15,23,42,0.05)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-7 w-7 shrink-0 rounded-full shadow-[0_5px_12px_rgba(15,23,42,0.12)]"
                      style={{ backgroundColor: expense.categoryColor }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-950">
                        {expense.name}
                      </p>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                        {expense.categoryName} • {formatDateLabel(expense.date)}
                      </p>
                      {expense.recurrenceLabel ? (
                        <p className="mt-1 truncate text-xs font-semibold text-[#ff6500]">
                          {expense.recurrenceLabel}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-extrabold text-slate-950">
                    {formatCurrency(expense.amountCents)}
                  </p>
                </div>

                <div className="shrink-0 self-start">
                  <ExpenseActionsPopover
                    expense={expense}
                    onDelete={handleDeleteExpense}
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-3xl bg-orange-50/70 px-4 text-center">
            <p className="text-sm font-bold text-slate-950">
              {selectedCategory
                ? `Nenhum gasto em ${selectedCategory.name}.`
                : "Nenhum gasto criado ainda."}
            </p>
            <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
              {selectedCategory
                ? "Escolha outra categoria ou registre um gasto para este setor."
                : "Clique em “Criar gasto” para registrar sua primeira despesa."}
            </p>
          </div>
        )}
      </section>

      {isModalMounted ? (
        <ExpenseModal
          categories={categories}
          isOpen={isModalOpen}
          onClose={closeCreateExpenseModal}
        />
      ) : null}

      {isMonthlyModalMounted ? (
        <MonthlyExpenseModal
          categories={categories}
          isOpen={isMonthlyModalOpen}
          onClose={closeMonthlyExpenseModal}
        />
      ) : null}
    </div>
  );
}
