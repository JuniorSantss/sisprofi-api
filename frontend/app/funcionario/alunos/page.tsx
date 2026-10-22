"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { buscarAlunos } from "@/services/api";

type Aluno = {
  cpf_aluno: string;
  nome: string;
  contato: string;
  curso: string;
  programas: number[];
  nomes_programas: string[];
};

export default function AlunosPage() {
  const router = useRouter();

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [busca, setBusca] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarAlunos() {
      try {
        setCarregando(true);
        setErro("");

        const dados = await buscarAlunos();

        setAlunos(dados);
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os alunos.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarAlunos();
  }, []);

  const alunosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return alunos;
    }

    return alunos.filter((aluno) => {
      const nome = aluno.nome.toLowerCase();
      const cpf = aluno.cpf_aluno.toLowerCase();

      return nome.includes(termo) || cpf.includes(termo);
    });
  }, [alunos, busca]);

  function abrirDetalhesAluno(cpf: string) {
    router.push(`/funcionario/alunos/${encodeURIComponent(cpf)}`);
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      <div className="flex h-full w-full overflow-hidden bg-white">
        {/* SIDEBAR */}
        <aside className="relative hidden w-[22%] min-w-[230px] max-w-[290px] shrink-0 overflow-hidden bg-[#0B5598] text-white lg:flex lg:flex-col">
          <div className="absolute left-0 top-0 z-20 h-full w-[14px] bg-[#FF681D]" />

          <div className="relative z-10 flex h-full flex-col px-6 pt-10 xl:px-8 xl:pt-12">
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

              <MenuButton label="Alunos" icon={<UserIcon />} ativo />

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

            <div className="pointer-events-none mt-auto -mx-6 xl:-mx-8">
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
          <div className="flex h-full flex-col px-5 py-7 sm:px-6 md:px-8 xl:px-10 xl:py-10">
            {/* CABEÇALHO */}
            <header className="flex shrink-0 flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h2 className="text-3xl font-black leading-tight tracking-tight text-[#064F91] xl:text-4xl">
                  Alunos
                </h2>

                <p className="mt-3 text-base text-[#064F91] xl:text-lg">
                  Consulte os alunos cadastrados no sistema.
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

            {/* BUSCA + TOTAL */}
            <section className="mt-8 grid shrink-0 grid-cols-1 gap-4 xl:grid-cols-[1fr_265px]">
              {/* BUSCA */}
              <div>
                <label className="mb-2 block text-sm text-[#064F91]">
                  Buscar aluno
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                    <SearchIcon />
                  </div>

                  <input
                    type="text"
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Digite o nome ou CPF do aluno"
                    className="h-[52px] w-full rounded-xl border border-[#2E71B8] bg-white pl-12 pr-4 text-sm text-[#064F91] outline-none placeholder:text-[#8DAAC4] transition focus:ring-2 focus:ring-[#0B5598]/10"
                  />
                </div>
              </div>

              {/* TOTAL */}
              <div className="flex min-h-[82px] items-center justify-between rounded-xl border border-[#0B5598] bg-[#F4F8FC] px-5">
                <div>
                  <p className="text-sm text-[#064F91]">Alunos cadastrados</p>

                  <p className="mt-1 text-3xl font-black text-[#064F91]">
                    {carregando ? "0" : alunos.length}
                  </p>
                </div>

                <div className="flex h-[45px] w-[45px] items-center justify-center rounded-lg border border-[#75A5D0]">
                  <UserBlueIcon />
                </div>
              </div>
            </section>

            {/* ERRO */}
            {erro && (
              <div className="mt-5 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {erro}
              </div>
            )}

            {/* TABELA */}
            <section className="mt-7 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#0B5598] bg-white">
              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full min-w-[980px] border-collapse text-left text-[#064F91]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-[#B9CEE2] bg-[#F0F4F8]">
                      <th className="px-5 py-3 text-[13px] font-medium">CPF</th>

                      <th className="px-5 py-3 text-[13px] font-medium">
                        Nome
                      </th>

                      <th className="px-5 py-3 text-[13px] font-medium">
                        Curso
                      </th>

                      <th className="px-5 py-3 text-[13px] font-medium">
                        Contato
                      </th>

                      <th className="px-5 py-3 text-[13px] font-medium">
                        Programa
                      </th>

                      <th className="px-5 py-3 text-center text-[13px] font-medium">
                        Ação
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {carregando ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-12 text-center text-sm text-[#064F91]"
                        >
                          Carregando alunos...
                        </td>
                      </tr>
                    ) : alunosFiltrados.length > 0 ? (
                      alunosFiltrados.map((aluno) => (
                        <tr
                          key={aluno.cpf_aluno}
                          className="border-b border-[#C8D9E8] transition-colors duration-200 hover:bg-[#F8FBFE]"
                        >
                          <td className="px-5 py-3 text-[13px]">
                            {formatarCpf(aluno.cpf_aluno)}
                          </td>

                          <td className="px-5 py-3 text-[13px] font-medium">
                            {aluno.nome}
                          </td>

                          <td className="px-5 py-3 text-[13px]">
                            {aluno.curso}
                          </td>

                          <td className="px-5 py-3 text-[13px]">
                            {aluno.contato}
                          </td>

                          <td className="px-5 py-3 text-[13px]">
                            {aluno.nomes_programas.length > 0
                              ? aluno.nomes_programas.join(" e ")
                              : "-"}
                          </td>

                          <td className="px-5 py-2 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                abrirDetalhesAluno(aluno.cpf_aluno)
                              }
                              className="cursor-pointer rounded-lg bg-[#FF681D] px-4 py-2 text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#E95A0D] hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                            >
                              Ver detalhes
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-12 text-center text-sm text-gray-400"
                        >
                          Nenhum aluno encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
  ativo = false,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  ativo?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[46px] cursor-pointer items-center gap-4 rounded-xl px-3 text-left transition-all duration-200 ${
        ativo ? "border border-white bg-white/20" : "hover:bg-white/10"
      }`}
    >
      {icon}

      <span className="text-sm font-medium xl:text-base">{label}</span>
    </button>
  );
}

function formatarCpf(cpf: string) {
  const somenteNumeros = cpf.replace(/\D/g, "");

  if (somenteNumeros.length !== 11) {
    return cpf;
  }

  return somenteNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
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

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#064F91"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />

      <path d="m20 20-4-4" />
    </svg>
  );
}

function UserBlueIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#064F91"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="7" r="4" />

      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7H4Z" />
    </svg>
  );
}
