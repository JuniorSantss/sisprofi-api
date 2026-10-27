"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import FuncionarioPerfilButton from "@/components/FuncionarioPerfilButton";

import {
  buscarAgendamentos,
  buscarAtendimentos,
  buscarPendencias,
} from "@/services/api";

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

type LinhaRelatorio = {
  indicador: string;
  quantidade: number;
  observacao: string;
};

type Periodo =
  | "este_mes"
  | "mes_passado"
  | "ultimos_3_meses"
  | "este_ano"
  | "todos";

type Tipo = "geral" | "agendamento" | "atendimento" | "pendencia";

export default function RelatoriosPage() {
  const router = useRouter();

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);

  const [pendencias, setPendencias] = useState<Pendencia[]>([]);

  const [periodoSelecionado, setPeriodoSelecionado] =
    useState<Periodo>("este_mes");

  const [tipoSelecionado, setTipoSelecionado] = useState<Tipo>("geral");

  const [periodoAplicado, setPeriodoAplicado] = useState<Periodo>("este_mes");

  const [tipoAplicado, setTipoAplicado] = useState<Tipo>("geral");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const [dadosAgendamentos, dadosAtendimentos, dadosPendencias] =
          await Promise.all([
            buscarAgendamentos(),
            buscarAtendimentos(),
            buscarPendencias(),
          ]);

        setAgendamentos(dadosAgendamentos);
        setAtendimentos(dadosAtendimentos);
        setPendencias(dadosPendencias);
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados do relatório.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  const intervalo = useMemo(() => {
    return obterIntervalo(periodoAplicado);
  }, [periodoAplicado]);

  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter((item) =>
      dataNoIntervalo(item.data, intervalo.inicio, intervalo.fim),
    );
  }, [agendamentos, intervalo]);

  const atendimentosFiltrados = useMemo(() => {
    return atendimentos.filter((item) =>
      dataNoIntervalo(item.data_atendimento, intervalo.inicio, intervalo.fim),
    );
  }, [atendimentos, intervalo]);

  const pendenciasFiltradas = useMemo(() => {
    return pendencias.filter((item) =>
      dataNoIntervalo(item.data_criacao, intervalo.inicio, intervalo.fim),
    );
  }, [pendencias, intervalo]);

  const atendimentosConcluidos = useMemo(() => {
    return atendimentosFiltrados.filter(
      (item) => normalizar(item.status) === "concluido",
    );
  }, [atendimentosFiltrados]);

  const pendenciasAbertas = useMemo(() => {
    return pendenciasFiltradas.filter(
      (item) => normalizar(item.status) !== "concluida",
    );
  }, [pendenciasFiltradas]);

  const pendenciasConcluidas = useMemo(() => {
    return pendenciasFiltradas.filter(
      (item) => normalizar(item.status) === "concluida",
    );
  }, [pendenciasFiltradas]);

  const linhasRelatorio = useMemo(() => {
    const todas: LinhaRelatorio[] = [
      {
        indicador: "Agendamentos realizados",
        quantidade: agendamentosFiltrados.length,
        observacao: "Total no período selecionado",
      },
      {
        indicador: "Atendimentos realizados",
        quantidade: atendimentosFiltrados.length,
        observacao: "Total no período selecionado",
      },
      {
        indicador: "Atendimentos concluídos",
        quantidade: atendimentosConcluidos.length,
        observacao: "Finalizados no período",
      },
      {
        indicador: "Pendências abertas",
        quantidade: pendenciasAbertas.length,
        observacao: "Ainda em andamento",
      },
      {
        indicador: "Pendências concluídas",
        quantidade: pendenciasConcluidas.length,
        observacao: "Finalizadas no período",
      },
    ];

    if (tipoAplicado === "agendamento") {
      return todas.filter((linha) =>
        linha.indicador.toLowerCase().includes("agendamento"),
      );
    }

    if (tipoAplicado === "atendimento") {
      return todas.filter((linha) =>
        linha.indicador.toLowerCase().includes("atendimento"),
      );
    }

    if (tipoAplicado === "pendencia") {
      return todas.filter((linha) =>
        linha.indicador.toLowerCase().includes("pendência"),
      );
    }

    return todas;
  }, [
    agendamentosFiltrados,
    atendimentosFiltrados,
    atendimentosConcluidos,
    pendenciasAbertas,
    pendenciasConcluidas,
    tipoAplicado,
  ]);

  function gerarRelatorio() {
    setPeriodoAplicado(periodoSelecionado);
    setTipoAplicado(tipoSelecionado);
  }

  function exportarPdf() {
    window.print();
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-white print:h-auto print:w-auto print:overflow-visible">
      <div className="flex h-full w-full overflow-hidden bg-white print:block print:h-auto print:overflow-visible">
        {/* SIDEBAR */}
        <aside className="relative hidden w-[25%] min-w-[245px] max-w-[320px] shrink-0 overflow-hidden bg-[#0B5598] text-white lg:flex lg:flex-col print:hidden">
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

              <MenuButton label="Relatórios" icon={<ChartIcon />} ativo />
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
        <section className="min-w-0 flex-1 overflow-hidden bg-white print:overflow-visible">
          <div className="flex h-full flex-col px-6 py-8 md:px-10 xl:px-12 xl:py-10 print:h-auto print:p-6">
            {/* CABEÇALHO */}
            <header className="flex shrink-0 flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h2 className="text-3xl font-black leading-tight tracking-tight text-[#064F91] xl:text-4xl">
                  Relatórios
                </h2>

                <p className="mt-2 text-base text-[#064F91] xl:text-lg">
                  Visualize resumos e gere relatórios básicos do sistema.
                </p>
              </div>

              <FuncionarioPerfilButton />
            </header>

            {/* FILTROS */}
            <section className="mt-3 shrink-0 rounded-xl border border-[#0B5598] bg-white px-5 py-4 print:hidden">
              <div className="grid grid-cols-1 items-end gap-5 md:grid-cols-[1fr_1fr_auto]">
                <div>
                  <label className="mb-2 block text-sm text-[#064F91]">
                    Período
                  </label>

                  <select
                    value={periodoSelecionado}
                    onChange={(event) =>
                      setPeriodoSelecionado(event.target.value as Periodo)
                    }
                    className="h-[48px] w-full rounded-lg border border-[#2E71B8] bg-white px-4 text-sm text-[#064F91] outline-none"
                  >
                    <option value="este_mes">Este mês</option>

                    <option value="mes_passado">Mês passado</option>

                    <option value="ultimos_3_meses">Últimos 3 meses</option>

                    <option value="este_ano">Este ano</option>

                    <option value="todos">Todo o período</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[#064F91]">
                    Tipo
                  </label>

                  <select
                    value={tipoSelecionado}
                    onChange={(event) =>
                      setTipoSelecionado(event.target.value as Tipo)
                    }
                    className="h-[48px] w-full rounded-lg border border-[#2E71B8] bg-white px-4 text-sm text-[#064F91] outline-none"
                  >
                    <option value="geral">Geral</option>

                    <option value="agendamento">Agendamentos</option>

                    <option value="atendimento">Atendimentos</option>

                    <option value="pendencia">Pendências</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={gerarRelatorio}
                  className="flex h-[48px] cursor-pointer items-center justify-center gap-3 rounded-lg bg-[#FF681D] px-6 text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#E95A0D] hover:shadow-md active:scale-[0.98]"
                >
                  <ReportIcon />
                  Gerar relatório
                </button>
              </div>
            </section>

            {/* ERRO */}
            {erro && (
              <div className="mt-4 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {erro}
              </div>
            )}

            {/* CARDS */}
            <section className="mt-3 grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ResumoCard
                titulo="Agendamentos"
                valor={carregando ? 0 : agendamentosFiltrados.length}
                icon={<CalendarBlueIcon />}
              />

              <ResumoCard
                titulo="Atendimentos"
                valor={carregando ? 0 : atendimentosFiltrados.length}
                icon={<AttendanceGreenIcon />}
              />

              <ResumoCard
                titulo="Pendências"
                valor={carregando ? 0 : pendenciasAbertas.length}
                icon={<AlertOrangeIcon />}
              />
            </section>

            {/* TABELA */}
            <section className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#0B5598] bg-white print:mt-6 print:overflow-visible">
              <div className="min-h-0 flex-1 overflow-auto p-4 print:overflow-visible">
                <table className="w-full min-w-[720px] border-collapse text-left text-[#064F91] print:min-w-0">
                  <thead>
                    <tr className="border border-[#B9CEE2] bg-[#F0F4F8]">
                      <th className="px-4 py-3 text-[13px] font-medium">
                        Indicador
                      </th>

                      <th className="px-4 py-3 text-center text-[13px] font-medium">
                        Quantidade
                      </th>

                      <th className="px-4 py-3 text-right text-[13px] font-medium">
                        Observações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {carregando ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-12 text-center text-sm"
                        >
                          Carregando relatório...
                        </td>
                      </tr>
                    ) : linhasRelatorio.length > 0 ? (
                      linhasRelatorio.map((linha) => (
                        <tr
                          key={linha.indicador}
                          className="border-b border-[#C8D9E8]"
                        >
                          <td className="px-4 py-3 text-[13px]">
                            {linha.indicador}
                          </td>

                          <td className="px-4 py-3 text-center text-[13px] font-semibold">
                            {linha.quantidade}
                          </td>

                          <td className="px-4 py-3 text-right text-[13px]">
                            {linha.observacao}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-12 text-center text-sm text-gray-400"
                        >
                          Nenhum dado encontrado no período selecionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* RODAPÉ */}
            <div className="mt-3 flex shrink-0 items-center justify-between gap-4 print:hidden">
              <button
                type="button"
                onClick={() => router.back()}
                className="h-[46px] min-w-[145px] cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-7 text-sm font-extrabold text-[#064F91] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#F3F8FD] active:scale-[0.98]"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={exportarPdf}
                className="flex h-[46px] cursor-pointer items-center justify-center gap-3 rounded-lg bg-[#FF681D] px-7 text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#E95A0D] hover:shadow-md active:scale-[0.98]"
              >
                <ReportIcon />
                Exportar PDF
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================
   COMPONENTES
========================= */

function ResumoCard({
  titulo,
  valor,
  icon,
}: {
  titulo: string;
  valor: number;
  icon: ReactNode;
}) {
  return (
    <div className="flex min-h-[110px] items-center gap-5 rounded-xl border border-[#0B5598] bg-[#F8FBFE] px-5">
      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center">
        {icon}
      </div>

      <div>
        <p className="text-sm text-[#064F91]">{titulo}</p>

        <p className="mt-1 text-4xl font-black text-[#064F91]">{valor}</p>
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

/* =========================
   FILTROS DE DATA
========================= */

function obterIntervalo(periodo: Periodo) {
  const hoje = new Date();

  const inicioHoje = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate(),
  );

  if (periodo === "todos") {
    return {
      inicio: null,
      fim: null,
    };
  }

  if (periodo === "este_mes") {
    return {
      inicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1),

      fim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0),
    };
  }

  if (periodo === "mes_passado") {
    return {
      inicio: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1),

      fim: new Date(hoje.getFullYear(), hoje.getMonth(), 0),
    };
  }

  if (periodo === "ultimos_3_meses") {
    return {
      inicio: new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1),

      fim: inicioHoje,
    };
  }

  return {
    inicio: new Date(hoje.getFullYear(), 0, 1),

    fim: new Date(hoje.getFullYear(), 11, 31),
  };
}

function dataNoIntervalo(data: string, inicio: Date | null, fim: Date | null) {
  if (!inicio || !fim) {
    return true;
  }

  const [ano, mes, dia] = data.split("-").map(Number);

  const dataRegistro = new Date(ano, mes - 1, dia);

  return dataRegistro >= inicio && dataRegistro <= fim;
}

function normalizar(texto: string) {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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

function CalendarBlueIcon() {
  return (
    <svg
      width="42"
      height="42"
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

function AttendanceGreenIcon() {
  return (
    <svg
      width="42"
      height="42"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3AA765"
      strokeWidth="1.6"
    >
      <circle cx="9" cy="8" r="3" />

      <circle cx="16" cy="7" r="2.5" />

      <path d="M3 19c0-4 2.5-6 6-6s6 2 6 6" />

      <path d="M14 13c3 0 5 2 5 5" />
    </svg>
  );
}

function AlertOrangeIcon() {
  return (
    <svg
      width="42"
      height="42"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FF681D"
      strokeWidth="1.7"
    >
      <circle cx="12" cy="12" r="9" />

      <path d="M12 7v6M12 17h.01" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <rect x="4" y="3" width="14" height="17" rx="1" />

      <path d="M7 7h8M7 11h8M7 15h5" />
      <path d="M18 7h2v14H7v-1" />
    </svg>
  );
}
