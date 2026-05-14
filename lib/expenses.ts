import type {
  ArchivedExpense,
  CreateExpenseInput,
  CreateMonthlyExpenseInput,
  Expense,
  UpdateExpenseInput,
} from "@/types/expense";

// Chave usada para guardar os gastos no localStorage.
const EXPENSES_STORAGE_KEY = "financas:expenses";

// Chave usada para guardar gastos comuns arquivados em renovações do saldo.
const EXPENSE_HISTORY_STORAGE_KEY = "financas:expense-history";

// Evento interno disparado quando os gastos mudam.
// Componentes inscritos recebem esse aviso e atualizam a tela.
const EXPENSES_CHANGED_EVENT = "financas:expenses-changed";

// Evento interno disparado quando o histórico muda.
const EXPENSE_HISTORY_CHANGED_EVENT = "financas:expense-history-changed";

// Lista vazia estável para o React não receber uma referência nova a cada leitura.
const EMPTY_EXPENSES: Expense[] = [];
const EMPTY_ARCHIVED_EXPENSES: ArchivedExpense[] = [];

// Cache do último texto lido e da lista já transformada em objeto.
// Isso evita loop infinito com useSyncExternalStore.
let cachedExpensesRaw: string | null = null;
let cachedExpensesSnapshot: Expense[] = EMPTY_EXPENSES;
let cachedHistoryRaw: string | null = null;
let cachedHistorySnapshot: ArchivedExpense[] = EMPTY_ARCHIVED_EXPENSES;

// Garante que localStorage só seja acessado no navegador.
const canUseStorage = () => typeof window !== "undefined";

// Busca todos os gastos salvos.
// Se o localStorage estiver vazio ou quebrado, devolve lista vazia.
export function getExpenses(): Expense[] {
  if (!canUseStorage()) {
    return EMPTY_EXPENSES;
  }

  const storedExpenses = window.localStorage.getItem(EXPENSES_STORAGE_KEY);

  if (!storedExpenses) {
    cachedExpensesRaw = null;
    cachedExpensesSnapshot = EMPTY_EXPENSES;
    return cachedExpensesSnapshot;
  }

  if (storedExpenses === cachedExpensesRaw) {
    return cachedExpensesSnapshot;
  }

  try {
    const parsedExpenses = JSON.parse(storedExpenses);
    cachedExpensesRaw = storedExpenses;
    cachedExpensesSnapshot = Array.isArray(parsedExpenses)
      ? (parsedExpenses as Expense[])
      : EMPTY_EXPENSES;

    return cachedExpensesSnapshot;
  } catch {
    cachedExpensesRaw = storedExpenses;
    cachedExpensesSnapshot = EMPTY_EXPENSES;
    return cachedExpensesSnapshot;
  }
}

// Busca os gastos comuns arquivados.
// Esses itens representam despesas de ciclos anteriores do saldo.
export function getExpenseHistory(): ArchivedExpense[] {
  if (!canUseStorage()) {
    return EMPTY_ARCHIVED_EXPENSES;
  }

  const storedHistory = window.localStorage.getItem(EXPENSE_HISTORY_STORAGE_KEY);

  if (!storedHistory) {
    cachedHistoryRaw = null;
    cachedHistorySnapshot = EMPTY_ARCHIVED_EXPENSES;
    return cachedHistorySnapshot;
  }

  if (storedHistory === cachedHistoryRaw) {
    return cachedHistorySnapshot;
  }

  try {
    const parsedHistory = JSON.parse(storedHistory);
    cachedHistoryRaw = storedHistory;
    cachedHistorySnapshot = Array.isArray(parsedHistory)
      ? (parsedHistory as ArchivedExpense[])
      : EMPTY_ARCHIVED_EXPENSES;

    return cachedHistorySnapshot;
  } catch {
    cachedHistoryRaw = storedHistory;
    cachedHistorySnapshot = EMPTY_ARCHIVED_EXPENSES;
    return cachedHistorySnapshot;
  }
}

// Salva a lista completa e avisa a interface que precisa atualizar.
function saveExpenses(expenses: Expense[]) {
  if (!canUseStorage()) {
    return;
  }

  const serializedExpenses = JSON.stringify(expenses);

  cachedExpensesRaw = serializedExpenses;
  cachedExpensesSnapshot = expenses;

  window.localStorage.setItem(EXPENSES_STORAGE_KEY, serializedExpenses);
  window.dispatchEvent(new Event(EXPENSES_CHANGED_EVENT));
}

// Salva o histórico e avisa a página Histórico para atualizar a lista.
function saveExpenseHistory(history: ArchivedExpense[]) {
  if (!canUseStorage()) {
    return;
  }

  const serializedHistory = JSON.stringify(history);

  cachedHistoryRaw = serializedHistory;
  cachedHistorySnapshot = history;

  window.localStorage.setItem(EXPENSE_HISTORY_STORAGE_KEY, serializedHistory);
  window.dispatchEvent(new Event(EXPENSE_HISTORY_CHANGED_EVENT));
}

// Permite que telas React escutem mudanças nos gastos.
// Assim criar ou excluir um gasto atualiza a lista sem recarregar a página.
export function subscribeToExpenses(callback: () => void) {
  if (!canUseStorage()) {
    return () => undefined;
  }

  window.addEventListener(EXPENSES_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(EXPENSES_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// Permite que a página Histórico escute mudanças nos itens arquivados.
export function subscribeToExpenseHistory(callback: () => void) {
  if (!canUseStorage()) {
    return () => undefined;
  }

  window.addEventListener(EXPENSE_HISTORY_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(EXPENSE_HISTORY_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// Converte a criação do gasto em tempo real para comparar com uma renovação.
// Gastos antigos sem createdAt usam a data do gasto como compatibilidade.
function getExpenseCreatedTime(expense: Expense) {
  const createdTime = expense.createdAt
    ? new Date(expense.createdAt).getTime()
    : Number.NaN;

  if (Number.isFinite(createdTime)) {
    return createdTime;
  }

  return new Date(`${expense.date}T00:00:00`).getTime();
}

// Cria um gasto novo depois de validar os dados mínimos.
// Cada erro volta como texto amigável para aparecer abaixo do formulário.
export function createExpense(input: CreateExpenseInput) {
  const trimmedName = input.name.trim();

  if (!trimmedName) {
    return {
      success: false,
      message: "Informe o nome do gasto.",
    };
  }

  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    return {
      success: false,
      message: "Informe um valor de gasto válido.",
    };
  }

  if (!input.date) {
    return {
      success: false,
      message: "Selecione uma data para o gasto.",
    };
  }

  if (!input.categoryId) {
    return {
      success: false,
      message: "Selecione uma categoria para o gasto.",
    };
  }

  const nextExpense: Expense = {
    id: crypto.randomUUID(),
    name: trimmedName,
    amountCents: input.amountCents,
    date: input.date,
    createdAt: new Date().toISOString(),
    categoryId: input.categoryId,
    categoryName: input.categoryName,
    categoryColor: input.categoryColor,
  };

  saveExpenses([nextExpense, ...getExpenses()]);

  return {
    success: true,
    message: "Gasto criado com sucesso.",
  };
}

// Cria um gasto mensal sem automatizar recorrência ainda.
// O texto de recorrência fica salvo para aparecer no card do gasto.
export function createMonthlyExpense(input: CreateMonthlyExpenseInput) {
  const trimmedName = input.name.trim();

  if (!trimmedName) {
    return {
      success: false,
      message: "Informe o nome do gasto mensal.",
    };
  }

  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    return {
      success: false,
      message: "Informe um valor de gasto mensal válido.",
    };
  }

  if (!input.recurrenceLabel.trim()) {
    return {
      success: false,
      message: "Informe quando o gasto mensal será renovado.",
    };
  }

  if (!input.categoryId) {
    return {
      success: false,
      message: "Selecione uma categoria para o gasto mensal.",
    };
  }

  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(today.getDate()).padStart(2, "0")}`;
  const nextExpense: Expense = {
    id: crypto.randomUUID(),
    name: trimmedName,
    amountCents: input.amountCents,
    date,
    createdAt: new Date().toISOString(),
    categoryId: input.categoryId,
    categoryName: input.categoryName,
    categoryColor: input.categoryColor,
    isMonthly: true,
    recurrenceLabel: input.recurrenceLabel.trim(),
  };

  saveExpenses([nextExpense, ...getExpenses()]);

  return {
    success: true,
    message: "Gasto mensal criado com sucesso.",
  };
}

// Remove um gasto específico da lista.
// A exclusão é local e imediata, igual ao restante da simulação do projeto.
export function deleteExpense(expenseId: string) {
  const nextExpenses = getExpenses().filter(
    (expense) => expense.id !== expenseId,
  );

  saveExpenses(nextExpenses);
}

// Move gastos comuns de ciclos encerrados para o histórico.
// Gastos fixos nunca são arquivados por essa função e continuam na página Gastos.
export function archiveCommonExpensesForRenewal(renewedAt: string) {
  const renewedAtTime = new Date(renewedAt).getTime();
  const expenses = getExpenses();
  const currentHistory = getExpenseHistory();
  const lastRenewalNumber = currentHistory.reduce(
    (highestNumber, expense) =>
      Math.max(highestNumber, expense.renewalNumber ?? 1),
    0,
  );
  const nextRenewalNumber = lastRenewalNumber + 1;
  const commonExpensesToArchive = expenses.filter(
    (expense) =>
      !expense.isMonthly && getExpenseCreatedTime(expense) <= renewedAtTime,
  );

  if (commonExpensesToArchive.length === 0) {
    return;
  }

  const archivedExpenses: ArchivedExpense[] = commonExpensesToArchive.map(
    (expense) => ({
      ...expense,
      archivedAt: renewedAt,
      renewalNumber: nextRenewalNumber,
    }),
  );
  const activeExpenses = expenses.filter(
    (expense) =>
      expense.isMonthly || getExpenseCreatedTime(expense) > renewedAtTime,
  );

  saveExpenses(activeExpenses);
  saveExpenseHistory([...archivedExpenses, ...currentHistory]);
}

// Edita um gasto já salvo.
// Gasto fixo mantém a marca isMonthly e pode receber uma nova recorrência.
export function updateExpense(input: UpdateExpenseInput) {
  const trimmedName = input.name.trim();

  if (!trimmedName) {
    return {
      success: false,
      message: "Informe o nome do gasto.",
    };
  }

  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    return {
      success: false,
      message: "Informe um valor de gasto válido.",
    };
  }

  const expenses = getExpenses();
  const targetExpense = expenses.find((expense) => expense.id === input.id);

  if (!targetExpense) {
    return {
      success: false,
      message: "Gasto não encontrado.",
    };
  }

  if (targetExpense.isMonthly && !input.recurrenceLabel?.trim()) {
    return {
      success: false,
      message: "Informe quando o gasto fixo será renovado.",
    };
  }

  const nextExpenses = expenses.map((expense) => {
    if (expense.id !== input.id) {
      return expense;
    }

    return {
      ...expense,
      name: trimmedName,
      amountCents: input.amountCents,
      recurrenceLabel: expense.isMonthly
        ? input.recurrenceLabel?.trim()
        : expense.recurrenceLabel,
    };
  });

  saveExpenses(nextExpenses);

  return {
    success: true,
    message: "Gasto editado com sucesso.",
  };
}

// Atualiza a cópia da categoria dentro dos gastos já criados.
// Cada gasto guarda o id, nome e cor da categoria para exibir rápido na tela;
// quando a categoria muda, essa função mantém todos os gastos sincronizados.
export function updateExpensesCategorySnapshot(
  categoryId: string,
  categoryName: string,
  categoryColor?: string,
) {
  const expenses = getExpenses();
  const nextExpenses = expenses.map((expense) => {
    if (expense.categoryId !== categoryId) {
      return expense;
    }

    return {
      ...expense,
      categoryName,
      categoryColor: categoryColor ?? expense.categoryColor,
    };
  });

  saveExpenses(nextExpenses);

  const history = getExpenseHistory();
  const nextHistory = history.map((expense) => {
    if (expense.categoryId !== categoryId) {
      return expense;
    }

    return {
      ...expense,
      categoryName,
      categoryColor: categoryColor ?? expense.categoryColor,
    };
  });

  saveExpenseHistory(nextHistory);
}
