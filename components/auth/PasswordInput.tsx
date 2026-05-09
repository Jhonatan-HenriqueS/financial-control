"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { EyeIcon, EyeOffIcon, LockIcon } from "./icons";

// Propriedades do campo de senha.
// Ele tambem recebe erro para mostrar borda vermelha e texto abaixo.
interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Campo de senha reutilizavel.
// Alem de receber uma senha, ele permite mostrar ou ocultar o texto digitado.
export function PasswordInput({
  label = "Password",
  id,
  error,
  ...props
}: PasswordInputProps) {
  // Controla se a senha aparece como texto comum ou como caracteres ocultos.
  const [isVisible, setIsVisible] = useState(false);

  // Conecta a mensagem de erro ao input para melhorar acessibilidade.
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="space-y-4">
      <label
        htmlFor={id}
        className="block text-[1.05rem] font-medium leading-none text-[#2f3337] sm:text-[1.28rem]"
      >
        {label}
      </label>
      <div
        className={`flex h-[60px] items-center rounded-2xl bg-white/86 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_16px_34px_rgba(47,38,26,0.07)] ring-1 transition focus-within:ring-2 sm:h-[68px] sm:rounded-[22px] ${
          error
            ? "ring-red-400/70 focus-within:ring-red-500/70"
            : "ring-black/[0.02] focus-within:ring-[#ff7a00]/50"
        }`}
      >
        {/* Cadeado visual para deixar claro que este campo recebe senha. */}
        <LockIcon className="mr-3 h-8 w-8 shrink-0 text-[#ff7300] sm:h-10 sm:w-10" />
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className="min-w-0 flex-1 bg-transparent text-base font-medium text-[#30343a] outline-none placeholder:text-[#7b7f84] sm:text-[1.12rem]"
          {...props}
        />

        {/* Botao semantico para alternar entre mostrar e esconder a senha. */}
        <button
          type="button"
          aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setIsVisible((current) => !current)}
          className="ml-3 rounded-full p-2 text-[#7b7f84] transition hover:bg-orange-50 hover:text-[#ff7300] focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50"
        >
          {isVisible ? (
            <EyeOffIcon className="h-6 w-6" />
          ) : (
            <EyeIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Erro do campo de senha, exibido logo abaixo do input. */}
      {error ? (
        <p id={errorId} className="px-1 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
