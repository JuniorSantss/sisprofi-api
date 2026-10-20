"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

type HistoricoAtendimento = {
  atendimento: Atendimento;
  agendamento?: Agendamento;
  pendencias: Pendencia[];
};

export default function DetalhesAlunoPage() {
  const router = useRouter();
  const params = useParams();

  const cpf = decodeURIComponent(String(params.cpf || ""));

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
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados do aluno.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  const aluno = useMemo(() => {
    return alunos.find((item) => item.cpf_aluno === cpf);
  }, [alunos, cpf]);

  const agendamentosAluno = useMemo(() => {
    return agendamentos.filter((item) => item.aluno === cpf);
  }, [agendamentos, cpf]);

  const historico = useMemo(() => {
    const lista: HistoricoAtendimento[] = [];

    agendamentosAluno.forEach((agendamento) => {
      const atendimentoRelacionado = atendimentos.find(
        (atendimento) => atendimento.agendamento === agendamento.id,
      );

      if (!atendimentoRelacionado) {
        return;
      }

      const pendenciasRelacionadas = pendencias.filter(
        (pendencia) => pendencia.atendimento === atendimentoRelacionado.id,
      );

      lista.push({
        atendimento: atendimentoRelacionado,
        agendamento,
        pendencias: pendenciasRelacionadas,
      });
    });

    return lista.sort((a, b) => {
      const dataA = a.atendimento.data_atendimento;
      const dataB = b.atendimento.data_atendimento;

      if (dataA !== dataB) {
        return dataB.localeCompare(dataA);
      }

      return (
        b.agendamento?.horario.localeCompare(a.agendamento?.horario || "") || 0
      );
    });
  }, [agendamentosAluno, atendimentos, pendencias]);

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
                ativo
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
                <button
                  type="button"
                  onClick={() => router.push("/funcionario/alunos")}
                  className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#064F91] transition hover:text-[#FF681D]"
                >
                  ← Voltar para alunos
                </button>

                <h2 className="text-3xl font-black leading-tight tracking-tight text-[#064F91] xl:text-4xl">
                  Detalhes do aluno
                </h2>

                <p className="mt-2 text-base text-[#064F91]">
                  Consulte os dados e o histórico de atendimentos do aluno.
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

            {carregando ? (
              <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-[#064F91]">
                Carregando dados do aluno...
              </div>
            ) : erro ? (
              <div className="mt-7 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
                {erro}
              </div>
            ) : !aluno ? (
              <div className="mt-7 rounded-xl border border-[#B9CEE2] bg-[#F8FBFE] px-5 py-8 text-center text-[#064F91]">
                Aluno não encontrado.
              </div>
            ) : (
              <>
                {/* DADOS DO ALUNO */}
                <section className="mt-7 shrink-0 rounded-xl border border-[#0B5598] bg-[#F4F8FC] p-5">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#6E8CA8]">
                        Aluno
                      </p>

                      <h3 className="mt-1 text-2xl font-black text-[#064F91]">
                        {aluno.nome}
                      </h3>
                    </div>

                    <div className="inline-flex w-fit rounded-full bg-[#DCEBFA] px-4 py-2 text-sm font-semibold text-[#064F91]">
                      {aluno.nomes_programas.length > 0
                        ? aluno.nomes_programas.join(" e ")
                        : "Sem programa"}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <InfoBox
                      titulo="CPF"
                      valor={formatarCpf(aluno.cpf_aluno)}
                    />

                    <InfoBox titulo="Curso" valor={aluno.curso} />

                    <InfoBox titulo="Contato" valor={aluno.contato} />

                    <InfoBox
                      titulo="Atendimentos"
                      valor={String(historico.length)}
                    />
                  </div>
                </section>

                {/* HISTÓRICO */}
                <section className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#0B5598] bg-white">
                  <div className="shrink-0 border-b border-[#B9CEE2] px-5 py-4">
                    <h3 className="text-lg font-extrabold text-[#064F91]">
                      Histórico de atendimentos
                    </h3>

                    <p className="mt-1 text-sm text-[#6E8CA8]">
                      Atendimentos e pendências registrados para este aluno.
                    </p>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                    {historico.length === 0 ? (
                      <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-[#B9CEE2] bg-[#F8FBFE] text-center text-sm text-[#6E8CA8]">
                        Este aluno ainda não possui atendimentos registrados.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {historico.map(
                          ({ atendimento, agendamento, pendencias }) => (
                            <article
                              key={atendimento.id}
                              className="rounded-xl border border-[#C8D9E8] bg-white p-5 transition hover:bg-[#FBFDFF]"
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="text-sm text-[#6E8CA8]">
                                    Atendimento #{atendimento.id}
                                  </p>

                                  <h4 className="mt-1 text-lg font-extrabold text-[#064F91]">
                                    {formatarData(atendimento.data_atendimento)}
                                    {agendamento &&
                                      ` às ${agendamento.horario.slice(0, 5)}`}
                                  </h4>
                                </div>

                                <StatusBadge status={atendimento.status} />
                              </div>

                              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Detalhe
                                  titulo="Motivo do agendamento"
                                  valor={agendamento?.motivo || "-"}
                                />

                                <Detalhe
                                  titulo="Descrição do atendimento"
                                  valor={atendimento.descricao || "-"}
                                />
                              </div>

                              <div className="mt-5 border-t border-[#E1EBF4] pt-4">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-sm font-extrabold text-[#064F91]">
                                    Pendências
                                  </h5>

                                  <span className="rounded-full bg-[#F0F4F8] px-3 py-1 text-xs font-semibold text-[#064F91]">
                                    {pendencias.length}
                                  </span>
                                </div>

                                {pendencias.length === 0 ? (
                                  <p className="mt-3 text-sm text-[#6E8CA8]">
                                    Nenhuma pendência registrada neste
                                    atendimento.
                                  </p>
                                ) : (
                                  <div className="mt-3 flex flex-col gap-2">
                                    {pendencias.map((pendencia) => (
                                      <div
                                        key={pendencia.id}
                                        className="flex flex-col gap-3 rounded-lg border border-[#E1EBF4] bg-[#F8FBFE] p-3 sm:flex-row sm:items-center sm:justify-between"
                                      >
                                        <div>
                                          <p className="text-sm font-medium text-[#064F91]">
                                            {pendencia.descricao}
                                          </p>

                                          <p className="mt-1 text-xs text-[#6E8CA8]">
                                            Registrada em{" "}
                                            {formatarData(
                                              pendencia.data_criacao,
                                            )}
                                          </p>
                                        </div>

                                        <StatusPendencia
                                          status={pendencia.status}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </article>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================
   COMPONENTES
========================= */

function InfoBox({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-[#B9CEE2] bg-white px-4 py-3">
      <p className="text-xs font-medium text-[#6E8CA8]">{titulo}</p>

      <p className="mt-1 break-words text-sm font-semibold text-[#064F91]">
        {valor || "-"}
      </p>
    </div>
  );
}

function Detalhe({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-[#6E8CA8]">{titulo}</p>

      <p className="mt-1 whitespace-pre-wrap text-sm text-[#064F91]">{valor}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalizado = status.trim().toLowerCase();

  if (normalizado === "concluído" || normalizado === "concluido") {
    return (
      <span className="inline-flex w-fit rounded-full bg-[#D9F0E1] px-4 py-1.5 text-xs font-semibold text-[#26804A]">
        {status}
      </span>
    );
  }

  if (normalizado === "em andamento") {
    return (
      <span className="inline-flex w-fit rounded-full bg-[#FFE5D4] px-4 py-1.5 text-xs font-semibold text-[#FF681D]">
        {status}
      </span>
    );
  }

  if (normalizado === "com pendência" || normalizado === "com pendencia") {
    return (
      <span className="inline-flex w-fit rounded-full bg-[#FFD8DB] px-4 py-1.5 text-xs font-semibold text-[#E32E3D]">
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit rounded-full bg-[#DCEBFA] px-4 py-1.5 text-xs font-semibold text-[#064F91]">
      {status}
    </span>
  );
}

function StatusPendencia({ status }: { status: string }) {
  const normalizado = status.trim().toLowerCase();

  if (normalizado === "concluída" || normalizado === "concluida") {
    return (
      <span className="inline-flex w-fit rounded-full bg-[#D9F0E1] px-3 py-1 text-xs font-semibold text-[#26804A]">
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit rounded-full bg-[#FFD8DB] px-3 py-1 text-xs font-semibold text-[#E32E3D]">
      {status}
    </span>
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

/* =========================
   FUNÇÕES AUXILIARES
========================= */

function formatarData(data: string) {
  if (!data) {
    return "-";
  }

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
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
