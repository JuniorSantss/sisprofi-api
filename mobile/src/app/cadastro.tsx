import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cadastrarAluno, loginAluno } from "../services/api";
import { useState } from "react";

export default function CadastroScreen() {
  const router = useRouter();

  const programas = [
    { id: 1, nome: "PROUNI" },
    { id: 2, nome: "FIES" },
  ];
  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [curso, setCurso] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [programaSelecionado, setProgramaSelecionado] = useState<number | null>(
    null,
  );

  const [carregando, setCarregando] = useState(false);

  async function cadastrar() {
    if (
      !cpf.trim() ||
      !nome.trim() ||
      !contato.trim() ||
      !curso.trim() ||
      !username.trim() ||
      !password.trim() ||
      !programaSelecionado
    ) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    try {
      setCarregando(true);

      await cadastrarAluno({
        cpf_aluno: cpf.trim(),
        nome: nome.trim(),
        contato: contato.trim(),
        curso: curso.trim(),

        programas: programaSelecionado ? [programaSelecionado] : [],

        username: username.trim(),
        password,
      });

      const dadosLogin = await loginAluno(username.trim(), password);

      await AsyncStorage.setItem("access", dadosLogin.access);

      await AsyncStorage.setItem("refresh", dadosLogin.refresh);

      Alert.alert("Cadastro realizado", "Sua conta foi criada com sucesso.");

      router.replace("/agendamento");
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o cadastro.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>Criar cadastro</Text>

      <Text style={styles.subtitulo}>
        Informe seus dados para acessar o SisProfi
      </Text>

      <TextInput
        style={styles.input}
        placeholder="CPF"
        value={cpf}
        onChangeText={setCpf}
        keyboardType="numeric"
        maxLength={11}
      />

      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Contato"
        value={contato}
        onChangeText={setContato}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Curso"
        value={curso}
        onChangeText={setCurso}
      />

      <Text style={styles.label}>Programa</Text>

      <View style={styles.programas}>
        {programas.map((programa) => (
          <TouchableOpacity
            key={programa.id}
            style={[
              styles.botaoPrograma,
              programaSelecionado === programa.id &&
                styles.botaoProgramaSelecionado,
            ]}
            onPress={() => setProgramaSelecionado(programa.id)}
          >
            <Text
              style={[
                styles.textoPrograma,
                programaSelecionado === programa.id &&
                  styles.textoProgramaSelecionado,
              ]}
            >
              {programa.nome}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
        onPress={cadastrar}
        disabled={carregando}
      >
        <Text style={styles.textoBotao}>
          {carregando ? "Criando cadastro..." : "Cadastrar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/")}>
        <Text style={styles.voltar}>Já tenho cadastro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  titulo: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },

  subtitulo: {
    fontSize: 16,
    marginBottom: 24,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
  },

  botao: {
    backgroundColor: "#0B5598",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },

  textoBotao: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  voltar: {
    textAlign: "center",
    marginTop: 20,
    color: "#0B5598",
    fontWeight: "600",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  programas: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

  botaoPrograma: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    alignItems: "center",
  },

  botaoProgramaSelecionado: {
    backgroundColor: "#0B5598",
    borderColor: "#0B5598",
  },

  textoPrograma: {
    fontWeight: "600",
  },

  textoProgramaSelecionado: {
    color: "#FFFFFF",
  },
});
