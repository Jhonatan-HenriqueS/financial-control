import type { ComponentType, InputHTMLAttributes } from "react";

// Propriedades do input comum.
// Ele aceita tudo que um input HTML aceita, mais label, icone e mensagem de erro.
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: ComponentType<{ className?: string }>;
  error?: string;
}

// Campo reutilizavel para textos como nome, email ou usuario.
// Ele ja vem com icone, label, estilo visual e suporte a erro em vermelho.
export function InputField({
  label,
  icon: Icon,
  id,
  error,
  ...props
}: InputFieldProps) {
  // ID usado para ligar a mensagem de erro ao input.
  // Isso ajuda leitores de tela a entenderem que o campo esta invalido.
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
        {/* O icone fica sempre a esquerda para indicar o tipo de informacao esperada. */}
        <Icon className="mr-3 h-6 w-6 shrink-0 text-[#ff7300] sm:h-8 sm:w-8" />
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className="min-w-0 flex-1 bg-transparent text-base font-medium text-[#30343a] outline-none placeholder:text-[#7b7f84] sm:text-[1.12rem]"
          {...props}
        />
      </div>

      {/* Mensagem especifica do campo, exibida somente quando existe erro. */}
      {error ? (
        <p id={errorId} className="px-1 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
