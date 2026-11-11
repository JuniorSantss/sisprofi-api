const API_URL = "http://192.168.0.3:8000/api/v1";

import AsyncStorage from "@react-native-async-storage/async-storage";

export async function loginAluno(username: string, password: string) {
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

  const texto = await response.text();

  console.log("STATUS:", response.status);
  console.log("RESPOSTA API:", texto);

  let dados;

  try {
    dados = JSON.parse(texto);
  } catch {
    throw new Error("A API retornou uma resposta inválida.");
  }

  if (!response.ok) {
    throw new Error(dados?.detail || "Não foi possível realizar o login.");
  }

  return dados;
}

export async function criarAgendamento(dados: {
  data: string;
  horario: string;
  motivo: string;
}) {
  const token = await AsyncStorage.getItem("access");

  if (!token) {
    throw new Error("Sessão não encontrada. Faça login novamente.");
  }

  const response = await fetch(`${API_URL}/agendamentos/meu-agendamento/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...dados,
      status: "Agendado",
    }),
  });

  const resposta = await response.json();

  if (!response.ok) {
    throw new Error(
      resposta?.detail ||
        resposta?.non_field_errors?.[0] ||
        "Não foi possível realizar o agendamento.",
    );
  }

  return resposta;
}
