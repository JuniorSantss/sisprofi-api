"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import {
  buscarAgendamentos,
  buscarAlunos,
  buscarAtendimentos,
} from "@/services/api";

type AgendamentoAPI = {
  id: number;
  aluno: string;
  data: string;
  horario: string;
  motivo: string;
  status: string;
};

type Aluno = {
  cpf_aluno: string;
  nome: string;
  contato: string;
  curso: string;
  programas: number[];
  nomes_programas: string[];
};

type Atendimento = {
  id: number;
  agendamento: number;
  funcionario: string;
  data_atendimento: string;
  descricao: string;
  status: string;
};

type AgendamentoTela = AgendamentoAPI & {
  nomeAluno: string;
};

export default function AgendamentosPage() {
  const router = useRouter();

  const [agendamentos, setAgendamentos] = useState<AgendamentoTela[]>([]);

  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const [dadosAgendamentos, dadosAlunos, dadosAtendimentos] =
          await Promise.all([
            buscarAgendamentos(),
            buscarAlunos(),
            buscarAtendimentos(),
          ]);

        const dadosComNome: AgendamentoTela[] = dadosAgendamentos.map(
          (agendamento: AgendamentoAPI) => {
            const aluno = dadosAlunos.find(
              (item: Aluno) => item.cpf_aluno === agendamento.aluno,
            );

            return {
              ...agendamento,
              nomeAluno: aluno?.nome || agendamento.aluno,
            };
          },
        );

        setAgendamentos(dadosComNome);
        setAtendimentos(dadosAtendimentos);
      } catch {
        setErro("Não foi possível carregar os agendamentos.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  const hoje = obterDataHoje();

  const agendamentosHoje = useMemo(() => {
    return agendamentos
      .filter((agendamento) => agendamento.data === hoje)
      .sort((a, b) => a.horario.localeCompare(b.horario));
  }, [agendamentos, hoje]);

  function atenderAgendamento(id: number) {
    router.push(`/funcionario/atendimentos?agendamento=${id}`);
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

              <MenuButton label="Agendamentos" icon={<CalendarIcon />} ativo />

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
                  Agendamentos
                </h2>

                <p className="mt-3 text-base text-[#064F91] xl:text-lg">
                  Lista de agendamentos do dia.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/funcionario/perfil")
                }
                className="flex h-[54px] w-full max-w-[240px] cursor-pointer items-center gap-3 rounded-xl border border-[#0B5598] bg-[#F4F8FC] px-4 text-[#064F91] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#EAF2F9] hover:shadow-sm"
              >
                <ProfileIcon />

                <span className="flex-1 text-left text-base">Funcionário</span>

                <span className="text-xs">▼</span>
              </button>
            </header>

            {/* CARD TOTAL */}
            <section className="mt-8 shrink-0">
              <div className="relative min-h-[150px] w-full max-w-[265px] rounded-xl border border-[#0B5598] bg-[#F4F8FC] px-5 py-5">
                <div className="absolute left-4 top-4 flex h-[38px] w-[38px] items-center justify-center rounded-md border border-[#75A5D0]">
                  <CalendarBlueIcon />
                </div>

                <div className="text-center">
                  <p className="text-4xl font-black leading-none tabular-nums text-[#064F91]">
                    {carregando ? "0" : agendamentosHoje.length}
                  </p>

                  <p className="mt-4 text-sm text-[#064F91] xl:text-base">
                    Agendamentos
                  </p>

                  <p className="mt-1 text-sm text-[#064F91] xl:text-base">
                    de hoje
                  </p>
                </div>
              </div>
            </section>

            {/* TABELA */}
            <section className="mt-7 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#0B5598] bg-white">
              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-[#064F91]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-[#B9CEE2] bg-[#F0F4F8]">
                      <th className="px-5 py-3 text-[13px] font-medium">
                        Horário
                      </th>

                      <th className="px-5 py-3 text-[13px] font-medium">
                        Aluno
                      </th>

                      <th className="px-5 py-3 text-[13px] font-medium">
                        Status
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
                          colSpan={4}
                          className="px-5 py-12 text-center text-sm text-[#064F91]"
                        >
                          Carregando agendamentos...
                        </td>
                      </tr>
                    ) : erro ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-12 text-center text-sm text-red-500"
                        >
                          {erro}
                        </td>
                      </tr>
                    ) : agendamentosHoje.length > 0 ? (
                      agendamentosHoje.map((agendamento) => {
                        const atendimentoRelacionado = atendimentos.find(
                          (atendimento) =>
                            atendimento.agendamento === agendamento.id,
                        );

                        const jaPossuiAtendimento = Boolean(
                          atendimentoRelacionado,
                        );

                        const statusExibido =
                          atendimentoRelacionado?.status || agendamento.status;

                        return (
                          <tr
                            key={agendamento.id}
                            className="border-b border-[#C8D9E8] transition-colors duration-200 hover:bg-[#F8FBFE]"
                          >
                            <td className="px-5 py-3 text-[13px]">
                              {agendamento.horario.slice(0, 5)}
                            </td>

                            <td className="px-5 py-3 text-[13px]">
                              {agendamento.nomeAluno}
                            </td>

                            <td className="px-5 py-3">
                              <StatusBadge status={statusExibido} />
                            </td>

                            <td className="px-5 py-2 text-center">
                              {jaPossuiAtendimento ? (
                                <span className="inline-flex rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-500">
                                  Atendido
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    atenderAgendamento(agendamento.id)
                                  }
                                  className="cursor-pointer rounded-lg bg-[#FF681D] px-4 py-2 text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#E95A0D] hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                                >
                                  Atender
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-12 text-center text-sm text-gray-400"
                        >
                          Nenhum agendamento encontrado para hoje.
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

/* COMPONENTES */

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
  const statusNormalizado = status.trim().toLowerCase();

  if (statusNormalizado === "em andamento") {
    return (
      <span className="inline-flex rounded-full bg-[#FFE5D4] px-3 py-1 text-[12px] text-[#FF681D]">
        {status}
      </span>
    );
  }

  if (
    statusNormalizado === "com pendência" ||
    statusNormalizado === "com pendencia"
  ) {
    return (
      <span className="inline-flex rounded-full bg-[#FFD8DB] px-3 py-1 text-[12px] text-[#E32E3D]">
        {status}
      </span>
    );
  }

  if (statusNormalizado === "concluído" || statusNormalizado === "concluido") {
    return (
      <span className="inline-flex rounded-full bg-[#D9F0E1] px-4 py-1 text-[12px] text-[#26804A]">
        {status}
      </span>
    );
  }

  if (statusNormalizado === "agendado" || statusNormalizado === "confirmado") {
    return (
      <span className="inline-flex rounded-full bg-[#DCEBFA] px-4 py-1 text-[12px] text-[#064F91]">
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-gray-100 px-4 py-1 text-[12px] text-gray-600">
      {status}
    </span>
  );
}

function obterDataHoje() {
  const agora = new Date();

  const ano = agora.getFullYear();

  const mes = String(agora.getMonth() + 1).padStart(2, "0");

  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

/* ÍCONES */

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

function CalendarBlueIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#064F91"
      strokeWidth="1.5"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />

      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}
