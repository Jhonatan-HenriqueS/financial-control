import type { ExpenseCategory } from "@/types/category";
import { updateExpensesCategorySnapshot } from "@/lib/expenses";

// Chave que guarda as categorias no localStorage.
const CATEGORIES_STORAGE_KEY = "financas:expense-categories";

// Evento interno usado para avisar a tela quando a lista de categorias mudou.
const CATEGORIES_CHANGED_EVENT = "financas:categories-changed";

// Lista vazia compartilhada.
// O React precisa receber a mesma referencia quando os dados nao mudam.
const EMPTY_CATEGORIES: ExpenseCategory[] = [];

// Cache do ultimo texto lido do localStorage e da lista parseada.
// Isso evita loop infinito no useSyncExternalStore.
let cachedCategoriesRaw: string | null = null;
let cachedCategoriesSnapshot: ExpenseCategory[] = EMPTY_CATEGORIES;

// Garante que o codigo so acesse localStorage no navegador.
const canUseStorage = () => typeof window !== "undefined";

// Normaliza nomes para comparar categorias sem diferenciar maiusculas/minusculas.
const normalizeCategoryName = (value: string) => value.trim().toLowerCase();

// Busca todas as categorias salvas.
// Se nao houver nada ou se o dado estiver quebrado, devolve lista vazia.
export function getCategories(): ExpenseCategory[] {
  if (!canUseStorage()) {
    return EMPTY_CATEGORIES;
  }

  const storedCategories = window.localStorage.getItem(CATEGORIES_STORAGE_KEY);

  if (!storedCategories) {
    cachedCategoriesRaw = null;
    cachedCategoriesSnapshot = EMPTY_CATEGORIES;
    return cachedCategoriesSnapshot;
  }

  if (storedCategories === cachedCategoriesRaw) {
    return cachedCategoriesSnapshot;
  }

  try {
    const parsedCategories = JSON.parse(storedCategories);
    cachedCategoriesRaw = storedCategories;
    cachedCategoriesSnapshot = Array.isArray(parsedCategories)
      ? (parsedCategories as ExpenseCategory[])
      : EMPTY_CATEGORIES;

    return cachedCategoriesSnapshot;
  } catch {
    cachedCategoriesRaw = storedCategories;
    cachedCategoriesSnapshot = EMPTY_CATEGORIES;
    return cachedCategoriesSnapshot;
  }
}

// Salva a lista completa e avisa quem estiver ouvindo que as categorias mudaram.
function saveCategories(categories: ExpenseCategory[]) {
  if (!canUseStorage()) {
    return;
  }

  const serializedCategories = JSON.stringify(categories);

  cachedCategoriesRaw = serializedCategories;
  cachedCategoriesSnapshot = categories;

  window.localStorage.setItem(CATEGORIES_STORAGE_KEY, serializedCategories);
  window.dispatchEvent(new Event(CATEGORIES_CHANGED_EVENT));
}

// Permite que componentes React escutem alteracoes das categorias.
// Isso mantém a tela sincronizada sem precisar recarregar a pagina.
export function subscribeToCategories(callback: () => void) {
  if (!canUseStorage()) {
    return () => undefined;
  }

  window.addEventListener(CATEGORIES_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(CATEGORIES_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// Gera uma cor HSL aleatoria que ainda nao esteja sendo usada pelas categorias atuais.
// A lista de 360 tons evita repetir cor enquanto houver tons disponiveis.
function generateUniqueCategoryColor(categories: ExpenseCategory[]) {
  const usedColors = new Set(categories.map((category) => category.color));
  const availableHues = Array.from({ length: 360 }, (_, hue) => hue).filter(
    (hue) => !usedColors.has(`hsl(${hue} 82% 82%)`),
  );

  const randomIndex = Math.floor(Math.random() * availableHues.length);
  const hue = availableHues[randomIndex] ?? Date.now() % 360;

  return `hsl(${hue} 82% 82%)`;
}

// Cria uma categoria nova para gastos.
// Ela ja nasce com uma cor unica e pode receber um limite de gastos opcional.
export function createCategory(name: string, limitCents?: number | null) {
  const categories = getCategories();
  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      success: false,
      message: "Informe o nome da categoria.",
    };
  }

  const alreadyExists = categories.some(
    (category) =>
      normalizeCategoryName(category.name) === normalizeCategoryName(trimmedName),
  );

  if (alreadyExists) {
    return {
      success: false,
      message: "Ja existe uma categoria com este nome.",
    };
  }

  const nextCategory: ExpenseCategory = {
    id: crypto.randomUUID(),
    name: trimmedName,
    color: generateUniqueCategoryColor(categories),
    limitCents: limitCents ?? null,
  };

  saveCategories([...categories, nextCategory]);

  return {
    success: true,
    message: "Categoria criada com sucesso.",
  };
}

// Edita o nome e o limite da categoria.
// A cor nao muda para manter a identidade visual da categoria.
export function updateCategory(
  categoryId: string,
  name: string,
  limitCents?: number | null,
) {
  const categories = getCategories();
  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      success: false,
      message: "Informe o nome da categoria.",
    };
  }

  const alreadyExists = categories.some(
    (category) =>
      category.id !== categoryId &&
      normalizeCategoryName(category.name) === normalizeCategoryName(trimmedName),
  );

  if (alreadyExists) {
    return {
      success: false,
      message: "Ja existe uma categoria com este nome.",
    };
  }

  const nextCategories = categories.map((category) =>
    category.id === categoryId
      ? { ...category, name: trimmedName, limitCents: limitCents ?? null }
      : category,
  );
  const updatedCategory = nextCategories.find(
    (category) => category.id === categoryId,
  );

  saveCategories(nextCategories);

  // Depois de renomear a categoria, atualiza todos os gastos ligados a ela.
  // Assim a tela de gastos mostra o nome novo imediatamente.
  if (updatedCategory) {
    updateExpensesCategorySnapshot(
      updatedCategory.id,
      updatedCategory.name,
      updatedCategory.color,
    );
  }

  return {
    success: true,
    message: "Categoria atualizada com sucesso.",
  };
}

// Remove uma categoria da lista.
// Por enquanto isso afeta apenas o armazenamento local do navegador.
export function deleteCategory(categoryId: string) {
  const nextCategories = getCategories().filter(
    (category) => category.id !== categoryId,
  );

  saveCategories(nextCategories);
}
