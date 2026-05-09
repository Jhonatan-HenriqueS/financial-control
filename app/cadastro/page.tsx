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
import { MailIcon, UserIcon } from "@/components/auth/icons";
import { registerUser } from "@/lib/storage";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const nextFieldErrors = {
      name: name.trim() ? "" : "Informe seu nome.",
      email: email.trim() ? "" : "Informe seu email.",
      password: password.trim() ? "" : "Informe sua senha.",
    };

    if (password.trim() && password.length < 6) {
      nextFieldErrors.password = "A senha deve possuir no mínimo 6 caracteres.";
    }

    setFieldErrors(nextFieldErrors);

    if (
      nextFieldErrors.name ||
      nextFieldErrors.email ||
      nextFieldErrors.password
    ) {
      return;
    }

    const result = registerUser({ name, email, password });

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    router.push("/login");
  }

  return (
    <AuthLayout>
      <AuthCard title="CADASTRO">
        <form className="space-y-7" onSubmit={handleSubmit} noValidate>
          <InputField
            id="name"
            label="Nome"
            icon={UserIcon}
            type="text"
            autoComplete="name"
            placeholder="Seu nome"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setFieldErrors((current) => ({ ...current, name: "" }));
              setMessage("");
            }}
            error={fieldErrors.name}
          />

          <InputField
            id="email"
            label="Email"
            icon={MailIcon}
            type="email"
            autoComplete="email"
            placeholder="@mail.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setFieldErrors((current) => ({ ...current, email: "" }));
              setMessage("");
            }}
            error={fieldErrors.email}
          />

          <div className="space-y-3">
            <PasswordInput
              id="signup-password"
              label="Senha"
              autoComplete="new-password"
              placeholder="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setFieldErrors((current) => ({ ...current, password: "" }));
                setMessage("");
              }}
              error={fieldErrors.password}
            />
            <p className="px-1 text-sm font-medium text-[#8a8d92] sm:text-base">
              Use uma senha forte com no mínimo 6 caracteres.
            </p>
          </div>

          <FormMessage message={message} />

          <AuthButton type="submit">Cadastrar</AuthButton>
        </form>

        <p className="mt-10 text-center text-[1.05rem] font-medium text-[#23272c] sm:text-left sm:text-[1.45rem]">
          Já Tem Uma Conta?{" "}
          <Link
            href="/login"
            className="text-[#ff7300] underline underline-offset-4 transition hover:text-[#e45f00]"
          >
            Entrar
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
