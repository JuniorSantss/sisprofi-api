"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  buscarAlunos,
  buscarAgendamentos,
  buscarAtendimentoPorId,
  buscarFuncionarioLogado,
  buscarPendencias,
  atualizarPendencia,
  criarPendencia,
  atualizarAtendimento,
} from "@/services/api";

type Atendimento = {
  id: number;
  agendamento: number;
  funcionario: string;
  data_atendimento: string;
  descricao: string;
  status: string;
};

type Aluno = {
  cpf_aluno: string;
  nome: string;
  curso: string;
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

type Pendencia = {
  id: number;
  atendimento: number;
  descricao: string;
  status: string;
};

type Funcionario = {
  cpf_func: string;
  nome: string;
};

function formatarData(data: string) {
  if (!data) return "-";

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function StatusBadge({ status }: { status: string }) {
  let estilo = "bg-gray-100 text-gray-700";

  if (status === "Em andamento") {
    estilo = "bg-blue-100 text-blue-700";
  }

  if (status === "Com pendência" || status === "Aberta") {
    estilo = "bg-blue-100 text-blue-700";
  }

  if (status === "Concluído" || status === "Concluída") {
    estilo = "bg-green-100 text-green-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${estilo}`}
    >
      {status}
    </span>
  );
}

function Detalhe({
  label,
  valor,
}: {
  label: string;
  valor: string | number | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-[#064F91]">{label}</p>

      <p className="mt-1 text-sm font-bold text-[#064F91]">{valor || "-"}</p>
    </div>
  );
}

export default function AtendimentoDetalhesPage() {
  const params = useParams();
  const router = useRouter();

  const atendimentoId = Number(params.id);

  const [atendimento, setAtendimento] = useState<Atendimento | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modalPendencia, setModalPendencia] = useState(false);
  const [descricaoPendencia, setDescricaoPendencia] = useState("");
  const [modalConclusao, setModalConclusao] = useState(false);
  const [modalReabrir, setModalReabrir] = useState(false);
  const [erroConclusao, setErroConclusao] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const [
          atendimentoDados,
          alunosDados,
          agendamentosDados,
          pendenciasDados,
          funcionarioDados,
        ] = await Promise.all([
          buscarAtendimentoPorId(atendimentoId),
          buscarAlunos(),
          buscarAgendamentos(),
          buscarPendencias(),
          buscarFuncionarioLogado(),
        ]);

        setAtendimento(atendimentoDados);
        setAlunos(alunosDados);
        setAgendamentos(agendamentosDados);
        setPendencias(pendenciasDados);
        setFuncionario(funcionarioDados);
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o atendimento.",
        );
      } finally {
        setCarregando(false);
      }
    }

    if (atendimentoId) {
      carregarDados();
    }
  }, [atendimentoId]);

  const agendamento = useMemo(() => {
    if (!atendimento) return undefined;

    return agendamentos.find((item) => item.id === atendimento.agendamento);
  }, [agendamentos, atendimento]);

  const aluno = useMemo(() => {
    if (!agendamento) return undefined;

    return alunos.find((item) => item.cpf_aluno === agendamento.aluno);
  }, [alunos, agendamento]);

  const pendenciasAtendimento = useMemo(() => {
    if (!atendimento) return [];

    return pendencias
      .filter((item) => item.atendimento === atendimento.id)
      .sort((a, b) => b.id - a.id);
  }, [pendencias, atendimento]);

  async function alternarPendencia(pendencia: Pendencia) {
    try {
      setErro("");

      const estaAberta = pendencia.status.trim().toLowerCase() === "aberta";

      const novoStatus = estaAberta ? "Concluída" : "Aberta";

      await atualizarPendencia(pendencia.id, {
        status: novoStatus,
      });

      const pendenciasAtualizadas = await buscarPendencias();

      setPendencias(pendenciasAtualizadas);

      const atendimentoAtualizado = await buscarAtendimentoPorId(atendimentoId);

      setAtendimento(atendimentoAtualizado);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a pendência.",
      );
    }
  }

  async function adicionarPendencia() {
    if (!descricaoPendencia.trim()) {
      setErro("Informe a descrição da pendência.");
      return;
    }

    try {
      setErro("");

      await criarPendencia({
        atendimento: atendimentoId,
        descricao: descricaoPendencia.trim(),
        status: "Aberta",
        data_criacao: new Date().toISOString().split("T")[0],
      });

      const pendenciasAtualizadas = await buscarPendencias();
      setPendencias(pendenciasAtualizadas);

      const atendimentoAtualizado = await buscarAtendimentoPorId(atendimentoId);

      setAtendimento(atendimentoAtualizado);

      setDescricaoPendencia("");
      setModalPendencia(false);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar a pendência.",
      );
    }
  }

  async function concluirAtendimento() {
    try {
      setErroConclusao("");

      await atualizarAtendimento(atendimentoId, {
        status: "Concluído",
      });

      const atendimentoAtualizado = await buscarAtendimentoPorId(atendimentoId);

      setAtendimento(atendimentoAtualizado);
      setModalConclusao(false);
    } catch (error) {
      setErroConclusao(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir o atendimento.",
      );
    }
  }

  async function reabrirAtendimento() {
    try {
      setErro("");

      await atualizarAtendimento(atendimentoId, {
        status: "Em andamento",
      });

      const atendimentoAtualizado = await buscarAtendimentoPorId(atendimentoId);

      setAtendimento(atendimentoAtualizado);
      setModalReabrir(false);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível reabrir o atendimento.",
      );
    }
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#F4F7FA] px-5 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-[#064F91]">
            Carregando atendimento...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F7FA] px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* VOLTAR */}
        <button
          type="button"
          onClick={() => router.push("/funcionario/atendimentos")}
          className="mb-6 inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-[#064F91] bg-white px-5 py-3 text-sm font-extrabold text-[#064F91] shadow-sm transition-all duration-200 hover:bg-[#F3F8FD] hover:shadow-md"
        >
          <span className="text-lg">←</span>
          Voltar para atendimentos
        </button>

        {/* CABEÇALHO */}
        <div className="mb-6 rounded-2xl bg-[#064F91] px-7 py-6 text-white shadow-md">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-white/80">
                Atendimento #{atendimento?.id}
              </p>

              <h1 className="mt-1 text-2xl font-black sm:text-3xl">
                Detalhes do atendimento
              </h1>

              <p className="mt-2 text-sm text-white/80">
                Consulte os dados do aluno e acompanhe o andamento do
                atendimento.
              </p>
            </div>

            {atendimento && (
              <div className="shrink-0">
                <StatusBadge status={atendimento.status} />
              </div>
            )}
          </div>
        </div>

        {/* ERRO */}
        {erro && (
          <div className="mb-5 rounded-xl border border-red-300 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {erro}
          </div>
        )}

        {/* CONTEÚDO */}
        {atendimento && agendamento && aluno && (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* COLUNA PRINCIPAL */}
            <div className="space-y-6">
              {/* DADOS DO ALUNO */}
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-xl font-black text-[#064F91]">
                    Dados do aluno
                  </h2>

                  <p className="mt-1 text-sm text-[#6A8198]">
                    Informações relacionadas ao estudante atendido.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 border-t border-[#D6E2EE] pt-5 sm:grid-cols-2">
                  <Detalhe label="Aluno" valor={aluno.nome} />

                  <Detalhe label="CPF" valor={aluno.cpf_aluno} />

                  <Detalhe label="Curso" valor={aluno.curso} />

                  <Detalhe
                    label="Programa"
                    valor={aluno.nomes_programas?.join(", ")}
                  />
                </div>
              </section>

              {/* DADOS DO ATENDIMENTO */}
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-xl font-black text-[#064F91]">
                    Informações do atendimento
                  </h2>

                  <p className="mt-1 text-sm text-[#6A8198]">
                    Dados do agendamento e do atendimento atual.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 border-t border-[#D6E2EE] pt-5 sm:grid-cols-2">
                  <Detalhe
                    label="Responsável"
                    valor={funcionario?.nome || "Não identificado"}
                  />

                  <Detalhe
                    label="Agendamento"
                    valor={`${formatarData(
                      agendamento.data,
                    )} às ${agendamento.horario.slice(0, 5)}`}
                  />

                  <Detalhe label="Motivo" valor={agendamento.motivo} />

                  <Detalhe label="Descrição" valor={atendimento.descricao} />
                </div>
              </section>

              {/* PENDÊNCIAS */}
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-xl font-black text-[#064F91]">
                      Pendências
                    </h2>

                    <p className="mt-1 text-sm text-[#6A8198]">
                      Acompanhe as pendências registradas neste atendimento.
                    </p>
                  </div>

                  {atendimento.status !== "Concluído" && (
                    <button
                      type="button"
                      onClick={() => {
                        setErro("");
                        setDescricaoPendencia("");
                        setModalPendencia(true);
                      }}
                      className="h-[42px] cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-5 text-sm font-extrabold text-[#064F91] transition hover:bg-[#F3F8FD]"
                    >
                      + Adicionar pendência
                    </button>
                  )}
                </div>

                <div className="mt-5 border-t border-[#D6E2EE] pt-5">
                  {pendenciasAtendimento.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#BFD1E1] bg-[#F8FBFE] px-5 py-6 text-center">
                      <p className="text-sm font-semibold text-[#6A8198]">
                        Nenhuma pendência registrada.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendenciasAtendimento.map((pendencia) => {
                        const pendenciaConcluida =
                          pendencia.status.trim().toLowerCase() === "concluída";

                        return (
                          <div
                            key={pendencia.id}
                            className="flex flex-col justify-between gap-4 rounded-xl border border-[#D6E2EE] bg-[#F8FBFE] px-5 py-4 sm:flex-row sm:items-center"
                          >
                            <div>
                              <p className="text-sm font-extrabold text-[#064F91]">
                                {pendencia.descricao}
                              </p>

                              <div className="mt-2">
                                <StatusBadge status={pendencia.status} />
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs font-semibold text-[#6A8198]">
                                {pendenciaConcluida ? "Concluída" : "Aberta"}
                              </span>

                              <button
                                type="button"
                                onClick={() => alternarPendencia(pendencia)}
                                className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
                                  pendenciaConcluida
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }`}
                                title={
                                  pendenciaConcluida
                                    ? "Reabrir pendência"
                                    : "Concluir pendência"
                                }
                              >
                                <span
                                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
                                    pendenciaConcluida
                                      ? "left-[22px]"
                                      : "left-0.5"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* AÇÕES */}
            <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-6">
              <h2 className="text-lg font-black text-[#064F91]">
                Ações do atendimento
              </h2>

              <p className="mt-1 text-sm text-[#6A8198]">
                Gerencie o andamento deste atendimento.
              </p>

              <div className="my-5 border-t border-[#D6E2EE]" />

              <div className="space-y-3">
                {atendimento.status !== "Concluído" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setErro("");
                        setDescricaoPendencia("");
                        setModalPendencia(true);
                      }}
                      className="h-[46px] w-full cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-5 text-sm font-extrabold text-[#064F91] transition hover:bg-[#F3F8FD]"
                    >
                      Adicionar pendência
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setErroConclusao("");
                        setModalConclusao(true);
                      }}
                      className="h-[46px] w-full cursor-pointer rounded-lg bg-[#FF681D] px-5 text-sm font-extrabold text-white transition hover:bg-[#E95A0D]"
                    >
                      Concluir atendimento
                    </button>
                  </>
                )}

                {atendimento.status === "Concluído" && (
                  <button
                    type="button"
                    onClick={() => {
                      setErro("");
                      setModalReabrir(true);
                    }}
                    className="h-[46px] w-full cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-5 text-sm font-extrabold text-[#064F91] transition hover:bg-[#F3F8FD]"
                  >
                    Reabrir atendimento
                  </button>
                )}
              </div>
            </aside>
          </div>
        )}

        {/* MODAL ADICIONAR PENDÊNCIA */}
        {modalPendencia && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
            onClick={() => setModalPendencia(false)}
          >
            <div
              className="w-full max-w-[520px] rounded-2xl bg-white p-7 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-[#064F91]">
                    Adicionar pendência
                  </h3>

                  <p className="mt-1 text-sm text-[#064F91]">
                    Informe a pendência encontrada durante o atendimento.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalPendencia(false)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-2xl text-[#064F91] hover:bg-[#F0F4F8]"
                >
                  ×
                </button>
              </div>

              <div className="my-5 border-t border-[#D6E2EE]" />

              <label className="text-sm font-bold text-[#064F91]">
                Descrição
              </label>

              <textarea
                value={descricaoPendencia}
                onChange={(event) => setDescricaoPendencia(event.target.value)}
                placeholder="Descreva a pendência"
                className="mt-2 min-h-[120px] w-full resize-none rounded-lg border border-[#2E71B8] p-3 text-sm text-[#064F91] outline-none"
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDescricaoPendencia("");
                    setModalPendencia(false);
                  }}
                  className="h-[44px] cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-6 text-sm font-extrabold text-[#064F91] transition hover:bg-[#F3F8FD]"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={adicionarPendencia}
                  className="h-[44px] cursor-pointer rounded-lg bg-[#FF681D] px-6 text-sm font-extrabold text-white transition hover:bg-[#E95A0D]"
                >
                  Salvar pendência
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CONCLUIR */}
        {modalConclusao && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
            onClick={() => setModalConclusao(false)}
          >
            <div
              className="w-full max-w-[500px] rounded-2xl bg-white p-7 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="text-2xl font-black text-[#064F91]">
                Concluir atendimento
              </h3>

              <p className="mt-3 text-sm text-[#064F91]">
                Tem certeza que deseja concluir este atendimento?
              </p>

              {erroConclusao && (
                <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {erroConclusao}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalConclusao(false)}
                  className="h-[44px] cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-6 text-sm font-extrabold text-[#064F91]"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={concluirAtendimento}
                  className="h-[44px] cursor-pointer rounded-lg bg-[#FF681D] px-6 text-sm font-extrabold text-white hover:bg-[#E95A0D]"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL REABRIR */}
        {modalReabrir && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
            onClick={() => setModalReabrir(false)}
          >
            <div
              className="w-full max-w-[500px] rounded-2xl bg-white p-7 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="text-2xl font-black text-[#064F91]">
                Reabrir atendimento
              </h3>

              <p className="mt-3 text-sm text-[#064F91]">
                Deseja reabrir este atendimento?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalReabrir(false)}
                  className="h-[44px] cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-6 text-sm font-extrabold text-[#064F91]"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={reabrirAtendimento}
                  className="h-[44px] cursor-pointer rounded-lg bg-[#FF681D] px-6 text-sm font-extrabold text-white hover:bg-[#E95A0D]"
                >
                  Reabrir atendimento
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
