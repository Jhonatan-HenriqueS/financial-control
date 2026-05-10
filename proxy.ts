import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_SESSION_COOKIE_NAME,
  hasValidSessionCookie,
} from "@/lib/session";

// Rotas que qualquer pessoa pode acessar sem estar logada.
// Cadastro fica livre porque o usuario precisa conseguir criar a conta.
const PUBLIC_ROUTES = ["/login", "/cadastro"];

// Verifica se a rota atual esta na lista de paginas publicas.
// O teste considera tambem subrotas, caso alguma tela publica ganhe filhos no futuro.
function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

// Proxy roda antes da pagina ser entregue.
// Ele usa o cookie de sessao para decidir se libera a rota ou redireciona.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = hasValidSessionCookie(sessionCookie);

  // Quem ja esta logado e abre "/" ou "/login" vai direto para o dashboard.
  if (isAuthenticated && (pathname === "/" || pathname === "/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Quem nao esta logado so pode acessar login e cadastro.
  // Qualquer outra rota volta para a tela de login.
  if (!isAuthenticated && pathname !== "/" && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Evita rodar o Proxy em arquivos internos do Next e assets estaticos.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
