import { archiveCommonExpensesForRenewal } from "@/lib/expenses";

// Chave usada para guardar o saldo disponível no localStorage.
const BALANCE_STORAGE_KEY = "financas:available-balance";

// Chave que guarda a regra de renovação automática do saldo.
const BALANCE_RESET_STORAGE_KEY = "financas:balance-reset-config";

// Evento interno para avisar os componentes quando o saldo muda.
const BALANCE_CHANGED_EVENT = "financas:balance-changed";

export interface BalanceResetConfig {
  mode: "period" | "monthDay" | "manual";
  value: number;
  label: string;
  lastResetDate: string;
  lastResetAt?: string;
  scheduledFromDate?: string;
}

// Cache usado pelo useSyncExternalStore.
// Sem ele, JSON.parse cria um novo objeto a cada leitura e o React entende
// que o snapshot mudou infinitamente.
let cachedBalanceResetRaw: string | null = null;
let cachedBalanceResetSnapshot: BalanceResetConfig | null = null;

// Garante que o localStorage seja acessado somente no navegador.
const canUseStorage = () => typeof window !== "undefined";

// Cria uma chave de data estável no formato yyyy-mm-dd.
function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Transforma yyyy-mm-dd em data local sem depender de fuso UTC.
function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

// Conta dias inteiros entre duas datas.
function getDaysBetween(startDateKey: string, endDateKey: string) {
  const startDate = parseDateKey(startDateKey).getTime();
  const endDate = parseDateKey(endDateKey).getTime();

  return Math.floor((endDate - startDate) / 86_400_000);
}

// Retorna o dia válido no mês atual, tratando meses com menos de 31 dias.
function getMonthOccurrenceDateKey(dayOfMonth: number, referenceDate: Date) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(dayOfMonth, lastDayOfMonth);

  return formatDateKey(new Date(year, month, safeDay));
}

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

// Busca a regra de renovação do saldo.
// Se não existir ou estiver corrompida, a aplicação entende que não há renovação.
export function getBalanceResetConfig(): BalanceResetConfig | null {
  if (!canUseStorage()) {
    return null;
  }

  const storedConfig = window.localStorage.getItem(BALANCE_RESET_STORAGE_KEY);

  if (!storedConfig) {
    cachedBalanceResetRaw = null;
    cachedBalanceResetSnapshot = null;
    return null;
  }

  if (storedConfig === cachedBalanceResetRaw) {
    return cachedBalanceResetSnapshot;
  }

  try {
    const parsedConfig = JSON.parse(storedConfig) as BalanceResetConfig;

    if (
      !parsedConfig ||
      !parsedConfig.mode ||
      !Number.isFinite(parsedConfig.value) ||
      !parsedConfig.lastResetDate
    ) {
      cachedBalanceResetRaw = null;
      cachedBalanceResetSnapshot = null;
      return null;
    }

    cachedBalanceResetRaw = storedConfig;
    cachedBalanceResetSnapshot = parsedConfig;

    return parsedConfig;
  } catch {
    cachedBalanceResetRaw = null;
    cachedBalanceResetSnapshot = null;
    return null;
  }
}

// Salva o saldo em centavos e avisa a tela que ela precisa atualizar.
function saveBalanceCents(balanceCents: number) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(BALANCE_STORAGE_KEY, String(balanceCents));
  window.dispatchEvent(new Event(BALANCE_CHANGED_EVENT));
}

// Salva a regra de renovação e avisa a interface para recalcular o saldo disponível.
export function saveBalanceResetConfig(config: BalanceResetConfig) {
  if (!canUseStorage()) {
    return;
  }

  const serializedConfig = JSON.stringify(config);

  cachedBalanceResetRaw = serializedConfig;
  cachedBalanceResetSnapshot = config;

  window.localStorage.setItem(BALANCE_RESET_STORAGE_KEY, serializedConfig);
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

// Salva uma renovação por intervalo fixo de dias.
export function setBalanceResetByPeriod(days: number) {
  const now = new Date();
  const currentConfig = getBalanceResetConfig();

  saveBalanceResetConfig({
    mode: "period",
    value: days,
    label: `Renova a cada ${days} dias`,
    lastResetDate: formatDateKey(now),
    lastResetAt: currentConfig?.lastResetAt,
    scheduledFromDate: formatDateKey(now),
  });
}

// Salva uma renovação em um dia específico de cada mês.
export function setBalanceResetByMonthDay(day: number) {
  const now = new Date();
  const currentConfig = getBalanceResetConfig();

  saveBalanceResetConfig({
    mode: "monthDay",
    value: day,
    label: `Renova todo dia ${day} de cada mês`,
    lastResetDate: formatDateKey(now),
    lastResetAt: currentConfig?.lastResetAt,
    scheduledFromDate: formatDateKey(now),
  });
}

// Renova o saldo imediatamente.
// A regra automática existente é preservada; quando não existe regra,
// uma marcação manual é criada para iniciar um novo ciclo agora.
export function renewBalanceNow() {
  const now = new Date();
  const renewedAt = now.toISOString();
  const currentConfig = getBalanceResetConfig();

  archiveCommonExpensesForRenewal(renewedAt);

  saveBalanceResetConfig({
    mode: currentConfig?.mode ?? "manual",
    value: currentConfig?.value ?? 0,
    label: currentConfig?.label ?? "Saldo renovado manualmente",
    lastResetDate: formatDateKey(now),
    lastResetAt: renewedAt,
  });
}

// Verifica se a regra de renovação venceu.
// Quando vence, atualiza o início do ciclo; os gastos anteriores deixam de abater o saldo atual.
export function applyDueBalanceReset() {
  const config = getBalanceResetConfig();

  if (!config) {
    return false;
  }

  const today = new Date();
  const todayKey = formatDateKey(today);
  const resetMoment = new Date();
  const renewedAt = resetMoment.toISOString();
  const scheduledFromDate = config.scheduledFromDate ?? config.lastResetDate;
  let nextResetDateKey: string | null = null;

  if (
    config.mode === "period" &&
    getDaysBetween(config.lastResetDate, todayKey) >= config.value
  ) {
    nextResetDateKey = todayKey;
  }

  if (config.mode === "monthDay") {
    const occurrenceDateKey = getMonthOccurrenceDateKey(config.value, today);
    const alreadyResetThisOccurrence =
      parseDateKey(config.lastResetDate).getTime() >=
      parseDateKey(occurrenceDateKey).getTime();
    const reachedOccurrence =
      parseDateKey(todayKey).getTime() >= parseDateKey(occurrenceDateKey).getTime();
    const occurrenceHappenedAfterSchedule =
      parseDateKey(occurrenceDateKey).getTime() >
      parseDateKey(scheduledFromDate).getTime();

    if (
      reachedOccurrence &&
      occurrenceHappenedAfterSchedule &&
      !alreadyResetThisOccurrence
    ) {
      nextResetDateKey = occurrenceDateKey;
    }
  }

  if (!nextResetDateKey) {
    return false;
  }

  archiveCommonExpensesForRenewal(renewedAt);

  saveBalanceResetConfig({
    ...config,
    lastResetDate: nextResetDateKey,
    lastResetAt: renewedAt,
  });

  return true;
}
