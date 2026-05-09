"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormMessage } from "@/components/auth/FormMessage";
import { InputField } from "@/components/auth/InputField";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { UserIcon } from "@/components/auth/icons";
import { findAuthenticatedUser, saveCurrentUser } from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    identifier: "",
    password: "",
  });

  //Altera o State com a mensagem do erro, ou seja, se a validação não passar, uma das mensagens é emitida

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const nextFieldErrors = {
      identifier: identifier.trim()
        ? ""
        : "Informe seu email ou nome de usuário.",
      password: password.trim() ? "" : "Informe sua senha.",
    };

    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.identifier || nextFieldErrors.password) {
      return;
    }

    // A constante recebe o usuario encontrado no localStorage.
    // Se vier null, significa que email/nome ou senha nao bateram.
    const authenticatedUser = findAuthenticatedUser({ identifier, password });

    if (!authenticatedUser) {
      setMessage("Email, nome de usuário ou senha incorretos.");
      return;
    }

    // Salva quem entrou para que a proxima pagina consiga mostrar "Ola, Nome".
    saveCurrentUser(authenticatedUser);

    router.push("/dashboard");
  }

  return (
    <AuthLayout>
      <AuthCard title="LOGIN">
        <form className="space-y-8" onSubmit={handleSubmit} noValidate>
          <InputField
            id="identifier"
            label="Nome ou email"
            icon={UserIcon}
            type="text"
            autoComplete="Nome ou email"
            placeholder="Nome ou @mail.com"
            value={identifier}
            onChange={(event) => {
              setIdentifier(event.target.value);
              setFieldErrors((current) => ({ ...current, identifier: "" }));
              setMessage("");
            }}
            aria-label="Email ou nome de usuário"
            error={fieldErrors.identifier}
          />

          <PasswordInput
            id="password"
            label="Senha"
            autoComplete="current-password"
            placeholder="Senha"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setFieldErrors((current) => ({ ...current, password: "" }));
              setMessage("");
            }}
            error={fieldErrors.password}
          />

          <div className="flex flex-col gap-5 text-sm font-medium sm:flex-row sm:items-center sm:justify-between sm:text-base">
            <a
              href="#"
              className="text-[#ff7300] transition hover:text-[#e45f00]"
            >
              Esqueceu a Senha?
            </a>
          </div>

          <FormMessage message={message} />

          <AuthButton type="submit">Entrar</AuthButton>
        </form>

        <p className="mt-10 text-center text-sm font-medium text-[#23272c] sm:text-left sm:text-lg">
          Não Tem Uma Conta?{" "}
          <Link
            href="/cadastro"
            className="text-[#ff7300] underline underline-offset-4 transition hover:text-[#e45f00]"
          >
            Inscrever-se
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
