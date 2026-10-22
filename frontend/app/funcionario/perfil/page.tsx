"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { atualizarFuncionario, buscarFuncionarios } from "@/services/api";

type Funcionario = {
  cpf_func: string;
  nome: string;
  email: string;
};

export default function PerfilFuncionarioPage() {
  const router = useRouter();

  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    async function carregarFuncionario() {
      try {
        setCarregando(true);
        setErro("");

        const dados = await buscarFuncionarios();

        if (!dados || dados.length === 0) {
          setErro("Nenhum funcionário cadastrado foi encontrado.");
          return;
        }

        /*
          Temporário:
          enquanto o usuário autenticado do Django
          não estiver vinculado ao model Funcionario,
          usamos o primeiro funcionário cadastrado.
        */
        const funcionarioEncontrado: Funcionario = dados[0];

        setFuncionario(funcionarioEncontrado);
        setNome(funcionarioEncontrado.nome);
        setEmail(funcionarioEncontrado.email);
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o perfil.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarFuncionario();
  }, []);

  async function salvarAlteracoes() {
    setErro("");
    setSucesso("");

    if (!funcionario) {
      setErro("Funcionário não encontrado.");
      return;
    }

    if (!nome.trim()) {
      setErro("Informe o nome do funcionário.");
      return;
    }

    if (!email.trim()) {
      setErro("Informe o e-mail do funcionário.");
      return;
    }

    try {
      setSalvando(true);

      const atualizado = await atualizarFuncionario(funcionario.cpf_func, {
        nome: nome.trim(),
        email: email.trim(),
      });

      setFuncionario(atualizado);
      setNome(atualizado.nome);
      setEmail(atualizado.email);

      setSucesso("Dados atualizados com sucesso.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o perfil.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function cancelarAlteracoes() {
    if (!funcionario) {
      router.back();
      return;
    }

    setNome(funcionario.nome);
    setEmail(funcionario.email);

    setErro("");
    setSucesso("");
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      <div className="flex h-full w-full overflow-hidden bg-white">
        {/* SIDEBAR */}
        <aside className="relative hidden w-[25%] min-w-[245px] max-w-[320px] shrink-0 overflow-hidden bg-[#0B5598] text-white lg:flex lg:flex-col">
          <div className="absolute left-0 top-0 z-20 h-full w-[14px] bg-[#FF681D]" />

          <div className="relative z-10 flex h-full flex-col px-7 pt-12 xl:px-9">
            <h1 className="ml-2 text-xl font-extrabold text-[#FF681D] xl:text-2xl">
              PROUNI E FIES
            </h1>

            <nav className="mt-8 flex flex-col gap-2">
              <MenuButton
                label="Dashboard"
                icon={<HomeIcon />}
                onClick={() => router.push("/funcionario/dashboard")}
              />

              <MenuButton
                label="Agendamentos"
                icon={<CalendarIcon />}
                onClick={() => router.push("/funcionario/agendamentos")}
              />

              <MenuButton
                label="Alunos"
                icon={<UserIcon />}
                onClick={() => router.push("/funcionario/alunos")}
              />

              <MenuButton
                label="Atendimentos"
                icon={<AttendanceIcon />}
                onClick={() => router.push("/funcionario/atendimentos")}
              />

              <MenuButton
                label="Pendências"
                icon={<AlertIcon />}
                onClick={() => router.push("/funcionario/pendencias")}
              />

              <MenuButton
                label="Relatórios"
                icon={<ChartIcon />}
                onClick={() => router.push("/funcionario/relatorios")}
              />
            </nav>

            <div className="pointer-events-none mt-auto -mx-7 xl:-mx-9">
              <Image
                src="/images/predio-login.png"
                alt="Prédio acadêmico"
                width={650}
                height={400}
                className="h-auto w-full object-contain object-bottom opacity-90"
                priority
              />
            </div>
          </div>
        </aside>

        {/* CONTEÚDO */}
        <section className="min-w-0 flex-1 overflow-hidden bg-white">
          <div className="flex h-full flex-col px-6 py-8 md:px-10 xl:px-12 xl:py-10">
            {/* CABEÇALHO */}
            <header className="flex shrink-0 flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h2 className="text-3xl font-black leading-tight tracking-tight text-[#064F91] xl:text-4xl">
                  Perfil do funcionário
                </h2>

                <p className="mt-2 text-base text-[#064F91] xl:text-lg">
                  Consulte e atualize seus dados básicos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/funcionario/perfil")}
                className="flex h-[54px] w-full max-w-[240px] cursor-pointer items-center gap-3 rounded-xl border border-[#0B5598] bg-[#F4F8FC] px-4 text-[#064F91] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#EAF2F9] hover:shadow-sm"
              >
                <ProfileIcon />

                <span className="flex-1 text-left text-base">Funcionário</span>

                <span className="text-xs">▼</span>
              </button>
            </header>

            {/* FORMULÁRIO */}
            <section className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#0B5598] bg-white">
              {carregando ? (
                <div className="flex h-full items-center justify-center text-sm text-[#064F91]">
                  Carregando perfil...
                </div>
              ) : erro && !funcionario ? (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-red-600">
                  {erro}
                </div>
              ) : (
                <div className="flex h-full flex-col overflow-y-auto px-7 py-6 md:px-8">
                  {/* NOME */}
                  <div>
                    <label className="mb-2 block text-sm text-[#064F91]">
                      Nome completo
                    </label>

                    <input
                      type="text"
                      value={nome}
                      onChange={(event) => setNome(event.target.value)}
                      className="h-[48px] w-full rounded-lg border border-[#2E71B8] bg-white px-4 text-sm text-[#064F91] outline-none transition focus:ring-2 focus:ring-[#0B5598]/10"
                    />
                  </div>

                  {/* CPF */}
                  <div className="mt-8">
                    <label className="mb-2 block text-sm text-[#064F91]">
                      CPF
                    </label>

                    <input
                      type="text"
                      value={
                        funcionario ? formatarCpf(funcionario.cpf_func) : ""
                      }
                      disabled
                      className="h-[48px] w-full rounded-lg border border-[#2E71B8] bg-[#F0F4F8] px-4 text-sm text-[#064F91] outline-none disabled:opacity-100"
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="mt-8">
                    <label className="mb-2 block text-sm text-[#064F91]">
                      E-mail
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-[48px] w-full rounded-lg border border-[#2E71B8] bg-white px-4 text-sm text-[#064F91] outline-none transition focus:ring-2 focus:ring-[#0B5598]/10"
                    />
                  </div>

                  {/* ESPAÇO CENTRAL */}
                  <div className="min-h-[80px] flex-1" />

                  {/* MENSAGENS */}
                  {erro && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {erro}
                    </div>
                  )}

                  {sucesso && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {sucesso}
                    </div>
                  )}

                  {/* RODAPÉ */}
                  <div className="border-t border-[#2E71B8] pt-5">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={cancelarAlteracoes}
                        disabled={salvando}
                        className="h-[48px] min-w-[140px] cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-7 text-sm font-extrabold text-[#064F91] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#F3F8FD] hover:shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        onClick={salvarAlteracoes}
                        disabled={salvando || !funcionario}
                        className="h-[48px] min-w-[185px] cursor-pointer rounded-lg bg-[#FF681D] px-7 text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#E95A0D] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {salvando ? "Salvando..." : "Salvar alterações"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================
   COMPONENTES
========================= */

function MenuButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[46px] cursor-pointer items-center gap-4 rounded-xl px-3 text-left transition-all duration-200 hover:bg-white/10"
    >
      {icon}

      <span className="text-sm font-medium xl:text-base">{label}</span>
    </button>
  );
}

function formatarCpf(cpf: string) {
  const numeros = cpf.replace(/\D/g, "");

  if (numeros.length !== 11) {
    return cpf;
  }

  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/* =========================
   ÍCONES
========================= */

function HomeIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.7"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.7"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />

      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="7" r="4" />

      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7H4Z" />
    </svg>
  );
}

function AttendanceIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.7"
    >
      <rect x="4" y="3" width="14" height="17" rx="1" />

      <path d="M7 7h8M7 11h8M7 15h5" />
      <path d="M18 7h2v14H7v-1" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 17h.01" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.7"
    >
      <path d="M4 3v18h17" />
      <path d="M7 17c2-1 2-8 5-8 3 0 2 7 7 7" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#064F91"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="10" />

      <circle cx="12" cy="9" r="3" fill="#064F91" />

      <path d="M6.5 18c1-3 3-4.5 5.5-4.5S16.5 15 17.5 18" fill="#064F91" />
    </svg>
  );
}
