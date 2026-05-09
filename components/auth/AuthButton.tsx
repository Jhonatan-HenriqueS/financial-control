import type { ButtonHTMLAttributes, ReactNode } from "react";

// Propriedades aceitas pelo botao.
// Ele recebe children para permitir textos como "Entrar" ou "Cadastrar".
interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

// Botao principal das telas de autenticacao.
// Centraliza o estilo laranja em degradê para evitar repetir classes nas paginas.
export function AuthButton({
  children,
  className = "",
  ...props
}: AuthButtonProps) {
  return (
    <button
      className={`h-[76px] w-full rounded-2xl bg-[linear-gradient(135deg,#ff5f00_0%,#ff8a00_45%,#ffbd17_100%)] text-white shadow-[0_18px_28px_rgba(255,111,0,0.24)] transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[#ff8a00]/30 disabled:cursor-not-allowed disabled:opacity-70 sm:h-[82px] sm:rounded-[19px] ${className} `}
      {...props}
    >
      {/* Span interno controla o tamanho e peso do texto sem afetar o tamanho do botao. */}
      <span className="text-2xl font-medium">{children}</span>
    </button>
  );
}
