import type { ReactNode } from "react";

// Layout recebe qualquer tela por dentro.
// Assim login, cadastro e desenvolvimento usam o mesmo fundo.
interface AuthLayoutProps {
  children: ReactNode;
}

// Mantem o fundo compartilhado pelas telas de autenticacao.
// Pense nele como a "parede" atras do card de vidro.
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fbfaf8] px-5 py-8 text-[#2b2f33] sm:px-8">
      {/* Primeira camada: manchas suaves em branco e laranja, como na imagem de referencia. */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_28%,rgba(255,122,0,0.82)_0,rgba(255,176,57,0.44)_16%,rgba(255,241,217,0.48)_34%,transparent_58%),radial-gradient(circle_at_100%_84%,rgba(255,145,0,0.7)_0,rgba(255,190,82,0.42)_17%,rgba(255,244,226,0.45)_35%,transparent_61%),linear-gradient(118deg,#ffffff_0%,#f8f6f2_45%,#fff8ef_100%)]" />

      {/* Segunda camada: brilho claro que deixa o fundo mais leve e moderno. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.44),transparent_22%,rgba(255,255,255,0.7)_52%,transparent_77%,rgba(255,255,255,0.24))]" />

      {/* Conteudo real da pagina fica acima das camadas decorativas. */}
      <div className="relative z-10 flex w-full justify-center">{children}</div>
    </main>
  );
}
