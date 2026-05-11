// Chave usada para guardar o saldo disponível no localStorage.
const BALANCE_STORAGE_KEY = "financas:available-balance";

// Evento interno para avisar os componentes quando o saldo muda.
const BALANCE_CHANGED_EVENT = "financas:balance-changed";

// Garante que o localStorage seja acessado somente no navegador.
const canUseStorage = () => typeof window !== "undefined";

// Busca o saldo atual em centavos.
// Quando o usuário nunca definiu saldo, retorna null para a interface saber disso.
export function getBalanceCents(): number | null {
  if (!canUseStorage()) {
    return null;
  }

  const storedBalance = window.localStorage.getItem(BALANCE_STORAGE_KEY);

  if (!storedBalance) {
    return null;
  }

  const parsedBalance = Number(storedBalance);

  return Number.isFinite(parsedBalance) ? parsedBalance : null;
}

// Salva o saldo em centavos e avisa a tela que ela precisa atualizar.
function saveBalanceCents(balanceCents: number) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(BALANCE_STORAGE_KEY, String(balanceCents));
  window.dispatchEvent(new Event(BALANCE_CHANGED_EVENT));
}

// Permite que o React escute alterações do saldo salvo no navegador.
export function subscribeToBalance(callback: () => void) {
  if (!canUseStorage()) {
    return () => undefined;
  }

  window.addEventListener(BALANCE_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(BALANCE_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// Define o saldo, substituindo qualquer valor anterior.
export function setBalanceCents(balanceCents: number) {
  saveBalanceCents(Math.max(0, balanceCents));
}

// Soma um novo valor ao saldo já existente.
// Se ainda não houver saldo, a soma parte de zero.
export function addBalanceCents(amountCents: number) {
  const currentBalance = getBalanceCents() ?? 0;

  saveBalanceCents(Math.max(0, currentBalance + amountCents));
}
