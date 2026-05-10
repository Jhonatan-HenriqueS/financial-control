import type { CreateExpenseInput, Expense } from "@/types/expense";

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

// Remove um gasto específico da lista.
// A exclusão é local e imediata, igual ao restante da simulação do projeto.
export function deleteExpense(expenseId: string) {
  const nextExpenses = getExpenses().filter(
    (expense) => expense.id !== expenseId,
  );

  saveExpenses(nextExpenses);
}
