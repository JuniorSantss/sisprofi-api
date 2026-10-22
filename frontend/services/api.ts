const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access");
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAccessToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...options.headers,
    },
  });

  let dados: any = null;

  try {
    dados = await response.json();
  } catch {
    dados = null;
  }

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    }

    throw new Error("Sessão expirada.");
  }

  if (!response.ok) {
    console.error("Erro da API:", dados);

    if (dados?.detail) {
      throw new Error(dados.detail);
    }

    if (dados?.non_field_errors) {
      throw new Error(
        Array.isArray(dados.non_field_errors)
          ? dados.non_field_errors.join(" ")
          : dados.non_field_errors,
      );
    }

    if (dados && typeof dados === "object") {
      const mensagens = Object.entries(dados)
        .map(([campo, valor]) => {
          if (Array.isArray(valor)) {
            return `${campo}: ${valor.join(" ")}`;
          }

          return `${campo}: ${String(valor)}`;
        })
        .join(" ");

      if (mensagens) {
        throw new Error(mensagens);
      }
    }

    if (typeof dados === "string") {
      throw new Error(dados);
    }

    throw new Error("Erro ao acessar a API.");
  }

  return dados;
}

/* =========================
   LOGIN
========================= */

export async function login(username: string, password: string) {
  const response = await fetch(`${API_URL}/token/`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      username,
      password,
    }),
  });

  const dados = await response.json();

  if (!response.ok) {
    throw new Error(dados.detail || "Usuário ou senha inválidos.");
  }

  return dados;
}

/* =========================
  ALUNOS
========================= */

export async function buscarAlunos() {
  return apiRequest("/alunos/");
}

/* =========================
  PROGRAMAS
========================= */

export async function buscarProgramas() {
  return apiRequest("/programas/");
}

/* =========================
  AGENDAMENTOS
========================= */

export async function buscarAgendamentos() {
  return apiRequest("/agendamentos/");
}

/* =========================
  FUNCIONÁRIOS
========================= */

export async function buscarFuncionarios() {
  return apiRequest("/funcionarios/");
}

/* =========================
  ATENDIMENTOS
========================= */

export async function buscarAtendimentos() {
  return apiRequest("/atendimentos/");
}

export async function criarAtendimento(dados: {
  agendamento: number;
  funcionario: string;
  data_atendimento: string;
  descricao: string;
  status: string;
}) {
  return apiRequest("/atendimentos/", {
    method: "POST",

    body: JSON.stringify(dados),
  });
}

export async function atualizarAtendimento(
  id: number,
  dados: {
    status?: string;
    descricao?: string;
  },
) {
  return apiRequest(`/atendimentos/${id}/`, {
    method: "PATCH",

    body: JSON.stringify(dados),
  });
}

/* =========================
  PENDÊNCIAS
========================= */

export async function buscarPendencias() {
  return apiRequest("/pendencias/");
}

export async function criarPendencia(dados: {
  atendimento: number;
  descricao: string;
  status: string;
  data_criacao: string;
}) {
  return apiRequest("/pendencias/", {
    method: "POST",

    body: JSON.stringify(dados),
  });
}

export async function atualizarPendencia(
  id: number,
  dados: {
    status?: string;
    descricao?: string;
  },
) {
  return apiRequest(`/pendencias/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}

export async function atualizarFuncionario(
  cpf: string,
  dados: {
    nome?: string;
    email?: string;
  },
) {
  return apiRequest(`/funcionarios/${cpf}/`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}
