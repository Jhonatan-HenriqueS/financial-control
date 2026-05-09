// Propriedade comum para todos os icones.
// className permite controlar tamanho e cor usando Tailwind no componente pai.
interface IconProps {
  className?: string;
}

// Icone de usuario usado em campos de nome ou identificador.
export function UserIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 12.2a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7.2 7.6c-.5-3.7-3.5-6.2-7.2-6.2s-6.7 2.5-7.2 6.2h14.4Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

// Icone de email usado no campo de cadastro.
export function MailIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4.5 6.5h15v11h-15v-11Zm1.2 1.2 6.3 5.1 6.3-5.1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

// Icone de cadeado usado no campo de senha.
export function LockIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.7 10.3h10.6v9H6.7v-9Zm2.2 0V8a3.1 3.1 0 0 1 6.2 0v2.3M12 14v1.8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

// Icone de olho aberto para indicar que a senha pode ser exibida.
export function EyeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3.7 12s2.9-5 8.3-5 8.3 5 8.3 5-2.9 5-8.3 5-8.3-5-8.3-5Zm8.3 2.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

// Icone de olho cortado para indicar que a senha pode ser escondida.
export function EyeOffIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m4 4 16 16M9.7 5.5A8.8 8.8 0 0 1 12 5c5.4 0 8.3 5 8.3 5a14.7 14.7 0 0 1-2.4 3.1M14.2 14.2A2.6 2.6 0 0 1 9.8 9.8M6.4 7.4A14.7 14.7 0 0 0 3.7 12s2.9 5 8.3 5c.9 0 1.8-.1 2.5-.4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
