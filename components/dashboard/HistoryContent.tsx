"use client";

import {
  Check,
  ChevronDown,
  FolderOpen,
  History,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatCurrency } from "@/lib/currency";
import { getExpenseHistory, subscribeToExpenseHistory } from "@/lib/expenses";
import type { ArchivedExpense } from "@/types/expense";

interface HistoryCategory {
  id: string;
  name: string;
  color: string;
}

interface HistoryCategoryFilterProps {
  categories: HistoryCategory[];
  expenses: ArchivedExpense[];
  renewalScope: ArchivedExpense[];
  selectedCategoryId: string | null;
  selectedRenewalNumber: number | null;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectRenewal: (renewalNumber: number | null) => void;
}

interface HistoryRenewal {
  number: number;
  archivedAt: string;
  count: number;
}

const EMPTY_HISTORY: ArchivedExpense[] = [];

// Collator nativo para ordenar categorias em português.
const categoryNameCollator = new Intl.Collator("pt-BR", {
  sensitivity: "base",
  numeric: true,
});

// Snapshot usado enquanto o servidor ainda não tem localStorage.
const getServerHistorySnapshot = () => EMPTY_HISTORY;

// Mostra yyyy-mm-dd como dd/mm/aaaa.
function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-");

  return `${day}/${month}/${year}`;
}

// Mostra a data de arquivamento em dd/mm/aaaa.
function formatArchivedDateLabel(dateKey: string) {
  return new Date(dateKey).toLocaleDateString("pt-BR");
}

// Extrai as categorias presentes no histórico.
// Assim a tela continua filtrando mesmo se a categoria não estiver mais na lista atual.
function getHistoryCategories(expenses: ArchivedExpense[]) {
  const categoryMap = new Map<string, HistoryCategory>();

  expenses.forEach((expense) => {
    if (!categoryMap.has(expense.categoryId)) {
      categoryMap.set(expense.categoryId, {
        id: expense.categoryId,
        name: expense.categoryName,
        color: expense.categoryColor,
      });
    }
  });

  return Array.from(categoryMap.values()).sort(
    (firstCategory, secondCategory) =>
      categoryNameCollator.compare(firstCategory.name, secondCategory.name),
  );
}

// Garante que históricos antigos sem renewalNumber continuem aparecendo.
function getExpenseRenewalNumber(expense: ArchivedExpense) {
  return expense.renewalNumber ?? 1;
}

// Lista todas as renovações disponíveis, sempre da mais recente para a mais antiga.
function getHistoryRenewals(expenses: ArchivedExpense[]) {
  const renewalMap = new Map<number, HistoryRenewal>();

  expenses.forEach((expense) => {
    const renewalNumber = getExpenseRenewalNumber(expense);
    const currentRenewal = renewalMap.get(renewalNumber);

    if (!currentRenewal) {
      renewalMap.set(renewalNumber, {
        number: renewalNumber,
        archivedAt: expense.archivedAt,
        count: 1,
      });
      return;
    }

    renewalMap.set(renewalNumber, {
      ...currentRenewal,
      archivedAt:
        new Date(expense.archivedAt).getTime() >
        new Date(currentRenewal.archivedAt).getTime()
          ? expense.archivedAt
          : currentRenewal.archivedAt,
      count: currentRenewal.count + 1,
    });
  });

  return Array.from(renewalMap.values()).sort(
    (firstRenewal, secondRenewal) => secondRenewal.number - firstRenewal.number,
  );
}

// Conta quantos gastos históricos existem em uma categoria.
function getCategoryHistoryCount(
  expenses: ArchivedExpense[],
  categoryId: string,
) {
  return expenses.filter((expense) => expense.categoryId === categoryId).length;
}

// Página Histórico.
// Ela exibe apenas gastos comuns arquivados quando o saldo é renovado.
export function HistoryContent() {
  const history = useSyncExternalStore(
    subscribeToExpenseHistory,
    getExpenseHistory,
    getServerHistorySnapshot,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const latestRenewalNumber = useMemo(() => {
    const renewals = getHistoryRenewals(history);

    return renewals[0]?.number ?? null;
  }, [history]);
  const [manualSelectedRenewalNumber, setManualSelectedRenewalNumber] =
    useState<number | null>(null);
  const selectedRenewalNumber =
    manualSelectedRenewalNumber ?? latestRenewalNumber;
  const renewalScopedHistory = selectedRenewalNumber
    ? history.filter(
        (expense) => getExpenseRenewalNumber(expense) === selectedRenewalNumber,
      )
    : history;
  const categories = useMemo(() => getHistoryCategories(history), [history]);
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const filteredHistory = selectedCategory
    ? renewalScopedHistory.filter(
        (expense) => expense.categoryId === selectedCategory.id,
      )
    : renewalScopedHistory;
  const totalAmountCents = filteredHistory.reduce(
    (total, expense) => total + expense.amountCents,
    0,
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <section className="rounded-[30px] bg-white p-5 shadow-[0_18px_54px_rgba(255,136,0,0.12),0_22px_65px_rgba(45,35,24,0.08)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#ff7300]">
              Histórico
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">
              Gastos de ciclos anteriores
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Aqui ficam apenas gastos comuns movidos quando o saldo é renovado.
              Gastos fixos continuam na página de gastos.
            </p>
          </div>

          <div className="rounded-2xl bg-orange-50/80 px-5 py-3 text-left shadow-[0_10px_28px_rgba(255,132,0,0.1)] sm:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              Total
            </p>
            <p className="mt-1 text-lg font-extrabold text-slate-950">
              {formatCurrency(totalAmountCents)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-4 shadow-[0_16px_50px_rgba(255,136,0,0.1),0_18px_55px_rgba(45,35,24,0.07)] sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-slate-950">
            {selectedCategory
              ? `Histórico em ${selectedCategory.name}`
              : selectedRenewalNumber
                ? `Renovação ${selectedRenewalNumber}`
                : "Todos os históricos"}
          </p>

          <HistoryCategoryFilter
            categories={categories}
            expenses={renewalScopedHistory}
            renewalScope={
              selectedCategory
                ? history.filter(
                    (expense) => expense.categoryId === selectedCategory.id,
                  )
                : history
            }
            selectedCategoryId={selectedCategoryId}
            selectedRenewalNumber={selectedRenewalNumber}
            onSelectCategory={setSelectedCategoryId}
            onSelectRenewal={setManualSelectedRenewalNumber}
          />
        </div>

        {filteredHistory.length > 0 ? (
          <div className="grid gap-3">
            {filteredHistory.map((expense) => (
              <article
                key={`${expense.id}-${expense.archivedAt}`}
                className="rounded-2xl bg-orange-50/45 p-4 shadow-[0_10px_26px_rgba(255,136,0,0.1),0_10px_24px_rgba(15,23,42,0.05)]"
              >
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
                    <p className="mt-1 truncate text-xs font-semibold text-[#ff6500]">
                      Renovação {getExpenseRenewalNumber(expense)} • Arquivado
                      em {formatArchivedDateLabel(expense.archivedAt)}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm font-extrabold text-slate-950">
                  {formatCurrency(expense.amountCents)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-3xl bg-orange-50/70 px-4 text-center">
            <p className="text-sm font-bold text-slate-950">
              Nenhum gasto no histórico.
            </p>
            <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
              Quando o saldo for renovado, os gastos comuns do ciclo encerrado
              aparecerão aqui.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// Filtro simples por categoria para a página Histórico.
// Diferente da página Gastos, aqui não existe filtro por tipo.
function HistoryCategoryFilter({
  categories,
  expenses,
  renewalScope,
  selectedCategoryId,
  selectedRenewalNumber,
  onSelectCategory,
  onSelectRenewal,
}: HistoryCategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<
    "menu" | "category" | "renewal"
  >("menu");
  const [renewalSearch, setRenewalSearch] = useState("");
  const [isFilterInHeaderRow, setIsFilterInHeaderRow] = useState(false);
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const renewals = getHistoryRenewals(renewalScope);
  const searchedRenewalNumber = renewalSearch ? Number(renewalSearch) : null;
  const visibleRenewals =
    searchedRenewalNumber === null
      ? renewals
      : renewals.filter((renewal) => renewal.number === searchedRenewalNumber);
  const totalResults = selectedCategory
    ? getCategoryHistoryCount(expenses, selectedCategory.id)
    : expenses.length;
  const filterButtonLabel =
    selectedCategory?.name ??
    (selectedRenewalNumber ? `Renovação ${selectedRenewalNumber}` : "Filtrar");

  // Em telas maiores o popover alinha pela direita; em telas menores fica central.
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

  // Seleciona a categoria e fecha o filtro.
  function handleSelectCategory(categoryId: string | null) {
    onSelectCategory(categoryId);
    setIsOpen(false);
    setActivePanel("menu");
  }

  // Seleciona a renovação e fecha o filtro.
  function handleSelectRenewal(renewalNumber: number | null) {
    onSelectRenewal(renewalNumber);
    setIsOpen(false);
    setActivePanel("menu");
    setRenewalSearch("");
  }

  // Atualiza a busca aceitando somente números.
  function handleRenewalSearch(value: string) {
    setRenewalSearch(value.replace(/\D/g, ""));
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);

        if (!open) {
          setActivePanel("menu");
          setRenewalSearch("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="translucentAction"
          className="h-12 w-full justify-between gap-3 px-4 text-sm font-bold sm:w-auto sm:min-w-40"
        >
          <span className="flex min-w-0 items-center gap-2">
            <SlidersHorizontal size={16} strokeWidth={2.1} />
            <span className="truncate">{filterButtonLabel}</span>
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
                      Filtre por setor do histórico.
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
                onClick={() => setActivePanel("renewal")}
                variant="whiteAction"
                className="h-auto w-full justify-between gap-3 rounded-2xl px-4 py-4 text-left hover:scale-[1.01]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <History
                    size={18}
                    strokeWidth={2.1}
                    className="shrink-0 text-[#ff7300]"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-950">
                      Renovação
                    </span>
                    <span className="mt-1 block truncate text-xs font-semibold text-slate-500">
                      Veja um ciclo específico.
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
                  Filtrar histórico
                </p>
                <h3 className="mt-3 text-lg font-bold leading-7 text-slate-950">
                  Escolha uma categoria
                </h3>
              </div>

              <div className="shrink-0 whitespace-nowrap rounded-2xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-500 shadow-[0_8px_20px_rgba(255,132,0,0.08)]">
                {totalResults} {totalResults > 1 ? "resultados" : "resultado"}
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

              {categories.length > 0 ? (
                categories.map((category) => {
                  const isSelected = category.id === selectedCategoryId;
                  const count = getCategoryHistoryCount(expenses, category.id);

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
                  Nenhuma categoria no histórico.
                </p>
              )}
            </div>
          </>
        ) : null}

        {activePanel === "renewal" ? (
          <>
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-500">
                  Filtrar histórico
                </p>
                <h3 className="mt-3 text-lg font-bold leading-7 text-slate-950">
                  Escolha uma renovação
                </h3>
              </div>

              <div className="shrink-0 whitespace-nowrap rounded-2xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-500 shadow-[0_8px_20px_rgba(255,132,0,0.08)]">
                {visibleRenewals.length}{" "}
                {visibleRenewals.length > 1 ? "renovações" : "renovação"}
              </div>
            </div>

            <input
              type="text"
              inputMode="numeric"
              value={renewalSearch}
              onChange={(event) => handleRenewalSearch(event.target.value)}
              placeholder="Digite o número da renovação"
              className="mt-5 h-12 w-full rounded-2xl bg-white/78 px-4 text-sm font-semibold text-slate-950 shadow-[0_10px_26px_rgba(255,136,0,0.08)] outline-none transition-all duration-200 placeholder:text-slate-400 focus:shadow-[0_0_0_5px_rgba(255,154,42,0.18),0_14px_34px_rgba(255,112,0,0.2)]"
            />

            <div className="scrollbar-invisible mt-4 grid max-h-[292px] gap-2 overflow-y-auto pr-1">
              {visibleRenewals.length > 0 ? (
                visibleRenewals.map((renewal) => {
                  const isSelected = renewal.number === selectedRenewalNumber;

                  return (
                    <Button
                      key={renewal.number}
                      type="button"
                      onClick={() => handleSelectRenewal(renewal.number)}
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
                          <Check size={16} strokeWidth={2.2} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold">
                            Renovação {renewal.number}
                          </span>
                          <span className="mt-1 block truncate text-xs font-semibold opacity-75">
                            {formatArchivedDateLabel(renewal.archivedAt)}
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-500">
                        {renewal.count}
                      </span>
                    </Button>
                  );
                })
              ) : (
                <p className="rounded-2xl bg-white/52 px-4 py-4 text-sm font-medium leading-6 text-slate-500">
                  Nenhuma renovação encontrada.
                </p>
              )}
            </div>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
