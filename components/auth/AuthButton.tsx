import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "@/components/ui/button";

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
    <Button
      variant="sunAuth"
      className={`h-[50px] w-full disabled:cursor-not-allowed disabled:opacity-70 sm:h-[64px] ${className}`}
      {...props}
    >
      {/* Span interno controla o tamanho e peso do texto sem afetar o tamanho do botao. */}
      <span className="sm:text-xl font-medium">{children}</span>
    </Button>
  );
}
