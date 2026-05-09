import { AuthLayout } from "@/components/auth/AuthLayout";

export default function DesenvolvimentoPage() {
  return (
    <AuthLayout>
      <section className="flex min-h-[420px] w-full max-w-2xl flex-col items-center justify-center rounded-[38px] bg-white/72 px-6 py-14 text-center shadow-[0_28px_80px_rgba(32,27,18,0.14)] backdrop-blur-xl sm:px-12">
        <div
          className="animate-hourglass text-7xl text-[#ff7300] sm:text-8xl"
          aria-hidden="true"
        >
          ⌛
        </div>
        <h1 className="mt-9 text-3xl font-extrabold text-[#24282d] sm:text-5xl">
          Página em <span className="text-[#ff7300]">desenvolvimento</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-[#24282d] sm:text-2xl">
          Em breve esta área estará pronta para uso.
        </p>
      </section>
    </AuthLayout>
  );
}
