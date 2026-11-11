import AsyncStorage from "@react-native-async-storage/async-storage";

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { useRouter } from "expo-router";
import { loginAluno } from "../services/api";

export default function LoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Atenção", "Informe usuário e senha.");
      return;
    }

    try {
      setCarregando(true);

      const dados = await loginAluno(username.trim(), password);

      await AsyncStorage.setItem("access", dados.access);
      await AsyncStorage.setItem("refresh", dados.refresh);

      console.log("TOKEN:", dados.access);

      router.replace("/agendamento");
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o login.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>PROUNI E FIES</Text>

      <Text style={styles.subtitulo}>Acesse sua conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={entrar}
        disabled={carregando}
      >
        <Text style={styles.textoBotao}>
          {carregando ? "Entrando..." : "Entrar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/cadastro")}>
        <Text style={styles.cadastro}>Ainda não possui conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },

  titulo: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0B5598",
    textAlign: "center",
  },

  subtitulo: {
    marginTop: 8,
    marginBottom: 30,
    fontSize: 18,
    color: "#064F91",
    textAlign: "center",
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#2E71B8",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 14,
  },

  botao: {
    height: 50,
    backgroundColor: "#FF681D",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },

  textoBotao: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },

  cadastro: {
    marginTop: 20,
    textAlign: "center",
    color: "#0B5598",
    fontWeight: "600",
  },
});
