// Propriedades da mensagem do formulario.
// variant decide se o texto aparece como erro ou sucesso.
interface FormMessageProps {
  message?: string;
  variant?: "error" | "success";
}

// Mostra uma mensagem curta abaixo do formulario.
// Se nao houver mensagem, retorna null para nao ocupar espaco na tela.
export function FormMessage({ message, variant = "error" }: FormMessageProps) {
  if (!message) {
    return null;
  }

  // Define a cor visual de acordo com o tipo da mensagem.
  const colorClass = variant === "error" ? "text-red-600" : "text-emerald-600";

  return (
    <p className={`text-center text-xs font-medium ${colorClass}`} role="alert">
      {message}
    </p>
  );
}
