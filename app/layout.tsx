import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

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
    <html lang="pt-BR" className={`${poppins.variable} h-full antialiased`}>
      {/* body recebe a fonte global e ocupa a altura minima da tela. */}
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
