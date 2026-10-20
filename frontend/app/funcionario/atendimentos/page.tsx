"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import {
  atualizarAtendimento,
  buscarAgendamentos,
  buscarAlunos,
  buscarAtendimentos,
  buscarFuncionarios,
  criarAtendimento,
  criarPendencia,
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

export default function AtendimentosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const idAgendamentoUrl = searchParams.get("agendamento");

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

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

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [
        dadosAlunos,
        dadosAgendamentos,
        dadosAtendimentos,
        dadosFuncionarios,
      ] = await Promise.all([
        buscarAlunos(),
        buscarAgendamentos(),
        buscarAtendimentos(),
        buscarFuncionarios(),
      ]);

      setAlunos(dadosAlunos);
      setAgendamentos(dadosAgendamentos);
      setAtendimentos(dadosAtendimentos);
      setFuncionarios(dadosFuncionarios);

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

    if (funcionarios.length === 0) {
      setErro("Nenhum funcionário cadastrado foi encontrado.");
      return;
    }

    try {
      setSalvando(true);

      await criarAtendimento({
        agendamento: agendamento.id,
        funcionario: funcionarios[0].cpf_func,
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
      setSalvando(true);

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
          <div className="flex h-full flex-col px-5 py-7 sm:px-6 md:px-8 xl:px-10 xl:py-10">
            {/* CABEÇALHO */}

            <header className="flex shrink-0 flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h2 className="text-3xl font-black leading-tight tracking-tight text-[#064F91] xl:text-4xl">
                  Atendimentos
                </h2>

                <p className="mt-2 text-base text-[#064F91]">
                  Registre ou atualize os atendimentos dos alunos.
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

            {/* FORMULÁRIO */}

            <section className="mt-6 min-h-0 flex-1 overflow-y-auto rounded-xl border border-[#0B5598] bg-white p-5 sm:p-6 xl:px-7 xl:py-6">
              {carregando ? (
                <div className="flex h-full items-center justify-center text-sm text-[#064F91]">
                  Carregando atendimentos...
                </div>
              ) : (
                <div className="mx-auto max-w-[950px]">
                  {/* ATENDIMENTO EXISTENTE */}

                  <div>
                    <label className="mb-2 block text-sm text-[#064F91]">
                      Atendimento em andamento
                    </label>

                    <select
                      value={
                        atendimentoSelecionadoId
                          ? String(atendimentoSelecionadoId)
                          : ""
                      }
                      onChange={(event) =>
                        selecionarAtendimentoExistente(event.target.value)
                      }
                      className="h-[48px] w-full rounded-lg border border-[#2E71B8] bg-white px-4 text-sm text-[#064F91] outline-none"
                    >
                      <option value=""></option>

                      {alunosComAtendimentoAtivo.map(
                        ({ atendimento, aluno }) => (
                          <option key={atendimento.id} value={atendimento.id}>
                            {aluno.nome} - {atendimento.status}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  {/* ALUNO */}

                  <div className="mt-5">
                    <label className="mb-2 block text-sm text-[#064F91]">
                      Aluno
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <select
                      value={alunoSelecionado}
                      disabled={editandoAtendimento}
                      onChange={(event) => selecionarAluno(event.target.value)}
                      className="h-[48px] w-full rounded-lg border border-[#2E71B8] bg-white px-4 text-sm text-[#064F91] outline-none disabled:bg-[#F0F4F8] disabled:opacity-100"
                    >
                      <option value="">Selecione o aluno</option>

                      {alunos.map((alunoItem) => (
                        <option
                          key={alunoItem.cpf_aluno}
                          value={alunoItem.cpf_aluno}
                        >
                          {alunoItem.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CPF / PROGRAMA */}

                  <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <CampoLeitura label="CPF" valor={aluno?.cpf_aluno || ""} />

                    <CampoLeitura
                      label="Programa"
                      valor={aluno ? aluno.nomes_programas.join(" e ") : ""}
                    />
                  </div>

                  {/* AGENDAMENTO / DATA */}

                  <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <CampoLeitura
                      label="Agendamento vinculado"
                      valor={
                        agendamento
                          ? `${formatarData(
                              agendamento.data,
                            )} às ${agendamento.horario.slice(0, 5)}`
                          : ""
                      }
                    />

                    <div>
                      <label className="mb-2 block text-sm text-[#064F91]">
                        Data do atendimento
                      </label>

                      <input
                        type="date"
                        value={dataAtendimento}
                        disabled={editandoAtendimento}
                        onChange={(event) =>
                          setDataAtendimento(event.target.value)
                        }
                        className="h-[48px] w-full rounded-lg border border-[#2E71B8] bg-white px-4 text-sm text-[#064F91] outline-none disabled:bg-[#F0F4F8] disabled:opacity-100"
                      />
                    </div>
                  </div>

                  {/* STATUS */}

                  <div className="mt-4 max-w-[48%] max-md:max-w-full">
                    <label className="mb-2 block text-sm text-[#064F91]">
                      Status
                    </label>

                    <select
                      value={status}
                      disabled={!editandoAtendimento}
                      onChange={(event) => {
                        setStatus(event.target.value);

                        if (event.target.value !== "Com pendência") {
                          setDescricaoPendencia("");
                        }
                      }}
                      className="h-[48px] w-full rounded-lg border border-[#2E71B8] bg-white px-4 text-sm text-[#064F91] outline-none disabled:bg-[#F0F4F8] disabled:opacity-100"
                    >
                      <option value="Em andamento">Em andamento</option>

                      {editandoAtendimento && (
                        <>
                          <option value="Com pendência">Com pendência</option>

                          <option value="Concluído">Concluído</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* DESCRIÇÃO */}

                  <div className="mt-4">
                    <label className="mb-2 block text-sm text-[#064F91]">
                      Descrição do atendimento
                    </label>

                    <textarea
                      value={descricao}
                      onChange={(event) => setDescricao(event.target.value)}
                      placeholder="Descreva o atendimento realizado..."
                      rows={4}
                      className="w-full resize-none rounded-lg border border-[#2E71B8] bg-white px-4 py-3 text-sm text-[#064F91] outline-none placeholder:text-[#8DAAC4]"
                    />
                  </div>

                  {/* PENDÊNCIA */}

                  {editandoAtendimento && status === "Com pendência" && (
                    <div className="mt-4 rounded-xl border border-[#FFB8BF] bg-[#FFF8F8] p-4">
                      <label className="mb-2 block text-sm font-semibold text-[#C72C3A]">
                        Descrição da pendência
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <textarea
                        value={descricaoPendencia}
                        onChange={(event) =>
                          setDescricaoPendencia(event.target.value)
                        }
                        placeholder="Informe qual é a pendência do aluno..."
                        rows={3}
                        className="w-full resize-none rounded-lg border border-[#FF8E98] bg-white px-4 py-3 text-sm text-[#064F91] outline-none placeholder:text-[#A9A9A9]"
                      />
                    </div>
                  )}

                  {/* ERRO */}

                  {erro && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {erro}
                    </div>
                  )}

                  {/* SUCESSO */}

                  {sucesso && (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {sucesso}
                    </div>
                  )}

                  {/* BOTÕES */}

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => router.push("/funcionario/agendamentos")}
                      className="h-[48px] cursor-pointer rounded-lg border border-[#2E71B8] bg-white px-8 text-sm font-extrabold text-[#064F91] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#F3F8FD] hover:shadow-sm active:scale-[0.98]"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={
                        editandoAtendimento
                          ? atualizarAtendimentoExistente
                          : registrarNovoAtendimento
                      }
                      disabled={salvando}
                      className="h-[48px] cursor-pointer rounded-lg bg-[#FF681D] px-8 text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#E95A0D] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {salvando
                        ? "Salvando..."
                        : editandoAtendimento
                          ? "Atualizar atendimento"
                          : "Registrar atendimento"}
                    </button>
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

/* COMPONENTES */

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
