"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import FuncionarioPerfilButton from "@/components/FuncionarioPerfilButton";

import {
  atualizarAtendimento,
  buscarAgendamentos,
  buscarAlunos,
  buscarAtendimentos,
  buscarPendencias,
  criarAtendimento,
  criarPendencia,
  buscarFuncionarioLogado,
  atualizarPendencia,
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

type Funcionario = {
  cpf_func: string;
  nome: string;
  email: string;
};

type Pendencia = {
  id: number;
  atendimento: number;
  descricao: string;
  status: string;
  data_criacao: string;
};

export default function AtendimentosPage() {
  console.log("PÁGINA DE ATENDIMENTOS CARREGOU");
  const router = useRouter();
  const searchParams = useSearchParams();
  const atendimentoIdUrl = searchParams.get("atendimento");

  const idAgendamentoUrl = searchParams.get("agendamento");

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [funcionarioLogado, setFuncionarioLogado] =
    useState<Funcionario | null>(null);
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);

  const [filtroStatus, setFiltroStatus] = useState("Em andamento");

  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalPendencia, setModalPendencia] = useState(false);
  const [modalStatus, setModalStatus] = useState(false);
  const [modalConfirmarConclusao, setModalConfirmarConclusao] = useState(false);
  const [atendimentoParaConcluir, setAtendimentoParaConcluir] =
    useState<Atendimento | null>(null);

  const [nomeAlunoParaConcluir, setNomeAlunoParaConcluir] = useState("");

  const [atendimentoModal, setAtendimentoModal] = useState<Atendimento | null>(
    null,
  );

  const [alunoSelecionado, setAlunoSelecionado] = useState("");
  const [atendimentoSelecionadoId, setAtendimentoSelecionadoId] = useState<
    number | null
  >(null);

  const [dataAtendimento, setDataAtendimento] = useState(obterDataHoje());

  const [status, setStatus] = useState("Em andamento");
  const [descricao, setDescricao] = useState("");
  const [descricaoPendencia, setDescricaoPendencia] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [salvandoConclusao, setSalvandoConclusao] = useState(false);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [
        dadosAlunos,
        dadosAgendamentos,
        dadosAtendimentos,
        dadosFuncionarios,
        dadosPendencias,
      ] = await Promise.all([
        buscarAlunos(),
        buscarAgendamentos(),
        buscarAtendimentos(),
        buscarFuncionarioLogado(),
        buscarPendencias(),
      ]);

      setAlunos(dadosAlunos);
      setAgendamentos(dadosAgendamentos);

      const atendimentosOrdenados = [...dadosAtendimentos].sort(
        (a, b) => b.id - a.id,
      );

      const pendenciasOrdenadas = [...dadosPendencias].sort(
        (a, b) => b.id - a.id,
      );

      setAtendimentos(atendimentosOrdenados);
      setFuncionarioLogado(dadosFuncionarios);
      setPendencias(pendenciasOrdenadas);

      setAtendimentoModal((atual) => {
        if (!atual) {
          return atual;
        }

        const atendimentoAtualizado = atendimentosOrdenados.find(
          (item) => item.id === atual.id,
        );

        return atendimentoAtualizado || atual;
      });

      if (idAgendamentoUrl) {
        const agendamentoUrl = dadosAgendamentos.find(
          (item: Agendamento) => item.id === Number(idAgendamentoUrl),
        );

        if (agendamentoUrl) {
          setAlunoSelecionado(agendamentoUrl.aluno);

          const atendimentoExistente = dadosAtendimentos.find(
            (item: Atendimento) => item.agendamento === agendamentoUrl.id,
          );

          if (atendimentoExistente) {
            preencherAtendimento(atendimentoExistente);
          } else {
            setAtendimentoSelecionadoId(null);
            setStatus("Em andamento");
            setDescricao("");
            setDescricaoPendencia("");
            setDataAtendimento(obterDataHoje());
          }
        }
      }
    } catch {
      setErro("Não foi possível carregar os dados dos atendimentos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [idAgendamentoUrl]);

  const aluno = useMemo(() => {
    return alunos.find((item) => item.cpf_aluno === alunoSelecionado);
  }, [alunos, alunoSelecionado]);

  const agendamento = useMemo(() => {
    if (!alunoSelecionado) {
      return undefined;
    }

    if (atendimentoSelecionadoId !== null) {
      const atendimentoSelecionado = atendimentos.find(
        (item) => item.id === atendimentoSelecionadoId,
      );

      if (!atendimentoSelecionado) {
        return undefined;
      }

      return agendamentos.find(
        (item) => item.id === atendimentoSelecionado.agendamento,
      );
    }

    return agendamentos.find(
      (item) => item.aluno === alunoSelecionado && item.status === "Agendado",
    );
  }, [agendamentos, alunoSelecionado, atendimentos, atendimentoSelecionadoId]);

  const atendimentosAtivos = useMemo(() => {
    return atendimentos.filter((atendimento) =>
      ["Em andamento", "Com pendência"].includes(atendimento.status),
    );
  }, [atendimentos]);

  const cardsAtendimentos = useMemo(() => {
    return atendimentos
      .map((atendimento) => {
        const agendamentoRelacionado = agendamentos.find(
          (item) => item.id === atendimento.agendamento,
        );

        if (!agendamentoRelacionado) {
          return null;
        }

        const alunoRelacionado = alunos.find(
          (item) => item.cpf_aluno === agendamentoRelacionado.aluno,
        );

        if (!alunoRelacionado) {
          return null;
        }

        const pendenciasRelacionadas = pendencias
          .filter((item) => item.atendimento === atendimento.id)
          .sort((a, b) => b.id - a.id);

        return {
          atendimento,
          agendamento: agendamentoRelacionado,
          aluno: alunoRelacionado,
          pendencias: pendenciasRelacionadas,
        };
      })
      .filter(Boolean);
  }, [atendimentos, agendamentos, alunos, pendencias]);

  const resumoAtendimentos = useMemo(() => {
    const hoje = obterDataHoje();

    const emAndamento = atendimentos.filter(
      (item) => item.status === "Em andamento",
    ).length;

    const comPendencia = atendimentos.filter(
      (item) => item.status === "Com pendência",
    ).length;

    const concluidosHoje = atendimentos.filter(
      (item) => item.status === "Concluído" && item.data_atendimento === hoje,
    ).length;

    return {
      todos: atendimentos.length,
      emAndamento,
      comPendencia,
      concluidosHoje,
    };
  }, [atendimentos]);

  const atendimentosFiltrados = useMemo(() => {
    return cardsAtendimentos.filter((card) => {
      if (!card) return false;

      if (filtroStatus === "Em andamento") {
        return card.atendimento.status === "Em andamento";
      }

      if (filtroStatus === "Com pendência") {
        return card.atendimento.status === "Com pendência";
      }

      if (filtroStatus === "Concluído") {
        return card.atendimento.status === "Concluído";
      }

      return true;
    });
  }, [cardsAtendimentos, filtroStatus]);

  const dadosAtendimentoModal = useMemo(() => {
    if (!atendimentoModal) {
      return null;
    }

    const agendamentoRelacionado = agendamentos.find(
      (item) => item.id === atendimentoModal.agendamento,
    );

    if (!agendamentoRelacionado) {
      return null;
    }

    const alunoRelacionado = alunos.find(
      (item) => item.cpf_aluno === agendamentoRelacionado.aluno,
    );

    if (!alunoRelacionado) {
      return null;
    }

    const pendenciasRelacionadas = pendencias
      .filter((item) => item.atendimento === atendimentoModal.id)
      .sort((a, b) => b.id - a.id);

    return {
      atendimento: atendimentoModal,
      agendamento: agendamentoRelacionado,
      aluno: alunoRelacionado,
      pendencias: pendenciasRelacionadas,
    };
  }, [atendimentoModal, agendamentos, alunos, pendencias]);

  const alunosComAtendimentoAtivo = useMemo(() => {
    return atendimentosAtivos
      .map((atendimento) => {
        const agendamentoRelacionado = agendamentos.find(
          (agendamento) => agendamento.id === atendimento.agendamento,
        );

        const alunoRelacionado = alunos.find(
          (aluno) => aluno.cpf_aluno === agendamentoRelacionado?.aluno,
        );

        if (!alunoRelacionado) {
          return null;
        }

        return {
          atendimento,
          aluno: alunoRelacionado,
        };
      })
      .filter(Boolean) as {
      atendimento: Atendimento;
      aluno: Aluno;
    }[];
  }, [atendimentosAtivos, agendamentos, alunos]);

  function preencherAtendimento(atendimento: Atendimento) {
    setAtendimentoSelecionadoId(atendimento.id);
    setStatus(atendimento.status);
    setDescricao(atendimento.descricao);
    setDataAtendimento(atendimento.data_atendimento);
    setDescricaoPendencia("");
  }

  function selecionarAtendimentoExistente(atendimentoId: string) {
    setErro("");
    setSucesso("");
    setDescricaoPendencia("");

    if (!atendimentoId) {
      setAtendimentoSelecionadoId(null);
      setAlunoSelecionado("");
      setStatus("Em andamento");
      setDescricao("");
      setDataAtendimento(obterDataHoje());

      return;
    }

    const atendimento = atendimentos.find(
      (item) => item.id === Number(atendimentoId),
    );

    if (!atendimento) {
      return;
    }

    const agendamentoRelacionado = agendamentos.find(
      (item) => item.id === atendimento.agendamento,
    );

    if (agendamentoRelacionado) {
      setAlunoSelecionado(agendamentoRelacionado.aluno);
    }

    preencherAtendimento(atendimento);
  }

  function selecionarAluno(cpf: string) {
    setAlunoSelecionado(cpf);

    setAtendimentoSelecionadoId(null);
    setStatus("Em andamento");
    setDescricao("");
    setDescricaoPendencia("");
    setDataAtendimento(obterDataHoje());

    setErro("");
    setSucesso("");
  }

  async function registrarNovoAtendimento() {
    setErro("");
    setSucesso("");

    if (!alunoSelecionado) {
      setErro("Selecione um aluno.");
      return;
    }

    if (!agendamento) {
      setErro("O aluno selecionado não possui um novo agendamento ativo.");
      return;
    }

    const jaPossuiAtendimento = atendimentos.some(
      (item) => item.agendamento === agendamento.id,
    );

    if (jaPossuiAtendimento) {
      setErro("Este agendamento já possui um atendimento registrado.");
      return;
    }

    if (!descricao.trim()) {
      setErro("Informe a descrição do atendimento.");
      return;
    }

    if (!funcionarioLogado) {
      setErro("Funcionário autenticado não encontrado.");
      return;
    }

    try {
      setSalvandoConclusao(true);

      await criarAtendimento({
        agendamento: agendamento.id,
        funcionario: funcionarioLogado.cpf_func,
        data_atendimento: dataAtendimento,
        descricao: descricao.trim(),
        status: "Em andamento",
      });

      setSucesso("Atendimento registrado com sucesso.");

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar o atendimento.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function atualizarAtendimentoExistente() {
    setErro("");
    setSucesso("");

    if (!atendimentoSelecionadoId) {
      setErro("Selecione um atendimento ativo.");
      return;
    }

    if (!descricao.trim()) {
      setErro("Informe a descrição do atendimento.");
      return;
    }

    if (status === "Com pendência" && !descricaoPendencia.trim()) {
      setErro("Informe a descrição da pendência.");
      return;
    }

    try {
      setSalvandoConclusao(true);

      if (status === "Com pendência") {
        await criarPendencia({
          atendimento: atendimentoSelecionadoId,
          descricao: descricaoPendencia.trim(),
          status: "Aberta",
          data_criacao: obterDataHoje(),
        });

        setSucesso("Pendência registrada com sucesso.");
      } else if (status === "Concluído") {
        await atualizarAtendimento(atendimentoSelecionadoId, {
          status: "Concluído",
          descricao: descricao.trim(),
        });

        setSucesso("Atendimento concluído com sucesso.");
      } else {
        await atualizarAtendimento(atendimentoSelecionadoId, {
          status: "Em andamento",
          descricao: descricao.trim(),
        });

        setSucesso("Atendimento atualizado com sucesso.");
      }

      setDescricaoPendencia("");

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o atendimento.",
      );
    } finally {
      setSalvando(false);
    }
  }

  const editandoAtendimento = atendimentoSelecionadoId !== null;

  async function salvarPendenciaModal() {
    setErro("");
    setSucesso("");

    if (!atendimentoModal) {
      setErro("Nenhum atendimento selecionado.");
      return;
    }

    if (!descricaoPendencia.trim()) {
      setErro("Informe a descrição da pendência.");
      return;
    }

    try {
      setSalvando(true);

      await criarPendencia({
        atendimento: atendimentoModal.id,
        descricao: descricaoPendencia.trim(),
        status: "Aberta",
        data_criacao: obterDataHoje(),
      });

      setDescricaoPendencia("");
      setModalPendencia(false);

      // Atualiza o atendimento dentro do modal
      setAtendimentoModal((atual) =>
        atual
          ? {
              ...atual,
              status: "Com pendência",
            }
          : atual,
      );

      // Atualiza também o card da lista
      setAtendimentos((atuais) =>
        atuais.map((atendimento) =>
          atendimento.id === atendimentoModal.id
            ? {
                ...atendimento,
                status: "Com pendência",
              }
            : atendimento,
        ),
      );

      setFiltroStatus("Com pendência");

      setModalDetalhes(true);

      setSucesso("Pendência registrada com sucesso.");

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a pendência.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function salvarStatusModal() {
    setErro("");
    setSucesso("");

    if (!atendimentoModal) {
      setErro("Nenhum atendimento selecionado.");
      return;
    }

    try {
      setSalvando(true);

      await atualizarAtendimento(atendimentoModal.id, {
        status,
        descricao: atendimentoModal.descricao,
      });

      setAtendimentoModal((atual) =>
        atual
          ? {
              ...atual,
              status,
            }
          : atual,
      );

      setSucesso("Status atualizado com sucesso.");

      setModalStatus(false);

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o status.",
      );
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    async function carregarFuncionarioLogado() {
      try {
        const funcionario = await buscarFuncionarioLogado();
        setFuncionarioLogado(funcionario);
      } catch (error) {
        console.error("Erro ao carregar funcionário:", error);
      }
    }

    carregarFuncionarioLogado();
  }, []);

  useEffect(() => {
    if (!atendimentoIdUrl) return;

    const atendimentoEncontrado = atendimentos.find(
      (item) => item.id === Number(atendimentoIdUrl),
    );

    if (!atendimentoEncontrado) return;

    setAtendimentoModal(atendimentoEncontrado);
    setModalDetalhes(true);
  }, [atendimentoIdUrl, atendimentos]);

  console.log(
    "STATUS DOS ATENDIMENTOS:",
    atendimentos.map((item) => ({
      id: item.id,
      status: item.status,
      agendamento: item.agendamento,
    })),
  );

  console.log(
    "AGENDAMENTOS AINDA ABERTOS:",
    agendamentos
      .filter((item) => item.status === "Agendado")
      .map((item) => ({
        id: item.id,
        aluno: item.aluno,
        status: item.status,
        data: item.data,
        horario: item.horario,
      })),
  );
  console.log("Atendimentos ativos:", atendimentosAtivos);
  console.log("Cards montados:", cardsAtendimentos);

  function abrirConfirmacaoConclusao(
    atendimento: Atendimento,
    nomeAluno: string,
  ) {
    setAtendimentoParaConcluir(atendimento);
    setNomeAlunoParaConcluir(nomeAluno);
    setModalConfirmarConclusao(true);
  }

  const quantidadeEmAndamento = cardsAtendimentos.filter(
    (card) => card?.atendimento.status === "Em andamento",
  ).length;

  const quantidadeComPendencia = cardsAtendimentos.filter(
    (card) => card?.atendimento.status === "Com pendência",
  ).length;

  const quantidadeConcluidos = cardsAtendimentos.filter(
    (card) => card?.atendimento.status === "Concluído",
  ).length;

  function fecharModalDetalhes() {
    setModalDetalhes(false);
    setAtendimentoModal(null);

    router.replace("/funcionario/atendimentos");
  }

  async function concluirPendenciaModal(pendenciaId: number) {
    try {
      setErro("");
      setSucesso("");

      await atualizarPendencia(pendenciaId, {
        status: "Concluída",
      });

      setSucesso("Pendência concluída com sucesso.");

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a pendência.",
      );
    }
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
                ativo
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
          <div className="flex h-full flex-col px-5 py-5 sm:px-6 md:px-8 xl:px-8 xl:py-6">
            {/* CABEÇALHO */}

            <header className="flex shrink-0 flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h2 className="text-3xl font-black leading-tight tracking-tight text-[#064F91] xl:text-4xl">
                  Atendimentos
                </h2>

                <p className="mt-2 text-sm text-[#064F91]">
                  Acompanhe os atendimentos ativos, pendências e conclusões do
                  dia.
                </p>
              </div>

              <FuncionarioPerfilButton />
            </header>

            {/* RESUMO */}

            <section className="mt-5 grid shrink-0 grid-cols-4 gap-3">
              <ResumoCard
                titulo="Todos"
                valor={resumoAtendimentos.todos}
                texto="Atendimentos no dia"
              />

              <ResumoCard
                titulo="Em andamento"
                valor={resumoAtendimentos.emAndamento}
                texto="Em atendimento hoje"
              />

              <ResumoCard
                titulo="Com pendência"
                valor={resumoAtendimentos.comPendencia}
                texto="Aguardando ação"
              />

              <ResumoCard
                titulo="Concluídos hoje"
                valor={resumoAtendimentos.concluidosHoje}
                texto="Atendimentos finalizados"
              />
            </section>

            {/* ATENDIMENTOS ATIVOS */}

            <section className="mt-5 flex min-h-0 flex-1 flex-col">
              <div className="mb-4 shrink-0">
                <h3 className="text-2xl font-black text-[#064F91]">
                  Atendimentos
                </h3>

                <div className="mt-4 flex gap-2 border-b border-[#D6E2EE]">
                  <button
                    type="button"
                    onClick={() => setFiltroStatus("Em andamento")}
                    className={`border-b-2 px-4 py-3 text-sm font-extrabold transition ${
                      filtroStatus === "Em andamento"
                        ? "border-[#FF681D] text-[#064F91]"
                        : "border-transparent text-[#6A8198] hover:text-[#064F91]"
                    }`}
                  >
                    Em andamento ({quantidadeEmAndamento})
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltroStatus("Com pendência")}
                    className={`border-b-2 px-4 py-3 text-sm font-extrabold transition ${
                      filtroStatus === "Com pendência"
                        ? "border-[#FF681D] text-[#064F91]"
                        : "border-transparent text-[#6A8198] hover:text-[#064F91]"
                    }`}
                  >
                    Com pendência ({quantidadeComPendencia})
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltroStatus("Concluído")}
                    className={`border-b-2 px-4 py-3 text-sm font-extrabold transition ${
                      filtroStatus === "Concluído"
                        ? "border-[#FF681D] text-[#064F91]"
                        : "border-transparent text-[#6A8198] hover:text-[#064F91]"
                    }`}
                  >
                    Concluídos ({quantidadeConcluidos})
                  </button>
                </div>
              </div>

              {erro && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {erro}
                </div>
              )}

              {sucesso && (
                <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {sucesso}
                </div>
              )}

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {carregando ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#064F91]">
                    Carregando atendimentos...
                  </div>
                ) : atendimentosFiltrados.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#064F91]">
                    {filtroStatus === "Em andamento"
                      ? "Nenhum atendimento em andamento."
                      : filtroStatus === "Com pendência"
                        ? "Nenhum atendimento com pendência."
                        : "Nenhum atendimento concluído."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {atendimentosFiltrados.map((card) => {
                      if (!card) {
                        return null;
                      }

                      const {
                        atendimento,
                        aluno,
                        agendamento,
                        pendencias: pendenciasCard,
                      } = card;

                      return (
                        <article
                          key={atendimento.id}
                          className={`rounded-xl border px-4 py-3 ${
                            atendimento.status === "Concluído"
                              ? "border-[#B8C6D3] bg-[#F8FAFC]"
                              : "border-[#2E71B8] bg-white"
                          }`}
                        >
                          {/* CABEÇALHO DO CARD */}

                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="text-lg font-black leading-tight text-[#064F91]">
                                {aluno.nome}
                              </h4>

                              <p className="mt-1 text-xs text-[#064F91]">
                                {aluno.nomes_programas.join(" • ")}
                                {aluno.curso ? ` • ${aluno.curso}` : ""}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <StatusBadge status={atendimento.status} />

                              <span className="rounded-full border border-[#2E71B8] px-3 py-1 text-[10px] text-[#064F91]">
                                {formatarData(agendamento.data)} às{" "}
                                {agendamento.horario.slice(0, 5)}
                              </span>
                            </div>
                          </div>

                          {/* DADOS */}

                          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-[#064F91]">
                            <InfoCard
                              label="CPF"
                              valor={mascararCpf(aluno.cpf_aluno)}
                            />

                            <InfoCard
                              label="Agendamento"
                              valor={`${formatarData(
                                agendamento.data,
                              )} às ${agendamento.horario.slice(0, 5)}`}
                            />

                            <InfoCard
                              label="Motivo"
                              valor={agendamento.motivo}
                            />

                            <InfoCard
                              label="Pendências"
                              valor={
                                pendenciasCard.length > 0
                                  ? `${pendenciasCard.length} registrada(s)`
                                  : "Nenhuma"
                              }
                            />
                          </div>

                          {/* BOTÕES */}

                          <div className="mt-3 flex flex-wrap gap-2">
                            <AcaoCard
                              texto="Ver detalhes"
                              onClick={() => {
                                setModalPendencia(false);

                                setAtendimentoModal(atendimento);
                                setModalDetalhes(true);
                              }}
                            />

                            <AcaoCard
                              texto="Alterar status"
                              onClick={() => {
                                setAtendimentoModal(atendimento);

                                setStatus(
                                  atendimento.status === "Concluído"
                                    ? "Em andamento"
                                    : atendimento.status,
                                );

                                setModalStatus(true);
                              }}
                            />

                            {atendimento.status !== "Concluído" && (
                              <AcaoCard
                                texto="Adicionar pendência"
                                onClick={() => {
                                  setModalStatus(false);

                                  setAtendimentoModal(atendimento);
                                  setDescricaoPendencia("");
                                  setModalPendencia(true);
                                }}
                              />
                            )}

                            {atendimento.status !== "Concluído" && (
                              <button
                                type="button"
                                onClick={() =>
                                  abrirConfirmacaoConclusao(
                                    atendimento,
                                    aluno.nome,
                                  )
                                }
                                className="flex h-[38px] cursor-pointer items-center justify-center rounded-lg bg-[#FF681D] px-5 text-xs font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:bg-[#E95A0D] hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                              >
                                Concluir atendimento
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>

      {/* MODAL DETALHES */}

      {modalDetalhes && dadosAtendimentoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
          onClick={fecharModalDetalhes}
        >
          <div
            className="max-h-[90vh] w-full max-w-[650px] overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* CABEÇALHO */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-[#064F91]">
                  Detalhes do atendimento
                </h3>

                <p className="mt-1 text-sm text-[#064F91]">
                  Visualize os dados do atendimento selecionado.
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModalDetalhes}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-2xl text-[#064F91] transition-all duration-200 hover:bg-[#F0F4F8] hover:shadow-sm"
              >
                ×
              </button>
            </div>

            <div className="my-5 border-t border-[#D6E2EE]" />

            {/* DADOS */}

            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <DetalheModal
                label="Aluno"
                valor={dadosAtendimentoModal.aluno.nome}
              />

              <DetalheModal
                label="Responsável"
                valor={funcionarioLogado?.nome || "Não identificado"}
              />

              <DetalheModal
                label="Programa"
                valor={dadosAtendimentoModal.aluno.nomes_programas.join(", ")}
              />

              <DetalheModal
                label="CPF"
                valor={dadosAtendimentoModal.aluno.cpf_aluno}
              />

              <DetalheModal
                label="Curso"
                valor={dadosAtendimentoModal.aluno.curso}
              />

              <DetalheModal
                label="Motivo"
                valor={dadosAtendimentoModal.agendamento.motivo}
              />

              <DetalheModal
                label="Descrição"
                valor={dadosAtendimentoModal.atendimento.descricao}
              />

              <DetalheModal
                label="Agendamento"
                valor={`${formatarData(
                  dadosAtendimentoModal.agendamento.data,
                )} às ${dadosAtendimentoModal.agendamento.horario.slice(0, 5)}`}
              />

              <div>
                <p className="text-xs font-medium text-[#064F91]">Status</p>

                <div className="mt-2">
                  <StatusBadge
                    status={dadosAtendimentoModal.atendimento.status}
                  />
                </div>
              </div>
            </div>

            {/* PENDÊNCIAS */}

            <div className="mt-6 border-t border-[#D6E2EE] pt-5">
              <p className="text-xs font-medium text-[#064F91]">Pendências</p>

              {dadosAtendimentoModal.pendencias.length === 0 ? (
                <p className="mt-2 text-sm text-[#064F91]">
                  Nenhuma pendência registrada.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {dadosAtendimentoModal.pendencias.map((pendencia) => {
                    const pendenciaAberta =
                      pendencia.status.trim().toLowerCase() === "aberta";

                    return (
                      <div
                        key={pendencia.id}
                        className="flex items-center justify-between gap-4 rounded-lg border border-[#D6E2EE] bg-[#F8FBFE] px-4 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[#064F91]">
                            {pendencia.descricao}
                          </p>

                          <div className="mt-2">
                            <StatusBadge status={pendencia.status} />
                          </div>
                        </div>

                        {pendenciaAberta && (
                          <button
                            type="button"
                            onClick={() => concluirPendenciaModal(pendencia.id)}
                            className="shrink-0 cursor-pointer rounded-lg bg-[#FF681D] px-4 py-2 text-xs font-extrabold text-white transition-all duration-200 hover:bg-[#E95A0D]"
                          >
                            Concluir pendência
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AÇÕES */}

            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={fecharModalDetalhes}
                className="h-[44px] cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-8 text-sm font-extrabold text-[#064F91] transition-all duration-200 hover:bg-[#F3F8FD]"
              >
                Fechar
              </button>

              <div className="flex items-center gap-3">
                {dadosAtendimentoModal.atendimento.status !== "Concluído" && (
                  <button
                    type="button"
                    onClick={() => {
                      setAtendimentoModal(dadosAtendimentoModal.atendimento);
                      setDescricaoPendencia("");
                      setModalPendencia(true);
                    }}
                    className="h-[44px] cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-6 text-sm font-extrabold text-[#064F91] transition-all duration-200 hover:bg-[#F3F8FD]"
                  >
                    Adicionar pendência
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setAtendimentoModal(dadosAtendimentoModal.atendimento);

                    setStatus(
                      dadosAtendimentoModal.atendimento.status === "Concluído"
                        ? "Em andamento"
                        : dadosAtendimentoModal.atendimento.status,
                    );

                    setModalStatus(true);
                  }}
                  className="h-[44px] cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-6 text-sm font-extrabold text-[#064F91] transition-all duration-200 hover:bg-[#F3F8FD]"
                >
                  Alterar status
                </button>

                {dadosAtendimentoModal.atendimento.status !== "Concluído" && (
                  <button
                    type="button"
                    onClick={() =>
                      abrirConfirmacaoConclusao(
                        dadosAtendimentoModal.atendimento,
                        dadosAtendimentoModal.aluno.nome,
                      )
                    }
                    className="h-[44px] cursor-pointer rounded-lg bg-[#FF681D] px-7 text-sm font-extrabold text-white transition-all duration-200 hover:bg-[#E95A0D]"
                  >
                    Concluir atendimento
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {modalConfirmarConclusao && atendimentoParaConcluir && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 px-4"
          onClick={() => setModalConfirmarConclusao(false)}
        >
          <div
            className="w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-xl font-black text-[#064F91]">
              Concluir atendimento
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#064F91]">
              Tem certeza que deseja concluir o atendimento de{" "}
              <span className="font-bold">{nomeAlunoParaConcluir}</span>?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalConfirmarConclusao(false)}
                className="h-[42px] cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-6 text-sm font-extrabold text-[#064F91] hover:bg-[#F3F8FD]"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={async () => {
                  console.log("INICIANDO CONCLUSÃO");

                  try {
                    setErro("");
                    setSucesso("");

                    await atualizarAtendimento(atendimentoParaConcluir.id, {
                      status: "Concluído",
                      descricao: atendimentoParaConcluir.descricao,
                    });

                    console.log("ATENDIMENTO CONCLUÍDO");

                    setModalConfirmarConclusao(false);
                    setModalDetalhes(false);

                    setSucesso(
                      `Atendimento de ${nomeAlunoParaConcluir} concluído com sucesso.`,
                    );

                    await carregarDados();

                    setAtendimentoParaConcluir(null);
                    setNomeAlunoParaConcluir("");
                  } catch (error) {
                    console.error("ERRO AO CONCLUIR:", error);

                    setErro(
                      error instanceof Error
                        ? error.message
                        : "Não foi possível concluir o atendimento.",
                    );
                  }
                }}
                className="h-[42px] cursor-pointer rounded-lg bg-[#FF681D] px-6 text-sm font-extrabold text-white hover:bg-[#E95A0D]"
              >
                Confirmar conclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR PENDÊNCIA */}

      {modalPendencia && atendimentoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
          onClick={() => {
            setModalPendencia(false);
            setDescricaoPendencia("");
          }}
        >
          <div
            className="w-full max-w-[560px] rounded-2xl bg-white p-7 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* CABEÇALHO */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-[#064F91]">
                  Adicionar pendência
                </h3>

                <p className="mt-1 text-sm text-[#064F91]">
                  Registre uma pendência para este atendimento.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalPendencia(false);
                  setDescricaoPendencia("");
                }}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-2xl text-[#064F91] transition-all duration-200 hover:bg-[#F0F4F8] hover:shadow-sm"
              >
                ×
              </button>
            </div>

            <div className="my-5 border-t border-[#D6E2EE]" />
            {erro && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {erro}
              </div>
            )}

            {/* IDENTIFICAÇÃO */}

            {dadosAtendimentoModal && (
              <div className="rounded-xl border border-[#D6E2EE] bg-[#F8FBFE] px-4 py-3">
                <p className="text-xs text-[#064F91]">Atendimento de</p>

                <p className="mt-1 text-base font-black text-[#064F91]">
                  {dadosAtendimentoModal.aluno.nome}
                </p>

                <p className="mt-1 text-xs text-[#064F91]">
                  {dadosAtendimentoModal.aluno.nomes_programas.join(", ")}
                </p>
              </div>
            )}

            {/* CAMPO */}

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-[#064F91]">
                Descrição da pendência
              </label>

              <textarea
                value={descricaoPendencia}
                onChange={(event) => setDescricaoPendencia(event.target.value)}
                placeholder="Descreva a pendência do aluno..."
                rows={5}
                autoFocus
                className="w-full resize-none rounded-xl border border-[#2E71B8] bg-white px-4 py-3 text-sm text-[#064F91] outline-none placeholder:text-[#8DAAC4] focus:ring-2 focus:ring-[#2E71B8]/20"
              />
            </div>

            {/* BOTÕES */}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setModalPendencia(false);
                  setDescricaoPendencia("");
                }}
                className="h-[44px] cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-7 text-sm font-extrabold text-[#064F91] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#F3F8FD] hover:shadow-md active:scale-[0.98]"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={salvarPendenciaModal}
                disabled={salvando || !descricaoPendencia.trim()}
                className="h-[44px] cursor-pointer rounded-lg bg-[#FF681D] px-7 text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#E95A0D] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Salvar pendência"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ATUALIZAR STATUS */}

      {modalStatus && atendimentoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
          onClick={() => {
            setModalStatus(false);
          }}
        >
          <div
            className="w-full max-w-[520px] rounded-2xl bg-white p-7 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-[#064F91]">
                  Atualizar status
                </h3>

                <p className="mt-1 text-sm text-[#064F91]">
                  Altere o status do atendimento selecionado.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalStatus(false);
                }}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-2xl text-[#064F91] transition-all duration-200 hover:bg-[#F0F4F8]"
              >
                ×
              </button>
            </div>

            <div className="my-5 border-t border-[#D6E2EE]" />

            {dadosAtendimentoModal && (
              <div className="rounded-xl border border-[#D6E2EE] bg-[#F8FBFE] px-4 py-3">
                <p className="text-xs text-[#064F91]">Atendimento de</p>

                <p className="mt-1 text-base font-black text-[#064F91]">
                  {dadosAtendimentoModal.aluno.nome}
                </p>

                <p className="mt-1 text-xs text-[#064F91]">
                  Status atual: {dadosAtendimentoModal.atendimento.status}
                </p>
              </div>
            )}

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-[#064F91]">
                Novo status
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-[48px] w-full cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-4 text-sm text-[#064F91] outline-none"
              >
                <option value="Em andamento">Em andamento</option>

                {atendimentoModal.status !== "Concluído" && (
                  <option value="Concluído">Concluído</option>
                )}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setModalStatus(false);
                }}
                className="h-[44px] cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-7 text-sm font-extrabold text-[#064F91] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#F3F8FD] hover:shadow-md"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={salvarStatusModal}
                disabled={salvando}
                className="h-[44px] cursor-pointer rounded-lg bg-[#FF681D] px-7 text-sm font-extrabold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#E95A0D] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Atualizar status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* COMPONENTES */

function DetalheModal({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-[#064F91]">{label}</p>

      <p className="mt-1 text-base font-bold text-[#064F91]">{valor || "-"}</p>
    </div>
  );
}

function CampoLeitura({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-[#064F91]">{label}</label>

      <div className="flex h-[48px] items-center rounded-lg border border-[#2E71B8] bg-[#F0F4F8] px-4 text-sm text-[#064F91]">
        {valor || "-"}
      </div>
    </div>
  );
}

function ResumoCard({
  titulo,
  valor,
  texto,
}: {
  titulo: string;
  valor: number;
  texto: string;
}) {
  return (
    <div className="rounded-xl border border-[#2E71B8] bg-white px-4 py-3 text-[#064F91]">
      <p className="text-xs">{titulo}</p>

      <p className="mt-1 text-2xl font-black">{valor}</p>

      <p className="mt-1 text-[10px]">{texto}</p>
    </div>
  );
}

function InfoCard({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium">{label}</p>

      <p className="mt-1 text-xs">{valor || "-"}</p>
    </div>
  );
}

function AcaoCard({ texto, onClick }: { texto: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex h-[38px] cursor-pointer items-center justify-center
        rounded-lg border border-[#2E71B8]
        bg-white px-5
        text-xs font-bold text-[#064F91]
        shadow-sm
        transition-all duration-200
        hover:-translate-y-[2px]
        hover:bg-[#F1F7FC]
        hover:shadow-md
        active:translate-y-0
        active:scale-[0.98]
      "
    >
      {texto}
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

function mascararCpf(cpf: string) {
  if (!cpf || cpf.length < 11) {
    return cpf;
  }

  return `***.${cpf.slice(3, 6)}.***-**`;
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

function obterDataHoje() {
  const agora = new Date();

  const ano = agora.getFullYear();

  const mes = String(agora.getMonth() + 1).padStart(2, "0");

  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarData(data: string) {
  if (!data) {
    return "";
  }

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
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
