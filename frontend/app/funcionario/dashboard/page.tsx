"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

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

type Pendencia = {
  id: number;
  atendimento: number;
  descricao: string;
  status: string;
  data_criacao: string;
};

type AtendimentoDoDia = {
  id: number;
  horario: string;
  aluno: string;
  status: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const [
          dadosAlunos,
          dadosAgendamentos,
          dadosAtendimentos,
          dadosPendencias,
        ] = await Promise.all([
          buscarAlunos(),
          buscarAgendamentos(),
          buscarAtendimentos(),
          buscarPendencias(),
        ]);

        setAlunos(dadosAlunos);
        setAgendamentos(dadosAgendamentos);
        setAtendimentos(dadosAtendimentos);
        setPendencias(dadosPendencias);
      } catch {
        setErro("Não foi possível carregar os dados do dashboard.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  const hoje = obterDataHoje();

  const agendamentosHoje = useMemo(() => {
    return agendamentos.filter((agendamento) => agendamento.data === hoje);
  }, [agendamentos, hoje]);

  const atendimentosAtivos = useMemo(() => {
    return atendimentos.filter((atendimento) =>
      ["Em andamento", "Com pendência"].includes(atendimento.status),
    );
  }, [atendimentos]);

  const pendenciasAbertas = useMemo(() => {
    return pendencias.filter((pendencia) => {
      const status = pendencia.status.trim().toLowerCase();

      return status !== "concluída" && status !== "concluida";
    });
  }, [pendencias]);

  const atendimentosDoDia = useMemo(() => {
    const lista: AtendimentoDoDia[] = agendamentosHoje.map((agendamento) => {
      const aluno = alunos.find((item) => item.cpf_aluno === agendamento.aluno);

      const atendimento = atendimentos.find(
        (item) => item.agendamento === agendamento.id,
      );

      return {
        id: agendamento.id,
        horario: agendamento.horario,
        aluno: aluno?.nome || agendamento.aluno,

        status: atendimento ? atendimento.status : agendamento.status,
      };
    });

    return lista.sort((a, b) => a.horario.localeCompare(b.horario));
  }, [agendamentosHoje, alunos, atendimentos]);

  return (
    <main className="h-screen overflow-hidden bg-[#F8F9FF] px-4 py-6 sm:px-6">
      <div className="mx-auto flex h-full w-full max-w-[1440px] overflow-hidden rounded-2xl border border-[#0B5598] bg-white">
        {/* SIDEBAR */}
        <aside className="relative hidden w-[22%] min-w-[230px] max-w-[290px] shrink-0 overflow-hidden bg-[#0B5598] text-white lg:flex lg:flex-col">
          <div className="absolute left-0 top-0 z-20 h-full w-[14px] bg-[#FF681D]" />

          <div className="relative z-10 flex h-full flex-col px-6 pt-10 xl:px-8 xl:pt-12">
            <h1 className="ml-2 text-xl font-extrabold text-[#FF681D] xl:text-2xl">
              PROUNI E FIES
            </h1>

            <nav className="mt-8 flex flex-col gap-2">
              <MenuButton label="Dashboard" icon={<HomeIcon />} ativo />

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
                  Dashboard do funcionário
                </h2>

                <p className="mt-3 text-base text-[#064F91] xl:text-lg">
                  Acompanhe os atendimentos e pendências do dia.
                </p>
              </div>

              <button
                type="button"
                className="flex h-[54px] w-full max-w-[240px] cursor-pointer items-center gap-3 rounded-xl border border-[#0B5598] bg-[#F4F8FC] px-4 text-[#064F91] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#EAF2F9] hover:shadow-sm"
              >
                <ProfileIcon />

                <span className="flex-1 text-left text-base">Funcionário</span>

                <span className="text-xs">▼</span>
              </button>
            </header>

            {/* CARDS */}
            <section className="mt-8 grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <DashboardCard
                titulo="Agendamentos hoje"
                valor={agendamentosHoje.length}
                icon={<CalendarBlueIcon />}
              />

              <DashboardCard
                titulo="Atendimentos ativos"
                valor={atendimentosAtivos.length}
                icon={<AttendanceBlueIcon />}
              />

              <DashboardCard
                titulo="Pendências abertas"
                valor={pendenciasAbertas.length}
                icon={<AlertBlueIcon />}
              />
            </section>

            {/* ERRO */}
            {erro && (
              <div className="mt-5 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {erro}
              </div>
            )}

            {/* LISTA DO DIA */}
            <section className="mt-7 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#0B5598] bg-white">
              <div className="flex shrink-0 items-center justify-between border-b border-[#B9CEE2] px-5 py-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#064F91]">
                    Atendimentos do dia
                  </h3>

                  <p className="mt-1 text-sm text-[#6E8CA8]">
                    Agendamentos e atendimentos registrados hoje.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/funcionario/agendamentos")}
                  className="hidden cursor-pointer rounded-lg bg-[#FF681D] px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#E95A0D] hover:shadow-md sm:block"
                >
                  Ver agendamentos
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full min-w-[620px] border-collapse text-left text-[#064F91]">
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
                    </tr>
                  </thead>

                  <tbody>
                    {carregando ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-12 text-center text-sm text-[#064F91]"
                        >
                          Carregando dados...
                        </td>
                      </tr>
                    ) : atendimentosDoDia.length > 0 ? (
                      atendimentosDoDia.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[#C8D9E8] transition-colors duration-200 hover:bg-[#F8FBFE]"
                        >
                          <td className="px-5 py-3 text-[13px]">
                            {item.horario.slice(0, 5)}
                          </td>

                          <td className="px-5 py-3 text-[13px]">
                            {item.aluno}
                          </td>

                          <td className="px-5 py-3">
                            <StatusBadge status={item.status} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-12 text-center text-sm text-gray-400"
                        >
                          Nenhum agendamento registrado para hoje.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="shrink-0 p-4 sm:hidden">
                <button
                  type="button"
                  onClick={() => router.push("/funcionario/agendamentos")}
                  className="h-[46px] w-full cursor-pointer rounded-lg bg-[#FF681D] text-sm font-extrabold text-white"
                >
                  Ver agendamentos
                </button>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

/* COMPONENTES */

function DashboardCard({
  titulo,
  valor,
  icon,
}: {
  titulo: string;
  valor: number;
  icon: ReactNode;
}) {
  return (
    <div className="flex min-h-[130px] items-center gap-5 rounded-xl border border-[#0B5598] bg-[#F4F8FC] px-5 py-5">
      <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-lg border border-[#75A5D0]">
        {icon}
      </div>

      <div>
        <p className="text-3xl font-black leading-none text-[#064F91]">
          {valor}
        </p>

        <p className="mt-3 text-sm text-[#064F91] xl:text-base">{titulo}</p>
      </div>
    </div>
  );
}

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

  if (statusNormalizado === "concluído" || statusNormalizado === "concluido") {
    return (
      <span className="inline-flex rounded-full bg-[#D9F0E1] px-4 py-1 text-[12px] font-medium text-[#26804A]">
        {status}
      </span>
    );
  }

  if (statusNormalizado === "em andamento") {
    return (
      <span className="inline-flex rounded-full bg-[#FFE4D3] px-4 py-1 text-[12px] font-medium text-[#FF681D]">
        {status}
      </span>
    );
  }

  if (
    statusNormalizado === "com pendência" ||
    statusNormalizado === "com pendencia"
  ) {
    return (
      <span className="inline-flex rounded-full bg-[#FFD8DB] px-4 py-1 text-[12px] font-medium text-[#D93545]">
        {status}
      </span>
    );
  }

  if (statusNormalizado === "agendado") {
    return (
      <span className="inline-flex rounded-full bg-[#DCEBFA] px-4 py-1 text-[12px] font-medium text-[#064F91]">
        {status}
      </span>
    );
  }

  if (statusNormalizado === "confirmado") {
    return (
      <span className="inline-flex rounded-full bg-[#E5ECFF] px-4 py-1 text-[12px] font-medium text-[#365DA8]">
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-gray-100 px-4 py-1 text-[12px] font-medium text-gray-600">
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

function AttendanceBlueIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#064F91"
      strokeWidth="1.6"
    >
      <rect x="4" y="3" width="14" height="17" rx="1" />
      <path d="M7 7h8M7 11h8M7 15h5" />
      <path d="M18 7h2v14H7v-1" />
    </svg>
  );
}

function AlertBlueIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#064F91"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 17h.01" />
    </svg>
  );
}
