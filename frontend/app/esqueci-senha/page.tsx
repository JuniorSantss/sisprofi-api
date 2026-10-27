"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { solicitarRecuperacaoSenha, redefinirSenha } from "@/services/api";

export default function EsqueciSenhaPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function enviarCodigo() {
    setErro("");
    setSucesso("");

    if (!email.trim()) {
      setErro("Informe o e-mail cadastrado.");
      return;
    }

    try {
      setCarregando(true);

      const resposta = await solicitarRecuperacaoSenha(email);

      setCodigoEnviado(true);

      if (resposta.codigo) {
        setSucesso(`Código gerado: ${resposta.codigo}`);
      } else {
        setSucesso("Código enviado com sucesso! Confira seu e-mail.");
      }
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível solicitar a recuperação.",
      );
    } finally {
      setCarregando(false);
    }
  }

  async function alterarSenha() {
    setErro("");
    setSucesso("");

    if (!codigo.trim()) {
      setErro("Informe o código de verificação.");
      return;
    }

    if (codigo.length !== 6) {
      setErro("Informe o código de 6 dígitos.");
      return;
    }

    if (!novaSenha.trim()) {
      setErro("Informe a nova senha.");
      return;
    }

    if (novaSenha.length < 8) {
      setErro("A nova senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      setCarregando(true);

      await redefinirSenha(email, codigo, novaSenha);

      router.push("/senha-alterada");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a senha.",
      );
    } finally {
      setCarregando(false);
    }
  }

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

        <section className="flex min-w-0 flex-1 items-center justify-center bg-white px-5 py-6 sm:px-8 md:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-[560px]">
            {/* MOBILE */}

            <div className="mb-7 lg:hidden">
              <p className="text-sm font-extrabold tracking-wide text-[#FF681D]">
                PROUNI E FIES
              </p>

              <h1 className="mt-2 text-2xl font-extrabold text-[#0B5598]">
                Atendimento Acadêmico
              </h1>
            </div>

            <h2 className="text-3xl font-extrabold text-[#0B5598] sm:text-[34px] xl:text-[38px]">
              Esqueci minha senha
            </h2>

            <p className="mt-3 max-w-[470px] text-sm leading-6 text-[#0B5598] sm:text-base">
              Informe seu e-mail cadastrado para receber um código de
              verificação.
            </p>

            {/* ETAPA 1 */}

            <div className="mt-5">
              <h3 className="text-sm font-extrabold text-[#0B5598]">
                Etapa 1 - Receber código
              </h3>

              <label className="mt-3 block text-sm font-bold text-[#0B5598]">
                E-mail cadastrado
              </label>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <div className="flex h-[50px] min-w-0 flex-1 items-center rounded-lg border border-[#2E71B8] bg-[#F3F8FD] px-4">
                  <MailIcon />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Digite seu e-mail"
                    className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-[#0B5598] outline-none placeholder:text-[#A9C6E2]"
                  />
                </div>

                <button
                  type="button"
                  onClick={enviarCodigo}
                  className="h-[50px] cursor-pointer rounded-lg bg-[#FF681D] px-6 text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#E95A0D] hover:shadow-md active:scale-[0.98]"
                >
                  Enviar código
                </button>
              </div>

              {codigoEnviado && sucesso && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#F3F8FD] px-4 py-3 text-sm text-[#0B5598]">
                  <CheckIcon />
                  {sucesso}
                </div>
              )}
            </div>

            <div className="my-5 border-t border-[#D6E2EE]" />

            {/* ETAPA 2 */}

            <div>
              <h3 className="text-sm font-extrabold text-[#0B5598]">
                Etapa 2 - Criar nova senha
              </h3>

              {/* CÓDIGO */}

              <div className="mt-4">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-bold text-[#0B5598]">
                    Código de verificação
                  </label>

                  <button
                    type="button"
                    onClick={enviarCodigo}
                    className="cursor-pointer text-xs text-[#0B5598] underline underline-offset-2 transition hover:text-[#FF681D] sm:text-sm"
                  >
                    Reenviar código
                  </button>
                </div>

                <div className="mt-2 flex h-[50px] items-center rounded-lg border border-[#2E71B8] bg-[#F3F8FD] px-4">
                  <KeyIcon />

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={codigo}
                    onChange={(event) =>
                      setCodigo(event.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Digite o código de 6 dígitos"
                    className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-[#0B5598] outline-none placeholder:text-[#A9C6E2]"
                  />
                </div>
              </div>

              {/* NOVA SENHA */}

              <div className="mt-4">
                <label className="block text-sm font-bold text-[#0B5598]">
                  Nova senha
                </label>

                <div className="mt-2 flex h-[50px] items-center rounded-lg border border-[#2E71B8] bg-[#F3F8FD] px-4">
                  <LockIcon />

                  <input
                    type={mostrarNovaSenha ? "text" : "password"}
                    value={novaSenha}
                    onChange={(event) => setNovaSenha(event.target.value)}
                    placeholder="Digite sua nova senha"
                    className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-[#0B5598] outline-none placeholder:text-[#A9C6E2]"
                  />

                  <EyeButton
                    mostrar={mostrarNovaSenha}
                    onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                  />
                </div>
              </div>

              {/* CONFIRMAR SENHA */}

              <div className="mt-4">
                <label className="block text-sm font-bold text-[#0B5598]">
                  Confirmar nova senha
                </label>

                <div className="mt-2 flex h-[50px] items-center rounded-lg border border-[#2E71B8] bg-[#F3F8FD] px-4">
                  <LockIcon />

                  <input
                    type={mostrarConfirmacao ? "text" : "password"}
                    value={confirmarSenha}
                    onChange={(event) => setConfirmarSenha(event.target.value)}
                    placeholder="Digite novamente sua nova senha"
                    className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-[#0B5598] outline-none placeholder:text-[#A9C6E2]"
                  />

                  <EyeButton
                    mostrar={mostrarConfirmacao}
                    onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
                  />
                </div>
              </div>
            </div>

            {/* ERRO */}

            {erro && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {erro}
              </div>
            )}

            {/* AÇÕES */}

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="h-[48px] cursor-pointer rounded-lg border border-[#2E71B8] bg-white text-sm font-extrabold text-[#0B5598] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#F3F8FD] hover:shadow-md active:scale-[0.98]"
              >
                Voltar ao login
              </button>

              <button
                type="button"
                onClick={alterarSenha}
                className="h-[48px] cursor-pointer rounded-lg bg-[#FF681D] text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#E95A0D] hover:shadow-md active:scale-[0.98]"
              >
                Alterar senha
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function EyeButton({
  mostrar,
  onClick,
}: {
  mostrar: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ml-2 shrink-0 cursor-pointer rounded-full p-1 transition hover:bg-[#DCECF9]"
      aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
    >
      {mostrar ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
}

function MailIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#A9C6E2"
      strokeWidth="1.5"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#A9C6E2"
      strokeWidth="1.5"
    >
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 8-8M16 4l4 4M14 6l4 4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#A9C6E2"
      strokeWidth="1.5"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0B5598"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#A9C6E2"
      strokeWidth="1.5"
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696C3.648 7.6 7.58 5 12 5c4.42 0 8.352 2.6 9.938 6.652a1 1 0 0 1 0 .696C20.352 16.4 16.42 19 12 19c-4.42 0-8.352-2.6-9.938-6.652Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#7DAED8"
      strokeWidth="1.5"
    >
      <path d="m2 2 20 20" />
      <path d="M6.71 6.71C4.72 7.8 3.2 9.54 2.06 11.65a1 1 0 0 0 0 .7C3.65 16.4 7.58 19 12 19c1.5 0 2.93-.3 4.21-.84" />
      <path d="M10.73 5.08A10.4 10.4 0 0 1 12 5c4.42 0 8.35 2.6 9.94 6.65a1 1 0 0 1 0 .7 12.7 12.7 0 0 1-2.23 3.42" />
      <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
    </svg>
  );
}
