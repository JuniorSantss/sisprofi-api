"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { buscarAtendimentoPorId } from "@/services/api";

type Atendimento = {
  id: number;
  agendamento: number;
  funcionario: string;
  data_atendimento: string;
  descricao: string;
  status: string;
};

export default function AtendimentoDetalhesPage() {
  const params = useParams();
  const router = useRouter();

  const atendimentoId = Number(params.id);

  const [atendimento, setAtendimento] = useState<Atendimento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarAtendimento() {
      try {
        setErro("");
        setCarregando(true);

        const dados = await buscarAtendimentoPorId(atendimentoId);

        setAtendimento(dados);
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
      carregarAtendimento();
    }
  }, [atendimentoId]);

  if (carregando) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-gray-600">Carregando atendimento...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => router.push("/funcionario/atendimentos")}
          className="mb-6 cursor-pointer rounded-lg border border-[#064F91] bg-white px-4 py-2 font-semibold text-[#064F91]"
        >
          ← Voltar para atendimentos
        </button>

        {erro && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {erro}
          </div>
        )}

        {atendimento && (
          <div className="rounded-xl bg-white p-6 shadow">
            <h1 className="text-2xl font-bold text-gray-800">
              Atendimento #{atendimento.id}
            </h1>

            <div className="mt-6 space-y-3 text-gray-700">
              <p>
                <strong>Status:</strong> {atendimento.status}
              </p>

              <p>
                <strong>Data:</strong> {atendimento.data_atendimento}
              </p>

              <p>
                <strong>Descrição:</strong> {atendimento.descricao}
              </p>

              <p>
                <strong>Agendamento:</strong> {atendimento.agendamento}
              </p>

              <p>
                <strong>Funcionário:</strong> {atendimento.funcionario}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
