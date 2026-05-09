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

// Esta pagina cria um usuario novo no localStorage.
// Ela simula um cadastro real, mas sem backend e sem banco externo.
export default function CadastroPage() {
  const router = useRouter();

  // Estados dos campos do formulario de cadastro.
  // Cada estado representa um campo que o usuario esta preenchendo.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Mensagem geral para erros que nao pertencem a um input especifico,
  // como email ja cadastrado.
  const [message, setMessage] = useState("");

  // Erros especificos por campo.
  // O componente de input usa estes textos para pintar borda vermelha e mostrar a frase abaixo.
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Esta funcao roda ao clicar em "Cadastrar".
  // Ela valida os campos, salva o usuario e depois volta para a tela de login.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    // Primeiro valida se os campos obrigatorios foram preenchidos.
    const nextFieldErrors = {
      name: name.trim() ? "" : "Informe seu nome.",
      email: email.trim() ? "" : "Informe seu email.",
      password: password.trim() ? "" : "Informe sua senha.",
    };

    // Depois valida a regra minima da senha.
    // O erro aparece no campo de senha, nao como alerta do navegador.
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

    // Tenta salvar o usuario no localStorage.
    // Se o email ja existir, registerUser devolve uma mensagem amigavel.
    const result = registerUser({ name, email, password });

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    // Cadastro concluido: volta para login para o usuario entrar com os dados criados.
    router.push("/login");
  }

  return (
    <AuthLayout>
      <AuthCard title="CADASTRO">
        {/* noValidate evita mensagens automaticas do HTML e deixa o React controlar os erros. */}
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
              // Atualiza o nome e remove o erro do campo quando o usuario digita.
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
            placeholder="Seu @mail.com"
            value={email}
            onChange={(event) => {
              // Atualiza o email e limpa qualquer erro antigo do campo.
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
              placeholder="Sua senha"
              value={password}
              onChange={(event) => {
                // Atualiza a senha e remove erro visual enquanto o usuario corrige.
                setPassword(event.target.value);
                setFieldErrors((current) => ({ ...current, password: "" }));
                setMessage("");
              }}
              error={fieldErrors.password}
            />
            {/* Orientacao fixa para o usuario saber a regra antes de enviar. */}
            <p className="px-1 text-sm font-medium text-[#8a8d92] sm:text-base">
              Use uma senha forte com no mínimo 6 caracteres.
            </p>
          </div>

          <FormMessage message={message} />

          <AuthButton type="submit">Cadastrar</AuthButton>
        </form>

        {/* Atalho para voltar ao login quando a pessoa ja tem uma conta. */}
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
