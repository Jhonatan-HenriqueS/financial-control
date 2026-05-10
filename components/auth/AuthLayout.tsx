import type { ReactNode } from "react";

// Layout recebe qualquer tela por dentro.
// Assim login, cadastro e desenvolvimento usam o mesmo fundo.
interface AuthLayoutProps {
  children: ReactNode;
}

// Mantem o fundo compartilhado pelas telas de autenticacao.
// O fundo principal fica totalmente branco; os detalhes visuais permanecem nos componentes.
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative flex h-screen items-center justify-center overflow-hidden bg-white px-3 text-[#2b2f33] sm:px-8">
      {/* Conteudo real da pagina fica acima das camadas decorativas. */}
      <div className="relative z-10 flex w-full justify-center">{children}</div>
    </main>
  );
}
