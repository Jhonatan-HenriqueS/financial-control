// Formato de um gasto salvo no localStorage.
// Ele guarda tambem o nome/cor da categoria para exibir a lista rapidamente.
// Quando a categoria muda, esses dados sao sincronizados nos gastos existentes.
export interface Expense {
  id: string;
  name: string;
  amountCents: number;
  date: string;
  createdAt?: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  isMonthly?: boolean;
  recurrenceLabel?: string;
}

// Gasto comum arquivado quando o saldo é renovado.
// Ele sai da lista atual e passa a aparecer na página Histórico.
export interface ArchivedExpense extends Expense {
  archivedAt: string;
  renewalNumber?: number;
}

// Dados que o formulario envia para criar um gasto novo.
// O valor ja chega em centavos para evitar problemas com casas decimais.
export interface CreateExpenseInput {
  name: string;
  amountCents: number;
  date: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
}

// Dados usados para criar um gasto mensal.
// A recorrência ainda é apenas informativa e aparece no card do gasto.
export interface CreateMonthlyExpenseInput {
  name: string;
  amountCents: number;
  recurrenceLabel: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
}

// Dados usados para editar um gasto existente.
// Gasto comum usa nome e valor; gasto fixo também pode atualizar a recorrência.
export interface UpdateExpenseInput {
  id: string;
  name: string;
  amountCents: number;
  recurrenceLabel?: string;
}
