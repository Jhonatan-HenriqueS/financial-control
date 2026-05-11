"use client";

import { Menu, Moon, Sun } from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";
import { DashboardMenu } from "@/components/dashboard/DashboardMenu";
import { Button } from "@/components/ui/button";
import type { DashboardPageKey } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/storage";

// Pega apenas o primeiro nome do usuario.
// Exemplo: "Jhonatan Silva" vira "Jhonatan".
function getFirstName(name?: string) {
  return name?.trim().split(/\s+/)[0] || "Usuário";
}

// Tempo da animacao de entrada e saida do menu.
// O valor e curto para parecer rapido, mas ainda suave.
const MENU_ANIMATION_MS = 180;

interface DashboardHeaderProps {
  currentPage: DashboardPageKey;
  onPageChange: (page: DashboardPageKey) => void;
}

// Header principal da pagina logada.
// Ele replica o card da imagem: botao de menu, nome da pagina, saudacao e botao de tema.
// O header fica fixo para continuar visivel mesmo quando a pagina tiver scroll.
export function DashboardHeader({
  currentPage,
  onPageChange,
}: DashboardHeaderProps) {
  const closeTimerRef = useRef<number | null>(null);
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isDarkIcon, setIsDarkIcon] = useState(true);

  // Le o usuario salvo no localStorage como um estado externo.
  // O subscribe nao escuta mudancas porque, nesta tela, o usuario ja foi salvo antes do redirect.
  const currentUserName = useSyncExternalStore(
    () => () => undefined,
    () => getCurrentUser()?.name ?? "",
    () => "",
  );

  // Le o email do usuario para preencher o card inferior do menu.
  const currentUserEmail = useSyncExternalStore(
    () => () => undefined,
    () => getCurrentUser()?.email ?? "",
    () => "",
  );

  // Transforma o nome completo salvo em saudacao curta.
  const firstName = getFirstName(currentUserName);

  // Abre o menu ja no estado visivel.
  // Assim evitamos um flash visual em que ele monta fechado e logo depois abre.
  function openMenu() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    setIsMenuMounted(true);
    setIsMenuVisible(true);
  }

  // Fecha o menu com animacao.
  // Ele fica montado por alguns milissegundos para conseguir deslizar para fora.
  function closeMenu() {
    setIsMenuVisible(false);

    closeTimerRef.current = window.setTimeout(() => {
      setIsMenuMounted(false);
    }, MENU_ANIMATION_MS);
  }

  // Troca o componente renderizado abaixo do header sem trocar de rota.
  // Depois fecha o menu com animacao para manter o fluxo visual limpo.
  function handlePageChange(page: DashboardPageKey) {
    onPageChange(page);
    closeMenu();
  }

  return (
    <>
      <header className="fixed left-4 right-4 top-4 z-50 overflow-hidden rounded-[28px] bg-white/78 px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.95),0_18px_55px_rgba(45,35,24,0.12)] backdrop-blur-2xl sm:left-8 sm:right-8 sm:top-6 sm:px-5 lg:left-[380px]">
        {/* Fundo interno com os mesmos tons claros e laranja suave do login/cadastro. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(255,154,42,0.18),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(255,184,54,0.16),transparent_38%),linear-gradient(115deg,rgba(255,255,255,0.95),rgba(255,248,238,0.76))]" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            {/* Botao que abre o menu lateral em vidro. */}
            <Button
              type="button"
              aria-label="Abrir menu"
              onClick={openMenu}
              variant="softIcon"
              size="appIcon"
              className="lg:hidden"
            >
              <Menu size={20} strokeWidth={2.2} />
            </Button>

            <div className="min-w-0">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.38em] text-slate-500">
                {currentPage}
              </p>
              <h1 className="mt-1 truncate text-xl font-semibold text-slate-950 sm:text-lg">
                Olá, {firstName}
              </h1>
            </div>
          </div>

          {/* Botao de tema. Ele alterna apenas o icone por enquanto. */}
          <Button
            type="button"
            aria-label="Alternar icone de tema"
            onClick={() => setIsDarkIcon((current) => !current)}
            variant="softIcon"
            size="appIcon"
          >
            {isDarkIcon ? (
              <Moon size={18} fill="currentColor" strokeWidth={2.2} />
            ) : (
              <Sun size={20} strokeWidth={2.2} />
            )}
          </Button>
        </div>
      </header>

      {isMenuMounted ? (
        <DashboardMenu
          isOpen={isMenuVisible}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          userName={currentUserName || "Usuário"}
          userEmail={currentUserEmail || "email não informado"}
          onClose={closeMenu}
        />
      ) : null}

      <DashboardMenu
        isOpen
        mode="persistent"
        currentPage={currentPage}
        onPageChange={onPageChange}
        userName={currentUserName || "Usuário"}
        userEmail={currentUserEmail || "email não informado"}
        onClose={() => undefined}
      />
    </>
  );
}
