import type { ComponentType, InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: ComponentType<{ className?: string }>;
  error?: string;
}

export function InputField({
  label,
  icon: Icon,
  id,
  error,
  ...props
}: InputFieldProps) {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="space-y-4">
      <label
        htmlFor={id}
        className="block text-[1.35rem] font-medium leading-none text-[#2f3337] sm:text-[1.72rem]"
      >
        {label}
      </label>
      <div
        className={`flex h-[76px] items-center rounded-2xl bg-white/86 px-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_16px_34px_rgba(47,38,26,0.07)] ring-1 transition focus-within:ring-2 sm:h-[88px] sm:rounded-[22px] ${
          error
            ? "ring-red-400/70 focus-within:ring-red-500/70"
            : "ring-black/[0.02] focus-within:ring-[#ff7a00]/50"
        }`}
      >
        <Icon className="mr-6 h-8 w-8 shrink-0 text-[#ff7300] sm:h-10 sm:w-10" />
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className="min-w-0 flex-1 bg-transparent text-[1.18rem] font-medium text-[#30343a] outline-none placeholder:text-[#7b7f84] sm:text-[1.6rem]"
          {...props}
        />
      </div>
      {error ? (
        <p id={errorId} className="px-1 text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
