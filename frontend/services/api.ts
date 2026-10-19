const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

  if (!response.ok) {
    throw new Error("Usuário ou senha inválidos.");
  }

  return response.json();
}
