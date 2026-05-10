import { DashboardShell } from "@/components/dashboard/DashboardShell";

// Pagina exibida apos login bem-sucedido.
// O DashboardShell mantem o header/menu fixos; esta pagina ainda nao possui conteudo abaixo.
export default function DashboardPage() {
  return <DashboardShell />;
}
