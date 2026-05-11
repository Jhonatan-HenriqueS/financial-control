"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CategoriesContent } from "@/components/dashboard/CategoriesContent";
import { DashboardBalanceCard } from "@/components/dashboard/DashboardBalanceCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GastosContent } from "@/components/dashboard/GastosContent";
import { clearAuthSession, hasAuthSession } from "@/lib/session";
import { getCurrentUser } from "@/lib/storage";

export type DashboardPageKey = "Dashboard" | "Categorias" | "Gastos";

// Conteudo renderizado quando o usuario escolhe Dashboard no menu.
function DashboardContent() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <DashboardBalanceCard />
    </div>
  );
}

// Conteudo renderizado quando o usuario escolhe Categorias no menu.
function CategoriasContent() {
  return <CategoriesContent />;
}

// Conteudo renderizado quando o usuario escolhe Gastos no menu.
function GastosPageContent() {
  return <GastosContent />;
}

// Decide qual componente aparece abaixo do header.
// Essa funcao substitui a troca de rotas por renderizacao condicional de componentes.
function renderSelectedPage(page: DashboardPageKey) {
  const pages: Record<DashboardPageKey, ReactNode> = {
    Dashboard: <DashboardContent />,
    Categorias: <CategoriasContent />,
    Gastos: <GastosPageContent />,
  };

  return pages[page];
}

// Shell compartilhado das paginas internas apos login.
// Ele mantem Header/Menu sempre visiveis e troca apenas o componente renderizado abaixo.
export function DashboardShell() {
  const router = useRouter();
  const [selectedPage, setSelectedPage] = useState<DashboardPageKey>("Dashboard");

  // Lê a sessao e o usuario como um estado externo do navegador.
  // Isso evita setState manual no efeito e mantém o React sincronizado com localStorage/cookie.
  const isAuthenticated = useSyncExternalStore(
    () => () => undefined,
    () => hasAuthSession() && Boolean(getCurrentUser()),
    () => false,
  );

  // Confere a sessao tambem no navegador.
  // O Proxy protege a rota pelo cookie; aqui garantimos que os dados do usuario existem no localStorage.
  useEffect(() => {
    if (!isAuthenticated) {
      clearAuthSession();
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Enquanto a autenticacao local e checada, nao mostramos conteudo privado.
  if (!isAuthenticated) {
    return <main className="h-dvh w-full bg-white" />;
  }

  return (
    <main className="h-dvh w-full overflow-hidden bg-white">
      <DashboardHeader
        currentPage={selectedPage}
        onPageChange={setSelectedPage}
      />

      {/* Area reservada para renderizar o conteudo da pagina selecionada no menu. */}
      <section className="h-full overflow-auto px-4 pb-6 pt-32 sm:px-8 sm:pt-36 lg:pl-[380px]">
        {renderSelectedPage(selectedPage)}
      </section>
    </main>
  );
}
