"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SenhaAlteradaPage() {
  const router = useRouter();

  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      <div className="flex h-full w-full overflow-hidden bg-white">
        {/* PAINEL ESQUERDO */}

        <section className="relative hidden w-[42%] min-w-[360px] max-w-[560px] shrink-0 overflow-hidden bg-[#0B5598] lg:block">
          <div className="absolute left-0 top-0 h-full w-[14px] bg-[#FF681D]" />

          <div className="relative z-10 px-10 pt-12 xl:px-14 xl:pt-14">
            <p className="text-lg font-extrabold tracking-wide text-[#FF681D] xl:text-xl">
              PROUNI E FIES
            </p>

            <h1 className="mt-6 max-w-sm text-4xl font-extrabold leading-tight text-white xl:text-[42px]">
              Sistema de
              <br />
              atendimento
              <br />
              acadêmico
            </h1>

            <p className="mt-5 max-w-sm text-base leading-7 text-white xl:text-lg">
              Acesse seus serviços e acompanhe essa jornada no programa.
            </p>
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 w-full">
            <Image
              src="/images/predio-login.png"
              alt="Prédio acadêmico"
              width={700}
              height={430}
              className="h-auto w-full object-contain object-bottom"
              priority
            />
          </div>
        </section>

        {/* PAINEL DIREITO */}

        <section className="flex min-w-0 flex-1 items-center justify-center bg-white px-5 py-8 sm:px-8 md:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-[620px]">
            {/* MOBILE */}

            <div className="mb-8 lg:hidden">
              <p className="text-sm font-extrabold tracking-wide text-[#FF681D]">
                PROUNI E FIES
              </p>

              <h1 className="mt-2 text-2xl font-extrabold text-[#0B5598]">
                Atendimento Acadêmico
              </h1>
            </div>

            {/* CARD */}

            <div className="rounded-2xl border border-[#2E71B8] bg-white px-7 py-10 text-center shadow-sm sm:px-10 sm:py-12">
              {/* ÍCONE */}

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-50">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
                  <CheckIcon />
                </div>
              </div>

              {/* TEXTO */}

              <h2 className="mt-7 text-3xl font-extrabold text-[#0B5598] sm:text-[34px]">
                Senha alterada com sucesso
              </h2>

              <p className="mx-auto mt-4 max-w-[480px] text-sm leading-7 text-[#0B5598] sm:text-base">
                Sua senha foi redefinida com sucesso. Agora você já pode acessar
                o sistema utilizando sua nova senha.
              </p>

              {/* BOTÃO */}

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="mt-8 h-[50px] w-full cursor-pointer rounded-lg bg-[#FF681D] px-6 text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#E95A0D] hover:shadow-md active:scale-[0.98] sm:text-base"
              >
                Voltar para o login
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}
