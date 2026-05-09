import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

// Pagina exibida apos login bem-sucedido.
// O fundo fica branco e apenas o componente de topo carrega a identidade visual colorida.
export default function DashboardPage() {
  return (
    <main className="h-dvh w-full overflow-hidden bg-white">
      <DashboardHeader />
    </main>
  );
}
