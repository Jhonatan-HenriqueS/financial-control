import type { User } from "@/types/user";

// Nome do cookie que representa a sessao autenticada.
// O Proxy do Next consegue ler cookies antes de entregar uma rota ao navegador.
export const AUTH_SESSION_COOKIE_NAME = "financas:auth-session";

// Tempo da sessao persistente: 1 ano.
// Assim o usuario continua logado mesmo fechando e abrindo o navegador.
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

// Garante que funcoes que usam document rodem apenas no navegador.
// No servidor, document nao existe.
const canUseDocument = () => typeof document !== "undefined";

// Cria um token simples para a autenticacao simulada.
// Ele nao substitui uma sessao real de backend; apenas identifica que o login local foi validado.
function createSessionToken(user: User) {
  const rawToken = `${user.email.trim().toLowerCase()}:${Date.now()}`;

  return window.btoa(rawToken);
}

// Salva a sessao no cookie do navegador.
// O cookie fica em path=/ para proteger qualquer rota do projeto.
export function createAuthSession(user: User) {
  if (!canUseDocument()) {
    return;
  }

  const token = encodeURIComponent(createSessionToken(user));

  document.cookie = `${AUTH_SESSION_COOKIE_NAME}=${token}; Max-Age=${SESSION_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
}

// Remove o cookie de sessao.
// Esta funcao fica pronta para quando o projeto ganhar botao real de sair.
export function clearAuthSession() {
  if (!canUseDocument()) {
    return;
  }

  document.cookie = `${AUTH_SESSION_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
}

// Verifica, no navegador, se existe uma sessao salva.
// O dashboard usa isso como segunda camada de protecao client-side.
export function hasAuthSession() {
  if (!canUseDocument()) {
    return false;
  }

  return document.cookie
    .split(";")
    .some((cookie) =>
      cookie.trim().startsWith(`${AUTH_SESSION_COOKIE_NAME}=`),
    );
}

// Valida de forma otimista o valor do cookie no Proxy.
// Como a autenticacao e simulada, basta existir um token nao vazio.
export function hasValidSessionCookie(cookieValue?: string) {
  return Boolean(cookieValue?.trim());
}
