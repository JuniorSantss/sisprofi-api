"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const dados = await login(username, password);

      localStorage.setItem("access", dados.access);
      localStorage.setItem("refresh", dados.refresh);

      router.push("/funcionario/dashboard");
    } catch {
      setErro("Usuário ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      <div className="flex h-full w-full overflow-hidden bg-white">
        {/* PAINEL ESQUERDO */}
        <section className="relative hidden w-[42%] min-w-[360px] max-w-[560px] shrink-0 overflow-hidden bg-[#0B5598] lg:block">
          {/* FAIXA LARANJA */}
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

          {/* IMAGEM DO PRÉDIO */}
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
          <div className="w-full max-w-[520px]">
            {/* CABEÇALHO MOBILE */}
            <div className="mb-8 lg:hidden">
              <p className="text-sm font-extrabold tracking-wide text-[#FF681D]">
                PROUNI E FIES
              </p>

              <h1 className="mt-2 text-2xl font-extrabold text-[#0B5598]">
                Atendimento Acadêmico
              </h1>
            </div>

            <h2 className="text-3xl font-extrabold text-[#0B5598] sm:text-[34px] xl:text-[38px]">
              Acesso ao Sistema
            </h2>

            <p className="mt-4 max-w-[430px] text-sm leading-7 text-[#0B5598] sm:text-base xl:text-[17px]">
              Informe seu usuário e senha para acessar a conta no sistema.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 sm:mt-8">
              {/* USUÁRIO */}
              <div>
                <label className="mb-2 block text-sm font-bold text-[#0B5598]">
                  Usuário
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="flex h-[52px] items-center rounded-lg border border-[#2E71B8] bg-[#F3F8FD] px-4 sm:h-[54px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9ABFE2"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>

                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Digite seu usuário"
                    className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-[#0B5598] outline-none placeholder:text-[#A9C6E2] sm:ml-4"
                    required
                  />
                </div>
              </div>

              {/* SENHA */}
              <div className="mt-5 sm:mt-6">
                <label className="mb-2 block text-sm font-bold text-[#0B5598]">
                  Senha
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="flex h-[52px] items-center rounded-lg border border-[#2E71B8] bg-[#F3F8FD] px-4 sm:h-[54px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9ABFE2"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>

                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Digite sua senha"
                    className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-[#0B5598] outline-none placeholder:text-[#A9C6E2] sm:ml-4"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="ml-2 shrink-0 cursor-pointer rounded-full p-1 transition-all duration-200 hover:bg-[#DCECF9] active:scale-95"
                    aria-label={
                      mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {mostrarSenha ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7DAED8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m2 2 20 20" />
                        <path d="M6.71 6.71C4.72 7.8 3.2 9.54 2.06 11.65a1 1 0 0 0 0 .7C3.65 16.4 7.58 19 12 19c1.5 0 2.93-.3 4.21-.84" />
                        <path d="M10.73 5.08A10.4 10.4 0 0 1 12 5c4.42 0 8.35 2.6 9.94 6.65a1 1 0 0 1 0 .7 12.7 12.7 0 0 1-2.23 3.42" />
                        <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#A9C6E2"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696C3.648 7.6 7.58 5 12 5c4.42 0 8.352 2.6 9.938 6.652a1 1 0 0 1 0 .696C20.352 16.4 16.42 19 12 19c-4.42 0-8.352-2.6-9.938-6.652Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* ESQUECI MINHA SENHA */}
              <div className="mt-3 text-right">
                <button
                  type="button"
                  onClick={() => router.push("/esqueci-senha")}
                  className="cursor-pointer text-xs text-[#0B5598] underline underline-offset-2 transition-all duration-200 hover:text-[#FF681D] hover:underline-offset-4 active:scale-[0.98] sm:text-sm"
                >
                  Esqueci minha senha
                </button>
              </div>

              {/* ERRO */}
              {erro && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {erro}
                </div>
              )}

              {/* ENTRAR */}
              <button
                type="submit"
                disabled={carregando}
                className="mt-7 h-[48px] w-full cursor-pointer rounded-lg bg-[#FF681D] text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#E95A0D] hover:shadow-md active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm sm:mt-8 sm:text-base"
              >
                {carregando ? "Entrando..." : "Entrar"}
              </button>

              {/* VOLTAR */}
              <button
                type="button"
                onClick={() => router.back()}
                className="mt-3 h-[46px] w-full cursor-pointer rounded-lg border border-[#2E71B8] bg-white text-sm font-extrabold text-[#0B3E8E] shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#F3F8FD] hover:shadow-md active:translate-y-0 active:scale-[0.99] sm:text-base"
              >
                Voltar
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
