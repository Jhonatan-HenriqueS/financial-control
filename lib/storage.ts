import type { LoginCredentials, User } from "@/types/user";

const USERS_STORAGE_KEY = "financas:users";

const normalize = (value: string) => value.trim().toLowerCase();

const canUseStorage = () => typeof window !== "undefined";

export function getUsers(): User[] {
  if (!canUseStorage()) {
    return [];
  }

  const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);

  if (!storedUsers) {
    return [];
  }

  try {
    const parsedUsers = JSON.parse(storedUsers);
    return Array.isArray(parsedUsers) ? (parsedUsers as User[]) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: User[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function hasUserWithEmail(email: string) {
  return getUsers().some((user) => normalize(user.email) === normalize(email));
}

export function registerUser(user: User) {
  if (hasUserWithEmail(user.email)) {
    return {
      success: false,
      message: "Ja existe uma conta cadastrada com este email.",
    };
  }

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

export function validateLogin({ identifier, password }: LoginCredentials) {
  const normalizedIdentifier = normalize(identifier);

  return getUsers().some((user) => {
    const emailMatches = normalize(user.email) === normalizedIdentifier;
    const nameMatches = normalize(user.name) === normalizedIdentifier;

    return (emailMatches || nameMatches) && user.password === password;
  });
}
