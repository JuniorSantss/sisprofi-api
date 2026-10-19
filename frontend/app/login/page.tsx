"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  function entrar() {
    router.push("/funcionario/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F9FF]">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-[#00355F]">
          Login funcionando
        </h1>

        <label className="mb-2 block font-semibold text-[#00355F]">
          Usuário
        </label>

        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mb-5 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#0F4C81]"
        />

        <button
          onClick={entrar}
          className="w-full rounded-lg bg-[#F97316] p-3 font-semibold text-white hover:bg-[#EA580C]"
        >
          Entrar
        </button>
      </div>
    </main>
  );
}
