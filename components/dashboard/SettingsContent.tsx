"use client";

import { CircleDollarSign, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { clearAuthSession } from "@/lib/session";
import {
  clearCurrentUser,
  getCurrentUser,
  subscribeToCurrentUser,
} from "@/lib/storage";
import { Separator } from "../ui/separator";

// Pega as duas primeiras letras do nome para montar o avatar do perfil.
// Exemplo: "Jhonatan Henrique" vira "JH".
function getUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";

  return `${first}${second}`.toUpperCase();
}

// Snapshot usado no servidor.
// Como o usuário atual fica no localStorage, o servidor sempre começa sem usuário.
const getServerCurrentUserSnapshot = () => null;

// Conteúdo da página de configurações.
// Ele segue o fluxo interno do dashboard: o menu e o header continuam fixos,
// e apenas este conteúdo é renderizado abaixo do header.
export function SettingsContent() {
  const router = useRouter();
  const user = useSyncExternalStore(
    subscribeToCurrentUser,
    getCurrentUser,
    getServerCurrentUserSnapshot,
  );

  // Encerra a sessão ativa e volta para a tela de login.
  // Depois disso, o Proxy e o DashboardShell bloqueiam qualquer página privada.
  function handleLogout() {
    clearAuthSession();
    clearCurrentUser();
    router.replace("/login");
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col">
      <section className="flex flex-col items-center text-center">
        <div className="grid h-24 w-24 place-items-center rounded-[30px] bg-[linear-gradient(135deg,#ff6500,#ffb51b)] text-2xl font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_42px_rgba(255,112,0,0.2)]">
          {getUserInitials(user.name)}
        </div>

        <h2 className="mt-5 text-2xl font-extrabold text-slate-950 sm:text-3xl">
          {user.name}
        </h2>
      </section>

      <section className="mt-8">
        <button
          type="button"
          className="grid min-h-36 w-full grid-cols-[auto_1fr] gap-5 rounded-[28px] bg-orange-50/70 p-7 text-left shadow-[0_16px_42px_rgba(255,132,0,0.1),0_18px_48px_rgba(45,35,24,0.06)] transition-all duration-300 hover:scale-[1.01] hover:bg-orange-100/70 hover:shadow-[0_18px_48px_rgba(255,132,0,0.14),0_20px_54px_rgba(45,35,24,0.08)] focus:outline-none focus-visible:shadow-[0_0_0_5px_rgba(255,154,42,0.16),0_18px_48px_rgba(255,132,0,0.14)] sm:min-h-44 sm:p-8"
        >
          <div className="grid h-13 w-13 shrink-0 place-items-center self-start text-[#ff6500]">
            <CircleDollarSign size={25} strokeWidth={2.1} />
          </div>

          <div className="min-w-0 self-center text-left">
            <p className="text-lg font-extrabold text-slate-950">Grátis</p>
            <p className="mt-1 text-sm font-medium text-slate-500">Plano</p>
          </div>
        </button>
      </section>

      <Separator className="my-10" />

      <section className="mt-8">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              className="h-16 w-full justify-start gap-3 rounded-[24px] bg-white px-7 text-base font-bold text-red-700 hover:scale-[1.01] hover:bg-orange-100/70 hover:text-red-800 hover:shadow-[0_18px_48px_rgba(255,132,0,0.14),0_20px_54px_rgba(45,35,24,0.08)]"
            >
              <LogOut size={20} strokeWidth={2.1} />
              Sair
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Desejá sair da página</AlertDialogTitle>
              <AlertDialogDescription>
                Você será deslogado da sua conta e precisará fazer login
                novamente para acessar as páginas privadas.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button type="button" variant="whiteAction" className="h-11 px-5">
                  Cancelar
                </Button>
              </AlertDialogCancel>

              <AlertDialogAction asChild>
                <Button
                  type="button"
                  variant="dangerAction"
                  className="h-11 px-5"
                  onClick={handleLogout}
                >
                  Sair
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
