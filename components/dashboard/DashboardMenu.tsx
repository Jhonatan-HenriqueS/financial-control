"use client";

import { Folder, LayoutDashboard, Settings, WalletCards, X } from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import type { DashboardPageKey } from "@/components/dashboard/DashboardShell";

interface DashboardMenuProps {
  isOpen: boolean;
  currentPage: DashboardPageKey;
  userName: string;
  userEmail: string;
  onPageChange: (page: DashboardPageKey) => void;
  onClose: () => void;
  mode?: "overlay" | "persistent";
}

interface MenuItem {
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  label: DashboardPageKey;
}

// Itens exibidos no menu.
// Cada item tem icone e texto; o clique troca o componente renderizado, nao a rota.
const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    icon: Folder,
    label: "Categorias",
  },
  {
    icon: WalletCards,
    label: "Gastos",
  },
];

// Pega as duas primeiras letras do nome para montar o avatar textual.
// Exemplo: "Jhonatan Vordal" vira "JV".
function getUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";

  return `${first}${second}`.toUpperCase();
}

// Menu lateral da area logada.
// Em telas menores funciona como overlay; em desktop fica persistente e sempre visivel.
export function DashboardMenu({
  isOpen,
  currentPage,
  userName,
  userEmail,
  onPageChange,
  onClose,
  mode = "overlay",
}: DashboardMenuProps) {
  const isPersistent = mode === "persistent";

  return (
    <div
      className={`fixed z-[70] h-dvh overscroll-none transition ${
        isPersistent
          ? "left-0 top-0 hidden w-[380px] overflow-visible pointer-events-auto lg:block"
          : `inset-0 w-dvw overflow-hidden lg:hidden ${
              isOpen ? "pointer-events-auto" : "pointer-events-none"
            }`
      }`}
    >
      {/* Camada que escurece e desfoca a pagina enquanto o menu esta aberto. */}
      {isPersistent ? null : (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className={`absolute inset-0 bg-slate-950/42 backdrop-blur-md transition-opacity duration-200 ease-out ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      <aside
        className={`absolute overflow-hidden rounded-[30px] ${
          isPersistent
            ? "bottom-4 left-4 top-4 w-[340px] bg-white shadow-[22px_0_86px_-44px_rgba(45,35,24,0.28),0_24px_90px_-50px_rgba(255,132,0,0.24)]"
            : `bottom-3 left-3 top-3 w-[min(calc(100dvw-1.5rem),340px)] max-w-[calc(100dvw-1.5rem)] bg-white/48 backdrop-blur-[34px] backdrop-saturate-150 ${
                isOpen
                  ? "animate-dashboard-menu-enter"
                  : "animate-dashboard-menu-exit"
              } shadow-[0_24px_80px_rgba(15,23,42,0.16),0_0_0_1px_rgba(255,255,255,0.65)]`
        }`}
      >
        {/* Fundo do menu com vidro claro e manchas suaves na paleta laranja do projeto. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,153,45,0.28),transparent_35%),radial-gradient(circle_at_100%_95%,rgba(255,183,64,0.18),transparent_42%),linear-gradient(160deg,rgba(255,255,255,0.72),rgba(255,248,238,0.48))]" />

        <div className="relative z-10 flex h-full flex-col px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#ff6500,#ffb51b)] text-sm font-bold uppercase tracking-[0.14em] text-white shadow-[0_12px_28px_rgba(255,112,0,0.22)]">
                FN
              </div>
              <p className="truncate text-base font-bold tracking-[0.08em] text-slate-950">
                Financas
              </p>
            </div>

            {/* Fecha o menu sem navegar para outra pagina. */}
            {isPersistent ? null : (
              <Button
                type="button"
                aria-label="Fechar menu"
                onClick={onClose}
                variant="ghost"
                className="h-10 w-10 rounded-2xl text-slate-950 hover:bg-white/45 focus-visible:ring-0 focus-visible:shadow-[0_0_0_5px_rgba(255,154,42,0.15)]"
              >
                <X size={18} strokeWidth={2.1} />
              </Button>
            )}
          </div>

          <nav className="mt-10 flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.label === currentPage;

              return (
                <Button
                  key={item.label}
                  type="button"
                  onClick={() => onPageChange(item.label)}
                  variant="ghost"
                  className={`h-auto w-full justify-start gap-3 rounded-[24px] px-4 py-3 text-left focus-visible:ring-0 focus-visible:shadow-[0_0_0_5px_rgba(255,154,42,0.15)] ${
                    isActive
                      ? "bg-[linear-gradient(135deg,rgba(255,150,36,0.26),rgba(255,183,64,0.18))] text-slate-950 shadow-[0_12px_28px_rgba(255,135,0,0.16)]"
                      : "text-slate-500 hover:bg-white/42 hover:text-slate-950"
                  }`}
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl shadow-[0_8px_20px_rgba(15,23,42,0.08)] ${
                      isActive
                        ? "bg-white/55 text-[#d95f00]"
                        : "bg-white/36 text-slate-500"
                    }`}
                  >
                    <Icon size={20} strokeWidth={2.1} />
                  </span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </Button>
              );
            })}
          </nav>

          <div className="rounded-[26px] bg-white/55 p-3 shadow-[0_14px_38px_rgba(255,136,0,0.1),0_14px_38px_rgba(15,23,42,0.09)]">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#ff6500,#ffb51b)] text-sm font-bold uppercase tracking-[0.12em] text-white">
                {getUserInitials(userName)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-950">
                  {userName}
                </p>
                <p className="truncate text-xs font-medium text-slate-500">
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Botao de configuracoes. Ele ainda nao abre uma tela; apenas representa a acao. */}
            <Button
              type="button"
              variant="translucentAction"
              className="mt-4 h-11 w-full gap-2 text-sm font-semibold"
            >
              <Settings size={16} strokeWidth={2.1} />
              Configurações
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
