// Formato de uma categoria de gasto criada pelo usuario.
// A cor mantém a identidade visual; o limite é opcional para categorias antigas continuarem válidas.
export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  limitCents?: number | null;
}
