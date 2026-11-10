"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import FuncionarioPerfilButton from "@/components/FuncionarioPerfilButton";

import {
  buscarAgendamentos,
  buscarAlunos,
  buscarAtendimentos,
  buscarPendencias,
} from "@/services/api";

type Aluno = {
  cpf_aluno: string;
  nome: string;
  contato: string;
  curso: string;
  programas: number[];
  nomes_programas: string[];
};

type Agendamento = {
  id: number;
  aluno: string;
  data: string;
  horario: string;
  motivo: string;
  status: string;
};

type Atendimento = {
  id: number;
  agendamento: number;
  funcionario: string;
  data_atendimento: string;
  descricao: string;
  status: string;
};

type PendenciaAPI = {
  id: number;
  atendimento: number;
  descricao: string;
  status: string;
  data_criacao: string;
};

type PendenciaTela = PendenciaAPI & {
  nomeAluno: string;
  cpfAluno: string;
};

export default function PendenciasPage() {
  const router = useRouter();

  const [pendencias, setPendencias] = useState<PendenciaTela[]>([]);
  const [filtroStatus, setFiltroStatus] = useState("Aberta");

  const [carregando, setCarregando] = useState(true);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [modalListaPendencias, setModalListaPendencias] = useState(false);

  const [alunoPendenciasModal, setAlunoPendenciasModal] = useState<{
    nomeAluno: string;
    cpfAluno: string;
    pendencias: PendenciaTela[];
  } | null>(null);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [
        dadosPendencias,
        dadosAtendimentos,
        dadosAgendamentos,
        dadosAlunos,
      ] = await Promise.all([
        buscarPendencias(),
        buscarAtendimentos(),
        buscarAgendamentos(),
        buscarAlunos(),
      ]);

      const lista: PendenciaTela[] = dadosPendencias.map(
        (pendencia: PendenciaAPI) => {
          const atendimento = dadosAtendimentos.find(
            (item: Atendimento) => item.id === pendencia.atendimento,
          );

          const agendamento = dadosAgendamentos.find(
            (item: Agendamento) => item.id === atendimento?.agendamento,
          );

          const aluno = dadosAlunos.find(
            (item: Aluno) => item.cpf_aluno === agendamento?.aluno,
          );

          return {
            ...pendencia,
            nomeAluno: aluno?.nome || "Aluno não encontrado",
            cpfAluno: aluno?.cpf_aluno || "Não informado",
          };
        },
      );

      setPendencias([...lista].sort((a, b) => b.id - a.id));
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as pendências.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const pendenciasFiltradas = useMemo(() => {
    if (filtroStatus === "Todas") {
      return pendencias;
    }

    return pendencias.filter((pendencia) => pendencia.status === filtroStatus);
  }, [pendencias, filtroStatus]);

  const pendenciasAgrupadasPorAluno = useMemo(() => {
    const grupos = new Map<
      string,
      {
        nomeAluno: string;
        cpfAluno: string;
        pendencias: PendenciaTela[];
      }
    >();

    pendenciasFiltradas.forEach((pendencia) => {
      const cpf = pendencia.cpfAluno;

      if (!grupos.has(cpf)) {
        grupos.set(cpf, {
          nomeAluno: pendencia.nomeAluno,
          cpfAluno: pendencia.cpfAluno,
          pendencias: [],
        });
      }

      grupos.get(cpf)?.pendencias.push(pendencia);
    });

    grupos.forEach((grupo) => {
      grupo.pendencias.sort((a, b) => b.id - a.id);
    });

    return Array.from(grupos.values());
  }, [pendenciasFiltradas]);

  function pendenciaEstaConcluida(status: string) {
    const normalizado = status.trim().toLowerCase();

    return normalizado === "concluída" || normalizado === "concluida";
  }

  const quantidadeAbertas = pendencias.filter(
    (pendencia) => !pendenciaEstaConcluida(pendencia.status),
  ).length;

  const quantidadeConcluidas = pendencias.filter((pendencia) =>
    pendenciaEstaConcluida(pendencia.status),
  ).length;

  function formatarData(data: string) {
    if (!data) return "Não informada";

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      <div className="flex h-full w-full overflow-hidden bg-white">
        {/* SIDEBAR */}

        <aside className="relative hidden w-[22%] min-w-[230px] max-w-[290px] shrink-0 overflow-hidden bg-[#0B5598] text-white lg:flex lg:flex-col">
          <div className="absolute left-0 top-0 z-20 h-full w-[14px] bg-[#FF681D]" />

          <div className="relative z-10 flex h-full flex-col px-6 pt-10 xl:px-8 xl:pt-12">
            <h1 className="ml-2 text-xl font-extrabold text-white xl:text-2xl">
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

              <MenuButton label="Pendências" icon={<AlertIcon />} ativo />

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
                  Pendências
                </h2>

                <p className="mt-3 text-base text-[#064F91] xl:text-lg">
                  Acompanhe e conclua as pendências registradas nos
                  atendimentos.
                </p>
              </div>

              <FuncionarioPerfilButton />
            </header>

            {/* QUADRO PRINCIPAL */}

            <section className="mt-7 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#0B5598] bg-white p-4 sm:p-5">
              {/* ABAS */}

              <div className="shrink-0 border-b border-[#D6E2EE]">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFiltroStatus("Aberta")}
                    className={`border-b-2 px-4 py-3 text-sm font-extrabold transition ${
                      filtroStatus === "Aberta"
                        ? "border-[#FF681D] text-[#064F91]"
                        : "border-transparent text-[#6A8198] hover:text-[#064F91]"
                    }`}
                  >
                    Abertas ({quantidadeAbertas})
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltroStatus("Concluída")}
                    className={`border-b-2 px-4 py-3 text-sm font-extrabold transition ${
                      filtroStatus === "Concluída"
                        ? "border-[#FF681D] text-[#064F91]"
                        : "border-transparent text-[#6A8198] hover:text-[#064F91]"
                    }`}
                  >
                    Concluídas ({quantidadeConcluidas})
                  </button>
                </div>
              </div>

              {/* MENSAGENS */}

              {erro && (
                <div className="mt-4 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {erro}
                </div>
              )}

              {sucesso && (
                <div className="mt-4 shrink-0 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {sucesso}
                </div>
              )}

              {/* TABELA */}

              {/* CARDS */}

              <div className="mt-6 min-h-0 flex-1 overflow-auto">
                {carregando ? (
                  <div className="py-12 text-center text-sm text-[#064F91]">
                    Carregando pendências...
                  </div>
                ) : pendenciasAgrupadasPorAluno.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {pendenciasAgrupadasPorAluno.map((grupo) => {
                      const possuiPendenciaAberta = grupo.pendencias.some(
                        (pendencia) =>
                          !pendenciaEstaConcluida(pendencia.status),
                      );

                      return (
                        <article
                          key={grupo.cpfAluno}
                          className={`rounded-xl border px-5 py-4 ${
                            filtroStatus === "Aberta"
                              ? "border-[#DC2626] bg-white"
                              : "border-[#2E71B8] bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-black text-[#064F91]">
                                {grupo.nomeAluno}
                              </h3>

                              <p className="mt-1 text-sm text-[#6A8198]">
                                CPF: {grupo.cpfAluno}
                              </p>
                            </div>

                            <span className="rounded-full bg-[#0B5598] px-3 py-1 text-xs font-bold text-white">
                              {grupo.pendencias.length} pendência(s)
                            </span>
                          </div>

                          {filtroStatus === "Aberta" &&
                            possuiPendenciaAberta && (
                              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                                Este aluno possui pendência aberta.
                              </div>
                            )}

                          <div className="mt-4 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setAlunoPendenciasModal(grupo);
                                setModalListaPendencias(true);
                              }}
                              className="h-[40px] cursor-pointer rounded-lg bg-[#FF681D] px-5 text-sm font-extrabold text-white transition hover:bg-[#E95A0D]"
                            >
                              Ver pendências
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-gray-400">
                    {filtroStatus === "Aberta"
                      ? "Nenhuma pendência aberta."
                      : "Nenhuma pendência concluída."}
                  </div>
                )}
              </div>
            </section>

            {/* VOLTAR */}

            <div className="mt-4 shrink-0">
              <button
                type="button"
                onClick={() => router.back()}
                className="h-[46px] min-w-[125px] cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-7 text-sm font-extrabold text-[#064F91] shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#F3F8FD] hover:shadow-md active:scale-[0.98]"
              >
                Voltar
              </button>
            </div>
          </div>
        </section>
      </div>

      {modalListaPendencias && alunoPendenciasModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
          onClick={() => setModalListaPendencias(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-[700px] overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-[#064F91]">
                  Pendências de {alunoPendenciasModal.nomeAluno}
                </h3>

                <p className="mt-1 text-sm text-[#6A8198]">
                  CPF: {alunoPendenciasModal.cpfAluno}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalListaPendencias(false)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-2xl text-[#064F91] hover:bg-[#F0F4F8]"
              >
                ×
              </button>
            </div>

            <div className="my-5 border-t border-[#D6E2EE]" />

            <div className="flex flex-col gap-3">
              {alunoPendenciasModal.pendencias.map((pendencia) => (
                <div
                  key={pendencia.id}
                  className="rounded-xl border border-[#D6E2EE] bg-[#F8FBFE] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-[#064F91]">
                        {pendencia.descricao}
                      </p>

                      <p className="mt-1 text-xs text-[#6A8198]">
                        {formatarData(pendencia.data_criacao)}
                      </p>
                    </div>

                    <StatusBadge status={pendencia.status} />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/funcionario/atendimentos?atendimento=${pendencia.atendimento}`,
                        )
                      }
                      className="h-[38px] cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-4 text-sm font-extrabold text-[#064F91] transition hover:bg-[#F3F8FD]"
                    >
                      Ver atendimento
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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

function StatusBadge({ status }: { status: string }) {
  if (status === "Em andamento") {
    return (
      <span className="inline-flex rounded-full bg-[#2563EB] px-3 py-1 text-[11px] font-bold text-white">
        Em andamento
      </span>
    );
  }

  if (status === "Com pendência") {
    return (
      <span className="inline-flex rounded-full bg-[#D97706] px-3 py-1 text-[11px] font-bold text-white">
        Com pendência
      </span>
    );
  }

  if (status === "Concluído") {
    return (
      <span className="inline-flex rounded-full bg-[#16A34A] px-3 py-1 text-[11px] font-bold text-white">
        Concluído
      </span>
    );
  }

  if (status === "Concluída") {
    return (
      <span className="inline-flex rounded-full bg-[#16A34A] px-3 py-1 text-[11px] font-bold text-white">
        Concluída
      </span>
    );
  }

  if (status === "Aberta") {
    return (
      <span className="inline-flex rounded-full bg-[#DC2626] px-3 py-1 text-[11px] font-bold text-white">
        Aberta
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-[#64748B] px-3 py-1 text-[11px] font-bold text-white">
      {status}
    </span>
  );
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
