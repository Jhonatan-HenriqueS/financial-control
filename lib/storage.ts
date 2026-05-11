import type { LoginCredentials, User } from "@/types/user";

// Chave unica usada para guardar os usuarios no localStorage do navegador.
const USERS_STORAGE_KEY = "financas:users";

// Chave usada para guardar quem fez login por ultimo.
// A nova pagina usa esse dado para mostrar "Ola, Nome".
const CURRENT_USER_STORAGE_KEY = "financas:current-user";

// Evento interno para avisar quando o usuario atual mudar.
const CURRENT_USER_CHANGED_EVENT = "financas:current-user-changed";

// Cache do usuario atual.
// Isso evita que o React receba um objeto novo a cada leitura do localStorage.
let cachedCurrentUserRaw: string | null = null;
let cachedCurrentUserSnapshot: User | null = null;

// Padroniza textos para comparacao.
// Exemplo: "JOAO@email.com" e "joao@email.com" passam a ser tratados como iguais.
const normalize = (value: string) => value.trim().toLowerCase();

// Garante que localStorage so seja acessado no navegador.
// No servidor do Next.js, window nao existe.
const canUseStorage = () => typeof window !== "undefined";

// Busca todos os usuarios salvos no localStorage.
// Se nao existir nada salvo, devolve uma lista vazia.
export function getUsers(): User[] {
  if (!canUseStorage()) {
    return [];
  }

  const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);

  if (!storedUsers) {
    return [];
  }

  try {
    // JSON.parse transforma o texto salvo de volta em lista de objetos.
    const parsedUsers = JSON.parse(storedUsers);
    return Array.isArray(parsedUsers) ? (parsedUsers as User[]) : [];
  } catch {
    // Se o localStorage estiver corrompido, a aplicacao continua funcionando.
    return [];
  }
}

// Salva a lista completa de usuarios no localStorage.
// O localStorage guarda texto, entao a lista vira JSON antes de salvar.
export function saveUsers(users: User[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Verifica se ja existe uma conta com o mesmo email.
// Isso evita cadastrar duas contas iguais.
export function hasUserWithEmail(email: string) {
  return getUsers().some((user) => normalize(user.email) === normalize(email));
}

// Cadastra um novo usuario.
// Primeiro checa duplicidade de email, depois adiciona o usuario na lista salva.
export function registerUser(user: User) {
  if (hasUserWithEmail(user.email)) {
    return {
      success: false,
      message: "Ja existe uma conta cadastrada com este email.",
    };
  }

  // Cria uma nova lista preservando usuarios antigos e adicionando o novo.
  const nextUsers = [
    ...getUsers(),
    {
      name: user.name.trim(),
      email: user.email.trim(),
      password: user.password,
    },
  ];

  saveUsers(nextUsers);

  return {
    success: true,
    message: "Cadastro realizado com sucesso.",
  };
}

// Valida o login.
// O usuario pode entrar com email OU nome, mas a senha precisa ser igual a salva.
export function findAuthenticatedUser({
  identifier,
  password,
}: LoginCredentials) {
  const normalizedIdentifier = normalize(identifier);

  return (
    getUsers().find((user) => {
      const emailMatches = normalize(user.email) === normalizedIdentifier;
      const nameMatches = normalize(user.name) === normalizedIdentifier;

      return (emailMatches || nameMatches) && user.password === password;
    }) ?? null
  );
}

// Mantem a funcao antiga para qualquer parte do projeto que precise apenas de true/false.
// Por baixo ela usa a busca do usuario autenticado.
export function validateLogin(credentials: LoginCredentials) {
  return Boolean(findAuthenticatedUser(credentials));
}

// Salva o usuario autenticado atual.
// Isso permite que a proxima pagina saiba qual nome deve exibir no topo.
export function saveCurrentUser(user: User) {
  if (!canUseStorage()) {
    return;
  }

  const serializedUser = JSON.stringify(user);

  cachedCurrentUserRaw = serializedUser;
  cachedCurrentUserSnapshot = user;

  window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, serializedUser);
  window.dispatchEvent(new Event(CURRENT_USER_CHANGED_EVENT));
}

// Busca o usuario autenticado atual.
// Se nao houver usuario salvo ou o dado estiver quebrado, devolve null.
export function getCurrentUser(): User | null {
  if (!canUseStorage()) {
    return null;
  }

  const storedUser = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);

  if (!storedUser) {
    cachedCurrentUserRaw = null;
    cachedCurrentUserSnapshot = null;
    return null;
  }

  if (storedUser === cachedCurrentUserRaw) {
    return cachedCurrentUserSnapshot;
  }

  try {
    cachedCurrentUserRaw = storedUser;
    cachedCurrentUserSnapshot = JSON.parse(storedUser) as User;

    return cachedCurrentUserSnapshot;
  } catch {
    cachedCurrentUserRaw = storedUser;
    cachedCurrentUserSnapshot = null;
    return null;
  }
}

// Remove o usuario autenticado atual.
// O cadastro de usuarios continua salvo; apenas a sessão ativa deixa de existir.
export function clearCurrentUser() {
  if (!canUseStorage()) {
    return;
  }

  cachedCurrentUserRaw = null;
  cachedCurrentUserSnapshot = null;

  window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  window.dispatchEvent(new Event(CURRENT_USER_CHANGED_EVENT));
}

// Permite que componentes React acompanhem mudancas no usuario atual.
export function subscribeToCurrentUser(callback: () => void) {
  if (!canUseStorage()) {
    return () => undefined;
  }

  window.addEventListener(CURRENT_USER_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(CURRENT_USER_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
