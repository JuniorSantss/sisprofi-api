import DateTimePicker from "@react-native-community/datetimepicker";

import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { criarAgendamento } from "../services/api";

export default function AgendamentoScreen() {
  const router = useRouter();

  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [horario, setHorario] = useState("");
  const [motivo, setMotivo] = useState("");
  const [carregando, setCarregando] = useState(false);

  function formatarDataAPI(data: Date) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  async function agendar() {
    if (!dataSelecionada || !horario.trim() || !motivo.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    try {
      setCarregando(true);

      await criarAgendamento({
        data: formatarDataAPI(dataSelecionada!),
        horario: horario.trim(),
        motivo: motivo.trim(),
      });

      Alert.alert(
        "Agendamento realizado",
        "Seu atendimento foi agendado com sucesso.",
      );

      setDataSelecionada(null);
      setHorario("");
      setMotivo("");
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o agendamento.",
      );
    } finally {
      setCarregando(false);
    }
  }

  async function sair() {
    await AsyncStorage.removeItem("access");
    await AsyncStorage.removeItem("refresh");

    router.replace("/");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Agendamento</Text>

      <Text style={styles.subtitulo}>
        Informe os dados para solicitar seu atendimento.
      </Text>

      <TouchableOpacity
        style={styles.input}
        onPress={() => setMostrarCalendario(true)}
      >
        <Text
          style={{
            fontSize: 16,
            color: dataSelecionada ? "#000000" : "#777777",
          }}
        >
          {dataSelecionada
            ? dataSelecionada.toLocaleDateString("pt-BR")
            : "Selecionar data"}
        </Text>
      </TouchableOpacity>

      {mostrarCalendario && (
        <DateTimePicker
          value={dataSelecionada || new Date()}
          mode="date"
          display="calendar"
          minimumDate={new Date()}
          onChange={(_, data) => {
            setMostrarCalendario(false);

            if (data) {
              setDataSelecionada(data);
            }
          }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Horário - 14:00"
        value={horario}
        onChangeText={setHorario}
      />

      <TextInput
        style={[styles.input, styles.inputMotivo]}
        placeholder="Motivo do atendimento"
        value={motivo}
        onChangeText={setMotivo}
        multiline
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={agendar}
        disabled={carregando}
      >
        <Text style={styles.textoBotao}>
          {carregando ? "Agendando..." : "Realizar agendamento"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoSair} onPress={sair}>
        <Text style={styles.textoSair}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: "#555555",
  },

  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
  },

  inputMotivo: {
    minHeight: 100,
    textAlignVertical: "top",
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
    fontSize: 16,
    fontWeight: "700",
  },

  botaoSair: {
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },

  textoSair: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "600",
  },
});
