// Formato de um gasto salvo no localStorage.
// Ele guarda tambem o nome/cor da categoria para exibir a lista rapidamente.
// Quando a categoria muda, esses dados sao sincronizados nos gastos existentes.
export interface Expense {
  id: string;
  name: string;
  amountCents: number;
  date: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
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
