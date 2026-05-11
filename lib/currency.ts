// Mostra centavos como moeda brasileira.
// O armazenamento usa centavos para evitar erro de arredondamento com dinheiro.
export function formatCurrency(amountCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountCents / 100);
}

// Converte o texto digitado em centavos.
// Exemplo: "100", "R$100" ou "100,50" viram número seguro para salvar.
export function parseCurrencyToCents(value: string) {
  const normalizedValue = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const amount = Number(normalizedValue);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round(amount * 100);
}
