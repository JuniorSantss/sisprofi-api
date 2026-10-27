"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export default function FuncionarioLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem("access");

    if (!access) {
      router.replace("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(access.split(".")[1]));

      const expiracao = payload.exp * 1000;

      if (Date.now() >= expiracao) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        router.replace("/login");
        return;
      }

      setVerificando(false);
    } catch {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      router.replace("/login");
    }
  }, [router]);

  if (verificando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F9FF]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#DCEBFA] border-t-[#064F91]" />

          <p className="mt-4 text-sm font-medium text-[#064F91]">
            Verificando acesso...
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
