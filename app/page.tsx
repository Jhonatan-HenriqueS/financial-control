import { redirect } from "next/navigation";

// Rota inicial do projeto.
// Quem acessa "/" e enviado automaticamente para a tela de login.
export default function Home() {
  redirect("/login");
}
