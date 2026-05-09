import type { ReactNode } from "react";

// Propriedades do card.
// O titulo muda entre LOGIN e CADASTRO, e children recebe o formulario.
interface AuthCardProps {
  title: string;
  children: ReactNode;
}

// Card central das telas de login e cadastro.
// Ele cria o efeito de vidro: fundo transparente, blur e borda clara uniforme.
export function AuthCard({ title, children }: AuthCardProps) {
  return (
    <section className="relative w-full max-w-[735px] overflow-hidden rounded-[42px] border-2 border-white/70 bg-white/[0.11] px-6 py-12 shadow-[0_30px_90px_rgba(44,34,22,0.16),inset_0_0_0_1px_rgba(255,255,255,0.46)] backdrop-blur-[38px] backdrop-saturate-150 sm:rounded-[56px] sm:px-12 sm:py-16 lg:px-16 lg:py-[86px]">
      {/* Camada translúcida que reforca o vidro sem deixar o card totalmente branco. */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-white/[0.08]" />

      {/* Contorno interno homogeneo para a borda parecer parte do vidro. */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/58" />

      <div className="relative z-10">
        <h1 className="text-center text-[clamp(2.25rem,7vw,3.65rem)] font-extrabold leading-none text-[#2b2f33]">
          {title}
        </h1>
        {/* Area que segura o formulario e limita a largura dos campos. */}
        <div className="mx-auto mt-12 w-full max-w-[610px] sm:mt-16">
          {children}
        </div>
      </div>
    </section>
  );
}
