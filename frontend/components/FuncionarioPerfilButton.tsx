"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buscarFuncionarioLogado } from "@/services/api";

type Funcionario = {
  cpf_func: string;
  nome: string;
  email: string;
};

export default function FuncionarioPerfilButton() {
  const router = useRouter();

  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    async function carregarFuncionario() {
      try {
        const dados = await buscarFuncionarioLogado();
        setFuncionario(dados);
      } catch (error) {
        console.error("Erro ao carregar funcionário:", error);
      }
    }

    carregarFuncionario();
  }, []);

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    router.push("/login");
  }

  return (
    <div className="relative w-full max-w-[240px]">
      <button
        type="button"
        onClick={() => setMenuAberto(!menuAberto)}
        className="flex h-[54px] w-full cursor-pointer items-center gap-3 rounded-xl border border-[#0B5598] bg-[#F4F8FC] px-4 text-[#064F91] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#EAF2F9] hover:shadow-sm"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#0B5598]">
          👤
        </span>

        <span className="flex-1 truncate text-left text-base">
          {funcionario?.nome?.split(" ")[0] || "Funcionário"}
        </span>

        <span className="text-xs">{menuAberto ? "▲" : "▼"}</span>
      </button>

      {menuAberto && (
        <div className="absolute right-0 top-[62px] z-50 w-full overflow-hidden rounded-xl border border-[#B9CEE2] bg-white shadow-lg">
          <button
            type="button"
            onClick={() => router.push("/funcionario/perfil")}
            className="w-full cursor-pointer px-4 py-3 text-left text-sm text-[#064F91] transition hover:bg-[#F4F8FC]"
          >
            Meu perfil
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full cursor-pointer border-t border-[#E1EAF2] px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
