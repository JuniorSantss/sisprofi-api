import { View, Text } from "react-native";

export default function AgendamentoScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "700" }}>
        Área de agendamento
      </Text>
    </View>
  );
}
