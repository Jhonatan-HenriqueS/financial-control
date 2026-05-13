import type {
  CreateExpenseInput,
  CreateMonthlyExpenseInput,
  Expense,
} from "@/types/expense";

// Chave usada para guardar os gastos no localStorage.
const EXPENSES_STORAGE_KEY = "financas:expenses";

// Evento interno disparado quando os gastos mudam.
// Componentes inscritos recebem esse aviso e atualizam a tela.
const EXPENSES_CHANGED_EVENT = "financas:expenses-changed";

// Lista vazia estável para o React não receber uma referência nova a cada leitura.
const EMPTY_EXPENSES: Expense[] = [];

// Cache do último texto lido e da lista já transformada em objeto.
// Isso evita loop infinito com useSyncExternalStore.
let cachedExpensesRaw: string | null = null;
let cachedExpensesSnapshot: Expense[] = EMPTY_EXPENSES;

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
}
