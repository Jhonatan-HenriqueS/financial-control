interface FormMessageProps {
  message?: string;
  variant?: "error" | "success";
}

export function FormMessage({ message, variant = "error" }: FormMessageProps) {
  if (!message) {
    return null;
  }

  const colorClass = variant === "error" ? "text-red-600" : "text-emerald-600";

  return (
    <p className={`text-center text-sm font-medium ${colorClass}`} role="alert">
      {message}
    </p>
  );
}
