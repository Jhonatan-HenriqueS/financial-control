import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// Carrega a fonte Poppins pelo next/font.
// O Next baixa e otimiza a fonte para evitar carregamento externo no navegador.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// Metadados basicos que aparecem no navegador e ajudam mecanismos de busca.
export const metadata: Metadata = {
  title: "Financas | Autenticacao",
  description: "Fluxo de autenticacao simulado com Next.js e localStorage.",
};

// Layout raiz da aplicacao.
// Tudo que for renderizado nas rotas passa por aqui.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn("h-full", "antialiased", poppins.variable, "font-sans", geist.variable)}>
      {/* body recebe a fonte global e ocupa a altura minima da tela. */}
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
